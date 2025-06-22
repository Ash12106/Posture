interface RulaAssessmentProps {
  rulaScore: any;
  poseData: any;
  isProcessing: boolean;
}

export default function RulaAssessment({ rulaScore, poseData, isProcessing }: RulaAssessmentProps) {
  const getRiskLevelColor = (score: number) => {
    if (score <= 2) return 'bg-rula-safe';
    if (score <= 4) return 'bg-rula-investigate';
    if (score <= 6) return 'bg-rula-change-soon';
    return 'bg-rula-change-asap';
  };

  const getRiskLevelText = (score: number) => {
    if (score <= 2) return 'Acceptable';
    if (score <= 4) return 'Investigate';
    if (score <= 6) return 'Investigate & Change Soon';
    return 'Investigate & Change ASAP';
  };

  const getRiskLevelTextColor = (score: number) => {
    if (score <= 2) return 'text-rula-safe';
    if (score <= 4) return 'text-rula-investigate';
    if (score <= 6) return 'text-rula-change-soon';
    return 'text-rula-change-asap';
  };

  const getScoreProgress = (score: number, max: number) => {
    return (score / max) * 100;
  };

  return (
    <div className="bg-gradient-to-br from-dark-card to-dark-secondary rounded-xl shadow-2xl p-6 mb-6 border border-gray-700">
      {/* Header with improved styling */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-600">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-lg">
            <span className="material-icon text-white text-xl">assessment</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">RULA Assessment</h3>
            <p className="text-xs text-gray-400">Rapid Upper Limb Assessment</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${isProcessing ? 'bg-green-400 animate-pulse shadow-lg shadow-green-400/50' : 'bg-gray-500'}`}></div>
          <div className="text-right">
            <span className="text-sm font-medium text-white">
              {isProcessing ? 'Live Analysis' : 'Standby'}
            </span>
            <p className="text-xs text-gray-400">
              {isProcessing ? 'Real-time scoring' : 'Awaiting pose data'}
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Main Score Display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Primary Score Circle */}
        <div className="lg:col-span-1 flex flex-col items-center">
          <div className="relative">
            <div className={`w-32 h-32 rounded-full flex items-center justify-center shadow-2xl ${
              rulaScore ? getRiskLevelColor(rulaScore.finalScore) : 'bg-gray-600'
            } border-4 border-white/20`}>
              <span className="text-4xl font-black text-white drop-shadow-lg">
                {rulaScore ? rulaScore.finalScore : '--'}
              </span>
            </div>
            {rulaScore && (
              <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg">
                <span className={`material-icon text-lg ${
                  rulaScore.finalScore <= 2 ? 'text-green-500' : 
                  rulaScore.finalScore <= 4 ? 'text-yellow-500' :
                  rulaScore.finalScore <= 6 ? 'text-orange-500' : 'text-red-500'
                }`}>
                  {rulaScore.finalScore <= 2 ? 'check_circle' : 
                   rulaScore.finalScore <= 4 ? 'info' :
                   rulaScore.finalScore <= 6 ? 'warning' : 'error'}
                </span>
              </div>
            )}
          </div>
          <div className="text-center mt-4">
            <h4 className="text-lg font-bold text-white mb-1">RULA Score</h4>
            <p className="text-sm text-gray-400">Scale: 1-7</p>
          </div>
        </div>
        
        {/* Risk Level & Action */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-dark-card rounded-lg p-4 border border-gray-600">
            <div className="flex items-center space-x-3 mb-3">
              <span className="material-icon text-orange-400">shield</span>
              <h5 className="font-semibold text-white">Risk Level</h5>
            </div>
            <div className={`text-2xl font-bold mb-2 ${
              rulaScore ? getRiskLevelTextColor(rulaScore.finalScore) : 'text-gray-400'
            }`}>
              {rulaScore ? getRiskLevelText(rulaScore.finalScore) : 'No Assessment'}
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ${
                  rulaScore?.finalScore <= 2 ? 'bg-gradient-to-r from-green-500 to-green-400' :
                  rulaScore?.finalScore <= 4 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' :
                  rulaScore?.finalScore <= 6 ? 'bg-gradient-to-r from-orange-500 to-orange-400' : 
                  'bg-gradient-to-r from-red-500 to-red-400'
                }`}
                style={{width: `${rulaScore ? (rulaScore.finalScore / 7) * 100 : 0}%`}}
              ></div>
            </div>
          </div>
          
          {rulaScore && (
            <div className="bg-dark-card rounded-lg p-4 border border-gray-600">
              <div className="flex items-center space-x-3 mb-2">
                <span className="material-icon text-blue-400">lightbulb</span>
                <h5 className="font-semibold text-white">Recommended Action</h5>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                {rulaScore.finalScore <= 2 
                  ? 'Posture is acceptable if maintained for short periods. Continue current practices.'
                  : rulaScore.finalScore <= 4
                  ? 'Further investigation needed. Consider postural adjustments and breaks.'
                  : rulaScore.finalScore <= 6
                  ? 'Investigation and changes required soon. Implement ergonomic improvements.'
                  : 'Investigation and changes required immediately. Critical intervention needed.'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Body Part Analysis */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <span className="material-icon text-purple-400">anatomy</span>
          <span>Body Part Analysis</span>
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-dark-secondary to-gray-800 rounded-xl p-4 border border-gray-600 hover:border-orange-500/50 transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-300">Upper Arm</span>
            <div className="bg-orange-500/20 p-1.5 rounded-lg">
              <span className="material-icon text-orange-400 text-lg">accessibility</span>
            </div>
          </div>
          <div className="text-3xl font-black text-white mb-2">
            {rulaScore?.upperArm || '--'}
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-orange-500 to-orange-400 h-2.5 rounded-full transition-all duration-500 shadow-lg shadow-orange-500/30" 
              style={{width: `${rulaScore ? getScoreProgress(rulaScore.upperArm, 4) : 0}%`}}
            ></div>
          </div>
          <div className="text-xs text-gray-400 mt-1">Max: 4</div>
        </div>

        <div className="bg-gradient-to-br from-dark-secondary to-gray-800 rounded-xl p-4 border border-gray-600 hover:border-blue-500/50 transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-300">Lower Arm</span>
            <div className="bg-blue-500/20 p-1.5 rounded-lg">
              <span className="material-icon text-blue-400 text-lg">pan_tool</span>
            </div>
          </div>
          <div className="text-3xl font-black text-white mb-2">
            {rulaScore?.lowerArm || '--'}
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-400 h-2.5 rounded-full transition-all duration-500 shadow-lg shadow-blue-500/30" 
              style={{width: `${rulaScore ? getScoreProgress(rulaScore.lowerArm, 2) : 0}%`}}
            ></div>
          </div>
          <div className="text-xs text-gray-400 mt-1">Max: 2</div>
        </div>

        <div className="bg-gradient-to-br from-dark-secondary to-gray-800 rounded-xl p-4 border border-gray-600 hover:border-green-500/50 transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-300">Wrist</span>
            <div className="bg-green-500/20 p-1.5 rounded-lg">
              <span className="material-icon text-green-400 text-lg">back_hand</span>
            </div>
          </div>
          <div className="text-3xl font-black text-white mb-2">
            {rulaScore?.wrist || '--'}
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-green-500 to-green-400 h-2.5 rounded-full transition-all duration-500 shadow-lg shadow-green-500/30" 
              style={{width: `${rulaScore ? getScoreProgress(rulaScore.wrist, 2) : 0}%`}}
            ></div>
          </div>
          <div className="text-xs text-gray-400 mt-1">Max: 2</div>
        </div>

        <div className="bg-gradient-to-br from-dark-secondary to-gray-800 rounded-xl p-4 border border-gray-600 hover:border-purple-500/50 transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-300">Neck</span>
            <div className="bg-purple-500/20 p-1.5 rounded-lg">
              <span className="material-icon text-purple-400 text-lg">face</span>
            </div>
          </div>
          <div className="text-3xl font-black text-white mb-2">
            {rulaScore?.neck || '--'}
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-purple-500 to-purple-400 h-2.5 rounded-full transition-all duration-500 shadow-lg shadow-purple-500/30" 
              style={{width: `${rulaScore ? getScoreProgress(rulaScore.neck, 4) : 0}%`}}
            ></div>
          </div>
          <div className="text-xs text-gray-400 mt-1">Max: 4</div>
        </div>

        <div className="bg-gradient-to-br from-dark-secondary to-gray-800 rounded-xl p-4 border border-gray-600 hover:border-red-500/50 transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-300">Trunk</span>
            <div className="bg-red-500/20 p-1.5 rounded-lg">
              <span className="material-icon text-red-400 text-lg">accessibility_new</span>
            </div>
          </div>
          <div className="text-3xl font-black text-white mb-2">
            {rulaScore?.trunk || '--'}
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-red-500 to-red-400 h-2.5 rounded-full transition-all duration-500 shadow-lg shadow-red-500/30" 
              style={{width: `${rulaScore ? getScoreProgress(rulaScore.trunk, 4) : 0}%`}}
            ></div>
          </div>
          <div className="text-xs text-gray-400 mt-1">Max: 4</div>
        </div>
      </div>
      </div>

      {/* Enhanced Group Scores Summary */}
      {rulaScore && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-xl p-4 border border-blue-500/30">
            <div className="flex items-center space-x-3 mb-2">
              <div className="bg-blue-500/20 p-2 rounded-lg">
                <span className="material-icon text-blue-400">group_work</span>
              </div>
              <div>
                <h5 className="font-semibold text-white">Score A</h5>
                <p className="text-xs text-gray-400">Arm & Wrist</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-blue-400">{rulaScore.scoreA}</div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500/10 to-green-600/10 rounded-xl p-4 border border-green-500/30">
            <div className="flex items-center space-x-3 mb-2">
              <div className="bg-green-500/20 p-2 rounded-lg">
                <span className="material-icon text-green-400">group_work</span>
              </div>
              <div>
                <h5 className="font-semibold text-white">Score B</h5>
                <p className="text-xs text-gray-400">Neck & Trunk</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-green-400">{rulaScore.scoreB}</div>
          </div>
        </div>
      )}

      {/* Enhanced Risk Summary */}
      {rulaScore && (
        <div className={`p-6 rounded-xl border-2 ${
          rulaScore.finalScore <= 2 
            ? 'bg-gradient-to-r from-green-500/10 to-green-600/5 border-green-500/50' 
            : rulaScore.finalScore <= 4
            ? 'bg-gradient-to-r from-yellow-500/10 to-yellow-600/5 border-yellow-500/50'
            : rulaScore.finalScore <= 6
            ? 'bg-gradient-to-r from-orange-500/10 to-orange-600/5 border-orange-500/50'
            : 'bg-gradient-to-r from-red-500/10 to-red-600/5 border-red-500/50'
        }`}>
          <div className="flex items-start space-x-4">
            <div className={`p-3 rounded-xl ${
              rulaScore.finalScore <= 2 
                ? 'bg-green-500/20' 
                : rulaScore.finalScore <= 4
                ? 'bg-yellow-500/20'
                : rulaScore.finalScore <= 6
                ? 'bg-orange-500/20'
                : 'bg-red-500/20'
            }`}>
              <span className={`material-icon text-3xl ${
                rulaScore.finalScore <= 2 
                  ? 'text-green-400' 
                  : rulaScore.finalScore <= 4
                  ? 'text-yellow-400'
                  : rulaScore.finalScore <= 6
                  ? 'text-orange-400'
                  : 'text-red-400'
              }`}>
                {rulaScore.finalScore <= 2 ? 'verified' : 
                 rulaScore.finalScore <= 4 ? 'info' :
                 rulaScore.finalScore <= 6 ? 'warning' : 'error'}
              </span>
            </div>
            <div className="flex-1">
              <h4 className={`text-xl font-bold mb-2 ${getRiskLevelTextColor(rulaScore.finalScore)}`}>
                {getRiskLevelText(rulaScore.finalScore)} Risk
              </h4>
              <p className="text-gray-300 text-sm leading-relaxed mb-3">
                {rulaScore.finalScore <= 2 
                  ? 'Current posture is within acceptable ergonomic parameters. Continue monitoring for any changes in work conditions or duration.'
                  : rulaScore.finalScore <= 4
                  ? 'Some ergonomic concerns detected. Consider investigating posture and implementing minor adjustments to workstation setup.'
                  : rulaScore.finalScore <= 6
                  ? 'Significant ergonomic issues identified. Changes should be made soon to prevent injury. Consider workstation redesign.'
                  : 'Critical ergonomic risk detected. Immediate intervention required to prevent musculoskeletal disorders. Stop current activity.'
                }
              </p>
              <div className="flex items-center space-x-2 text-xs text-gray-400">
                <span className="material-icon text-sm">schedule</span>
                <span>Updated in real-time</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
