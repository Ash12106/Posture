// REBA Calculator - Rapid Entire Body Assessment
// Based on the original REBA scoring system by Hignett & McAtamney (2000)

export interface REBAScore {
  neck: number;
  trunk: number;
  legs: number;
  upperArm: number;
  lowerArm: number;
  wrist: number;
  scoreA: number;
  scoreB: number;
  finalScore: number;
  riskLevel: string;
  actionLevel: string;
  // Additional details for debugging
  neckAngle: number;
  trunkAngle: number;
  upperArmAngle: number;
  lowerArmAngle: number;
  wristAngle: number;
}

// REBA Scoring Tables
const REBA_TABLE_A = [
  [1, 2, 3, 4],
  [2, 3, 4, 5],
  [2, 4, 5, 6],
  [3, 5, 6, 7],
  [4, 6, 7, 8]
];

const REBA_TABLE_B = [
  [1, 2, 2],
  [1, 2, 3],
  [3, 4, 5],
  [4, 5, 6],
  [6, 7, 8],
  [7, 8, 9]
];

const REBA_TABLE_C = [
  [1, 1, 1, 2, 3, 3, 4, 5, 6, 7, 7, 7],
  [1, 2, 2, 3, 4, 4, 5, 6, 6, 7, 7, 8],
  [2, 3, 3, 3, 4, 5, 6, 7, 7, 8, 8, 8],
  [3, 4, 4, 4, 5, 6, 7, 8, 8, 9, 9, 9],
  [4, 4, 4, 5, 6, 7, 8, 8, 9, 9, 9, 9],
  [6, 6, 6, 7, 8, 8, 9, 9, 10, 10, 10, 10],
  [7, 7, 7, 8, 9, 9, 9, 10, 10, 11, 11, 11],
  [8, 8, 8, 9, 10, 10, 10, 10, 10, 11, 11, 11],
  [9, 9, 9, 10, 10, 10, 11, 11, 11, 12, 12, 12],
  [10, 10, 10, 11, 11, 11, 11, 12, 12, 12, 12, 12],
  [11, 11, 11, 11, 12, 12, 12, 12, 12, 12, 12, 12],
  [12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12]
];

// Individual body part scoring functions
function getNeckScore(neckAngle: number, isNeckTwisted: boolean = false): number {
  let score = 1;
  
  if (neckAngle >= 0 && neckAngle < 20) {
    score = 1;
  } else if (neckAngle >= 20) {
    score = 2;
  }
  
  // Extension adjustment
  if (neckAngle < 0) {
    score = 2;
  }
  
  // Adjustment for neck twist/side bend
  if (isNeckTwisted) {
    score += 1;
  }
  
  return Math.min(3, score);
}

function getTrunkScore(trunkAngle: number, isTrunkTwisted: boolean = false): number {
  let score = 1;
  
  if (trunkAngle >= 0 && trunkAngle < 5) {
    score = 1;
  } else if (trunkAngle >= 5 && trunkAngle < 20) {
    score = 2;
  } else if (trunkAngle >= 20 && trunkAngle < 60) {
    score = 3;
  } else if (trunkAngle >= 60) {
    score = 4;
  }
  
  // Adjustment for trunk twist/side bend
  if (isTrunkTwisted) {
    score += 1;
  }
  
  return Math.min(5, score);
}

function getLegsScore(kneeAngle: number, isSupported: boolean = true): number {
  let score = 1;
  
  // Basic leg position scoring
  if (kneeAngle >= 30 && kneeAngle < 60) {
    score = 2;
  } else if (kneeAngle >= 60) {
    score = 2;
  }
  
  // Adjustment for bilateral weight bearing
  if (!isSupported) {
    score += 1;
  }
  
  return Math.min(4, score);
}

function getUpperArmScore(upperArmAngle: number, isShoulderRaised: boolean = false, isArmAbducted: boolean = false, isArmSupported: boolean = false): number {
  let score = 1;
  
  if (upperArmAngle >= 20 && upperArmAngle < 45) {
    score = 2;
  } else if (upperArmAngle >= 45 && upperArmAngle < 90) {
    score = 3;
  } else if (upperArmAngle >= 90) {
    score = 4;
  }
  
  // Extension adjustment
  if (upperArmAngle < -20) {
    score = 2;
  }
  
  // Adjustments
  if (isShoulderRaised) score += 1;
  if (isArmAbducted) score += 1;
  if (isArmSupported) score -= 1;
  
  return Math.max(1, Math.min(6, score));
}

function getLowerArmScore(lowerArmAngle: number): number {
  if (lowerArmAngle >= 60 && lowerArmAngle <= 100) {
    return 1;
  } else {
    return 2;
  }
}

function getWristScore(wristAngle: number, isWristTwisted: boolean = false): number {
  let score = 1;
  
  if (Math.abs(wristAngle) > 15) {
    score = 2;
  }
  
  // Adjustment for wrist twist
  if (isWristTwisted) {
    score += 1;
  }
  
  return Math.min(3, score);
}

// Table lookup functions
function getScoreA(neck: number, trunk: number, legs: number): number {
  const neckIndex = Math.max(0, Math.min(4, neck - 1));
  const trunkIndex = Math.max(0, Math.min(2, trunk - 1));
  const legsAdjustedIndex = legs === 1 ? 0 : legs === 2 ? 1 : Math.min(3, legs - 1);
  
  return REBA_TABLE_A[neckIndex]?.[legsAdjustedIndex] || 1;
}

function getScoreB(upperArm: number, lowerArm: number, wrist: number): number {
  const upperArmIndex = Math.max(0, Math.min(5, upperArm - 1));
  const lowerArmIndex = Math.max(0, Math.min(1, lowerArm - 1));
  const wristIndex = Math.max(0, Math.min(2, wrist - 1));
  
  return REBA_TABLE_B[upperArmIndex]?.[wristIndex] || 1;
}

function getFinalScore(scoreA: number, scoreB: number, loadCoupling: number = 0, activity: number = 0): number {
  const scoreAIndex = Math.max(0, Math.min(11, scoreA - 1));
  const scoreBIndex = Math.max(0, Math.min(11, scoreB - 1));
  
  let finalScore = REBA_TABLE_C[scoreAIndex]?.[scoreBIndex] || 1;
  
  // Add load/coupling and activity adjustments
  finalScore += loadCoupling + activity;
  
  return Math.max(1, Math.min(15, finalScore));
}

function getRiskLevel(score: number): string {
  if (score === 1) return "Negligible";
  if (score >= 2 && score <= 3) return "Low";
  if (score >= 4 && score <= 7) return "Medium";
  if (score >= 8 && score <= 10) return "High";
  return "Very High";
}

function getActionLevel(score: number): string {
  if (score === 1) return "None necessary";
  if (score >= 2 && score <= 3) return "May be necessary";
  if (score >= 4 && score <= 7) return "Necessary";
  if (score >= 8 && score <= 10) return "Necessary soon";
  return "Necessary now";
}

// Main calculation function
export function calculateREBA(keypoints: any[]): REBAScore | null {
  if (!keypoints || keypoints.length < 17) {
    return null;
  }

  try {
    // Extract key landmarks
    const nose = keypoints[0];
    const leftShoulder = keypoints[5];
    const rightShoulder = keypoints[6];
    const leftElbow = keypoints[7];
    const rightElbow = keypoints[8];
    const leftWrist = keypoints[9];
    const rightWrist = keypoints[10];
    const leftHip = keypoints[11];
    const rightHip = keypoints[12];
    const leftKnee = keypoints[13];
    const rightKnee = keypoints[14];

    // Calculate angles using the dominant side (higher confidence)
    const useLeftSide = (leftShoulder?.score || 0) > (rightShoulder?.score || 0);
    const shoulder = useLeftSide ? leftShoulder : rightShoulder;
    const elbow = useLeftSide ? leftElbow : rightElbow;
    const wrist = useLeftSide ? leftWrist : rightWrist;
    const hip = useLeftSide ? leftHip : rightHip;
    const knee = useLeftSide ? leftKnee : rightKnee;

    // Calculate neck angle (head to shoulders)
    const shoulderMidpoint = {
      x: (leftShoulder.x + rightShoulder.x) / 2,
      y: (leftShoulder.y + rightShoulder.y) / 2
    };
    const neckAngle = Math.atan2(nose.y - shoulderMidpoint.y, nose.x - shoulderMidpoint.x) * 180 / Math.PI;

    // Calculate trunk angle (shoulders to hips)
    const hipMidpoint = {
      x: (leftHip.x + rightHip.x) / 2,
      y: (leftHip.y + rightHip.y) / 2
    };
    const trunkAngle = Math.abs(Math.atan2(shoulderMidpoint.y - hipMidpoint.y, shoulderMidpoint.x - hipMidpoint.x) * 180 / Math.PI - 90);

    // Calculate upper arm angle
    const upperArmAngle = Math.abs(Math.atan2(elbow.y - shoulder.y, elbow.x - shoulder.x) * 180 / Math.PI - 90);

    // Calculate lower arm angle
    const lowerArmAngle = Math.abs(Math.atan2(wrist.y - elbow.y, wrist.x - elbow.x) * 180 / Math.PI - 
                                  Math.atan2(elbow.y - shoulder.y, elbow.x - shoulder.x) * 180 / Math.PI);

    // Calculate wrist angle (simplified)
    const wristFlexionAngle = 15; // Default assumption for 2D pose detection

    // Calculate knee angle for legs score
    const kneeAngle = hip && knee ? Math.abs(Math.atan2(knee.y - hip.y, knee.x - hip.x) * 180 / Math.PI) : 30;

    // Get individual scores
    const neckScore = getNeckScore(Math.abs(neckAngle - 90));
    const trunkScore = getTrunkScore(trunkAngle);
    const legsScore = getLegsScore(kneeAngle);
    const upperArmScore = getUpperArmScore(upperArmAngle);
    const lowerArmScore = getLowerArmScore(lowerArmAngle);
    const wristScore = getWristScore(wristFlexionAngle);

    // Calculate group scores
    const scoreA = getScoreA(neckScore, trunkScore, legsScore);
    const scoreB = getScoreB(upperArmScore, lowerArmScore, wristScore);
    const finalScore = getFinalScore(scoreA, scoreB);

    return {
      neck: neckScore,
      trunk: trunkScore,
      legs: legsScore,
      upperArm: upperArmScore,
      lowerArm: lowerArmScore,
      wrist: wristScore,
      scoreA,
      scoreB,
      finalScore,
      riskLevel: getRiskLevel(finalScore),
      actionLevel: getActionLevel(finalScore),
      // Debug information
      neckAngle: Math.round(Math.abs(neckAngle - 90) * 10) / 10,
      trunkAngle: Math.round(trunkAngle * 10) / 10,
      upperArmAngle: Math.round(upperArmAngle * 10) / 10,
      lowerArmAngle: Math.round(lowerArmAngle * 10) / 10,
      wristAngle: Math.round(wristFlexionAngle * 10) / 10
    };

  } catch (error) {
    console.error("Error calculating REBA score:", error);
    return null;
  }
}