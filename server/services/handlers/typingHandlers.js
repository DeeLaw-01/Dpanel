/**
 * Handle typing indicator
 */
export const handleTyping = (socket) => {
  return ({ conversationId, userId, userName }) => {
    socket.to(conversationId).emit('userTyping', { userId, userName })
  }
}

/**
 * Handle stop typing indicator
 */
export const handleStopTyping = (socket) => {
  return ({ conversationId, userId }) => {
    socket.to(conversationId).emit('userStoppedTyping', { userId })
  }
}
