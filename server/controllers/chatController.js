import Message from '../models/Message.js'
import Conversation from '../models/Conversation.js'
import {
  encryptMessage,
  decryptMessage
} from '../services/encryptionService.js'

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const { content, conversationId } = req.body
    const senderId = req.user._id

    // Encrypt the message content
    const encryptedMessage = encryptMessage(content)
    const encryptedContent = JSON.stringify(encryptedMessage)

    const message = new Message({
      content: encryptedContent,
      sender: senderId,
      conversation: conversationId
    })

    await message.save()

    // Add message to the conversation
    await Conversation.findByIdAndUpdate(conversationId, {
      $push: { messages: message._id }
    })

    res
      .status(201)
      .json({ message: 'Message sent successfully', messageId: message._id })
  } catch (error) {
    console.error('Send message error:', error)
    res.status(500).json({ message: 'Failed to send message' })
  }
}

// Retrieve messages from a conversation
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'name email')
      .sort({ createdAt: 1 })

    // Decrypt the message content before sending it back
    const decryptedMessages = messages.map(message => {
      try {
        // Try to parse as JSON (new format)
        const encryptedObj = JSON.parse(message.content)
        return {
          ...message._doc,
          content: decryptMessage(encryptedObj)
        }
      } catch (error) {
        // If parsing fails, assume it's already decrypted or in old format
        return {
          ...message._doc,
          content: message.content
        }
      }
    })

    res.json(decryptedMessages)
  } catch (error) {
    console.error('Get messages error:', error)
    res.status(500).json({ message: 'Failed to retrieve messages' })
  }
}
// Get all conversations for the current user
export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id

    const conversations = await Conversation.find({
      participants: userId
    })
      .populate('participants', 'name email profilePicture')
      .populate({
        path: 'messages',
        options: { sort: { createdAt: -1 }, limit: 1 },
        populate: {
          path: 'sender',
          select: 'name email'
        }
      })
      .sort({ updatedAt: -1 })

    // Decrypt the last message content for each conversation
    const decryptedConversations = conversations.map(conversation => {
      const conversationObj = conversation.toObject()
      if (conversationObj.messages && conversationObj.messages.length > 0) {
        try {
          // Try to parse as JSON (new format)
          const encryptedObj = JSON.parse(conversationObj.messages[0].content)
          conversationObj.messages[0].content = decryptMessage(encryptedObj)
        } catch (error) {
          // If parsing fails, assume it's already decrypted or in old format
          // Keep the content as is
        }
      }
      return conversationObj
    })

    res.json(decryptedConversations)
  } catch (error) {
    console.error('Get conversations error:', error)
    res.status(500).json({ message: 'Failed to retrieve conversations' })
  }
}

// Get a specific conversation
export const getConversation = async (req, res) => {
  try {
    const { conversationId } = req.params

    const conversation = await Conversation.findById(conversationId)
      .populate('participants', 'name email profilePicture')
      .populate({
        path: 'messages',
        options: { sort: { createdAt: -1 }, limit: 1 },
        populate: {
          path: 'sender',
          select: 'name email'
        }
      })

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' })
    }

    // Make sure the requesting user is a participant
    if (
      !conversation.participants.some(
        participant => participant._id.toString() === req.user._id.toString()
      )
    ) {
      return res.status(403).json({ message: 'Access denied' })
    }

    res.json(conversation)
  } catch (error) {
    console.error('Get conversation error:', error)
    res.status(500).json({ message: 'Failed to retrieve conversation' })
  }
}

// Create or get existing conversation between two users
export const createOrGetConversation = async (req, res) => {
  try {
    const { participantId } = req.body
    const currentUserId = req.user._id

    // Don't allow creating conversation with self
    if (participantId === currentUserId.toString()) {
      return res
        .status(400)
        .json({ message: 'Cannot create conversation with yourself' })
    }

    // Check if conversation already exists between these users
    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, participantId] }
    }).populate('participants', 'name email profilePicture')

    if (!conversation) {
      // Create new conversation
      conversation = new Conversation({
        participants: [currentUserId, participantId]
      })
      await conversation.save()

      // Populate the participants
      await conversation.populate('participants', 'name email profilePicture')
    }

    res.json(conversation)
  } catch (error) {
    console.error('Create conversation error:', error)
    res.status(500).json({ message: 'Failed to create conversation' })
  }
}

// Mark messages as seen
export const markMessagesAsSeen = async (req, res) => {
  try {
    const { conversationId } = req.params
    const userId = req.user._id

    // Find all messages in the conversation that haven't been seen by this user
    const messages = await Message.find({
      conversation: conversationId,
      sender: { $ne: userId }, // Don't mark own messages as seen
      'seenBy.user': { $ne: userId } // Haven't been seen by this user
    })

    // Mark all unseen messages as seen
    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: userId },
        'seenBy.user': { $ne: userId }
      },
      {
        $push: {
          seenBy: {
            user: userId,
            seenAt: new Date()
          }
        }
      }
    )

    res.json({
      message: 'Messages marked as seen',
      markedCount: messages.length
    })
  } catch (error) {
    console.error('Mark messages as seen error:', error)
    res.status(500).json({ message: 'Failed to mark messages as seen' })
  }
}

// Get unread message count for a user
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id

    // First, get all conversations where the user is a participant
    const userConversations = await Conversation.find({
      participants: userId
    }).select('_id')

    const conversationIds = userConversations.map(conv => conv._id)

    // Count messages in those conversations where user hasn't seen the message
    const unreadCount = await Message.countDocuments({
      conversation: { $in: conversationIds }, // In user's conversations
      sender: { $ne: userId }, // Not sent by the user
      'seenBy.user': { $ne: userId } // Not seen by the user
    })

    res.json({ unreadCount })
  } catch (error) {
    console.error('Get unread count error:', error)
    res.status(500).json({ message: 'Failed to get unread count' })
  }
}
