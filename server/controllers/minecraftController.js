import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import path from 'path'

const execAsync = promisify(exec)

// Minecraft server paths
const MINECRAFT_DIR = process.env.MINECRAFT_DIR || '/opt/minecraft'
const SERVER_PROPERTIES_PATH = path.join(MINECRAFT_DIR, 'server.properties')
const BUKKIT_CONFIG_PATH = path.join(MINECRAFT_DIR, 'bukkit.yml')
const SPIGOT_CONFIG_PATH = path.join(MINECRAFT_DIR, 'spigot.yml')
const LOGS_PATH = path.join(MINECRAFT_DIR, 'logs/latest.log')
const SCREEN_SESSION = process.env.SCREEN_SESSION || 'minecraft'
const SERVICE_NAME = process.env.SERVICE_NAME || 'minecraft@2943'

// Get server stats
export const getServerStats = async (req, res) => {
  try {
    // Get CPU usage
    const cpuResult = await execAsync(
      "top -bn1 | grep 'Cpu(s)' | awk '{print $2}' | cut -d'%' -f1"
    )
    const cpuUsage = parseFloat(cpuResult.stdout.trim()) || 0

    // Get RAM usage
    const ramResult = await execAsync(
      'free -g | awk \'NR==2{printf "%.2f %.2f", $3,$2}\''
    )
    const [ramUsed, ramTotal] = ramResult.stdout
      .trim()
      .split(' ')
      .map(parseFloat)

    // Get disk usage
    const diskResult = await execAsync(
      `df -BG ${MINECRAFT_DIR} | awk 'NR==2{printf "%.2f %.2f", $3,$2}' | sed 's/G//g'`
    )
    const [diskUsed, diskTotal] = diskResult.stdout
      .trim()
      .split(' ')
      .map(parseFloat)

    // Try to get TPS from logs (basic estimation)
    let tps = 20.0
    try {
      const logsContent = await fs.readFile(LOGS_PATH, 'utf-8')
      const lines = logsContent.split('\n')
      const tpsLine = lines.reverse().find(line => line.includes('TPS'))
      if (tpsLine) {
        const tpsMatch = tpsLine.match(/(\d+\.?\d*)/)
        if (tpsMatch) tps = parseFloat(tpsMatch[1])
      }
    } catch (err) {
      console.log('Could not read TPS from logs, using default')
    }

    // Get players online from server.properties and try to get real count
    const properties = await parseServerProperties()
    let playersOnline = 0
    try {
      const playerListResult = await execAsync(
        `screen -S ${SCREEN_SESSION} -X stuff "list\\015"`
      )
      // This would need to parse the actual response, for now default to 0
    } catch (err) {
      console.log('Could not get player count')
    }

    // Get server uptime
    let uptime = 0
    try {
      const uptimeResult = await execAsync(
        `systemctl show ${SERVICE_NAME} --property=ActiveEnterTimestamp`
      )
      const timestamp = uptimeResult.stdout.split('=')[1]?.trim()
      if (timestamp) {
        const startTime = new Date(timestamp)
        uptime = Math.floor((Date.now() - startTime.getTime()) / 1000)
      }
    } catch (err) {
      console.log('Could not get uptime')
    }

    res.json({
      cpuUsage: Math.min(cpuUsage, 100),
      ramUsage: ramUsed,
      ramTotal: ramTotal,
      diskUsage: diskUsed,
      diskTotal: diskTotal,
      tps: tps,
      playersOnline: playersOnline,
      maxPlayers: parseInt(properties['max-players']) || 20,
      serverPort: parseInt(properties['server-port']) || 25565,
      whitelistEnabled: properties['white-list'] === 'true',
      uptime: uptime
    })
  } catch (error) {
    console.error('Error getting server stats:', error)
    res.status(500).json({ error: 'Failed to get server stats' })
  }
}

// Send command to server
export const sendCommand = async (req, res) => {
  try {
    const { command } = req.body

    if (!command || typeof command !== 'string') {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid command' })
    }

    // Send command to screen session
    await execAsync(`screen -S ${SCREEN_SESSION} -X stuff "${command}\\015"`)

    res.json({ success: true, message: 'Command sent successfully' })
  } catch (error) {
    console.error('Error sending command:', error)
    res.status(500).json({ success: false, message: 'Failed to send command' })
  }
}

// Get server logs
export const getLogs = async (req, res) => {
  try {
    const lines = parseInt(req.query.lines) || 100

    // Read last N lines from log file
    const result = await execAsync(`tail -n ${lines} ${LOGS_PATH}`)
    const logs = result.stdout.split('\n').filter(line => line.trim())

    res.json(logs)
  } catch (error) {
    console.error('Error reading logs:', error)
    res.status(500).json({ error: 'Failed to read logs' })
  }
}

// Get server.properties
export const getServerProperties = async (req, res) => {
  try {
    const properties = await parseServerProperties()
    res.json(properties)
  } catch (error) {
    console.error('Error reading server.properties:', error)
    res.status(500).json({ error: 'Failed to read server properties' })
  }
}

// Update server.properties
export const updateServerProperties = async (req, res) => {
  try {
    const updates = req.body

    // Read current properties
    const content = await fs.readFile(SERVER_PROPERTIES_PATH, 'utf-8')
    let lines = content.split('\n')

    // Update properties
    Object.entries(updates).forEach(([key, value]) => {
      const lineIndex = lines.findIndex(line => line.startsWith(`${key}=`))
      if (lineIndex !== -1) {
        lines[lineIndex] = `${key}=${value}`
      } else {
        lines.push(`${key}=${value}`)
      }
    })

    // Write back to file
    await fs.writeFile(SERVER_PROPERTIES_PATH, lines.join('\n'))

    res.json({
      success: true,
      message: 'Server properties updated successfully'
    })
  } catch (error) {
    console.error('Error updating server.properties:', error)
    res
      .status(500)
      .json({ success: false, message: 'Failed to update server properties' })
  }
}

// Get bukkit.yml
export const getBukkitConfig = async (req, res) => {
  try {
    const content = await fs.readFile(BUKKIT_CONFIG_PATH, 'utf-8')
    const config = parseYaml(content)
    res.json(config)
  } catch (error) {
    console.error('Error reading bukkit.yml:', error)
    res.status(500).json({ error: 'Failed to read Bukkit config' })
  }
}

// Update bukkit.yml
export const updateBukkitConfig = async (req, res) => {
  try {
    const config = req.body
    const yamlContent = stringifyYaml(config)
    await fs.writeFile(BUKKIT_CONFIG_PATH, yamlContent)

    res.json({ success: true, message: 'Bukkit config updated successfully' })
  } catch (error) {
    console.error('Error updating bukkit.yml:', error)
    res
      .status(500)
      .json({ success: false, message: 'Failed to update Bukkit config' })
  }
}

// Get spigot.yml
export const getSpigotConfig = async (req, res) => {
  try {
    const content = await fs.readFile(SPIGOT_CONFIG_PATH, 'utf-8')
    const config = parseYaml(content)
    res.json(config)
  } catch (error) {
    console.error('Error reading spigot.yml:', error)
    res.status(500).json({ error: 'Failed to read Spigot config' })
  }
}

// Update spigot.yml
export const updateSpigotConfig = async (req, res) => {
  try {
    const config = req.body
    const yamlContent = stringifyYaml(config)
    await fs.writeFile(SPIGOT_CONFIG_PATH, yamlContent)

    res.json({ success: true, message: 'Spigot config updated successfully' })
  } catch (error) {
    console.error('Error updating spigot.yml:', error)
    res
      .status(500)
      .json({ success: false, message: 'Failed to update Spigot config' })
  }
}

// Restart server
export const restartServer = async (req, res) => {
  try {
    await execAsync(`systemctl restart ${SERVICE_NAME}`)
    res.json({ success: true, message: 'Server restart initiated' })
  } catch (error) {
    console.error('Error restarting server:', error)
    res
      .status(500)
      .json({ success: false, message: 'Failed to restart server' })
  }
}

// Reload server
export const reloadServer = async (req, res) => {
  try {
    await execAsync(`screen -S ${SCREEN_SESSION} -X stuff "reload\\015"`)
    res.json({ success: true, message: 'Server reload initiated' })
  } catch (error) {
    console.error('Error reloading server:', error)
    res.status(500).json({ success: false, message: 'Failed to reload server' })
  }
}

// Helper functions
async function parseServerProperties () {
  const content = await fs.readFile(SERVER_PROPERTIES_PATH, 'utf-8')
  const properties = {}

  content.split('\n').forEach(line => {
    line = line.trim()
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=')
      if (key) {
        properties[key.trim()] = valueParts.join('=').trim()
      }
    }
  })

  return properties
}

// Simple YAML parser (for basic configs)
function parseYaml (content) {
  const lines = content.split('\n')
  const result = {}
  let currentObj = result
  const stack = [result]
  let lastIndent = 0

  lines.forEach(line => {
    if (!line.trim() || line.trim().startsWith('#')) return

    const indent = line.search(/\S/)
    const trimmed = line.trim()

    if (indent < lastIndent) {
      const diff = (lastIndent - indent) / 2
      for (let i = 0; i < diff; i++) {
        stack.pop()
        currentObj = stack[stack.length - 1]
      }
    }

    if (trimmed.includes(':')) {
      const [key, ...valueParts] = trimmed.split(':')
      const value = valueParts.join(':').trim()

      if (value === '' || value === '{}') {
        currentObj[key.trim()] = {}
        stack.push(currentObj[key.trim()])
        currentObj = currentObj[key.trim()]
      } else {
        currentObj[key.trim()] = isNaN(value) ? value : parseFloat(value)
      }
    }

    lastIndent = indent
  })

  return result
}

// Simple YAML stringifier
function stringifyYaml (obj, indent = 0) {
  let result = ''
  const spaces = '  '.repeat(indent)

  Object.entries(obj).forEach(([key, value]) => {
    if (typeof value === 'object' && value !== null) {
      result += `${spaces}${key}:\n`
      result += stringifyYaml(value, indent + 1)
    } else {
      result += `${spaces}${key}: ${value}\n`
    }
  })

  return result
}
