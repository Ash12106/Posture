import React, { useState } from 'react';

interface RecommendationSettingsProps {
  isVisible: boolean;
  onVisibilityChange: (visible: boolean) => void;
  notificationFrequency: number;
  onFrequencyChange: (frequency: number) => void;
  enabledCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
}

export default function RecommendationSettings({
  isVisible,
  onVisibilityChange,
  notificationFrequency,
  onFrequencyChange,
  enabledCategories,
  onCategoriesChange
}: RecommendationSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const categories = [
    { id: 'posture', label: 'Posture Corrections', icon: 'straighten' },
    { id: 'movement', label: 'Movement Guidance', icon: 'directions_walk' },
    { id: 'breaks', label: 'Break Reminders', icon: 'schedule' },
    { id: 'environment', label: 'Environment Setup', icon: 'settings' }
  ];

  const frequencies = [
    { value: 1, label: 'High (1 min)' },
    { value: 3, label: 'Medium (3 min)' },
    { value: 5, label: 'Low (5 min)' },
    { value: 10, label: 'Minimal (10 min)' }
  ];

  const toggleCategory = (categoryId: string) => {
    const newCategories = enabledCategories.includes(categoryId)
      ? enabledCategories.filter(id => id !== categoryId)
      : [...enabledCategories, categoryId];
    onCategoriesChange(newCategories);
  };

  return (
    <div className="relative">
      {/* Settings Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2.5 rounded-lg transition-all duration-200 ${
          isOpen 
            ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400' 
            : 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-400'
        }`}
        title="Recommendation Settings"
      >
        <span className="material-icon text-sm">tune</span>
      </button>

      {/* Settings Panel */}
      {isOpen && (
        <div className="absolute top-12 right-0 bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-sm border border-gray-600/50 rounded-xl p-4 shadow-2xl z-50 w-80">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-600/50">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-500/20 p-1.5 rounded-lg">
                <span className="material-icon text-blue-400 text-sm">tune</span>
              </div>
              <h3 className="font-semibold text-white">Recommendations</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-700/50 rounded transition-all duration-200"
            >
              <span className="material-icon text-gray-400 text-sm">close</span>
            </button>
          </div>

          <div className="space-y-4">
            {/* Visibility Toggle */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-white">Show Recommendations</label>
              <button
                onClick={() => onVisibilityChange(!isVisible)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isVisible ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isVisible ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Frequency Setting */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Notification Frequency
              </label>
              <select
                value={notificationFrequency}
                onChange={(e) => onFrequencyChange(Number(e.target.value))}
                className="w-full bg-gray-700/50 text-white px-3 py-2 rounded-lg border border-gray-600/50 focus:border-blue-500 focus:outline-none text-sm"
              >
                {frequencies.map(freq => (
                  <option key={freq.value} value={freq.value} className="bg-gray-800">
                    {freq.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Settings */}
            <div>
              <label className="block text-sm font-medium text-white mb-3">
                Recommendation Types
              </label>
              <div className="space-y-2">
                {categories.map(category => (
                  <div key={category.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="material-icon text-gray-400 text-sm">{category.icon}</span>
                      <span className="text-sm text-gray-300">{category.label}</span>
                    </div>
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        enabledCategories.includes(category.id) ? 'bg-green-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          enabledCategories.includes(category.id) ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Reset Button */}
            <div className="pt-3 border-t border-gray-600/50">
              <button
                onClick={() => {
                  onVisibilityChange(true);
                  onFrequencyChange(3);
                  onCategoriesChange(['posture', 'movement', 'breaks', 'environment']);
                }}
                className="w-full bg-gray-700/50 hover:bg-gray-600/50 px-3 py-2 rounded-lg text-sm text-gray-300 transition-all duration-200 flex items-center justify-center space-x-1"
              >
                <span className="material-icon text-xs">restore</span>
                <span>Reset to Defaults</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}