import React from 'react';

interface StatusIndicatorProps {
  status: 'success' | 'warning' | 'error' | 'info';
  message: string;
  icon?: string;
  animate?: boolean;
}

export default function StatusIndicator({ 
  status, 
  message, 
  icon,
  animate = false 
}: StatusIndicatorProps) {
  const getStatusStyles = () => {
    switch (status) {
      case 'success':
        return 'bg-green-500/20 border-green-500/50 text-green-400';
      case 'warning':
        return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400';
      case 'error':
        return 'bg-red-500/20 border-red-500/50 text-red-400';
      default:
        return 'bg-blue-500/20 border-blue-500/50 text-blue-400';
    }
  };

  const getDefaultIcon = () => {
    switch (status) {
      case 'success':
        return 'check_circle';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'info';
    }
  };

  return (
    <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${getStatusStyles()}`}>
      <span className={`material-icon text-sm ${animate ? 'animate-pulse' : ''}`}>
        {icon || getDefaultIcon()}
      </span>
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}