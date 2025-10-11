# Northeastern Course Planner

A personalized course planner for Northeastern University students with AI-powered recommendations.

## Features

- 🔐 Firebase Authentication (Sign up & Login)
- 📄 PDF Upload & Parsing for completed courses using Gemini AI
- 🎯 AI-powered course recommendations using Gemini AI
- 📚 Major requirement tracking
- 🎓 Career goal alignment
- 📅 Semester planning tools

## Setup Instructions

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable Email/Password authentication
4. Get your Firebase configuration:
   - Go to Project Settings > General
   - Scroll down to "Your apps" and click "Add app" > Web
   - Copy the configuration values

### 2. Gemini AI Setup

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key for Gemini AI
3. Copy the API key for use in environment variables

### 3. Environment Variables

Create a `.env.local` file in the root directory with your Firebase and Gemini AI configuration:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

- `/src/app/` - Next.js app router pages
- `/src/components/` - Reusable UI components
- `/src/lib/` - Utility functions and configurations
- `/src/app/login` - Login page
- `/src/app/signup` - Sign up page
- `/src/app/dashboard` - Main dashboard (protected route)

## Authentication Flow

1. Users visit the root page (`/`)
2. If not authenticated, redirected to `/login`
3. If authenticated, redirected to `/dashboard`
4. Users can sign up via `/signup` or login via `/login`
5. During sign up, users can upload a PDF of their completed courses
6. PDF is parsed using Gemini AI to extract course information
7. Completed courses are stored in Firebase Firestore
8. After successful authentication, users are redirected to `/dashboard`

## PDF Upload Feature

The sign-up process includes an optional PDF upload feature that:

1. **Accepts PDF files** up to 10MB in size
2. **Parses course information** using Gemini AI to extract:
   - Course codes (e.g., CS 2500, MATH 1341)
   - Course names/titles
   - Credits
   - Grades (if available)
   - Semester/Term (if available)
3. **Stores parsed data** in Firebase Firestore under the user's document
4. **Provides feedback** to users about successful parsing

### Supported PDF Formats
- Northeastern University transcripts
- Course completion lists
- Academic records
- Any PDF containing course information

## Next Steps

- [ ] Implement AI course recommendation engine
- [ ] Add course catalog integration
- [ ] Create major requirement tracking
- [ ] Build semester planning interface
- [ ] Add user profile management
