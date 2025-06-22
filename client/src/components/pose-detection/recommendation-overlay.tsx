import React, { useState, useEffect } from 'react';
import { RecommendationEngine, type ErgonomicRecommendation, type RecommendationContext } from '@/lib/recommendation-engine';

interface RecommendationOverlayProps {
  rulaScore?: any;
  rebaScore?: any;
  poseData?: any;
  sessionDuration: number;
  assessmentType: 'rula' | 'reba' | 'both';
  isVisible?: boolean;
  enabledCategories?: string[];
}

export default function RecommendationOverlay({
  rulaScore,
  rebaScore,
  poseData,
  sessionDuration,
  assessmentType,
  isVisible = true,
  enabledCategories = ['posture', 'movement', 'breaks', 'environment']
}: RecommendationOverlayProps) {
  const [recommendations, setRecommendations] = useState<ErgonomicRecommendation[]>([]);
  const [dismissedRecommendations, setDismissedRecommendations] = useState<Set<string>>(new Set());
  const [expandedRecommendation, setExpandedRecommendation] = useState<string | null>(null);

  useEffect(() => {
    if (!isVisible) return;

    const context: RecommendationContext = {
      rulaScore,
      rebaScore,
      poseData,
      sessionDuration,
      assessmentType,
      previousRecommendations: enabledCategories
    };

    const newRecommendations = RecommendationEngine.generateRecommendations(context);
    const filteredRecommendations = newRecommendations.filter(
      rec => !dismissedRecommendations.has(rec.id)
    );
    
    setRecommendations(filteredRecommendations);
  }, [rulaScore, rebaScore, poseData, sessionDuration, assessmentType, isVisible, dismissedRecommendations]);

  const handleDismissRecommendation = (id: string) => {
    setDismissedRecommendations(prev => new Set([...prev, id]));
    RecommendationEngine.markRecommendationShown(id);
    
    // Auto-clear dismissed recommendations after 5 minutes
    setTimeout(() => {
      setDismissedRecommendations(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }, 5 * 60 * 1000);
  };

  const toggleExpanded = (id: string) => {
    setExpandedRecommendation(expandedRecommendation === id ? null : id);
  };

  if (!isVisible || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {recommendations.map((recommendation, index) => (
        <div
          key={recommendation.id}
          className={`bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-sm border rounded-xl shadow-lg transition-all duration-300 ${
            expandedRecommendation === recommendation.id ? 'ring-2 ring-blue-500/50' : 'hover:shadow-xl'
          } ${
            recommendation.priority === 'critical' ? 'border-red-500/50' :
            recommendation.priority === 'high' ? 'border-orange-500/50' :
            recommendation.priority === 'medium' ? 'border-yellow-500/50' :
            'border-blue-500/50'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 pb-3">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${RecommendationEngine.getRecommendationColor(recommendation.priority)}`}>
                <span className="material-icon text-white text-lg">{recommendation.icon}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-semibold text-white text-sm">{recommendation.title}</h4>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    recommendation.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                    recommendation.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                    recommendation.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {recommendation.priority}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{recommendation.category}</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => toggleExpanded(recommendation.id)}
                className="p-1.5 hover:bg-gray-700/50 rounded-lg transition-all duration-200"
                title={expandedRecommendation === recommendation.id ? "Collapse" : "Expand"}
              >
                <span className={`material-icon text-gray-400 text-sm transition-transform duration-200 ${
                  expandedRecommendation === recommendation.id ? 'rotate-180' : ''
                }`}>
                  expand_more
                </span>
              </button>
              <button
                onClick={() => handleDismissRecommendation(recommendation.id)}
                className="p-1.5 hover:bg-gray-700/50 rounded-lg transition-all duration-200"
                title="Dismiss"
              >
                <span className="material-icon text-gray-400 text-sm">close</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 pb-4">
            <p className="text-sm text-gray-300 mb-3">{recommendation.description}</p>
            
            {expandedRecommendation === recommendation.id && (
              <div className="space-y-3 animate-fadeIn">
                <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-600/30">
                  <h5 className="text-xs font-medium text-gray-400 mb-2">Recommended Action:</h5>
                  <p className="text-sm text-white">{recommendation.action}</p>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="material-icon text-gray-500 text-sm">schedule</span>
                    <span className="text-gray-400">
                      {recommendation.duration || 'Immediate'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="material-icon text-gray-500 text-sm">person</span>
                    <span className="text-gray-400">
                      {recommendation.bodyPart.join(', ')}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Action Buttons */}
            <div className="flex space-x-2 mt-3">
              <button
                onClick={() => handleDismissRecommendation(recommendation.id)}
                className="flex-1 bg-gray-700/50 hover:bg-gray-600/50 px-3 py-2 rounded-lg text-xs text-gray-300 transition-all duration-200 flex items-center justify-center space-x-1"
              >
                <span className="material-icon text-xs">check</span>
                <span>Done</span>
              </button>
              <button
                onClick={() => {
                  // Snooze for 5 minutes
                  handleDismissRecommendation(recommendation.id);
                  setTimeout(() => {
                    setDismissedRecommendations(prev => {
                      const newSet = new Set(prev);
                      newSet.delete(recommendation.id);
                      return newSet;
                    });
                  }, 5 * 60 * 1000);
                }}
                className="flex-1 bg-yellow-500/20 hover:bg-yellow-500/30 px-3 py-2 rounded-lg text-xs text-yellow-400 transition-all duration-200 flex items-center justify-center space-x-1"
              >
                <span className="material-icon text-xs">snooze</span>
                <span>5min</span>
              </button>
            </div>
          </div>
        </div>
      ))}
      
      {/* Global Actions */}
      {recommendations.length > 1 && (
        <div className="flex justify-end">
          <button
            onClick={() => {
              recommendations.forEach(rec => handleDismissRecommendation(rec.id));
            }}
            className="bg-gray-700/50 hover:bg-gray-600/50 px-4 py-2 rounded-lg text-sm text-gray-300 transition-all duration-200 flex items-center space-x-2"
          >
            <span className="material-icon text-sm">clear_all</span>
            <span>Dismiss All</span>
          </button>
        </div>
      )}
    </div>
  );
}

// Add custom CSS for animations
const styles = `
@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    height: 0;
  }
  to {
    opacity: 1;
    height: auto;
  }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out forwards;
}
`;