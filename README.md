# Beam-Wellness-App
Beam: Your Reflective Wellbeing Companion
Project Overview
Beam is a modern, intuitive web application designed to empower individuals in their journey towards enhanced wellbeing, psychosocial safety, and equity. It provides a private, trauma-informed space for self-reflection, personal growth, and community engagement. Built with a focus on user privacy and a seamless experience, Beam aims to illuminate pathways to a healthier, safer, and more inclusive environment for its users.

Key Features
The Beam application offers a suite of interconnected features to support holistic wellbeing:

Personalized Dashboard: A central hub displaying key metrics such as Wellbeing Score, Psychological Safety, and Inclusion Index. It includes weekly trend charts and AI-generated personal insights to help users understand their progress and areas for growth.

Daily Check-in: A guided, trauma-informed process allowing users to reflect on their daily emotional state, feelings of safety, and inclusion through interactive sliders and optional journaling.

AI Companion (Chat): A private and empathetic AI-powered chatbot (utilizing the Gemini API) for users to engage in reflective conversations, seek support, and process thoughts in a safe and confidential space.

Calm Space: A dedicated area for mindfulness and reflection, featuring embedded guided meditation and yoga videos from Google Cloud Storage, along with a journaling tool. Users can also leverage the Gemini API to get personalized insights or follow-up questions on their journal entries, deepening their self-awareness.

Activity Challenge (Individual & Team Leaderboards): Encourages physical activity and community connection through a flexible activity-tracking feature. Users can log their activity (steps, kilometers, miles, or custom points), view their individual progress, and participate in team challenges by creating or joining teams. Real-time leaderboards display both individual and team rankings, fostering healthy competition and collaboration.

Comprehensive Settings: Allows users to customize their app experience, manage notification preferences, control data privacy settings (including explicit consent for AI data processing), and update their profile.

Technology Stack
Beam is primarily a single-page application (SPA) built with a robust and modern web technology stack:

Frontend:

HTML5: The structural foundation of the application.

Tailwind CSS: A utility-first CSS framework for rapid and consistent styling, ensuring a responsive and aesthetically pleasing user interface across all devices.

JavaScript (ES6+): Powers all interactive elements, dynamic content loading, client-side logic, and API integrations.

Chart.js: Used for rendering interactive and visually appealing data visualizations on the Dashboard.

Backend & Cloud Services:

Firebase Authentication: Handles user registration, login, and session management, supporting both email/password and anonymous guest access.

Cloud Firestore: A flexible, scalable NoSQL cloud database used for real-time data storage, including user check-ins, activity challenge data (individual and team), and user preferences.

Google AI (Gemini API): Integrated for advanced AI capabilities, providing the conversational intelligence for the Companion chat, generating personalized score analyses, and offering reflective insights for journal entries.

Google Cloud Storage: Utilized for efficient and scalable hosting of large media assets, such as the meditation and yoga video files embedded in the Calm Space.

Getting Started
Follow these steps to set up and deploy your Beam application.

Prerequisites

Node.js & npm: Ensure you have Node.js (which includes npm) installed on your machine. You can download it from nodejs.org.

Google Account: A Google account is required to use Firebase.

Gemini API Key: Obtain an API key for the Gemini API from Google AI Studio.

1. Firebase Project Setup

Create a Firebase Project:

Go to the Firebase Console.

Click "Add project" and follow the prompts. Give it a name like beam-wellbeing-app.

Enable Cloud Firestore and Firebase Authentication for your project.

Register a Web App:

In your Firebase project, click the </> icon (Web) to "Add app to get started".

Follow the steps to register your web app.

Copy the firebaseConfig object provided. You will need this in the next step.

Set Firestore Security Rules:

In the Firebase Console, navigate to Firestore Database -> Rules.

Replace the default rules with the following and Publish them. These rules secure your data, allowing authenticated users to read/write their own private data and read/write public challenge data.

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Match for artifacts collection (app-specific data)
    match /artifacts/{appId} {
      // Public data for activity challenges and teams
      match /public/data/{collectionId} {
        // Allow authenticated users to read and write to public collections
        allow read, write: if request.auth != null;
      }

      // Private user data (e.g., check-ins)
      match /users/{userId}/{collection=**} {
        // Allow read/write only if the user is authenticated and the userId matches their own UID
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}

2. Local Project Setup

Create a Project Folder: Create a new folder on your local machine (e.g., beam-app).

Place Your Files: Download and place all your application files into this folder:

index.html (This was beam-interactive-dashboard.html but should be renamed)

beam-interactive-dashboard-styles.css

beam-interactive-dashboard-main.js

beam-interactive-dashboard-firebase-config.js

Update beam-interactive-dashboard-firebase-config.js:

Open this file.

Replace the placeholder firebaseConfig object with the actual firebaseConfig object you copied from your Firebase Console.

// Example: Replace this entire block with your Firebase Console's config
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_FIREBASE_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "...",
  appId: "...",
  measurementId: "..."
};

Update beam-interactive-dashboard-main.js:

Open this file.

Find the line const apiKey = ""; (for Gemini API calls) and replace the empty string with your actual Gemini API Key.

Find the line const bypassAuthForDevelopment = true; and change it to false for production deployment.

3. Install Firebase CLI & Login

Install Firebase Tools: Open your terminal or command prompt and install the Firebase CLI globally:

npm install -g firebase-tools

Log in to Firebase: Authenticate your CLI with your Google account:

firebase login

Follow the browser prompts to complete the login.

4. Initialize Firebase Hosting in Your Project

Navigate to Project Folder: In your terminal, cd into the root directory of your beam-app folder (where index.html is).

cd path/to/your/beam-app-folder

Initialize Hosting: Run the Firebase initialization command:

firebase init hosting

"Are you ready to proceed? (Y/n)": Type Y and press Enter.

"Which Firebase project do you want to associate with this directory?": Use arrow keys to select your beam-wellbeing-app project. Press Enter.

"What do you want to use as your public directory? (public)": Type . (a single dot) and press Enter. This tells Firebase to deploy files directly from your current project folder.

"Configure as a single-page app (rewrite all urls to /index.html)? (y/N)": Type Y and press Enter. This is crucial for your app's hash-based routing.

"Set up automatic builds and deploys with GitHub? (y/N)": Type N (you can configure this later if desired).

If prompted to overwrite index.html or 404.html, type N.

This command will create firebase.json and .firebaserc files in your project root.

5. Deploy Your Application

Deploy to Firebase Hosting: In your terminal, from your project's root directory, run:

firebase deploy --only hosting

Firebase will upload your files.

Access Your Live App: Once the deployment is complete, the Firebase CLI will provide you with a Hosting URL (e.g., https://your-project-id.web.app or https://your-project-id.firebaseapp.com). This is your live Beam application!

Project Structure (after firebase init)

beam-app/
├── index.html
├── beam-interactive-dashboard-styles.css
├── beam-interactive-dashboard-main.js
├── beam-interactive-dashboard-firebase-config.js
├── firebase.json
├── .firebaserc
└── .gitignore
└── README.md

This README.md provides all the necessary information for anyone (including yourself in the future) to understand, set up, and deploy your Beam application
