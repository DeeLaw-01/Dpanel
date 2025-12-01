import jwt from 'jsonwebtoken';
import { promisify } from 'util';

export const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.query.token;

    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId; // Attach user ID to socket for later use
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
};