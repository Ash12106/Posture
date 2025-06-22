import React, { useState, useEffect } from 'react';
import { RecommendationEngine, type ErgonomicRecommendation, type RecommendationContext } from '@/lib/recommendation-engine';
import RecommendationSettings from './recommendation-settings';

interface RecommendationPanelProps {
  rulaScore?: any;
  rebaScore?: any;
  poseData?: any;
  sessionDuration: number;
  assessmentType: 'rula' | 'reba' | 'both';
  recommendationsVisible: boolean;
  onVisibilityChange: (visible: boolean) => void;
  notificationFrequency: number;
  onFrequencyChange: (frequency: number) => void;
  enabledCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
}

export default function RecommendationPanel({
  rulaScore,
  rebaScore,
  poseData,
  sessionDuration,
  assessmentType,
  recommendationsVisible,
  onVisibilityChange,
  notificationFrequency,
  onFrequencyChange,
  enabledCategories,
  onCategoriesChange
}: RecommendationPanelProps) {
  const [recommendations, setRecommendations] = useState<ErgonomicRecommendation[]>([]);
  const [dismissedRecommendations, setDismissedRecommendations] = useState<Set<string>>(new Set());
  const [expandedRecommendation, setExpandedRecommendation] = useState<string | null>(null);

  useEffect(() => {
    if (!recommendationsVisible) return;

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
  }, [rulaScore, rebaScore, poseData, sessionDuration, assessmentType, recommendationsVisible, dismissedRecommendations, enabledCategories]);

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
  return (
    <div className="bg-gradient-to-br from-dark-card to-dark-secondary rounded-xl shadow-2xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-600">
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-r from-green-500 to-blue-500 p-2 rounded-lg">
            <span className="material-icon text-white text-xl">psychology</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Smart Recommendations</h3>
            <p className="text-xs text-gray-400">Real-time ergonomic guidance</p>
          </div>
          
          {/* Live Assessment Status */}
          <div className="flex items-center space-x-4 ml-8">
            {rulaScore && (assessmentType === 'rula' || assessmentType === 'both') && (
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  rulaScore.finalScore <= 2 ? 'bg-green-400' :
                  rulaScore.finalScore <= 4 ? 'bg-yellow-400' :
                  rulaScore.finalScore <= 6 ? 'bg-orange-400' : 'bg-red-400'
                } animate-pulse`}></div>
                <div className="text-xs">
                  <div className="text-gray-400">RULA</div>
                  <div className="text-white font-mono">{rulaScore.finalScore}/7</div>
                </div>
              </div>
            )}
            
            {rebaScore && (assessmentType === 'reba' || assessmentType === 'both') && (
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  rebaScore.finalScore === 1 ? 'bg-green-400' :
                  rebaScore.finalScore <= 3 ? 'bg-yellow-400' :
                  rebaScore.finalScore <= 7 ? 'bg-orange-400' :
                  rebaScore.finalScore <= 10 ? 'bg-red-400' : 'bg-red-500'
                } animate-pulse`}></div>
                <div className="text-xs">
                  <div className="text-gray-400">REBA</div>
                  <div className="text-white font-mono">{rebaScore.finalScore}/15</div>
                </div>
              </div>
            )}
            
            {(rulaScore || rebaScore) && (
              <div className="text-xs">
                <div className="text-gray-400">Session</div>
                <div className="text-white font-mono">{Math.floor(sessionDuration / 60)}:{(sessionDuration % 60).toString().padStart(2, '0')}</div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <RecommendationSettings
            isVisible={recommendationsVisible}
            onVisibilityChange={onVisibilityChange}
            notificationFrequency={notificationFrequency}
            onFrequencyChange={onFrequencyChange}
            enabledCategories={enabledCategories}
            onCategoriesChange={onCategoriesChange}
          />
        </div>
      </div>

      {recommendationsVisible ? (
        <div className="min-h-[200px]">
          {recommendations.length > 0 ? (
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
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${RecommendationEngine.getRecommendationColor(recommendation.priority)} ${
                        recommendation.priority === 'critical' ? 'animate-pulse' : ''
                      }`}>
                        <span className="material-icon text-white text-lg">{recommendation.icon}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-white text-sm">{recommendation.title}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            recommendation.priority === 'critical' ? 'bg-red-500/20 text-red-400 animate-pulse' :
                            recommendation.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                            recommendation.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {recommendation.priority.toUpperCase()}
                          </span>
                          <span className="text-xs bg-gray-700/50 text-gray-300 px-2 py-0.5 rounded">
                            LIVE
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1 capitalize">{recommendation.category} • {recommendation.bodyPart.join(', ')}</p>
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
          ) : !rulaScore && !rebaScore ? (
            <div className="space-y-6">
              {/* No Assessment State */}
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="bg-gray-800/50 p-4 rounded-full mb-4">
                  <span className="material-icon text-gray-500 text-3xl">sensors_off</span>
                </div>
                <h4 className="text-lg font-medium text-gray-300 mb-2">No Active Assessment</h4>
                <p className="text-sm text-gray-500 max-w-sm">
                  Start your camera and enable pose detection to receive personalized ergonomic recommendations.
                </p>
              </div>
              
              {/* Assessment Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="material-icon text-blue-400 text-lg">trending_up</span>
                    <h5 className="font-medium text-blue-400">RULA Assessment</h5>
                  </div>
                  <p className="text-xs text-gray-400">
                    Rapid Upper Limb Assessment for evaluating work-related upper limb disorders. Score range: 1-7.
                  </p>
                </div>
                
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="material-icon text-purple-400 text-lg">analytics</span>
                    <h5 className="font-medium text-purple-400">REBA Assessment</h5>
                  </div>
                  <p className="text-xs text-gray-400">
                    Rapid Entire Body Assessment for analyzing postural risks. Score range: 1-15.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Good Posture State with Live Analysis */}
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-500/20 p-2 rounded-lg">
                      <span className="material-icon text-green-400 text-xl">check_circle</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-green-400">Excellent Posture!</h4>
                      <p className="text-sm text-gray-400">Your current posture is within acceptable limits</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400 mb-1">Risk Level</div>
                    <div className="text-green-400 font-medium">Low</div>
                  </div>
                </div>
                
                {/* Live Score Display */}
                <div className="grid grid-cols-2 gap-4">
                  {rulaScore && (assessmentType === 'rula' || assessmentType === 'both') && (
                    <div className="bg-gray-800/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">RULA Score</span>
                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">Live</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl font-bold text-white">{rulaScore.finalScore}</div>
                        <div className="flex-1">
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-500 ${
                                rulaScore.finalScore <= 2 ? 'bg-green-400' :
                                rulaScore.finalScore <= 4 ? 'bg-yellow-400' :
                                rulaScore.finalScore <= 6 ? 'bg-orange-400' : 'bg-red-400'
                              }`}
                              style={{width: `${(rulaScore.finalScore / 7) * 100}%`}}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-400 mt-1">{rulaScore.riskLevel}</div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {rebaScore && (assessmentType === 'reba' || assessmentType === 'both') && (
                    <div className="bg-gray-800/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">REBA Score</span>
                        <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">Live</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl font-bold text-white">{rebaScore.finalScore}</div>
                        <div className="flex-1">
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-500 ${
                                rebaScore.finalScore === 1 ? 'bg-green-400' :
                                rebaScore.finalScore <= 3 ? 'bg-yellow-400' :
                                rebaScore.finalScore <= 7 ? 'bg-orange-400' :
                                rebaScore.finalScore <= 10 ? 'bg-red-400' : 'bg-red-500'
                              }`}
                              style={{width: `${(rebaScore.finalScore / 15) * 100}%`}}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-400 mt-1">{rebaScore.riskLevel}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Positive Reinforcement */}
                <div className="mt-4 p-3 bg-green-500/5 rounded-lg border border-green-500/20">
                  <p className="text-sm text-green-400 font-medium">Keep it up!</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Maintain this posture and take regular breaks to prevent fatigue.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="bg-gray-800/50 p-4 rounded-full mb-4">
            <span className="material-icon text-gray-500 text-3xl">notifications_off</span>
          </div>
          <h4 className="text-lg font-medium text-gray-300 mb-2">Recommendations Disabled</h4>
          <p className="text-sm text-gray-500 mb-4">
            Enable recommendations in settings to receive real-time ergonomic guidance.
          </p>
          <button
            onClick={() => onVisibilityChange(true)}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 px-4 py-2 rounded-lg text-white font-medium transition-all duration-200 flex items-center space-x-2"
          >
            <span className="material-icon text-sm">notifications_active</span>
            <span>Enable Recommendations</span>
          </button>
        </div>
      )}
    </div>
  );
}