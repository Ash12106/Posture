import { useEffect, useRef } from "react";

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  cameraActive: boolean;
  poseData: any;
}

export default function CameraView({ videoRef, canvasRef, cameraActive, poseData }: CameraViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (canvasRef.current && videoRef.current && containerRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const container = containerRef.current;
      
      // Set canvas size to match container
      const resizeCanvas = () => {
        const rect = container.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
      };
      
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
      
      return () => {
        window.removeEventListener('resize', resizeCanvas);
      };
    }
  }, [canvasRef, videoRef]);

  // Draw pose keypoints and connections
  useEffect(() => {
    if (!poseData || !canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (poseData.keypoints && poseData.keypoints.length > 0) {
      const keypoints = poseData.keypoints;
      
      // COCO pose model connections (17 keypoints)
      const connections = [
        [0, 1], [0, 2], [1, 3], [2, 4], // Head
        [5, 6], // Shoulders
        [5, 7], [7, 9], // Left arm
        [6, 8], [8, 10], // Right arm
        [5, 11], [6, 12], // Torso
        [11, 12], // Hips
        [11, 13], [13, 15], // Left leg
        [12, 14], [14, 16] // Right leg
      ];

      const confidenceThreshold = 0.3;
      
      // Calculate scaling factors
      const videoAspect = video.videoWidth / video.videoHeight;
      const canvasAspect = canvas.width / canvas.height;
      
      let scaleX, scaleY, offsetX = 0, offsetY = 0;
      
      if (videoAspect > canvasAspect) {
        // Video is wider - fit to height
        scaleY = canvas.height;
        scaleX = canvas.height * videoAspect;
        offsetX = (canvas.width - scaleX) / 2;
      } else {
        // Video is taller - fit to width
        scaleX = canvas.width;
        scaleY = canvas.width / videoAspect;
        offsetY = (canvas.height - scaleY) / 2;
      }
      
      // Helper function to transform coordinates
      const transformCoordinates = (x: number, y: number) => {
        let transformedX, transformedY;
        
        // Handle different coordinate systems
        if (x > 1 || y > 1) {
          // Absolute coordinates - normalize first
          transformedX = (x / video.videoWidth) * scaleX + offsetX;
          transformedY = (y / video.videoHeight) * scaleY + offsetY;
        } else {
          // Normalized coordinates (0-1)
          transformedX = x * scaleX + offsetX;
          transformedY = y * scaleY + offsetY;
        }
        
        // Since canvas is mirrored, flip X coordinate
        transformedX = canvas.width - transformedX;
        
        return { x: transformedX, y: transformedY };
      };

      // Draw connections
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 3;

      let connectionsDrawn = 0;
      
      connections.forEach(([i, j]) => {
        const kp1 = keypoints[i];
        const kp2 = keypoints[j];
        
        if (kp1 && kp2 && kp1.score > confidenceThreshold && kp2.score > confidenceThreshold) {
          const pos1 = transformCoordinates(kp1.x, kp1.y);
          const pos2 = transformCoordinates(kp2.x, kp2.y);
          
          ctx.beginPath();
          ctx.moveTo(pos1.x, pos1.y);
          ctx.lineTo(pos2.x, pos2.y);
          ctx.stroke();
          connectionsDrawn++;
        }
      });

      // Draw keypoints
      let keypointsDrawn = 0;
      keypoints.forEach((keypoint: any, index: number) => {
        if (keypoint && keypoint.score > confidenceThreshold) {
          const pos = transformCoordinates(keypoint.x, keypoint.y);
          
          // Different colors for different body parts
          let color;
          if (index <= 4) {
            color = '#EF4444'; // Red for face
          } else if (index <= 10) {
            color = '#3B82F6'; // Blue for arms
          } else {
            color = '#10B981'; // Green for legs/torso
          }
          
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 6, 0, 2 * Math.PI);
          ctx.fill();
          
          // Add white border for better visibility
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 2;
          ctx.stroke();
          
          // Add confidence score (optional - comment out if too cluttered)
          ctx.fillStyle = '#FFFFFF';
          ctx.font = '10px Arial';
          ctx.shadowColor = '#000000';
          ctx.shadowBlur = 2;
          ctx.fillText(`${Math.round(keypoint.score * 100)}%`, pos.x + 8, pos.y - 8);
          ctx.shadowBlur = 0;
          
          keypointsDrawn++;
        }
      });
      
      // Draw debug info on canvas (optional)
      ctx.fillStyle = '#FFFF00';
      ctx.font = '14px Arial';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 2;
      ctx.fillText(`Points: ${keypointsDrawn} | Lines: ${connectionsDrawn}`, 10, 25);
      ctx.shadowBlur = 0;
      
      console.log(`Drew ${keypointsDrawn} keypoints and ${connectionsDrawn} connections`);
    }
  }, [poseData, canvasRef]);

  return (
    <div className="bg-gradient-to-br from-dark-card to-dark-secondary rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
      <div className="bg-gradient-to-r from-gray-700 to-gray-600 px-6 py-4 border-b border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-green-500 to-blue-500 p-2 rounded-lg">
              <span className="material-icon text-white text-xl">videocam</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Camera Feed</h3>
              <p className="text-xs text-gray-300">Live pose detection</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${cameraActive ? 'bg-green-400 animate-pulse shadow-lg shadow-green-400/50' : 'bg-red-400 shadow-lg shadow-red-400/50'}`}></div>
            <div className="text-right">
              <span className="text-sm font-medium text-white">
                {cameraActive ? 'Live' : 'Offline'}
              </span>
              <p className="text-xs text-gray-300">
                {cameraActive ? 'Recording active' : 'Camera stopped'}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div ref={containerRef} className="relative aspect-video bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <video 
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay 
          muted 
          playsInline
          style={{ transform: 'scaleX(-1)' }}
        />
        
        <canvas 
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
        />
        
        {!cameraActive && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="bg-gray-700/50 p-6 rounded-full">
                <span className="material-icon text-6xl text-gray-400">videocam_off</span>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-300 mb-2">Camera Inactive</h4>
                <p className="text-sm text-gray-500 mb-4">Click "Start Camera" to begin pose detection</p>
              </div>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex items-center justify-center space-x-2">
                  <span className="material-icon text-sm">info</span>
                  <span>Supports webcam, mobile camera, or DroidCam</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {cameraActive && poseData && (
          <div className="absolute top-4 left-4 bg-black/70 rounded-lg px-3 py-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Detecting Pose... {poseData.keypoints?.length || 0} keypoints</span>
            </div>
          </div>
        )}
        
        {/* Camera Info Overlay */}
        {cameraActive && (
          <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 rounded-lg p-2">
            <div className="text-xs text-white space-y-1">
              <div className="flex items-center space-x-2">
                <span className="material-icon text-xs">camera</span>
                <span>{videoRef.current?.videoWidth || 0}x{videoRef.current?.videoHeight || 0}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="material-icon text-xs">person</span>
                <span>{poseData?.keypoints?.length > 0 ? '1 person detected' : 'No pose detected'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}