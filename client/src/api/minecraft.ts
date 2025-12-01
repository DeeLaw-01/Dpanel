import axios from 'axios';
import type { ServerStats, ServerProperties, BukkitConfig, SpigotConfig } from '../types/minecraft';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const minecraftApi = {
  // Server Stats
  getServerStats: async (): Promise<ServerStats> => {
    const response = await api.get<ServerStats>('/minecraft/stats');
    return response.data;
  },

  // Console & Commands
  sendCommand: async (command: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/minecraft/command', { command });
    return response.data;
  },

  getLogs: async (lines: number = 100): Promise<string[]> => {
    const response = await api.get(`/minecraft/logs?lines=${lines}`);
    return response.data;
  },

  // Server Properties
  getServerProperties: async (): Promise<ServerProperties> => {
    const response = await api.get<ServerProperties>('/minecraft/config/server-properties');
    return response.data;
  },

  updateServerProperties: async (properties: Partial<ServerProperties>): Promise<{ success: boolean; message: string }> => {
    const response = await api.put('/minecraft/config/server-properties', properties);
    return response.data;
  },

  // Bukkit Config
  getBukkitConfig: async (): Promise<BukkitConfig> => {
    const response = await api.get<BukkitConfig>('/minecraft/config/bukkit');
    return response.data;
  },

  updateBukkitConfig: async (config: Partial<BukkitConfig>): Promise<{ success: boolean; message: string }> => {
    const response = await api.put('/minecraft/config/bukkit', config);
    return response.data;
  },

  // Spigot Config
  getSpigotConfig: async (): Promise<SpigotConfig> => {
    const response = await api.get<SpigotConfig>('/minecraft/config/spigot');
    return response.data;
  },

  updateSpigotConfig: async (config: Partial<SpigotConfig>): Promise<{ success: boolean; message: string }> => {
    const response = await api.put('/minecraft/config/spigot', config);
    return response.data;
  },

  // Server Control
  restartServer: async (): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/minecraft/restart');
    return response.data;
  },

  reloadServer: async (): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/minecraft/reload');
    return response.data;
  },
};

