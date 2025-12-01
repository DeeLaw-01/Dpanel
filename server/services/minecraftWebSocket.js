import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const MINECRAFT_DIR = process.env.MINECRAFT_DIR || '/opt/minecraft';
const LOGS_PATH = path.join(MINECRAFT_DIR, 'logs/latest.log');

let tailProcess = null;
let isWatching = false;

export function setupMinecraftWebSocket(socket, io) {
  console.log('Client connected to Minecraft WebSocket');

  // Start watching logs when first client connects
  if (!isWatching) {
    startLogWatcher(io);
  }

  socket.on('disconnect', () => {
    console.log('Client disconnected from Minecraft WebSocket');
    
    // Stop watching if no clients connected
    const sockets = io.sockets.sockets;
    if (sockets.size === 0 && tailProcess) {
      stopLogWatcher();
    }
  });
}

function startLogWatcher(io) {
  if (isWatching) return;

  try {
    // Check if log file exists
    if (!fs.existsSync(LOGS_PATH)) {
      console.log(`Log file not found: ${LOGS_PATH}`);
      return;
    }

    console.log(`Starting log watcher for: ${LOGS_PATH}`);
    
    // Use tail -f to follow the log file
    tailProcess = spawn('tail', ['-f', '-n', '100', LOGS_PATH]);
    
    tailProcess.stdout.on('data', (data) => {
      const lines = data.toString().split('\n').filter(line => line.trim());
      lines.forEach(line => {
        io.emit('minecraft:log', line);
      });
    });

    tailProcess.stderr.on('data', (data) => {
      console.error(`Log watcher error: ${data}`);
    });

    tailProcess.on('close', (code) => {
      console.log(`Log watcher process exited with code ${code}`);
      isWatching = false;
      tailProcess = null;
    });

    isWatching = true;
  } catch (error) {
    console.error('Error starting log watcher:', error);
  }
}

function stopLogWatcher() {
  if (tailProcess) {
    console.log('Stopping log watcher');
    tailProcess.kill();
    tailProcess = null;
    isWatching = false;
  }
}

// Cleanup on process exit
process.on('exit', stopLogWatcher);
process.on('SIGINT', () => {
  stopLogWatcher();
  process.exit();
});

