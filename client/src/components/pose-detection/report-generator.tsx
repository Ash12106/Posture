import React, { useState } from 'react';
import { ReportGenerator, type ReportData } from '@/lib/report-generator';

interface ReportGeneratorProps {
  rulaScore: any;
  rebaScore: any;
  poseData: any;
  sessionDuration: string;
  assessmentType: 'rula' | 'reba' | 'both';
}

export default function ReportGeneratorComponent({
  rulaScore,
  rebaScore,
  poseData,
  sessionDuration,
  assessmentType
}: ReportGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportFormat, setReportFormat] = useState<'pdf' | 'json'>('pdf');

  const handleGenerateReport = async () => {
    if (!rulaScore && !rebaScore) {
      alert('No assessment data available. Please start pose detection first.');
      return;
    }

    setIsGenerating(true);

    try {
      // Prepare report data
      const reportData = ReportGenerator.prepareReportData(
        rulaScore,
        rebaScore,
        poseData,
        sessionDuration,
        assessmentType
      );

      // Capture screenshots
      const screenshots = await ReportGenerator.captureScreenshots();
      reportData.screenshots = screenshots;

      let blob: Blob;
      let filename: string;

      if (reportFormat === 'pdf') {
        blob = await ReportGenerator.generatePDFReport(reportData);
        filename = `ergotrack-report-${new Date().toISOString().split('T')[0]}.pdf`;
      } else {
        const jsonContent = ReportGenerator.generateJSONReport(reportData);
        blob = new Blob([jsonContent], { type: 'application/json' });
        filename = `ergotrack-report-${new Date().toISOString().split('T')[0]}.json`;
      }

      // Share or download the report
      await ReportGenerator.shareReport(blob, filename);

    } catch (error) {
      console.error('Report generation failed:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleQuickShare = async () => {
    if (!rulaScore && !rebaScore) {
      alert('No assessment data available.');
      return;
    }

    const reportData = ReportGenerator.prepareReportData(
      rulaScore,
      rebaScore,
      poseData,
      sessionDuration,
      assessmentType
    );

    const summary = `ErgoTrack Assessment Summary:
${rulaScore ? `RULA Score: ${rulaScore.finalScore} (${rulaScore.riskLevel})` : ''}
${rebaScore ? `REBA Score: ${rebaScore.finalScore} (${rebaScore.riskLevel})` : ''}
Detection Confidence: ${reportData.poseQuality.confidence}%
Session Duration: ${sessionDuration}
Generated: ${new Date().toLocaleString()}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ErgoTrack Assessment',
          text: summary
        });
      } catch (error) {
        // Fallback to clipboard
        await navigator.clipboard.writeText(summary);
        alert('Assessment summary copied to clipboard!');
      }
    } else {
      await navigator.clipboard.writeText(summary);
      alert('Assessment summary copied to clipboard!');
    }
  };

  return (
    <div className="bg-gradient-to-br from-dark-card to-dark-secondary rounded-xl shadow-2xl p-6 border border-gray-700">
      <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-600">
        <div className="bg-gradient-to-r from-green-500 to-blue-500 p-2 rounded-lg">
          <span className="material-icon text-white text-xl">description</span>
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Report Generation</h3>
          <p className="text-xs text-gray-400">Generate and share assessment reports</p>
        </div>
      </div>

      {/* Report Format Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-3">Report Format</label>
        <div className="flex space-x-3">
          <button
            onClick={() => setReportFormat('pdf')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              reportFormat === 'pdf'
                ? 'bg-blue-500/20 border border-blue-500/50 text-blue-400'
                : 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 border border-gray-600'
            }`}
          >
            <span className="material-icon text-sm">picture_as_pdf</span>
            <span>PDF Report</span>
          </button>
          <button
            onClick={() => setReportFormat('json')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              reportFormat === 'json'
                ? 'bg-blue-500/20 border border-blue-500/50 text-blue-400'
                : 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 border border-gray-600'
            }`}
          >
            <span className="material-icon text-sm">code</span>
            <span>JSON Data</span>
          </button>
        </div>
      </div>

      {/* Report Preview */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Report Contents</h4>
        <div className="bg-gray-800/50 rounded-lg p-4 space-y-2 text-sm">
          <div className="flex items-center space-x-2">
            <span className="material-icon text-green-400 text-xs">check_circle</span>
            <span className="text-gray-300">Session information and duration</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="material-icon text-green-400 text-xs">check_circle</span>
            <span className="text-gray-300">Pose detection quality metrics</span>
          </div>
          {rulaScore && (
            <div className="flex items-center space-x-2">
              <span className="material-icon text-green-400 text-xs">check_circle</span>
              <span className="text-gray-300">RULA assessment results and recommendations</span>
            </div>
          )}
          {rebaScore && (
            <div className="flex items-center space-x-2">
              <span className="material-icon text-green-400 text-xs">check_circle</span>
              <span className="text-gray-300">REBA assessment results and recommendations</span>
            </div>
          )}
          {reportFormat === 'pdf' && (
            <div className="flex items-center space-x-2">
              <span className="material-icon text-blue-400 text-xs">camera_alt</span>
              <span className="text-gray-300">Screenshots of visualizations</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={handleGenerateReport}
          disabled={isGenerating || (!rulaScore && !rebaScore)}
          className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed px-6 py-3 rounded-lg text-white font-medium transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:scale-105 disabled:hover:scale-100"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>Generating Report...</span>
            </>
          ) : (
            <>
              <span className="material-icon">download</span>
              <span>Generate & Download {reportFormat.toUpperCase()} Report</span>
            </>
          )}
        </button>

        <button
          onClick={handleQuickShare}
          disabled={!rulaScore && !rebaScore}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed px-6 py-3 rounded-lg text-white font-medium transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:scale-105 disabled:hover:scale-100"
        >
          <span className="material-icon">share</span>
          <span>Quick Share Summary</span>
        </button>
      </div>

      {/* Status Information */}
      <div className="mt-6 pt-4 border-t border-gray-600/50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            <span className="material-icon text-xs">info</span>
            <span>
              {!rulaScore && !rebaScore 
                ? 'Start assessment to enable reports' 
                : `Ready to generate ${assessmentType.toUpperCase()} report`
              }
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="material-icon text-xs">schedule</span>
            <span>{sessionDuration}</span>
          </div>
        </div>
      </div>
    </div>
  );
}