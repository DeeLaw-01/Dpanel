# DPanel Deployment Guide

Complete step-by-step guide for deploying DPanel on a DigitalOcean Ubuntu server.

## 📋 Prerequisites

- DigitalOcean Droplet (Ubuntu 22.04 LTS recommended)
- Minimum 4GB RAM (for Minecraft + Dashboard)
- SSH access to your server
- Domain name (optional, but recommended)

## 🚀 Step-by-Step Deployment

### 1. Initial Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version

# Install build essentials
sudo apt install -y build-essential screen git nginx

# Install Java for Minecraft
sudo apt install -y openjdk-17-jre-headless
```

### 2. Set Up Minecraft Server

```bash
# Create Minecraft directory
sudo mkdir -p /opt/minecraft
sudo chown $USER:$USER /opt/minecraft
cd /opt/minecraft

# Download Paper server (recommended)
wget https://api.papermc.io/v2/projects/paper/versions/1.20.4/builds/latest/downloads/paper-1.20.4-497.jar -O paper.jar

# Accept EULA
echo "eula=true" > eula.txt

# Create start script
cat > start.sh << 'EOF'
#!/bin/bash
java -Xmx3G -Xms2G -jar paper.jar nogui
EOF

chmod +x start.sh

# Start Minecraft in screen
screen -dmS minecraft ./start.sh

# Check if running
screen -ls
# Output should show: minecraft

# View logs (Ctrl+A, then D to detach)
screen -r minecraft
```

### 3. Create Systemd Service for Minecraft (Optional)

```bash
sudo nano /etc/systemd/system/minecraft@.service
```

Add:
```ini
[Unit]
Description=Minecraft Server
After=network.target

[Service]
Type=forking
User=your-username
Group=your-username

WorkingDirectory=/opt/minecraft
ExecStart=/usr/bin/screen -dmS minecraft /opt/minecraft/start.sh
ExecStop=/usr/bin/screen -S minecraft -X stuff "stop\n"

Restart=on-failure
RestartSec=30

[Install]
WantedBy=multi-user.target
```

Enable the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable minecraft@2943
sudo systemctl start minecraft@2943
sudo systemctl status minecraft@2943
```

### 4. Install DPanel

```bash
# Clone repository
cd ~
git clone <your-repository-url> DPanel
cd DPanel

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### 5. Configure DPanel

**Create server .env file:**
```bash
cd ~/DPanel/server
nano .env
```

Add:
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/dpanel

# Minecraft Configuration
MINECRAFT_DIR=/opt/minecraft
SCREEN_SESSION=minecraft
SERVICE_NAME=minecraft@2943

# Security
JWT_SECRET=generate_a_random_secret_here_use_pwgen
```

**Create client .env file:**
```bash
cd ~/DPanel/client
nano .env
```

Add:
```env
VITE_API_URL=http://your-server-ip:3000
# Or if using a domain:
# VITE_API_URL=https://your-domain.com
```

### 6. Build Frontend

```bash
cd ~/DPanel/client
npm run build
```

### 7. Set Up MongoDB (Optional - for auth features)

```bash
# Install MongoDB
sudo apt install -y mongodb

# Start MongoDB
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Verify
sudo systemctl status mongodb
```

### 8. Deploy Backend with PM2

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start DPanel backend
cd ~/DPanel/server
pm2 start index.js --name dpanel-server

# View logs
pm2 logs dpanel-server

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Copy and run the command it outputs
```

### 9. Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/dpanel
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;  # Or your server IP

    # Frontend
    root /home/your-username/DPanel/client/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket proxy
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

Enable site:
```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/dpanel /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# If test passes, restart Nginx
sudo systemctl restart nginx
```

### 10. Set Up SSL with Let's Encrypt (Recommended)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is set up automatically
# Test renewal
sudo certbot renew --dry-run
```

After SSL setup, update client .env:
```bash
cd ~/DPanel/client
nano .env
```

Change to:
```env
VITE_API_URL=https://your-domain.com
```

Rebuild client:
```bash
npm run build
```

### 11. Configure Firewall

```bash
# Enable UFW
sudo ufw enable

# Allow SSH (IMPORTANT!)
sudo ufw allow 22

# Allow HTTP and HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Allow Minecraft
sudo ufw allow 25565

# Check status
sudo ufw status
```

### 12. Set Up Log Rotation

```bash
sudo nano /etc/logrotate.d/dpanel
```

Add:
```
/home/your-username/.pm2/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0644 your-username your-username
}
```

## 🔍 Verification

### Test Minecraft Server
```bash
# Check if running
screen -ls

# View logs
screen -r minecraft
# Press Ctrl+A, then D to detach

# Test from outside
telnet your-server-ip 25565
```

### Test DPanel Backend
```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs dpanel-server

# Test API
curl http://localhost:3000/api/minecraft/stats
```

### Test Frontend
Visit `http://your-server-ip` or `https://your-domain.com` in your browser.

## 🔄 Updating DPanel

```bash
# Pull latest changes
cd ~/DPanel
git pull

# Update client
cd client
npm install
npm run build

# Update server
cd ../server
npm install

# Restart backend
pm2 restart dpanel-server

# Reload Nginx
sudo systemctl reload nginx
```

## 🐛 Common Issues

### Issue: Can't connect to dashboard
**Solution:**
```bash
# Check if backend is running
pm2 status

# Check backend logs
pm2 logs dpanel-server

# Restart if needed
pm2 restart dpanel-server
```

### Issue: Logs not showing
**Solution:**
```bash
# Check Minecraft server
screen -ls

# Check log file
ls -la /opt/minecraft/logs/latest.log

# Check permissions
sudo chmod 644 /opt/minecraft/logs/latest.log
```

### Issue: Commands not executing
**Solution:**
```bash
# Test screen session
screen -S minecraft -X stuff "list\015"

# Check if screen session exists
screen -ls

# Restart Minecraft server
sudo systemctl restart minecraft@2943
```

### Issue: High CPU/RAM usage
**Solution:**
```bash
# Monitor resources
htop

# Reduce Minecraft RAM
# Edit /opt/minecraft/start.sh
# Change -Xmx3G to -Xmx2G

# Optimize server.properties
# Lower view-distance
# Reduce mob spawns
```

## 📊 Monitoring

### Monitor PM2 processes
```bash
pm2 monit
```

### Monitor Nginx
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Monitor Minecraft
```bash
screen -r minecraft
# Then view logs in real-time
```

## 🔒 Security Best Practices

1. **Change default SSH port**
```bash
sudo nano /etc/ssh/sshd_config
# Change Port 22 to something else
sudo systemctl restart sshd
```

2. **Set up fail2ban**
```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

3. **Regular backups**
```bash
# Backup Minecraft world
cd /opt/minecraft
tar -czf ~/backups/minecraft-$(date +%Y%m%d).tar.gz world/

# Backup DPanel config
cp ~/DPanel/server/.env ~/backups/dpanel-env-$(date +%Y%m%d).bak
```

4. **Keep system updated**
```bash
sudo apt update && sudo apt upgrade -y
```

## 📈 Performance Tuning

### Optimize Minecraft
Edit `/opt/minecraft/server.properties`:
```properties
view-distance=6
simulation-distance=6
max-tick-time=60000
```

### Optimize Node.js
```bash
# Set Node.js memory limit
pm2 delete dpanel-server
pm2 start index.js --name dpanel-server --max-memory-restart 500M
pm2 save
```

## 🎉 Complete!

Your DPanel should now be fully deployed and accessible. Visit your dashboard and start managing your Minecraft server!

For support, check the main README.md or open an issue on GitHub.

