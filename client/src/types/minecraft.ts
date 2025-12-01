export interface ServerStats {
  cpuUsage: number;
  ramUsage: number;
  ramTotal: number;
  diskUsage: number;
  diskTotal: number;
  tps: number;
  playersOnline: number;
  maxPlayers: number;
  serverPort: number;
  whitelistEnabled: boolean;
  uptime: number;
}

export interface ServerProperties {
  'server-port': string;
  'max-players': string;
  'white-list': string;
  'motd': string;
  'difficulty': string;
  'gamemode': string;
  'pvp': string;
  'spawn-protection': string;
  'view-distance': string;
  'online-mode': string;
  [key: string]: string;
}

export interface BukkitConfig {
  'spawn-limits': {
    'monsters': number;
    'animals': number;
    'water-animals': number;
    'ambient': number;
  };
  'chunk-gc': {
    'period-in-ticks': number;
  };
  'ticks-per': {
    'animal-spawns': number;
    'monster-spawns': number;
  };
  [key: string]: any;
}

export interface SpigotConfig {
  'world-settings': {
    'default': {
      'mob-spawn-range': number;
      'entity-activation-range': {
        'animals': number;
        'monsters': number;
        'raiders': number;
        'misc': number;
      };
      'entity-tracking-range': {
        'players': number;
        'animals': number;
        'monsters': number;
      };
      'view-distance': number;
    };
  };
  [key: string]: any;
}

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
}

export interface CommandHistoryItem {
  command: string;
  timestamp: Date;
}

