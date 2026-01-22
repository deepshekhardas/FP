# FitnessPro - Smart Fitness Tracking Application 🏋️‍♂️

![Dashboard Preview](file:///C:/Users/hp/.gemini/antigravity/brain/5c955e50-8ba7-4074-a317-205d7724c301/dashboard_mockup_1768275612261.png)

FitnessPro is a **premium, full-stack fitness tracking application** built for the modern athlete. It combines AI-driven workout planning with comprehensive analytics.

## 🔗 Project Links (A to Z)

| Resource | Link |
| :--- | :--- |
| **📂 GitHub Repository** | [https://github.com/deepshekhardas/fp](https://github.com/deepshekhardas/fp) |
| **🚀 Backend Deployment** | *Deploy on Render to get URL* |
| **🌐 Frontend Deployment** | *Deploy on Vercel to get URL* |

## 🚀 Key Features

*   **🤖 AI-Powered Workout Planner:** Generates personalized routines using smart filtering algorithms.
*   **📊 Interactive Analytics:** Visual charts for Weekly Progress, Calories, and Consistency.
*   **🔔 Real-Time Notifications:** Goal tracking and deadline reminders.
*   **📱 Responsive & Premium UI:** "Deep Luxury" dark mode aesthetic with glassmorphism effects.

## 🛠️ Tech Stack

*   **Frontend Check:** React.js, Vite, Tailwind CSS
*   **Backend:** Node.js, Express.js
*   **Database:** MongoDB (Mongoose ODM)
*   **Authentication:** JWT (JSON Web Tokens) & Bcrypt
*   **AI Integration:** Google Gemini API for workout plans

## ⚙️ Setup & Installation (A to Z Guide)

### 1. Clone the Repository
```bash
git clone https://github.com/deepshekhardas/fp.git
cd fp
```

### 2. Install Dependencies
**Backend:**
```bash
npm install
```
**Frontend:**
```bash
cd client
npm install
cd ..
```

### 3. Environment Setup (.env)
Create a `.env` file in the root directory:
```env
PORT=3001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
OPENAI_API_KEY=your_gemini_api_key
NODE_ENV=development
```

### 4. Run Locally
To run both Backend and Frontend together:
```bash
npm run dev:all
# Frontend: http://localhost:5173
# Backend: http://localhost:3001
```

## 🌍 Deployment Guide

### Backend (Render)
1.  Connect this repo (`https://github.com/deepshekhardas/fp`) to Render.com.
2.  Set Build Command: `npm install`
3.  Set Start Command: `npm start`
4.  Add Environment Variables from your `.env` file.

### Frontend (Vercel)
1.  Import this repo to Vercel.
2.  Set Root Directory to `client`.
3.  Add Environment Variable: `VITE_API_URL` = `(Your Render Backend URL)`

## 🤝 Contributing
Contributions are welcome! Please Open an issue or Pull Request on GitHub.

## 📄 License
This project is open-source and available under the ISC License.
