# DPanel - Minecraft Server Dashboard

A modern, dark-mode Minecraft server dashboard built with Vite + React for managing your Minecraft server on DigitalOcean Ubuntu.

![DPanel](https://img.shields.io/badge/DPanel-v1.0.0-green)
![React](https://img.shields.io/badge/React-19.0.0-blue)
![Node](https://img.shields.io/badge/Node-18+-green)

## 🚀 Features

### 📊 Real-Time Monitoring

- **CPU Usage**: Live CPU utilization tracking
- **RAM Usage**: Memory consumption with visual progress bars
- **Disk Usage**: Storage monitoring
- **TPS (Ticks Per Second)**: Server performance metrics
- **Players Online**: Real-time player count
- **Server Uptime**: Track how long your server has been running

### 🖥️ Console Management

- **Real-time Log Streaming**: WebSocket-powered live log viewing
- **Command Execution**: Send commands directly to your Minecraft server
- **Command History**: Navigate through previous commands with arrow keys
- **Color-coded Logs**: INFO, WARN, ERROR messages with distinct colors

### 📈 Statistics Dashboard

- **Interactive Charts**: CPU, RAM, and TPS visualization using Recharts
- **Historical Data**: Track performance over time
- **Performance Metrics**: Detailed breakdown of server health

### ⚙️ Configuration Management

- **Server Properties Editor**: Edit `server.properties` with a user-friendly interface
- **Bukkit Config Editor**: Manage spawn limits and tick rates
- **Spigot Config Editor**: Control entity activation ranges and world settings
- **Live Reload**: Apply changes without full server restart
- **Server Restart**: Full server restart capability

### 🎨 Modern UI/UX

- **Dark Mode Theme**: Easy on the eyes for extended monitoring
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Sidebar Navigation**: Quick access to all features
- **Real-time Status Indicators**: Know your server status at a glance

## 📁 Project Structure

```
DPanel/
├── client/                      # React frontend
│   ├── src/
│   │   ├── api/
│   │   │   └── minecraft.ts    # API client
│   │   ├── components/
│   │   │   └── Dashboard/      # Reusable components
│   │   │       ├── Sidebar.tsx
│   │   │       ├── Header.tsx
│   │   │       ├── StatsCard.tsx
│   │   │       └── Terminal.tsx
│   │   ├── pages/
│   │   │   └── Minecraft/      # Dashboard pages
│   │   │       ├── Dashboard.tsx
│   │   │       ├── Console.tsx
│   │   │       ├── Stats.tsx
│   │   │       ├── ConfigEditor.tsx
│   │   │       └── BukkitSpigotEditor.tsx
│   │   ├── types/
│   │   │   └── minecraft.ts    # TypeScript types
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
│
└── server/                      # Node.js backend
    ├── controllers/
    │   └── minecraftController.js
    ├── routes/
    │   └── minecraftRoutes.js
    ├── services/
    │   └── minecraftWebSocket.js
    └── index.js
```

## 🛠️ Technology Stack

### Frontend

- **Vite** - Fast build tool
- **React 19** - UI library
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **React Router** - Navigation
- **Recharts** - Data visualization
- **Socket.IO Client** - Real-time communication
- **Axios** - HTTP client
- **Lucide React** - Icons
- **Sonner** - Toast notifications

### Backend

- **Node.js** - Runtime
- **Express** - Web framework
- **Socket.IO** - WebSocket server for real-time logs

## 📦 Installation

### Prerequisites

- Node.js 18+ and npm
- A DigitalOcean Ubuntu server with Minecraft server installed
- Minecraft server running in a `screen` session
- **No database required** - DPanel works without MongoDB or any database

### 1. Clone the Repository

```bash
cd ~
git clone <your-repo-url> DPanel
cd DPanel
```

### 2. Install Dependencies

```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### 3. Configure Environment Variables

**Client (.env):**

```bash
cd ~/DPanel/client
nano .env
```

Add:

```env
VITE_API_URL=http://localhost:3000
```

**Server (.env):**

```bash
cd ~/DPanel/server
nano .env
```

Add:

```env
PORT=3000

# Minecraft Server Configuration
MINECRAFT_DIR=/opt/minecraft
SCREEN_SESSION=minecraft
SERVICE_NAME=minecraft@2943

# CORS (optional - for production)
CORS_ORIGIN=http://localhost:5173
```

### 4. Build the Frontend

```bash
cd ~/DPanel/client
npm run build
```

### 5. Start the Backend

```bash
cd ~/DPanel/server
npm start
# or for development:
npm run dev
```

## 🚀 Deployment on DigitalOcean

### Option 1: PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start the server with PM2
cd ~/DPanel/server
pm2 start index.js --name dpanel-server

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### Option 2: Systemd Service

Create a service file:

```bash
sudo nano /etc/systemd/system/dpanel.service
```

Add:

```ini
[Unit]
Description=DPanel Minecraft Dashboard
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/home/your-username/DPanel/server
ExecStart=/usr/bin/node index.js
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable dpanel
sudo systemctl start dpanel
sudo systemctl status dpanel
```

### Serve Frontend with Nginx

```bash
sudo nano /etc/nginx/sites-available/dpanel
```

Add:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /home/your-username/DPanel/client/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/dpanel /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🔧 Server Requirements

Your Minecraft server should be:

1. Located at `/opt/minecraft` (or update `MINECRAFT_DIR` in `.env`)
2. Running in a `screen` session named `minecraft`
3. Using a systemd service named `minecraft@2943` (or update in `.env`)

### Example Minecraft Server Setup

```bash
# Create directory
sudo mkdir -p /opt/minecraft
cd /opt/minecraft

# Download Paper server (example)
sudo wget https://api.papermc.io/v2/projects/paper/versions/1.20.4/builds/latest/downloads/paper-1.20.4-latest.jar -O paper.jar

# Start with screen
screen -S minecraft java -Xmx4G -Xms2G -jar paper.jar nogui

# Detach from screen: Ctrl+A then D
```

## 📝 Usage

### Access the Dashboard

Open your browser and navigate to:

- Local: `http://localhost:5173` (development)
- Production: `http://your-server-ip` or `http://your-domain.com`

### Navigation

- **Dashboard**: Overview of server stats and health
- **Console**: Live logs and command execution
- **Stats**: Detailed performance charts
- **Server Config**: Edit server.properties
- **Bukkit/Spigot**: Manage plugin configurations

### Common Commands

**Console Commands:**

- `list` - Show online players
- `stop` - Stop the server
- `say <message>` - Broadcast message
- `whitelist add <player>` - Add player to whitelist
- `op <player>` - Give operator permissions

## 🐛 Troubleshooting

### Logs not showing

- Check if Minecraft server is running: `screen -ls`
- Verify log file exists: `ls -la /opt/minecraft/logs/latest.log`
- Check WebSocket connection in browser console

### Commands not working

- Verify screen session name: `screen -ls`
- Test command manually: `screen -S minecraft -X stuff "list\015"`
- Check server logs for errors

### Stats showing 0 or incorrect values

- Ensure server is running
- Check file permissions on Minecraft directory
- Verify environment variables are set correctly

### Can't save configurations

- Check file permissions: `ls -la /opt/minecraft/*.properties`
- Ensure user has write access
- Check server logs for error messages

## 🔐 Security Considerations

1. **Firewall**: Configure UFW to only allow necessary ports

```bash
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw allow 25565 # Minecraft
sudo ufw enable
```

2. **Authentication**: Consider adding authentication to the dashboard (already in starter template)

3. **HTTPS**: Use Let's Encrypt for SSL

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

4. **Rate Limiting**: Implement rate limiting for API endpoints

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Built with the Hackathon Starter Template
- Uses Paper/Spigot Minecraft server
- Inspired by modern server management tools

## 📞 Support

For issues and questions:

- Open an issue on GitHub
- Check the troubleshooting section
- Review server logs: `pm2 logs dpanel-server`

---

**Made with ❤️ by deelaw**
