import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { calculateREBA } from '@/lib/reba-calculator';
import { calculateWeightAdjustedReba } from '@/lib/weight-detection';
import ThreeDView from './three-d-view';
import SkeletonOverlay from './skeleton-overlay';
import ManualWeightInput, { type ManualWeight } from './manual-weight-input';

interface RecordingFrame {
  timestamp: number;
  rebaScore: any;
  imageData: string;
  poseData: any;
  hasObject?: boolean;
  adjustedRebaScore?: any;
  weightEstimation?: any;
}

interface RebaRecordingPanelProps {
  isRecording: boolean;
  recordingData: RecordingFrame[];
  recordingProgress: number;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onClearRecording: () => void;
  currentPoseData: any;
  currentRebaScore: any;
}

export default function RebaRecordingPanel({
  isRecording,
  recordingData,
  recordingProgress,
  onStartRecording,
  onStopRecording,
  onClearRecording,
  currentPoseData,
  currentRebaScore
}: RebaRecordingPanelProps) {
  const [selectedFrame, setSelectedFrame] = useState<RecordingFrame | null>(null);
  const [viewMode, setViewMode] = useState<'original' | 'skeleton' | 'enhanced'>('original');
  const [analysisMode, setAnalysisMode] = useState<'normal' | 'estimated' | 'manual'>('normal');
  const [activeGraph, setActiveGraph] = useState<'live' | 'estimated' | 'manual'>('live');
  const [manualWeights, setManualWeights] = useState<ManualWeight[]>([]);
  const [showWeightDialog, setShowWeightDialog] = useState(false);
  const recordingStartTimeRef = useRef<number | null>(null);

  // Set recording start time when recording begins
  useEffect(() => {
    if (isRecording && recordingData.length === 0) {
      recordingStartTimeRef.current = Date.now();
    } else if (!isRecording && recordingData.length === 0) {
      recordingStartTimeRef.current = null;
    }
  }, [isRecording, recordingData.length]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Process recording data for normal REBA graph
  const recordingGraphData = recordingData.map((frame, index) => {
    const timeOffset = recordingStartTimeRef.current ? 
      (frame.timestamp - recordingStartTimeRef.current) / 1000 : 
      index * 0.5; // Fallback: assume 0.5s intervals
    
    return {
      time: Math.max(0, Math.min(60, timeOffset)), // Clamp between 0-60 seconds
      rebaScore: frame.rebaScore?.finalScore || 1,
      hasObject: frame.hasObject || false,
      frameIndex: index
    };
  });

  // Process recording data with estimated weight adjustments
  const estimatedGraphData = recordingData.map((frame, index) => {
    if (!frame.poseData?.keypoints) {
      return {
        time: index * 0.5,
        rebaScore: frame.rebaScore?.finalScore || 1,
        hasObject: false,
        frameIndex: index
      };
    }

    const timeOffset = recordingStartTimeRef.current ? 
      (frame.timestamp - recordingStartTimeRef.current) / 1000 : 
      index * 0.5;

    // Calculate weight-adjusted REBA score using estimated weight
    const weightEstimation = frame.weightEstimation || { estimatedWeight: 0, confidence: 0 };
    const adjustedRebaScore = calculateWeightAdjustedReba(frame.rebaScore, weightEstimation);

    return {
      time: Math.max(0, Math.min(60, timeOffset)),
      rebaScore: adjustedRebaScore?.finalScore || frame.rebaScore?.finalScore || 1,
      hasObject: frame.hasObject || false,
      frameIndex: index
    };
  });

  // Process recording data with manual weights
  const getTotalManualWeight = () => {
    return manualWeights.reduce((total, weight) => total + weight.weight, 0);
  };

  const manualGraphData = recordingData.map((frame, index) => {
    if (!frame.poseData?.keypoints) {
      return {
        time: index * 0.5,
        normalScore: frame.rebaScore?.finalScore || 1,
        adjustedScore: frame.rebaScore?.finalScore || 1,
        hasObject: frame.hasObject || false,
        frameIndex: index
      };
    }

    const timeOffset = recordingStartTimeRef.current ? 
      (frame.timestamp - recordingStartTimeRef.current) / 1000 : 
      index * 0.5;

    const totalWeight = getTotalManualWeight();
    const weightEstimation = { estimatedWeight: totalWeight, confidence: 1.0 };
    const adjustedRebaScore = calculateWeightAdjustedReba(frame.rebaScore, weightEstimation, totalWeight);

    return {
      time: Math.max(0, Math.min(60, timeOffset)),
      normalScore: frame.rebaScore?.finalScore || 1,
      adjustedScore: adjustedRebaScore?.finalScore || frame.rebaScore?.finalScore || 1,
      hasObject: frame.hasObject || false,
      frameIndex: index
    };
  });

  const handleChartClick = (data: any) => {
    if (data?.activePayload?.[0]?.payload) {
      const frameIndex = data.activePayload[0].payload.frameIndex;
      if (frameIndex >= 0 && frameIndex < recordingData.length) {
        setSelectedFrame(recordingData[frameIndex]);
      }
    }
  };

  const startRecording = () => {
    recordingStartTimeRef.current = Date.now();
    onStartRecording();
  };

  const handleAddWeight = (weight: ManualWeight) => {
    setManualWeights([...manualWeights, weight]);
  };

  const getCurrentRebaScore = (frame: RecordingFrame) => {
    if (analysisMode === 'manual' && manualWeights.length > 0) {
      const totalWeight = getTotalManualWeight();
      const weightEstimation = { estimatedWeight: totalWeight, confidence: 1.0 };
      return calculateWeightAdjustedReba(frame.rebaScore, weightEstimation, totalWeight) || frame.rebaScore;
    } else if (analysisMode === 'estimated' && frame.weightEstimation) {
      return calculateWeightAdjustedReba(frame.rebaScore, frame.weightEstimation) || frame.rebaScore;
    }
    return frame.rebaScore;
  };

  const getCurrentWeightEstimation = (frame: RecordingFrame) => {
    if (analysisMode === 'manual' && manualWeights.length > 0) {
      return { estimatedWeight: getTotalManualWeight(), confidence: 1.0 };
    }
    return frame.weightEstimation;
  };

  return (
    <div className="bg-gradient-to-br from-dark-card to-dark-secondary rounded-xl shadow-2xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-600">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
            <span className="material-icon text-white text-xl">analytics</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">REBA Recording</h3>
            <p className="text-xs text-gray-400">Enhanced body assessment recording</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {!isRecording && recordingData.length === 0 && (
            <button
              onClick={startRecording}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-lg hover:scale-105"
            >
              <span className="material-icon">fiber_manual_record</span>
              <span>Record 1 Min</span>
            </button>
          )}

          {isRecording && (
            <button
              onClick={onStopRecording}
              className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-lg hover:scale-105"
            >
              <span className="material-icon">stop</span>
              <span>Stop Recording</span>
            </button>
          )}

          {recordingData.length > 0 && !isRecording && (
            <button
              onClick={onClearRecording}
              className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 p-2 rounded-lg transition-all duration-200 shadow-lg hover:scale-105"
              title="Clear Recording"
            >
              <span className="material-icon">delete</span>
            </button>
          )}
        </div>
      </div>

      {/* Recording Progress */}
      {isRecording && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300">Recording Progress</span>
            <span className="text-sm font-mono text-white">{Math.round(recordingProgress)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300 animate-pulse shadow-lg" 
              style={{width: `${recordingProgress}%`}}
            ></div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Recording REBA assessment for 60 seconds...</p>
        </div>
      )}

      {/* Analysis Mode Controls */}
      {recordingData.length > 0 && (
        <div className="mb-6">
          <div className="flex flex-wrap items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-white">Analysis Mode</h4>
            <div className="flex items-center space-x-4">
              <div className="flex space-x-2">
                <button
                  onClick={() => setAnalysisMode('normal')}
                  className={`px-3 py-1 rounded-lg text-sm transition-all duration-200 ${
                    analysisMode === 'normal' 
                      ? 'bg-blue-500/20 border border-blue-500/50 text-blue-400' 
                      : 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 border border-gray-600'
                  }`}
                >
                  Normal View
                </button>
                <button
                  onClick={() => setAnalysisMode('estimated')}
                  className={`px-3 py-1 rounded-lg text-sm transition-all duration-200 ${
                    analysisMode === 'estimated' 
                      ? 'bg-orange-500/20 border border-orange-500/50 text-orange-400' 
                      : 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 border border-gray-600'
                  }`}
                >
                  Weight Estimated
                </button>
                <button
                  onClick={() => setAnalysisMode('manual')}
                  className={`px-3 py-1 rounded-lg text-sm transition-all duration-200 ${
                    analysisMode === 'manual' 
                      ? 'bg-green-500/20 border border-green-500/50 text-green-400' 
                      : 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 border border-gray-600'
                  }`}
                >
                  Manual Weight
                </button>
              </div>

              {analysisMode === 'manual' && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-300">Total Weight: {getTotalManualWeight()}kg</span>
                  <button
                    onClick={() => setShowWeightDialog(true)}
                    className="px-2 py-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 rounded-lg text-sm transition-all duration-200 shadow-lg hover:scale-105"
                  >
                    Manage Objects
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Graph Selection Tabs */}
      <div className="mb-6">
        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => setActiveGraph('live')}
            className={`px-4 py-2 rounded-lg transition-all duration-200 ${
              activeGraph === 'live' 
                ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg' 
                : 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 border border-gray-600'
            }`}
          >
            Live REBA Graph
          </button>
          <button
            onClick={() => setActiveGraph('estimated')}
            className={`px-4 py-2 rounded-lg transition-all duration-200 ${
              activeGraph === 'estimated' 
                ? 'bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-lg' 
                : 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 border border-gray-600'
            }`}
          >
            Estimated Weight Graph
          </button>
          <button
            onClick={() => setActiveGraph('manual')}
            disabled={recordingData.length === 0 || manualWeights.length === 0}
            className={`px-4 py-2 rounded-lg transition-all duration-200 ${
              activeGraph === 'manual' && recordingData.length > 0 && manualWeights.length > 0
                ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg' 
                : recordingData.length === 0 || manualWeights.length === 0
                ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed border border-gray-700'
                : 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 border border-gray-600'
            }`}
          >
            Manual Weight Analysis
          </button>
        </div>

        {/* Normal REBA Graph */}
        {activeGraph === 'live' && (
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg p-4 border border-gray-600/50">
            <h4 className="text-lg font-medium mb-3 text-purple-400 flex items-center space-x-2">
              <span className="material-icon">trending_up</span>
              <span>Normal REBA Score (Recording Session)</span>
            </h4>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={recordingGraphData} onClick={handleChartClick}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#9CA3AF"
                    tickFormatter={formatTime}
                    domain={[0, 60]}
                  />
                  <YAxis 
                    domain={[1, 15]}
                    stroke="#9CA3AF"
                  />
                  <Tooltip 
                    labelFormatter={formatTime}
                    formatter={(value: any) => [value, 'REBA Score']}
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '0.5rem',
                      color: '#F9FAFB'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="rebaScore" 
                    stroke="#A855F7" 
                    strokeWidth={2}
                    dot={(props: any) => {
                      if (props.payload.hasObject) {
                        return <circle cx={props.cx} cy={props.cy} r={6} fill="#EF4444" stroke="#DC2626" strokeWidth={2} />;
                      }
                      return <circle cx={props.cx} cy={props.cy} r={3} fill="#A855F7" />;
                    }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-sm text-gray-400 mt-2">
              Normal REBA scores from recording session. Red dots indicate detected objects. Click on points to view frame details.
            </p>
          </div>
        )}

        {/* Estimated Weight Graph */}
        {activeGraph === 'estimated' && (
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg p-4 border border-gray-600/50">
            <h4 className="text-lg font-medium mb-3 text-orange-400 flex items-center space-x-2">
              <span className="material-icon">fitness_center</span>
              <span>Weight-Adjusted REBA Analysis (Recording Session)</span>
            </h4>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={recordingGraphData.map((liveData, index) => ({
                    ...liveData,
                    liveRebaScore: liveData.rebaScore,
                    estimatedRebaScore: estimatedGraphData[index]?.rebaScore || liveData.rebaScore
                  }))} 
                  onClick={handleChartClick}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#9CA3AF"
                    tickFormatter={formatTime}
                    domain={[0, 60]}
                  />
                  <YAxis 
                    domain={[1, 15]}
                    stroke="#9CA3AF"
                  />
                  <Tooltip 
                    labelFormatter={formatTime}
                    formatter={(value: any, name: string) => {
                      if (name === 'liveRebaScore') return [value, 'Live REBA Score'];
                      if (name === 'estimatedRebaScore') return [value, 'Weight-Adjusted REBA Score'];
                      return [value, name];
                    }}
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '0.5rem',
                      color: '#F9FAFB'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="liveRebaScore" 
                    stroke="#A855F7" 
                    strokeWidth={2}
                    dot={(props: any) => {
                      if (props.payload.hasObject) {
                        return <circle cx={props.cx} cy={props.cy} r={4} fill="#EF4444" stroke="#DC2626" strokeWidth={2} />;
                      }
                      return <circle cx={props.cx} cy={props.cy} r={2} fill="#A855F7" />;
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="estimatedRebaScore" 
                    stroke="#F59E0B" 
                    strokeWidth={2}
                    dot={(props: any) => {
                      if (props.payload.hasObject) {
                        return <circle cx={props.cx} cy={props.cy} r={6} fill="#EF4444" stroke="#DC2626" strokeWidth={2} />;
                      }
                      return <circle cx={props.cx} cy={props.cy} r={3} fill="#F59E0B" />;
                    }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-sm text-gray-400 mt-2">
              Purple line: Live REBA scores | Orange line: Weight-adjusted REBA scores | Red dots indicate detected objects.
            </p>
          </div>
        )}

        {/* Manual Weight Analysis Graph */}
        {activeGraph === 'manual' && recordingData.length > 0 && manualWeights.length > 0 && (
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg p-4 border border-gray-600/50">
            <h4 className="text-lg font-medium mb-3 text-green-400 flex items-center space-x-2">
              <span className="material-icon">scale</span>
              <span>Manual Weight Analysis (Post-Recording)</span>
            </h4>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={manualGraphData} onClick={handleChartClick}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#9CA3AF"
                    tickFormatter={formatTime}
                  />
                  <YAxis 
                    domain={[1, 15]}
                    stroke="#9CA3AF"
                  />
                  <Tooltip 
                    labelFormatter={formatTime}
                    formatter={(value: any, name: string) => {
                      if (name === 'normalScore') return [value, 'Normal REBA'];
                      if (name === 'adjustedScore') return [value, 'Manual Weight-Adjusted REBA'];
                      return [value, 'REBA Score'];
                    }}
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '0.5rem',
                      color: '#F9FAFB'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="normalScore" 
                    stroke="#9CA3AF" 
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    dot={(props: any) => {
                      if (props.payload.hasObject) {
                        return <circle cx={props.cx} cy={props.cy} r={4} fill="#EF4444" stroke="#DC2626" strokeWidth={2} />;
                      }
                      return <circle cx={props.cx} cy={props.cy} r={2} fill="#9CA3AF" />;
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="adjustedScore" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    dot={(props: any) => {
                      if (props.payload.hasObject) {
                        return <circle cx={props.cx} cy={props.cy} r={6} fill="#EF4444" stroke="#DC2626" strokeWidth={2} />;
                      }
                      return <circle cx={props.cx} cy={props.cy} r={4} fill="#10B981" />;
                    }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-sm text-gray-400 mt-2">
              Gray dashed: Normal REBA | Green solid: Manual weight-adjusted REBA (Total: {getTotalManualWeight()}kg) | Red dots indicate detected objects.
            </p>
          </div>
        )}
      </div>

      {/* Frame Details */}
      {selectedFrame && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-medium text-white">
              Frame at {recordingStartTimeRef.current ? 
                formatTime((selectedFrame.timestamp - recordingStartTimeRef.current) / 1000) : 
                formatTime(selectedFrame.timestamp)}
            </h4>
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('original')}
                className={`px-3 py-1 rounded-lg text-sm transition-all duration-200 ${
                  viewMode === 'original' ? 'bg-blue-500/20 border border-blue-500/50 text-blue-400' : 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 border border-gray-600'
                }`}
              >
                Original
              </button>
              <button
                onClick={() => setViewMode('skeleton')}
                className={`px-3 py-1 rounded-lg text-sm transition-all duration-200 ${
                  viewMode === 'skeleton' ? 'bg-green-500/20 border border-green-500/50 text-green-400' : 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 border border-gray-600'
                }`}
              >
                Skeleton
              </button>
              <button
                onClick={() => setViewMode('enhanced')}
                className={`px-3 py-1 rounded-lg text-sm transition-all duration-200 ${
                  viewMode === 'enhanced' ? 'bg-purple-500/20 border border-purple-500/50 text-purple-400' : 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 border border-gray-600'
                }`}
              >
                Enhanced
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
                {viewMode === 'original' && (
                  <div className="relative w-full h-full">
                    <img 
                      src={selectedFrame.imageData} 
                      alt="Original frame"
                      className="w-full h-full object-contain"
                    />
                    {selectedFrame.hasObject && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                        OBJECT DETECTED
                      </div>
                    )}
                  </div>
                )}
                {viewMode === 'skeleton' && (
                  <div className="relative w-full h-full bg-black grid grid-cols-1 lg:grid-cols-2 gap-2">
                    <div className="relative bg-black">
                      <SkeletonOverlay
                        poseData={selectedFrame.poseData}
                        rulaScore={getCurrentRebaScore(selectedFrame)}
                        width={320}
                        height={180}
                        showColorCoding={true}
                        weightEstimation={getCurrentWeightEstimation(selectedFrame)}
                      />
                      <div className="absolute bottom-1 left-1 bg-black/70 text-white px-2 py-1 rounded text-xs">
                        2D Skeleton
                      </div>
                    </div>
                    <div className="relative bg-black">
                      <ThreeDView
                        poseData={selectedFrame.poseData}
                        rulaScore={getCurrentRebaScore(selectedFrame)}
                        rebaScore={getCurrentRebaScore(selectedFrame)}
                      />
                      <div className="absolute bottom-1 left-1 bg-black/70 text-white px-2 py-1 rounded text-xs">
                        3D Skeleton
                      </div>
                    </div>
                    {selectedFrame.hasObject && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                        OBJECT DETECTED
                      </div>
                    )}
                  </div>
                )}
                {viewMode === 'enhanced' && (
                  <div className="relative w-full h-full">
                    <img 
                      src={selectedFrame.imageData} 
                      alt="Enhanced frame"
                      className="w-full h-full object-contain absolute inset-0"
                    />
                    <div className="absolute inset-0">
                      <SkeletonOverlay
                        poseData={selectedFrame.poseData}
                        rulaScore={getCurrentRebaScore(selectedFrame)}
                        imageData={selectedFrame.imageData}
                        width={640}
                        height={360}
                        showColorCoding={true}
                        weightEstimation={getCurrentWeightEstimation(selectedFrame)}
                      />
                    </div>
                    {selectedFrame.hasObject && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                        OBJECT DETECTED
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {viewMode !== 'enhanced' && (
                <div>
                  <h5 className="text-lg font-medium mb-3 text-white">REBA Assessment</h5>
                  {selectedFrame.rebaScore ? (
                    <div className="space-y-3">
                      {analysisMode !== 'normal' && selectedFrame.adjustedRebaScore && (
                        <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-3">
                          <h6 className="text-sm font-medium text-yellow-400 mb-2">Weight-Adjusted Analysis</h6>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>Original Score: {selectedFrame.rebaScore.finalScore}</div>
                            <div>Adjusted Score: {selectedFrame.adjustedRebaScore.finalScore}</div>
                            <div>Weight: {selectedFrame.adjustedRebaScore.effectiveWeight}kg</div>
                            <div>Multiplier: {selectedFrame.adjustedRebaScore.weightMultiplier}x</div>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <span>Final Score:</span>
                        <span className="font-bold text-xl">
                          {getCurrentRebaScore(selectedFrame)?.finalScore}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Risk Level:</span>
                        <span className={`font-medium ${
                          getCurrentRebaScore(selectedFrame)?.finalScore === 1 ? 'text-green-400' :
                          getCurrentRebaScore(selectedFrame)?.finalScore <= 3 ? 'text-yellow-400' :
                          getCurrentRebaScore(selectedFrame)?.finalScore <= 7 ? 'text-orange-400' :
                          getCurrentRebaScore(selectedFrame)?.finalScore <= 10 ? 'text-red-400' : 'text-red-300'
                        }`}>
                          {getCurrentRebaScore(selectedFrame)?.riskLevel}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span>Action Level:</span>
                        <span className={`font-medium text-xs ${
                          getCurrentRebaScore(selectedFrame)?.finalScore === 1 ? 'text-green-400' :
                          getCurrentRebaScore(selectedFrame)?.finalScore <= 3 ? 'text-yellow-400' :
                          getCurrentRebaScore(selectedFrame)?.finalScore <= 7 ? 'text-orange-400' :
                          getCurrentRebaScore(selectedFrame)?.finalScore <= 10 ? 'text-red-400' : 'text-red-300'
                        }`}>
                          {getCurrentRebaScore(selectedFrame)?.actionLevel}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-300 mb-1">Group A</div>
                          <div>Neck: {getCurrentRebaScore(selectedFrame)?.neck}</div>
                          <div>Trunk: {getCurrentRebaScore(selectedFrame)?.trunk}</div>
                          <div>Legs: {getCurrentRebaScore(selectedFrame)?.legs}</div>
                          <div className="font-medium mt-1">Score A: {getCurrentRebaScore(selectedFrame)?.scoreA}</div>
                        </div>
                        <div className="text-sm">
                          <div className="font-medium text-gray-300 mb-1">Group B</div>
                          <div>Upper Arm: {getCurrentRebaScore(selectedFrame)?.upperArm}</div>
                          <div>Lower Arm: {getCurrentRebaScore(selectedFrame)?.lowerArm}</div>
                          <div>Wrist: {getCurrentRebaScore(selectedFrame)?.wrist}</div>
                          <div className="font-medium mt-1">Score B: {getCurrentRebaScore(selectedFrame)?.scoreB}</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-400">No REBA data available for this frame</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Manual Weight Dialog */}
      {showWeightDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-dark-card rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Manage Manual Weights</h3>
              <button
                onClick={() => setShowWeightDialog(false)}
                className="text-gray-400 hover:text-white"
              >
                <span className="material-icon">close</span>
              </button>
            </div>
            <ManualWeightInput
              onAddWeight={handleAddWeight}
              existingWeights={manualWeights}
              recordedFrames={recordingData}
            />
          </div>
        </div>
      )}
    </div>
  );
}