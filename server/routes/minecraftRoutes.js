import express from 'express';
import * as minecraftController from '../controllers/minecraftController.js';

const router = express.Router();

// Server stats
router.get('/stats', minecraftController.getServerStats);

// Console & Commands
router.post('/command', minecraftController.sendCommand);
router.get('/logs', minecraftController.getLogs);

// Server Properties
router.get('/config/server-properties', minecraftController.getServerProperties);
router.put('/config/server-properties', minecraftController.updateServerProperties);

// Bukkit Config
router.get('/config/bukkit', minecraftController.getBukkitConfig);
router.put('/config/bukkit', minecraftController.updateBukkitConfig);

// Spigot Config
router.get('/config/spigot', minecraftController.getSpigotConfig);
router.put('/config/spigot', minecraftController.updateSpigotConfig);

// Server Control
router.post('/restart', minecraftController.restartServer);
router.post('/reload', minecraftController.reloadServer);

export default router;

