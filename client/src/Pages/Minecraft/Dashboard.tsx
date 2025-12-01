import { useEffect, useState } from 'react';
import { Cpu, HardDrive, Users, Zap, Server, Shield } from 'lucide-react';
import Header from '../../components/Dashboard/Header';
import StatsCard from '../../components/Dashboard/StatsCard';
import { minecraftApi } from '../../api/minecraft';
import type { ServerStats } from '../../types/minecraft';

export default function Dashboard() {
  const [stats, setStats] = useState<ServerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const data = await minecraftApi.getServerStats();
      setStats(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch server stats');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-white text-lg">Loading server stats...</div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-red-500 text-lg">{error || 'Failed to load stats'}</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header 
        title="Server Dashboard" 
        subtitle="Monitor your Minecraft server in real-time"
      />
      
      <div className="flex-1 overflow-y-auto p-6">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <StatsCard
            title="CPU Usage"
            value={`${stats.cpuUsage.toFixed(1)}%`}
            icon={Cpu}
            color={stats.cpuUsage > 80 ? 'red' : stats.cpuUsage > 60 ? 'yellow' : 'green'}
          />
          <StatsCard
            title="RAM Usage"
            value={`${stats.ramUsage.toFixed(1)} GB`}
            subtitle={`of ${stats.ramTotal.toFixed(1)} GB`}
            icon={HardDrive}
            color={stats.ramUsage / stats.ramTotal > 0.8 ? 'red' : 'blue'}
          />
          <StatsCard
            title="Disk Usage"
            value={`${stats.diskUsage.toFixed(1)} GB`}
            subtitle={`of ${stats.diskTotal.toFixed(1)} GB`}
            icon={Server}
            color="purple"
          />
          <StatsCard
            title="Server TPS"
            value={stats.tps.toFixed(1)}
            subtitle={stats.tps >= 19 ? 'Excellent' : stats.tps >= 15 ? 'Good' : 'Poor'}
            icon={Zap}
            color={stats.tps >= 19 ? 'green' : stats.tps >= 15 ? 'yellow' : 'red'}
          />
          <StatsCard
            title="Players Online"
            value={`${stats.playersOnline}/${stats.maxPlayers}`}
            icon={Users}
            color="green"
          />
          <StatsCard
            title="Whitelist"
            value={stats.whitelistEnabled ? 'Enabled' : 'Disabled'}
            icon={Shield}
            color={stats.whitelistEnabled ? 'green' : 'yellow'}
          />
        </div>

        {/* Server Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Server Information</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Server Port:</span>
                <span className="text-white font-mono">{stats.serverPort}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Max Players:</span>
                <span className="text-white font-mono">{stats.maxPlayers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Uptime:</span>
                <span className="text-white font-mono">{formatUptime(stats.uptime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Whitelist:</span>
                <span className={`font-medium ${stats.whitelistEnabled ? 'text-green-400' : 'text-yellow-400'}`}>
                  {stats.whitelistEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Performance Metrics</h2>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-400">CPU Load</span>
                  <span className="text-white">{stats.cpuUsage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      stats.cpuUsage > 80 ? 'bg-red-600' : 
                      stats.cpuUsage > 60 ? 'bg-yellow-600' : 'bg-green-600'
                    }`}
                    style={{ width: `${Math.min(stats.cpuUsage, 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-400">RAM Load</span>
                  <span className="text-white">
                    {((stats.ramUsage / stats.ramTotal) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${(stats.ramUsage / stats.ramTotal) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-400">Disk Load</span>
                  <span className="text-white">
                    {((stats.diskUsage / stats.diskTotal) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all"
                    style={{ width: `${(stats.diskUsage / stats.diskTotal) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

