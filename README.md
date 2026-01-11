# FitnessPro - Smart Fitness Tracking Application 🏋️‍♂️

FitnessPro is a full-stack fitness tracking application designed to help users monitor workouts, track nutrition, and achieve fitness goals with the power of AI. It features a modern, responsive UI and a robust backend for secure data management.

## 🚀 Key Features

*   **AI-Powered Workout Planner:** leveraging AI to generate personalized workout plans based on user goals and fitness levels.
*   **Comprehensive Dashboard:** Visual analytics for workout frequency, calories burned, and weight progress.
*   **Exercise Library:** A vast database of exercises with instructions and categorization.
*   **User Profiles:** Detailed profile management including BMI calculation and macro tracking.
*   **Secure Authentication:** User signup and login protected with industry-standard encryption.
*   **Responsive Design:** Fully optimized for seamless usage on desktop, tablet, and mobile devices.

## 🛠️ Tech Stack

*   **Frontend:** HTML5, CSS3, Vanilla JavaScript (Modern ES6+), Chart.js
*   **Backend:** Node.js, Express.js
*   **Database:** MongoDB (Mongoose ODM)
*   **Authentication:** JWT (JSON Web Tokens) & Bcrypt
*   **AI Integration:** Custom AI routes for generative workout plans

## ⚙️ Setup & Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/fitness-pro.git
    cd fitness-pro
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Create a `.env` file in the root directory and add your credentials:
    ```env
    PORT=3000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    ```

4.  **Run the Application:**
    ```bash
    # Run in development mode (with nodemon)
    npm run dev
    
    # Run in production mode
    npm start
    ```

5.  **Access the App:**
    Open your browser and navigate to `http://localhost:3000`

## 🤝 Contributing

Contributions are welcome! Please perform pull requests for any feature updates or bug fixes.

## 📄 License

This project is open-source and available under the MIT License.
