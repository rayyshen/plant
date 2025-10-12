# 🌱 Plant - Academic Growth Planner

**Cultivate your academic journey with Plant** - an intelligent course planning platform designed specifically for Northeastern University students. Plant helps you grow and thrive in your studies with personalized course recommendations, smart planning tools, and AI-powered insights that nurture your academic success.

## 🌟 Features

### 🌿 Smart Growth
- **AI-Powered Recommendations**: Get personalized course suggestions that adapt to your learning style and academic goals
- **Intelligent Planning**: Plan semester-by-semester with course difficulty ratings for balanced loads
- **Career Alignment**: Align your studies with future career opportunities and industry growth

### 🌱 Root Tracking
- **Real-time Progress Monitoring**: Track your progress toward graduation with live requirement checking
- **Major Requirements**: Comprehensive tracking for all Northeastern majors (especially Computer Science)
- **Prerequisite Management**: Automatic prerequisite checking and course sequencing

### 🌸 Academic Assistant
- **AI Chatbot**: Context-aware academic assistant powered by Google Gemini AI
- **Course Difficulty Ratings**: 1-5 scale difficulty ratings for 87,000+ courses
- **PDF Transcript Processing**: Upload and automatically parse your academic transcripts
- **PDF Export**: Generate comprehensive PDF reports of your academic plans

### 🌳 Seasonal Planning
- **Semester Management**: Plan your academic seasons with drag-and-drop course scheduling
- **Course Database**: Access to complete Northeastern University course catalog
- **Requirement Validation**: Real-time checking against major requirements

## 🚀 Tech Stack

### Frontend
- **Next.js 15.5.4** with App Router
- **React 19.1.0** with TypeScript
- **Tailwind CSS 4.1.14** with custom plant-themed animations
- **Radix UI** for accessible components
- **Lucide React** for icons
- **@dnd-kit** for drag-and-drop functionality

### Backend & Services
- **Firebase** (Authentication + Firestore)
- **Google Generative AI (Gemini 2.0 Flash)** for AI assistance
- **Next.js API Routes** for server-side functionality
- **jsPDF** for client-side PDF generation
- **html2canvas** for advanced PDF rendering

### Data Processing
- **Python** web scraping scripts
- **Beautiful Soup** for HTML parsing
- **JSON** for structured data storage

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project
- Google AI API key

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/plant.git
cd plant
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google AI API
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

### 4. Firebase Setup
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Update the environment variables with your Firebase config

### 5. Run the Development Server
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📊 Data Sources

The application uses several comprehensive datasets:

- **Course Catalog**: 79,572 lines of structured course data from Northeastern University
- **Course Difficulty**: 87,529 courses with 1-5 difficulty ratings
- **Major Requirements**: 23,206 lines covering 72+ majors
- **CS Requirements**: Detailed Computer Science program requirements

## 🎨 Design System
Plant uses a nature-inspired design system with:

- **Plant-themed animations**: Leaf floating, growing effects, organic shapes
- **Green color palette**: Various shades of green representing growth
- **Organic UI elements**: Rounded corners, natural shadows, flowing transitions
- **Accessibility**: WCAG compliant with Radix UI components

## 🤖 AI Integration

### Academic Assistant
The AI chatbot provides:
- Course scheduling advice
- Requirement tracking assistance
- Career-focused recommendations
- Difficulty-balanced semester planning

### PDF Processing
Upload academic transcripts for automatic course extraction using AI vision.

## PDF Export Features
Plant offers comprehensive PDF export capabilities to help you document and share your academic plans.

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production with Turbopack
npm run start        # Start production server
npm run lint         # Run ESLint
```
### Data Processing
To update course data:
```bash
cd data/
python scraping.py    # Scrape course catalog
python cleaning.py    # Clean and structure data
python score_eval.py  # Evaluate course difficulty
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- Northeastern University for course catalog data
- Google AI for Gemini integration
- Firebase for backend services
- The open-source community for amazing tools and libraries

---

**Ready to plant the seeds of success?** 🌱

Join thousands of students who are already growing smarter with Plant's intelligent planning tools.