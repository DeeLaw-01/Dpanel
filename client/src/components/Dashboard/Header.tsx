import { Activity } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <div className="border-b border-gray-800 bg-gray-900 px-4 md:px-6 py-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">{title}</h1>
          {subtitle && <p className="mt-1 text-xs md:text-sm text-gray-400">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-green-600 px-2 md:px-3 py-1.5 md:py-2">
          <Activity className="h-3 w-3 md:h-4 md:w-4 text-white animate-pulse" />
          <span className="text-xs md:text-sm font-medium text-white hidden sm:inline">Server Online</span>
        </div>
      </div>
    </div>
  );
}

