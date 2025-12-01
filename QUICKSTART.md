# DPanel Quick Start Guide

Get DPanel running in 5 minutes for local development!

## 🚀 For Local Development (Testing)

### Prerequisites
- Node.js 18+ installed
- Git installed

### Step 1: Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd DPanel

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### Step 2: Configure Environment

**Client .env:**
```bash
cd client
echo "VITE_API_URL=http://localhost:3000" > .env
```

**Server .env:**
```bash
cd ../server
cat > .env << EOF
PORT=3000
MONGO_URI=mongodb://localhost:27017/dpanel

# For local testing without actual Minecraft server
MINECRAFT_DIR=./mock-minecraft
SCREEN_SESSION=minecraft
SERVICE_NAME=minecraft@2943

JWT_SECRET=dev_secret_change_in_production
EOF
```

### Step 3: Create Mock Minecraft Directory (For Testing)

```bash
# Create mock Minecraft directory structure
mkdir -p ./mock-minecraft/logs
mkdir -p ./mock-minecraft/world

# Create mock server.properties
cat > ./mock-minecraft/server.properties << EOF
server-port=25565
max-players=20
white-list=false
motd=A Minecraft Server
difficulty=normal
gamemode=survival
pvp=true
spawn-protection=16
view-distance=10
online-mode=true
EOF

# Create mock bukkit.yml
cat > ./mock-minecraft/bukkit.yml << EOF
spawn-limits:
  monsters: 70
  animals: 10
  water-animals: 5
  ambient: 15
chunk-gc:
  period-in-ticks: 600
ticks-per:
  animal-spawns: 400
  monster-spawns: 1
EOF

# Create mock spigot.yml
cat > ./mock-minecraft/spigot.yml << EOF
world-settings:
  default:
    mob-spawn-range: 6
    view-distance: 10
    entity-activation-range:
      animals: 32
      monsters: 32
      raiders: 48
      misc: 16
    entity-tracking-range:
      players: 48
      animals: 48
      monsters: 48
EOF

# Create mock log file
cat > ./mock-minecraft/logs/latest.log << EOF
[12:00:00] [Server thread/INFO]: Starting minecraft server version 1.20.4
[12:00:01] [Server thread/INFO]: Loading properties
[12:00:02] [Server thread/INFO]: Default game type: SURVIVAL
[12:00:03] [Server thread/INFO]: Server is running!
[12:00:04] [Server thread/INFO]: Done! For help, type "help"
EOF
```

### Step 4: Run Development Servers

**Terminal 1 - Backend:**
```bash
cd DPanel/server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd DPanel/client
npm run dev
```

### Step 5: Access Dashboard

Open your browser and visit: **http://localhost:5173**

You should see the DPanel dashboard!

---

## 🖥️ For Production on DigitalOcean

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete production deployment instructions.

### Quick Production Checklist

1. ✅ Ubuntu server with 4GB+ RAM
2. ✅ Minecraft server running in screen session
3. ✅ Node.js 18+ installed
4. ✅ Nginx installed and configured
5. ✅ Domain name (optional)
6. ✅ SSL certificate (recommended)

**Production Command:**
```bash
# Build client
cd client
npm run build

# Start server with PM2
cd ../server
pm2 start index.js --name dpanel-server
pm2 save
```

---

## 🧪 Testing Without a Real Minecraft Server

The mock setup above allows you to test the dashboard without a real Minecraft server. However:

**What works:**
- ✅ UI and navigation
- ✅ Config file reading
- ✅ Config file editing
- ✅ Basic stats display

**What won't work (without real server):**
- ❌ Real-time stats (will show mock data or errors)
- ❌ Command execution
- ❌ Live log streaming
- ❌ Server restart/reload

To get full functionality, you need an actual Minecraft server running!

---

## 🐳 Docker Quick Start (Optional)

Create a `docker-compose.yml`:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

  dpanel-server:
    build: ./server
    ports:
      - "3000:3000"
    environment:
      - MONGO_URI=mongodb://mongodb:27017/dpanel
      - MINECRAFT_DIR=/opt/minecraft
    volumes:
      - /opt/minecraft:/opt/minecraft
    depends_on:
      - mongodb

volumes:
  mongo-data:
```

Run:
```bash
docker-compose up -d
```

---

## 🔧 Common Development Issues

### Issue: Port already in use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port in .env
PORT=3001
```

### Issue: Module not found
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: Hot reload not working
```bash
# Restart Vite dev server
# Press 'r' in the terminal running Vite
```

---

## 📝 Development Scripts

**Client:**
```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

**Server:**
```bash
npm run dev      # Start with nodemon (auto-reload)
npm start        # Start normally
```

---

## 🎨 Customization

### Change Theme Colors

Edit `client/src/index.css`:
```css
/* Change primary color from green to blue */
.bg-green-600 { background-color: #2563eb; }
.text-green-500 { color: #3b82f6; }
```

### Change Server Name

Edit `client/src/components/Dashboard/Sidebar.tsx`:
```tsx
<span className="text-xl font-bold text-white">Your Server Name</span>
```

### Add Custom Pages

1. Create new page in `client/src/pages/Minecraft/`
2. Add route in `client/src/App.tsx`
3. Add navigation item in `client/src/components/Dashboard/Sidebar.tsx`

---

## 🤝 Need Help?

- Check [README.md](README.md) for full documentation
- See [DEPLOYMENT.md](DEPLOYMENT.md) for production setup
- Open an issue on GitHub
- Check server logs: `npm run dev` or `pm2 logs`

---

**Happy coding! 🚀**

