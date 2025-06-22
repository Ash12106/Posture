import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface ReportData {
  sessionInfo: {
    timestamp: string;
    duration: string;
    assessmentType: 'rula' | 'reba' | 'both';
  };
  rulaScore?: {
    finalScore: number;
    riskLevel: string;
    upperArm: number;
    lowerArm: number;
    wrist: number;
    neck: number;
    trunk: number;
    scoreA: number;
    scoreB: number;
    recommendations: string[];
  };
  rebaScore?: {
    finalScore: number;
    riskLevel: string;
    neck: number;
    trunk: number;
    legs: number;
    upperArm: number;
    lowerArm: number;
    wrist: number;
    scoreA: number;
    scoreB: number;
    actionLevel: string;
    recommendations: string[];
  };
  poseQuality: {
    totalKeypoints: number;
    validKeypoints: number;
    confidence: number;
  };
  screenshots?: {
    cameraView?: string;
    threeDView?: string;
    assessmentView?: string;
  };
}

export class ReportGenerator {
  private static getRecommendations(score: number, type: 'rula' | 'reba'): string[] {
    if (type === 'rula') {
      if (score <= 2) {
        return [
          'Current posture is acceptable',
          'Continue monitoring during extended work periods',
          'Take regular breaks every 30-60 minutes',
          'Maintain good lighting and workstation setup'
        ];
      } else if (score <= 4) {
        return [
          'Minor ergonomic concerns detected',
          'Adjust chair height and monitor position',
          'Check keyboard and mouse placement',
          'Take micro-breaks every 20-30 minutes',
          'Consider ergonomic accessories'
        ];
      } else if (score <= 6) {
        return [
          'Significant ergonomic issues identified',
          'Immediate workstation assessment required',
          'Adjust chair, desk, and monitor configuration',
          'Implement regular stretching exercises',
          'Consider ergonomic training',
          'Take breaks every 15-20 minutes'
        ];
      } else {
        return [
          'Critical ergonomic risk detected',
          'Stop current activity immediately',
          'Comprehensive workstation redesign needed',
          'Consult with ergonomics specialist',
          'Implement job rotation if possible',
          'Consider alternative work methods'
        ];
      }
    } else { // REBA
      if (score === 1) {
        return [
          'Negligible risk - posture is acceptable',
          'Continue current practices',
          'Monitor for any changes in work conditions'
        ];
      } else if (score <= 3) {
        return [
          'Low risk detected',
          'Minor improvements may be beneficial',
          'Regular posture awareness training',
          'Implement micro-breaks'
        ];
      } else if (score <= 7) {
        return [
          'Medium risk - investigation required',
          'Implement corrective measures',
          'Workstation assessment needed',
          'Regular breaks and stretching',
          'Consider ergonomic improvements'
        ];
      } else if (score <= 10) {
        return [
          'High risk - immediate action required',
          'Comprehensive ergonomic assessment',
          'Implement changes soon',
          'Consider alternative work methods',
          'Regular monitoring required'
        ];
      } else {
        return [
          'Very high risk - critical intervention needed',
          'Immediate workstation changes required',
          'Stop current activity if possible',
          'Consult ergonomics specialist',
          'Implement comprehensive risk controls'
        ];
      }
    }
  }

  static async captureScreenshots(): Promise<{
    cameraView?: string;
    threeDView?: string;
    assessmentView?: string;
  }> {
    const screenshots: any = {};

    try {
      // Capture camera view
      const cameraElement = document.querySelector('[data-component="camera-view"]') as HTMLElement;
      if (cameraElement) {
        const canvas = await html2canvas(cameraElement, {
          backgroundColor: '#1f2937',
          scale: 0.8
        });
        screenshots.cameraView = canvas.toDataURL('image/png');
      }

      // Capture 3D view
      const threeDElement = document.querySelector('[data-component="three-d-view"]') as HTMLElement;
      if (threeDElement) {
        const canvas = await html2canvas(threeDElement, {
          backgroundColor: '#1f2937',
          scale: 0.8
        });
        screenshots.threeDView = canvas.toDataURL('image/png');
      }

      // Capture assessment view
      const assessmentElement = document.querySelector('[data-component="assessment-view"]') as HTMLElement;
      if (assessmentElement) {
        const canvas = await html2canvas(assessmentElement, {
          backgroundColor: '#1f2937',
          scale: 0.8
        });
        screenshots.assessmentView = canvas.toDataURL('image/png');
      }
    } catch (error) {
      console.warn('Screenshot capture failed:', error);
    }

    return screenshots;
  }

  static async generatePDFReport(data: ReportData): Promise<Blob> {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let currentY = 20;

    // Header
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(31, 41, 55);
    pdf.text('ErgoTrack Assessment Report', pageWidth / 2, currentY, { align: 'center' });
    currentY += 15;

    // Session Information
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Session Information', 20, currentY);
    currentY += 10;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Date: ${data.sessionInfo.timestamp}`, 20, currentY);
    currentY += 6;
    pdf.text(`Duration: ${data.sessionInfo.duration}`, 20, currentY);
    currentY += 6;
    pdf.text(`Assessment Type: ${data.sessionInfo.assessmentType.toUpperCase()}`, 20, currentY);
    currentY += 15;

    // Pose Quality
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Pose Detection Quality', 20, currentY);
    currentY += 10;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Total Keypoints: ${data.poseQuality.totalKeypoints}`, 20, currentY);
    currentY += 6;
    pdf.text(`Valid Keypoints: ${data.poseQuality.validKeypoints}`, 20, currentY);
    currentY += 6;
    pdf.text(`Detection Confidence: ${data.poseQuality.confidence}%`, 20, currentY);
    currentY += 15;

    // RULA Assessment
    if (data.rulaScore) {
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('RULA Assessment Results', 20, currentY);
      currentY += 10;

      // Risk level color
      const riskColor = data.rulaScore.finalScore <= 2 ? [34, 197, 94] : 
                       data.rulaScore.finalScore <= 4 ? [234, 179, 8] :
                       data.rulaScore.finalScore <= 6 ? [249, 115, 22] : [239, 68, 68];
      
      pdf.setFillColor(riskColor[0], riskColor[1], riskColor[2]);
      pdf.rect(20, currentY - 2, 40, 8, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Score: ${data.rulaScore.finalScore}`, 22, currentY + 3);
      
      pdf.setTextColor(31, 41, 55);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Risk Level: ${data.rulaScore.riskLevel}`, 70, currentY + 3);
      currentY += 15;

      // Body part scores
      pdf.setFontSize(12);
      pdf.text('Individual Body Part Scores:', 20, currentY);
      currentY += 8;
      pdf.text(`Upper Arm: ${data.rulaScore.upperArm}  Lower Arm: ${data.rulaScore.lowerArm}  Wrist: ${data.rulaScore.wrist}`, 25, currentY);
      currentY += 6;
      pdf.text(`Neck: ${data.rulaScore.neck}  Trunk: ${data.rulaScore.trunk}`, 25, currentY);
      currentY += 6;
      pdf.text(`Group A Score: ${data.rulaScore.scoreA}  Group B Score: ${data.rulaScore.scoreB}`, 25, currentY);
      currentY += 15;

      // Recommendations
      pdf.setFont('helvetica', 'bold');
      pdf.text('Recommendations:', 20, currentY);
      currentY += 8;
      pdf.setFont('helvetica', 'normal');
      
      data.rulaScore.recommendations.forEach((rec, index) => {
        const lines = pdf.splitTextToSize(`${index + 1}. ${rec}`, pageWidth - 40);
        lines.forEach((line: string) => {
          if (currentY > pageHeight - 20) {
            pdf.addPage();
            currentY = 20;
          }
          pdf.text(line, 25, currentY);
          currentY += 5;
        });
      });
      currentY += 10;
    }

    // REBA Assessment
    if (data.rebaScore) {
      if (currentY > pageHeight - 60) {
        pdf.addPage();
        currentY = 20;
      }

      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('REBA Assessment Results', 20, currentY);
      currentY += 10;

      // Risk level color
      const riskColor = data.rebaScore.finalScore === 1 ? [34, 197, 94] : 
                       data.rebaScore.finalScore <= 3 ? [234, 179, 8] :
                       data.rebaScore.finalScore <= 7 ? [249, 115, 22] :
                       data.rebaScore.finalScore <= 10 ? [239, 68, 68] : [185, 28, 28];
      
      pdf.setFillColor(riskColor[0], riskColor[1], riskColor[2]);
      pdf.rect(20, currentY - 2, 40, 8, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Score: ${data.rebaScore.finalScore}`, 22, currentY + 3);
      
      pdf.setTextColor(31, 41, 55);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Risk Level: ${data.rebaScore.riskLevel}`, 70, currentY + 3);
      currentY += 15;

      // Body part scores
      pdf.setFontSize(12);
      pdf.text('Individual Body Part Scores:', 20, currentY);
      currentY += 8;
      pdf.text(`Neck: ${data.rebaScore.neck}  Trunk: ${data.rebaScore.trunk}  Legs: ${data.rebaScore.legs}`, 25, currentY);
      currentY += 6;
      pdf.text(`Upper Arm: ${data.rebaScore.upperArm}  Lower Arm: ${data.rebaScore.lowerArm}  Wrist: ${data.rebaScore.wrist}`, 25, currentY);
      currentY += 6;
      pdf.text(`Group A Score: ${data.rebaScore.scoreA}  Group B Score: ${data.rebaScore.scoreB}`, 25, currentY);
      currentY += 15;

      // Recommendations
      pdf.setFont('helvetica', 'bold');
      pdf.text('Recommendations:', 20, currentY);
      currentY += 8;
      pdf.setFont('helvetica', 'normal');
      
      data.rebaScore.recommendations.forEach((rec, index) => {
        const lines = pdf.splitTextToSize(`${index + 1}. ${rec}`, pageWidth - 40);
        lines.forEach((line: string) => {
          if (currentY > pageHeight - 20) {
            pdf.addPage();
            currentY = 20;
          }
          pdf.text(line, 25, currentY);
          currentY += 5;
        });
      });
    }

    // Footer
    const timestamp = new Date().toLocaleString();
    pdf.setFontSize(8);
    pdf.setTextColor(107, 114, 128);
    pdf.text(`Generated by ErgoTrack on ${timestamp}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

    return pdf.output('blob');
  }

  static generateJSONReport(data: ReportData): string {
    const reportData = {
      ...data,
      generatedAt: new Date().toISOString(),
      version: '1.0',
      format: 'ErgoTrack Assessment Report'
    };

    return JSON.stringify(reportData, null, 2);
  }

  static async shareReport(blob: Blob, filename: string): Promise<void> {
    if (navigator.share && navigator.canShare) {
      const file = new File([blob], filename, { type: blob.type });
      
      if (navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: 'ErgoTrack Assessment Report',
            text: 'Ergonomic assessment report generated by ErgoTrack',
            files: [file]
          });
          return;
        } catch (error) {
          console.warn('Native sharing failed, falling back to download');
        }
      }
    }

    // Fallback to download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  static prepareReportData(
    rulaScore: any,
    rebaScore: any,
    poseData: any,
    sessionDuration: string,
    assessmentType: 'rula' | 'reba' | 'both'
  ): ReportData {
    const now = new Date();
    
    const reportData: ReportData = {
      sessionInfo: {
        timestamp: now.toLocaleString(),
        duration: sessionDuration,
        assessmentType
      },
      poseQuality: {
        totalKeypoints: poseData?.keypoints?.length || 0,
        validKeypoints: poseData?.keypoints?.filter((kp: any) => kp && kp.score > 0.3).length || 0,
        confidence: Math.round(((poseData?.keypoints?.filter((kp: any) => kp && kp.score > 0.3).length || 0) / 17) * 100)
      }
    };

    if (rulaScore) {
      reportData.rulaScore = {
        ...rulaScore,
        recommendations: this.getRecommendations(rulaScore.finalScore, 'rula')
      };
    }

    if (rebaScore) {
      reportData.rebaScore = {
        ...rebaScore,
        recommendations: this.getRecommendations(rebaScore.finalScore, 'reba')
      };
    }

    return reportData;
  }
}