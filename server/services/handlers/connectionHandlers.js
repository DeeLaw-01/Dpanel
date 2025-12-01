/**
 * Handle new client connection
 */
export const handleConnection = socket => {
  console.log('New client connected:', socket.id)
}

/**
 * Handle client disconnection
 */
export const handleDisconnect = socket => {
  return () => {
    console.log('Client disconnected:', socket.id)
  }
}
