export interface ErgonomicRecommendation {
  id: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'posture' | 'movement' | 'environment' | 'breaks';
  title: string;
  description: string;
  action: string;
  bodyPart: string[];
  icon: string;
  duration?: string;
}

export interface RecommendationContext {
  rulaScore?: any;
  rebaScore?: any;
  poseData?: any;
  sessionDuration: number;
  previousRecommendations?: string[];
  assessmentType: 'rula' | 'reba' | 'both';
}

export class RecommendationEngine {
  private static lastRecommendationTime = 0;
  private static shownRecommendations = new Set<string>();
  private static currentRecommendations: ErgonomicRecommendation[] = [];

  static generateRecommendations(context: RecommendationContext): ErgonomicRecommendation[] {
    const recommendations: ErgonomicRecommendation[] = [];
    const now = Date.now();

    // Don't generate recommendations too frequently (based on user frequency setting and risk level)
    const hasHighRisk = (context.rulaScore?.finalScore >= 5) || (context.rebaScore?.finalScore >= 8);
    const minInterval = hasHighRisk ? 3000 : (context.sessionDuration < 60 ? 8000 : 15000);
    
    if (now - this.lastRecommendationTime < minInterval) {
      return this.currentRecommendations;
    }

    // RULA-based recommendations
    if (context.rulaScore && (context.assessmentType === 'rula' || context.assessmentType === 'both')) {
      recommendations.push(...this.generateRulaRecommendations(context.rulaScore, context.poseData));
    }

    // REBA-based recommendations
    if (context.rebaScore && (context.assessmentType === 'reba' || context.assessmentType === 'both')) {
      recommendations.push(...this.generateRebaRecommendations(context.rebaScore, context.poseData));
    }

    // Session-based recommendations (only if breaks category is enabled)
    if (!context.previousRecommendations || context.previousRecommendations.includes('breaks')) {
      recommendations.push(...this.generateSessionRecommendations(context.sessionDuration));
    }

    // Pose quality recommendations
    if (context.poseData) {
      recommendations.push(...this.generatePoseQualityRecommendations(context.poseData));
    }

    // Filter by enabled categories and sort by priority
    const sortedRecommendations = recommendations
      .filter(rec => !this.shownRecommendations.has(rec.id))
      .filter(rec => !context.previousRecommendations || context.previousRecommendations.includes(rec.category))
      .sort((a, b) => this.getPriorityWeight(a.priority) - this.getPriorityWeight(b.priority))
      .slice(0, 2); // Show max 2 recommendations to avoid clutter

    this.currentRecommendations = sortedRecommendations;
    this.lastRecommendationTime = now;

    return sortedRecommendations;
  }

  private static generateRulaRecommendations(rulaScore: any, poseData: any): ErgonomicRecommendation[] {
    const recommendations: ErgonomicRecommendation[] = [];

    // Critical overall score first
    if (rulaScore.finalScore >= 7) {
      recommendations.push({
        id: 'rula-critical-immediate',
        priority: 'critical',
        category: 'breaks',
        title: 'CRITICAL: Immediate Action Required',
        description: `RULA score of ${rulaScore.finalScore}/7 indicates severe ergonomic risk`,
        action: 'Stop current activity immediately. Take a break and readjust your entire workstation setup.',
        bodyPart: ['full-body'],
        icon: 'report_problem',
        duration: '10-15 minutes'
      });
    } else if (rulaScore.finalScore >= 5) {
      recommendations.push({
        id: 'rula-high-action',
        priority: 'high',
        category: 'posture',
        title: 'High Risk Posture Detected',
        description: `RULA score of ${rulaScore.finalScore}/7 requires immediate attention`,
        action: 'Adjust your posture now and take a short break within the next few minutes.',
        bodyPart: ['full-body'],
        icon: 'warning',
        duration: '5 minutes'
      });
    }

    // Upper arm recommendations with specific angles
    if (rulaScore.upperArm >= 3) {
      const armAngle = Math.round(rulaScore.upperArmAngle || 0);
      recommendations.push({
        id: 'rula-upper-arm-high',
        priority: rulaScore.upperArm >= 4 ? 'critical' : 'high',
        category: 'posture',
        title: 'Upper Arm Position Critical',
        description: `Upper arms raised ${armAngle}° from neutral position (Score: ${rulaScore.upperArm}/6)`,
        action: 'Lower your arms and keep them close to your sides. Adjust chair height or desk level.',
        bodyPart: ['upper-arm'],
        icon: 'accessibility_new',
        duration: 'Immediate'
      });
    }

    // Wrist recommendations with specific angles
    if (rulaScore.wrist >= 3) {
      const wristAngle = Math.round(rulaScore.wristAngle || 0);
      recommendations.push({
        id: 'rula-wrist-high',
        priority: rulaScore.wrist >= 4 ? 'critical' : 'high',
        category: 'posture',
        title: 'Wrist Alignment Critical',
        description: `Wrists bent ${Math.abs(wristAngle)}° from neutral (Score: ${rulaScore.wrist}/4)`,
        action: 'Straighten wrists to neutral position. Use wrist rest or adjust keyboard height.',
        bodyPart: ['wrist'],
        icon: 'back_hand',
        duration: 'Immediate'
      });
    }

    // Neck recommendations with specific angles
    if (rulaScore.neck >= 3) {
      const neckAngle = Math.round(rulaScore.neckAngle || 0);
      const isForward = neckAngle > 0;
      recommendations.push({
        id: 'rula-neck-high',
        priority: rulaScore.neck >= 4 ? 'critical' : 'high',
        category: 'posture',
        title: 'Neck Position Critical',
        description: `Neck ${isForward ? 'forward' : 'backward'} ${Math.abs(neckAngle)}° from neutral (Score: ${rulaScore.neck}/4)`,
        action: isForward ? 'Move monitor closer and higher. Pull chin back to align head over shoulders.' : 'Lower monitor or adjust viewing angle. Relax neck position.',
        bodyPart: ['neck'],
        icon: 'sentiment_very_satisfied',
        duration: 'Immediate'
      });
    }

    // Add specific muscle fatigue recommendations based on score components
    if (rulaScore.scoreA >= 4 || rulaScore.scoreB >= 4) {
      const isArmIssue = rulaScore.scoreA >= rulaScore.scoreB;
      recommendations.push({
        id: isArmIssue ? 'rula-arm-fatigue' : 'rula-neck-fatigue',
        priority: 'medium',
        category: 'movement',
        title: isArmIssue ? 'Arm Muscle Fatigue Risk' : 'Neck/Trunk Fatigue Risk',
        description: `${isArmIssue ? 'Upper limb' : 'Neck and trunk'} stress detected (Score ${isArmIssue ? 'A' : 'B'}: ${isArmIssue ? rulaScore.scoreA : rulaScore.scoreB})`,
        action: isArmIssue ? 'Perform arm stretches and shoulder rolls. Rest arms by your sides.' : 'Do neck rolls and shoulder shrugs. Adjust monitor position.',
        bodyPart: isArmIssue ? ['upper-arm', 'lower-arm', 'wrist'] : ['neck', 'trunk'],
        icon: 'self_improvement',
        duration: '2-3 minutes'
      });
    }

    return recommendations;
  }

  private static generateRebaRecommendations(rebaScore: any, poseData: any): ErgonomicRecommendation[] {
    const recommendations: ErgonomicRecommendation[] = [];

    // Trunk recommendations
    if (rebaScore.trunk >= 3) {
      recommendations.push({
        id: 'reba-trunk-high',
        priority: rebaScore.trunk >= 4 ? 'critical' : 'high',
        category: 'posture',
        title: 'Back and Trunk Position',
        description: 'Your back is bent or twisted beyond safe limits',
        action: 'Straighten your back and use proper back support. Avoid twisting motions.',
        bodyPart: ['trunk', 'back'],
        icon: 'straighten',
        duration: 'Immediate'
      });
    }

    // Legs recommendations
    if (rebaScore.legs >= 2) {
      recommendations.push({
        id: 'reba-legs-high',
        priority: rebaScore.legs >= 3 ? 'high' : 'medium',
        category: 'posture',
        title: 'Leg and Foot Position',
        description: 'Your leg position indicates potential circulation or support issues',
        action: 'Ensure feet are flat on floor or footrest. Take walking breaks regularly.',
        bodyPart: ['legs', 'feet'],
        icon: 'directions_walk',
        duration: '2-3 minutes'
      });
    }

    // Overall REBA score recommendations
    if (rebaScore.finalScore >= 8) {
      recommendations.push({
        id: 'reba-critical-overall',
        priority: 'critical',
        category: 'breaks',
        title: 'High Risk Activity Detected',
        description: 'Your current activity poses high ergonomic risk to your entire body',
        action: 'Stop current activity immediately and take a proper break.',
        bodyPart: ['full-body'],
        icon: 'emergency',
        duration: '10-15 minutes'
      });
    } else if (rebaScore.finalScore >= 4) {
      recommendations.push({
        id: 'reba-medium-overall',
        priority: 'medium',
        category: 'movement',
        title: 'Posture Adjustment Needed',
        description: 'Multiple body parts need attention to reduce risk',
        action: 'Make gradual adjustments to your posture and take micro-breaks.',
        bodyPart: ['full-body'],
        icon: 'self_improvement',
        duration: '1-2 minutes'
      });
    }

    return recommendations;
  }

  private static generateSessionRecommendations(sessionDuration: number): ErgonomicRecommendation[] {
    const recommendations: ErgonomicRecommendation[] = [];
    const minutes = Math.floor(sessionDuration / 60);

    // Break reminders based on session duration
    if (minutes >= 30 && minutes % 30 === 0) {
      recommendations.push({
        id: `break-reminder-${minutes}`,
        priority: 'medium',
        category: 'breaks',
        title: 'Regular Break Time',
        description: `You've been working for ${minutes} minutes`,
        action: 'Take a 5-10 minute break. Stand up, stretch, and move around.',
        bodyPart: ['full-body'],
        icon: 'schedule',
        duration: '5-10 minutes'
      });
    }

    // Eye strain reminder
    if (minutes >= 20 && minutes % 20 === 0) {
      recommendations.push({
        id: `eye-break-${minutes}`,
        priority: 'low',
        category: 'breaks',
        title: '20-20-20 Rule',
        description: 'Protect your eyes from digital strain',
        action: 'Look at something 20 feet away for 20 seconds.',
        bodyPart: ['eyes'],
        icon: 'visibility',
        duration: '20 seconds'
      });
    }

    return recommendations;
  }

  private static generatePoseQualityRecommendations(poseData: any): ErgonomicRecommendation[] {
    const recommendations: ErgonomicRecommendation[] = [];
    
    if (!poseData || !poseData.keypoints) return recommendations;

    const validKeypoints = poseData.keypoints.filter((kp: any) => kp && kp.score > 0.3).length;
    const confidence = (validKeypoints / 17) * 100;

    // Poor pose detection quality
    if (confidence < 70) {
      recommendations.push({
        id: 'pose-quality-low',
        priority: 'low',
        category: 'environment',
        title: 'Improve Camera Position',
        description: 'Pose detection quality is suboptimal',
        action: 'Ensure good lighting and position yourself fully in the camera frame.',
        bodyPart: ['environment'],
        icon: 'camera_alt',
        duration: 'Immediate'
      });
    }

    return recommendations;
  }

  private static getPriorityWeight(priority: string): number {
    switch (priority) {
      case 'critical': return 1;
      case 'high': return 2;
      case 'medium': return 3;
      case 'low': return 4;
      default: return 5;
    }
  }

  static markRecommendationShown(id: string): void {
    this.shownRecommendations.add(id);
    
    // Clear old recommendations after 10 minutes
    setTimeout(() => {
      this.shownRecommendations.delete(id);
    }, 10 * 60 * 1000);
  }

  static clearShownRecommendations(): void {
    this.shownRecommendations.clear();
  }

  static getRecommendationColor(priority: string): string {
    switch (priority) {
      case 'critical': return 'from-red-500 to-red-600';
      case 'high': return 'from-orange-500 to-orange-600';
      case 'medium': return 'from-yellow-500 to-yellow-600';
      case 'low': return 'from-blue-500 to-blue-600';
      default: return 'from-gray-500 to-gray-600';
    }
  }

  static getRecommendationTextColor(priority: string): string {
    switch (priority) {
      case 'critical': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  }
}