import { Activity } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <div className="border-b border-gray-800 bg-gray-900 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-gray-400">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2">
          <Activity className="h-4 w-4 text-white animate-pulse" />
          <span className="text-sm font-medium text-white">Server Online</span>
        </div>
      </div>
    </div>
  );
}

