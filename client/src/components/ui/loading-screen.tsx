import React from 'react';

interface LoadingScreenProps {
  message?: string;
  progress?: number;
}

export default function LoadingScreen({ 
  message = "Initializing ErgoTrack...", 
  progress 
}: LoadingScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
      <div className="text-center space-y-8">
        {/* Logo/Icon */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6 rounded-full inline-block">
            <span className="material-icon text-white text-6xl">accessibility_new</span>
          </div>
        </div>

        {/* App Title */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white">ErgoTrack</h1>
          <p className="text-gray-400">Professional Ergonomic Assessment Platform</p>
        </div>

        {/* Loading Animation */}
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          </div>
          
          {/* Progress Bar */}
          {progress !== undefined && (
            <div className="w-80 bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}
          
          <p className="text-gray-300 font-medium">{message}</p>
        </div>

        {/* Features List */}
        <div className="mt-12 space-y-3 text-sm text-gray-400">
          <div className="flex items-center justify-center space-x-2">
            <span className="material-icon text-green-400 text-sm">check_circle</span>
            <span>Real-time pose detection</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <span className="material-icon text-green-400 text-sm">check_circle</span>
            <span>RULA & REBA assessments</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <span className="material-icon text-green-400 text-sm">check_circle</span>
            <span>3D visualization & reporting</span>
          </div>
        </div>
      </div>
    </div>
  );
}