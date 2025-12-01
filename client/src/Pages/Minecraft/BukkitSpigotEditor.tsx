import { useEffect, useState } from 'react';
import { Save, RotateCcw, Lock } from 'lucide-react';
import Header from '../../components/Dashboard/Header';
import { minecraftApi } from '../../api/minecraft';
import { toast } from 'sonner';
import { useUserRole } from '../../hooks/useUserRole';

export default function BukkitSpigotEditor() {
  const { isReadOnly } = useUserRole();
  const [activeTab, setActiveTab] = useState<'bukkit' | 'spigot'>('bukkit');
  const [bukkitConfig, setBukkitConfig] = useState<any>(null);
  const [spigotConfig, setSpigotConfig] = useState<any>(null);
  const [originalBukkit, setOriginalBukkit] = useState<any>(null);
  const [originalSpigot, setOriginalSpigot] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const [bukkit, spigot] = await Promise.all([
        minecraftApi.getBukkitConfig(),
        minecraftApi.getSpigotConfig(),
      ]);
      setBukkitConfig(bukkit);
      setSpigotConfig(spigot);
      setOriginalBukkit(bukkit);
      setOriginalSpigot(spigot);
    } catch (error) {
      console.error('Failed to fetch configs:', error);
      toast.error('Failed to load configurations');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBukkit = async () => {
    setSaving(true);
    try {
      const result = await minecraftApi.updateBukkitConfig(bukkitConfig);
      if (result.success) {
        toast.success('Bukkit configuration saved');
        setOriginalBukkit(bukkitConfig);
        await handleReload();
      } else {
        toast.error(result.message || 'Failed to save');
      }
    } catch (error) {
      console.error('Failed to save Bukkit config:', error);
      toast.error('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSpigot = async () => {
    setSaving(true);
    try {
      const result = await minecraftApi.updateSpigotConfig(spigotConfig);
      if (result.success) {
        toast.success('Spigot configuration saved');
        setOriginalSpigot(spigotConfig);
        await handleReload();
      } else {
        toast.error(result.message || 'Failed to save');
      }
    } catch (error) {
      console.error('Failed to save Spigot config:', error);
      toast.error('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleReload = async () => {
    try {
      const result = await minecraftApi.reloadServer();
      if (result.success) {
        toast.success('Server configs reloaded');
      }
    } catch (error) {
      console.error('Failed to reload server:', error);
    }
  };

  const handleResetBukkit = () => {
    setBukkitConfig(originalBukkit);
    toast.info('Bukkit changes reset');
  };

  const handleResetSpigot = () => {
    setSpigotConfig(originalSpigot);
    toast.info('Spigot changes reset');
  };

  const bukkitHasChanges = JSON.stringify(bukkitConfig) !== JSON.stringify(originalBukkit);
  const spigotHasChanges = JSON.stringify(spigotConfig) !== JSON.stringify(originalSpigot);

  if (loading || !bukkitConfig || !spigotConfig) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-white text-lg">Loading configurations...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header 
        title="Bukkit & Spigot Configuration" 
        subtitle="Edit bukkit.yml and spigot.yml"
      />
      
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          {isReadOnly && (
            <div className="mb-6 bg-yellow-900/50 border border-yellow-700 text-yellow-200 px-4 py-3 rounded-lg flex items-center gap-2">
              <Lock className="h-5 w-5" />
              <p className="text-sm font-medium">Read-only mode: You can view configuration but cannot make changes</p>
            </div>
          )}
          
          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-700">
            <button
              onClick={() => setActiveTab('bukkit')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'bukkit'
                  ? 'text-green-500 border-b-2 border-green-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Bukkit Config
            </button>
            <button
              onClick={() => setActiveTab('spigot')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'spigot'
                  ? 'text-green-500 border-b-2 border-green-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Spigot Config
            </button>
          </div>

          {/* Bukkit Tab */}
          {activeTab === 'bukkit' && (
            <>
              <div className="flex gap-3 mb-6">
                <button
                  onClick={handleSaveBukkit}
                  disabled={!bukkitHasChanges || saving || isReadOnly}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save & Reload'}
                </button>
                <button
                  onClick={handleResetBukkit}
                  disabled={!bukkitHasChanges || isReadOnly}
                  className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </button>
              </div>

              {bukkitHasChanges && (
                <div className="mb-6 bg-yellow-900 border border-yellow-700 text-yellow-200 px-4 py-3 rounded-lg">
                  <p className="text-sm">You have unsaved changes</p>
                </div>
              )}

              {/* Spawn Limits */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold text-white mb-4">Spawn Limits</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Monsters</label>
                    <input
                      type="number"
                      value={bukkitConfig['spawn-limits']?.monsters || 0}
                      disabled={isReadOnly}
                      onChange={(e) => setBukkitConfig({
                        ...bukkitConfig,
                        'spawn-limits': { ...bukkitConfig['spawn-limits'], monsters: parseInt(e.target.value) }
                      })}
                      disabled={isReadOnly}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Animals</label>
                    <input
                      type="number"
                      value={bukkitConfig['spawn-limits']?.animals || 0}
                      disabled={isReadOnly}
                      onChange={(e) => setBukkitConfig({
                        ...bukkitConfig,
                        'spawn-limits': { ...bukkitConfig['spawn-limits'], animals: parseInt(e.target.value) }
                      })}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Water Animals</label>
                    <input
                      type="number"
                      value={bukkitConfig['spawn-limits']?.['water-animals'] || 0}
                      disabled={isReadOnly}
                      onChange={(e) => setBukkitConfig({
                        ...bukkitConfig,
                        'spawn-limits': { ...bukkitConfig['spawn-limits'], 'water-animals': parseInt(e.target.value) }
                      })}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Ambient</label>
                    <input
                      type="number"
                      value={bukkitConfig['spawn-limits']?.ambient || 0}
                      disabled={isReadOnly}
                      onChange={(e) => setBukkitConfig({
                        ...bukkitConfig,
                        'spawn-limits': { ...bukkitConfig['spawn-limits'], ambient: parseInt(e.target.value) }
                      })}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Ticks Per Spawn */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Ticks Per Spawn</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Animal Spawns</label>
                    <input
                      type="number"
                      value={bukkitConfig['ticks-per']?.['animal-spawns'] || 0}
                      disabled={isReadOnly}
                      onChange={(e) => setBukkitConfig({
                        ...bukkitConfig,
                        'ticks-per': { ...bukkitConfig['ticks-per'], 'animal-spawns': parseInt(e.target.value) }
                      })}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Monster Spawns</label>
                    <input
                      type="number"
                      value={bukkitConfig['ticks-per']?.['monster-spawns'] || 0}
                      disabled={isReadOnly}
                      onChange={(e) => setBukkitConfig({
                        ...bukkitConfig,
                        'ticks-per': { ...bukkitConfig['ticks-per'], 'monster-spawns': parseInt(e.target.value) }
                      })}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Spigot Tab */}
          {activeTab === 'spigot' && (
            <>
              <div className="flex gap-3 mb-6">
                <button
                  onClick={handleSaveSpigot}
                  disabled={!spigotHasChanges || saving || isReadOnly}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save & Reload'}
                </button>
                <button
                  onClick={handleResetSpigot}
                  disabled={!spigotHasChanges || isReadOnly}
                  className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </button>
              </div>

              {spigotHasChanges && (
                <div className="mb-6 bg-yellow-900 border border-yellow-700 text-yellow-200 px-4 py-3 rounded-lg">
                  <p className="text-sm">You have unsaved changes</p>
                </div>
              )}

              {/* World Settings */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold text-white mb-4">World Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Mob Spawn Range</label>
                    <input
                      type="number"
                      value={spigotConfig['world-settings']?.default?.['mob-spawn-range'] || 0}
                      disabled={isReadOnly}
                      onChange={(e) => setSpigotConfig({
                        ...spigotConfig,
                        'world-settings': {
                          ...spigotConfig['world-settings'],
                          default: {
                            ...spigotConfig['world-settings']?.default,
                            'mob-spawn-range': parseInt(e.target.value)
                          }
                        }
                      })}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">View Distance</label>
                    <input
                      type="number"
                      value={spigotConfig['world-settings']?.default?.['view-distance'] || 0}
                      disabled={isReadOnly}
                      onChange={(e) => setSpigotConfig({
                        ...spigotConfig,
                        'world-settings': {
                          ...spigotConfig['world-settings'],
                          default: {
                            ...spigotConfig['world-settings']?.default,
                            'view-distance': parseInt(e.target.value)
                          }
                        }
                      })}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Entity Activation Range */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Entity Activation Range</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Animals</label>
                    <input
                      type="number"
                      value={spigotConfig['world-settings']?.default?.['entity-activation-range']?.animals || 0}
                      disabled={isReadOnly}
                      onChange={(e) => setSpigotConfig({
                        ...spigotConfig,
                        'world-settings': {
                          ...spigotConfig['world-settings'],
                          default: {
                            ...spigotConfig['world-settings']?.default,
                            'entity-activation-range': {
                              ...spigotConfig['world-settings']?.default?.['entity-activation-range'],
                              animals: parseInt(e.target.value)
                            }
                          }
                        }
                      })}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Monsters</label>
                    <input
                      type="number"
                      value={spigotConfig['world-settings']?.default?.['entity-activation-range']?.monsters || 0}
                      disabled={isReadOnly}
                      onChange={(e) => setSpigotConfig({
                        ...spigotConfig,
                        'world-settings': {
                          ...spigotConfig['world-settings'],
                          default: {
                            ...spigotConfig['world-settings']?.default,
                            'entity-activation-range': {
                              ...spigotConfig['world-settings']?.default?.['entity-activation-range'],
                              monsters: parseInt(e.target.value)
                            }
                          }
                        }
                      })}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Raiders</label>
                    <input
                      type="number"
                      value={spigotConfig['world-settings']?.default?.['entity-activation-range']?.raiders || 0}
                      disabled={isReadOnly}
                      onChange={(e) => setSpigotConfig({
                        ...spigotConfig,
                        'world-settings': {
                          ...spigotConfig['world-settings'],
                          default: {
                            ...spigotConfig['world-settings']?.default,
                            'entity-activation-range': {
                              ...spigotConfig['world-settings']?.default?.['entity-activation-range'],
                              raiders: parseInt(e.target.value)
                            }
                          }
                        }
                      })}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Misc</label>
                    <input
                      type="number"
                      value={spigotConfig['world-settings']?.default?.['entity-activation-range']?.misc || 0}
                      disabled={isReadOnly}
                      onChange={(e) => setSpigotConfig({
                        ...spigotConfig,
                        'world-settings': {
                          ...spigotConfig['world-settings'],
                          default: {
                            ...spigotConfig['world-settings']?.default,
                            'entity-activation-range': {
                              ...spigotConfig['world-settings']?.default?.['entity-activation-range'],
                              misc: parseInt(e.target.value)
                            }
                          }
                        }
                      })}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

