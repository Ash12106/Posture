# Ergonomic Assessment Application - Setup Instructions

## Project Overview
This is a comprehensive ergonomic assessment application with real-time RULA and REBA scoring, 3D visualization, and intelligent recommendations.

## Setup Instructions for VS Code

### 1. Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Modern web browser with webcam access

### 2. Installation
```bash
# Extract the zip file to your desired directory
cd your-project-directory

# Install dependencies
npm install

# Set up environment variables (optional)
cp .env.example .env
# Edit .env with your database URL if using PostgreSQL
```

### 3. Development Setup
```bash
# Start the development server
npm run dev

# The application will be available at:
# - Frontend: http://localhost:5173
# - Backend API: http://localhost:5000
```

### 4. Features Included
- ✅ Real-time pose detection using TensorFlow.js
- ✅ RULA (Rapid Upper Limb Assessment) scoring
- ✅ REBA (Rapid Entire Body Assessment) scoring
- ✅ 3D visualization of pose data
- ✅ Smart recommendations with live analysis
- ✅ Session recording and report generation
- ✅ Professional PDF report export
- ✅ Responsive design for desktop and mobile

### 5. Technology Stack
- **Frontend:** React + TypeScript + Vite
- **Backend:** Express.js + TypeScript
- **UI:** Tailwind CSS + shadcn/ui components
- **AI/ML:** TensorFlow.js + PoseNet
- **3D Graphics:** Three.js
- **Database:** PostgreSQL (optional, fallback to in-memory)

### 6. Project Structure
```
├── client/          # React frontend application
├── server/          # Express.js backend API
├── shared/          # Shared TypeScript types and schemas
├── package.json     # Root dependencies and scripts
└── README.md        # This file
```

### 7. Key Components
- **Pose Detection:** Real-time camera-based pose analysis
- **Assessment Engines:** RULA and REBA scoring algorithms
- **3D Visualization:** Interactive 3D pose representation
- **Smart Recommendations:** AI-driven ergonomic suggestions
- **Report Generation:** Professional PDF reports with screenshots

### 8. Usage
1. Open the application in your browser
2. Allow camera access when prompted
3. Select assessment type (RULA, REBA, or Both)
4. Position yourself in front of the camera
5. View real-time scores and recommendations
6. Generate reports for ergonomic analysis

### 9. Troubleshooting
- Ensure camera permissions are granted
- Check that all dependencies are installed
- Verify Node.js version compatibility
- Clear browser cache if experiencing issues

### 10. Deployment
The application is configured for Replit deployment but can be deployed to any Node.js hosting platform.

For questions or support, refer to the documentation in the codebase.