import { useEffect, useState } from 'react';
import { Save, RotateCcw } from 'lucide-react';
import Header from '../../components/Dashboard/Header';
import { minecraftApi } from '../../api/minecraft';
import { toast } from 'sonner';
import type { ServerProperties } from '../../types/minecraft';

export default function ConfigEditor() {
  const [config, setConfig] = useState<ServerProperties | null>(null);
  const [originalConfig, setOriginalConfig] = useState<ServerProperties | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const data = await minecraftApi.getServerProperties();
      setConfig(data);
      setOriginalConfig(data);
    } catch (error) {
      console.error('Failed to fetch config:', error);
      toast.error('Failed to load server configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;

    setSaving(true);
    try {
      const result = await minecraftApi.updateServerProperties(config);
      if (result.success) {
        toast.success('Configuration saved successfully');
        setOriginalConfig(config);
      } else {
        toast.error(result.message || 'Failed to save configuration');
      }
    } catch (error) {
      console.error('Failed to save config:', error);
      toast.error('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleRestart = async () => {
    try {
      const result = await minecraftApi.restartServer();
      if (result.success) {
        toast.success('Server restart initiated');
      } else {
        toast.error(result.message || 'Failed to restart server');
      }
    } catch (error) {
      console.error('Failed to restart server:', error);
      toast.error('Failed to restart server');
    }
  };

  const handleReset = () => {
    setConfig(originalConfig);
    toast.info('Changes reset');
  };

  const handleChange = (key: string, value: string) => {
    if (!config) return;
    setConfig({ ...config, [key]: value });
  };

  const hasChanges = JSON.stringify(config) !== JSON.stringify(originalConfig);

  if (loading || !config) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-white text-lg">Loading configuration...</div>
      </div>
    );
  }

  const mainSettings = [
    { key: 'server-port', label: 'Server Port', type: 'number' },
    { key: 'max-players', label: 'Max Players', type: 'number' },
    { key: 'white-list', label: 'Whitelist', type: 'select', options: ['true', 'false'] },
    { key: 'motd', label: 'MOTD (Message of the Day)', type: 'text' },
    { key: 'difficulty', label: 'Difficulty', type: 'select', options: ['peaceful', 'easy', 'normal', 'hard'] },
    { key: 'gamemode', label: 'Game Mode', type: 'select', options: ['survival', 'creative', 'adventure', 'spectator'] },
    { key: 'pvp', label: 'PVP', type: 'select', options: ['true', 'false'] },
    { key: 'spawn-protection', label: 'Spawn Protection', type: 'number' },
    { key: 'view-distance', label: 'View Distance', type: 'number' },
    { key: 'online-mode', label: 'Online Mode', type: 'select', options: ['true', 'false'] },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header 
        title="Server Configuration" 
        subtitle="Edit server.properties"
      />
      
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={handleReset}
              disabled={!hasChanges}
              className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
            <button
              onClick={handleRestart}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors ml-auto"
            >
              <RotateCcw className="h-4 w-4" />
              Restart Server
            </button>
          </div>

          {hasChanges && (
            <div className="mb-6 bg-yellow-900 border border-yellow-700 text-yellow-200 px-4 py-3 rounded-lg">
              <p className="text-sm">You have unsaved changes. Don't forget to save!</p>
            </div>
          )}

          {/* Main Settings */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">Main Settings</h2>
            <div className="space-y-4">
              {mainSettings.map((setting) => (
                <div key={setting.key}>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {setting.label}
                  </label>
                  {setting.type === 'select' ? (
                    <select
                      value={config[setting.key] || ''}
                      onChange={(e) => handleChange(setting.key, e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-green-500"
                    >
                      {setting.options?.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={setting.type}
                      value={config[setting.key] || ''}
                      onChange={(e) => handleChange(setting.key, e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-green-500"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* All Properties */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">All Properties</h2>
            <div className="space-y-3">
              {Object.entries(config).map(([key, value]) => (
                <div key={key} className="flex items-center gap-4">
                  <span className="text-gray-400 font-mono text-sm flex-shrink-0 w-64">
                    {key}
                  </span>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleChange(key, e.target.value)}
                    className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white text-sm focus:outline-none focus:border-green-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

