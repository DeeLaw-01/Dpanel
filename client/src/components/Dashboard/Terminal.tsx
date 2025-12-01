import { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';

interface TerminalProps {
  logs: string[];
  onCommand: (command: string) => void;
}

export default function Terminal({ logs, onCommand }: TerminalProps) {
  const [command, setCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (command.trim()) {
      onCommand(command);
      setCommandHistory([...commandHistory, command]);
      setCommand('');
      setHistoryIndex(-1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 
          ? commandHistory.length - 1 
          : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCommand(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex >= 0) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setCommand('');
        } else {
          setHistoryIndex(newIndex);
          setCommand(commandHistory[newIndex]);
        }
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg border border-gray-700">
      {/* Logs Area */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-sm">
        {logs.length === 0 ? (
          <p className="text-gray-500">No logs available. Server may be starting...</p>
        ) : (
          logs.map((log, index) => (
            <div
              key={index}
              className={`py-0.5 ${
                log.includes('ERROR') || log.includes('SEVERE')
                  ? 'text-red-400'
                  : log.includes('WARN')
                  ? 'text-yellow-400'
                  : log.includes('INFO')
                  ? 'text-green-400'
                  : 'text-gray-300'
              }`}
            >
              {log}
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>

      {/* Command Input */}
      <form onSubmit={handleSubmit} className="border-t border-gray-700 p-4">
        <div className="flex gap-2">
          <span className="text-green-500 font-mono self-center">$</span>
          <input
            ref={inputRef}
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter server command (e.g., list, stop, say Hello)"
            className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-green-500"
          />
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors"
          >
            <Send className="h-4 w-4" />
            Send
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Use ↑/↓ arrow keys to navigate command history
        </p>
      </form>
    </div>
  );
}

