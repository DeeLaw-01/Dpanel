import { 
  handleJoinConversation, 
  handleSendMessage, 
  handleMarkAsSeen 
} from './messageHandlers.js'
import { 
  handleTyping, 
  handleStopTyping 
} from './typingHandlers.js'
import { 
  handleConnection, 
  handleDisconnect 
} from './connectionHandlers.js'

/**
 * Set up all socket event handlers for a connected client
 * @param {Socket} socket - The socket instance
 * @param {Server} io - The Socket.IO server instance
 */
export const setupSocketHandlers = (socket, io) => {
  // Handle connection
  handleConnection(socket)

  // Message-related handlers
  socket.on('joinConversation', handleJoinConversation(socket))
  socket.on('sendMessage', handleSendMessage(socket, io))
  socket.on('markAsSeen', handleMarkAsSeen(socket, io))

  // Typing indicators
  socket.on('typing', handleTyping(socket))
  socket.on('stopTyping', handleStopTyping(socket))

  // Handle disconnection
  socket.on('disconnect', handleDisconnect(socket))
}
