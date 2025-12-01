import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Terminal, 
  BarChart3, 
  FileEdit, 
  FileCode,
  Server
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Console', href: '/console', icon: Terminal },
  { name: 'Stats', href: '/stats', icon: BarChart3 },
  { name: 'Server Config', href: '/config', icon: FileEdit },
  { name: 'Bukkit/Spigot', href: '/bukkit-spigot', icon: FileCode },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="flex h-screen w-64 flex-col bg-gray-900 border-r border-gray-800">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 px-6 border-b border-gray-800">
        <Server className="h-8 w-8 text-green-500" />
        <span className="text-xl font-bold text-white">DPanel</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`
                flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                ${isActive 
                  ? 'bg-green-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }
              `}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-800 p-4">
        <div className="text-xs text-gray-400">
          <p>Minecraft Server Dashboard</p>
          <p className="mt-1">v1.0.0</p>
        </div>
      </div>
    </div>
  );
}

