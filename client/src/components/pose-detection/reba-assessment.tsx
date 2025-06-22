import React from 'react';

interface RebaAssessmentProps {
  rebaScore: any;
  poseData: any;
  isProcessing: boolean;
}

export default function RebaAssessment({ rebaScore, poseData, isProcessing }: RebaAssessmentProps) {
  const getRiskLevelColor = (score: number) => {
    if (score === 1) return 'bg-green-500';
    if (score <= 3) return 'bg-yellow-500';
    if (score <= 7) return 'bg-orange-500';
    if (score <= 10) return 'bg-red-500';
    return 'bg-red-700';
  };

  const getRiskLevelTextColor = (score: number) => {
    if (score === 1) return 'text-green-400';
    if (score <= 3) return 'text-yellow-400';
    if (score <= 7) return 'text-orange-400';
    if (score <= 10) return 'text-red-400';
    return 'text-red-300';
  };

  const getScoreProgress = (score: number, max: number) => {
    return (score / max) * 100;
  };

  if (isProcessing) {
    return (
      <div className="bg-dark-card rounded-lg p-6 animate-pulse">
        <div className="h-4 bg-gray-600 rounded mb-4"></div>
        <div className="space-y-3">
          <div className="h-3 bg-gray-600 rounded"></div>
          <div className="h-3 bg-gray-600 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark-card rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">REBA Assessment</h3>
        <span className="text-xs text-text-secondary bg-dark-secondary px-2 py-1 rounded">
          Rapid Entire Body Assessment
        </span>
      </div>

      {rebaScore && (
        <div className="space-y-6">
          {/* Final Score Section */}
          <div className="bg-dark-secondary rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-text-secondary">Final REBA Score</span>
              <span className="text-xs bg-gray-600 px-2 py-1 rounded">1-15 Scale</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-3xl font-bold text-white">
                {rebaScore.finalScore}
              </div>
              <div className="flex-1">
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${getRiskLevelColor(rebaScore.finalScore)}`}
                    style={{width: `${(rebaScore.finalScore / 15) * 100}%`}}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-text-secondary mt-1">
                  <span>Low Risk</span>
                  <span>High Risk</span>
                </div>
              </div>
            </div>
            <div className={`mt-3 text-sm font-medium ${getRiskLevelTextColor(rebaScore.finalScore)}`}>
              Risk Level: {rebaScore.riskLevel}
            </div>
            <div className="text-xs text-text-secondary mt-1">
              Action: {rebaScore.actionLevel}
            </div>
          </div>

          {/* Body Part Scores */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-dark-secondary rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-text-secondary">Neck</span>
                <span className="text-lg">🦴</span>
              </div>
              <div className="text-2xl font-bold mb-1">
                {rebaScore.neck || '--'}
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                  style={{width: `${rebaScore ? getScoreProgress(rebaScore.neck, 3) : 0}%`}}
                ></div>
              </div>
            </div>

            <div className="bg-dark-secondary rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-text-secondary">Trunk</span>
                <span className="text-lg">🏃</span>
              </div>
              <div className="text-2xl font-bold mb-1">
                {rebaScore.trunk || '--'}
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all duration-300" 
                  style={{width: `${rebaScore ? getScoreProgress(rebaScore.trunk, 5) : 0}%`}}
                ></div>
              </div>
            </div>

            <div className="bg-dark-secondary rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-text-secondary">Legs</span>
                <span className="text-lg">🦵</span>
              </div>
              <div className="text-2xl font-bold mb-1">
                {rebaScore.legs || '--'}
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-indigo-500 h-2 rounded-full transition-all duration-300" 
                  style={{width: `${rebaScore ? getScoreProgress(rebaScore.legs, 4) : 0}%`}}
                ></div>
              </div>
            </div>

            <div className="bg-dark-secondary rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-text-secondary">Upper Arm</span>
                <span className="text-lg">💪</span>
              </div>
              <div className="text-2xl font-bold mb-1">
                {rebaScore.upperArm || '--'}
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full transition-all duration-300" 
                  style={{width: `${rebaScore ? getScoreProgress(rebaScore.upperArm, 6) : 0}%`}}
                ></div>
              </div>
            </div>

            <div className="bg-dark-secondary rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-text-secondary">Lower Arm</span>
                <span className="text-lg">🔧</span>
              </div>
              <div className="text-2xl font-bold mb-1">
                {rebaScore.lowerArm || '--'}
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full transition-all duration-300" 
                  style={{width: `${rebaScore ? getScoreProgress(rebaScore.lowerArm, 2) : 0}%`}}
                ></div>
              </div>
            </div>

            <div className="bg-dark-secondary rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-text-secondary">Wrist</span>
                <span className="text-lg">✋</span>
              </div>
              <div className="text-2xl font-bold mb-1">
                {rebaScore.wrist || '--'}
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                  style={{width: `${rebaScore ? getScoreProgress(rebaScore.wrist, 3) : 0}%`}}
                ></div>
              </div>
            </div>
          </div>

          {/* Group Scores */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-dark-secondary rounded-lg p-4">
              <div className="text-sm text-text-secondary mb-1">Score A (Neck, Trunk, Legs)</div>
              <div className="text-xl font-bold">{rebaScore.scoreA}</div>
            </div>
            <div className="bg-dark-secondary rounded-lg p-4">
              <div className="text-sm text-text-secondary mb-1">Score B (Arms, Wrist)</div>
              <div className="text-xl font-bold">{rebaScore.scoreB}</div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-dark-secondary rounded-lg p-4">
            <h4 className="text-sm font-medium text-white mb-2">Recommendations</h4>
            <div className="text-sm text-text-secondary">
              <p>
                {rebaScore.finalScore === 1
                  ? 'Current posture is acceptable with negligible risk of musculoskeletal disorders.'
                  : rebaScore.finalScore <= 3
                  ? 'Low risk detected. Minor improvements may be beneficial for long-term comfort.'
                  : rebaScore.finalScore <= 7
                  ? 'Medium risk identified. Investigation and corrective measures are necessary to prevent injury.'
                  : rebaScore.finalScore <= 10
                  ? 'High risk detected. Investigation and corrective measures should be implemented soon.'
                  : 'Very high risk identified. Investigation and corrective measures must be implemented immediately.'
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}