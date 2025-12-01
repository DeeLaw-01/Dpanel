import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Cpu, HardDrive, Activity } from 'lucide-react';
import Header from '../../components/Dashboard/Header';
import StatsCard from '../../components/Dashboard/StatsCard';
import { minecraftApi } from '../../api/minecraft';
import type { ServerStats } from '../../types/minecraft';

interface HistoricalData {
  timestamp: string;
  cpu: number;
  ram: number;
  tps: number;
}

export default function Stats() {
  const [stats, setStats] = useState<ServerStats | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 3000); // Update every 3 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const data = await minecraftApi.getServerStats();
      setStats(data);

      // Add to historical data
      const now = new Date();
      const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
      
      setHistoricalData((prev) => {
        const newData = [
          ...prev,
          {
            timestamp: timeString,
            cpu: data.cpuUsage,
            ram: (data.ramUsage / data.ramTotal) * 100,
            tps: data.tps,
          },
        ];
        // Keep only last 20 data points
        return newData.slice(-20);
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  if (!stats) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-white text-lg">Loading statistics...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header 
        title="Server Statistics" 
        subtitle="Real-time performance monitoring"
      />
      
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {/* Current Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="CPU Usage"
            value={`${stats.cpuUsage.toFixed(1)}%`}
            icon={Cpu}
            color={stats.cpuUsage > 80 ? 'red' : stats.cpuUsage > 60 ? 'yellow' : 'green'}
          />
          <StatsCard
            title="RAM Usage"
            value={`${((stats.ramUsage / stats.ramTotal) * 100).toFixed(1)}%`}
            subtitle={`${stats.ramUsage.toFixed(1)} / ${stats.ramTotal.toFixed(1)} GB`}
            icon={HardDrive}
            color="blue"
          />
          <StatsCard
            title="Server TPS"
            value={stats.tps.toFixed(1)}
            subtitle={stats.tps >= 19 ? 'Excellent' : stats.tps >= 15 ? 'Good' : 'Poor'}
            icon={Activity}
            color={stats.tps >= 19 ? 'green' : stats.tps >= 15 ? 'yellow' : 'red'}
          />
        </div>

        {/* CPU Usage Chart */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">CPU Usage Over Time</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="timestamp" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#F3F4F6' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="cpu" 
                stroke="#10B981" 
                strokeWidth={2}
                name="CPU %"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* RAM Usage Chart */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">RAM Usage Over Time</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="timestamp" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#F3F4F6' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="ram" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="RAM %"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* TPS Chart */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Server TPS Over Time</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="timestamp" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" domain={[0, 20]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#F3F4F6' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="tps" 
                stroke="#F59E0B" 
                strokeWidth={2}
                name="TPS"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

