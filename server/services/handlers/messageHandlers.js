import { encryptMessage, decryptMessage } from '../encryptionService.js'
import Message from '../../models/Message.js'
import Conversation from '../../models/Conversation.js'

/**
 * Handle joining a conversation room
 */
export const handleJoinConversation = (socket) => {
  return async (conversationId) => {
    socket.join(conversationId)
    console.log(`Client ${socket.id} joined conversation ${conversationId}`)
  }
}

/**
 * Handle sending a message
 */
export const handleSendMessage = (socket, io) => {
  return async ({ conversationId, message, senderId }) => {
    try {
      const encryptedMessage = encryptMessage(message)
      // Store the encrypted object as a JSON string
      const encryptedContent = JSON.stringify(encryptedMessage)

      const newMessage = new Message({
        content: encryptedContent,
        sender: senderId,
        conversation: conversationId
      })

      await newMessage.save()

      // Populate sender info
      await newMessage.populate('sender', 'name email')

      // Add message to conversation
      await Conversation.findByIdAndUpdate(conversationId, {
        $push: { messages: newMessage._id }
      })

      io.to(conversationId).emit('messageReceived', {
        ...newMessage._doc,
        content: decryptMessage(encryptedMessage)
      })
    } catch (error) {
      console.error('Socket message error:', error)
    }
  }
}

/**
 * Handle marking messages as seen
 */
export const handleMarkAsSeen = (socket, io) => {
  return async ({ conversationId, userId }) => {
    try {
      // Mark messages as seen in database
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

      // Notify other participants
      socket
        .to(conversationId)
        .emit('messagesSeen', { userId, seenAt: new Date() })
    } catch (error) {
      console.error('Mark as seen error:', error)
    }
  }
}
