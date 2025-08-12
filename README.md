# 🚀 AlgoTrack - DSA Progress Tracker

<div align="center">

![AlgoTrack Logo](https://img.shields.io/badge/AlgoTrack-DSA%20Tracker-blue?style=for-the-badge&logo=algorithm)

**A scalable full-stack platform designed to support students preparing for technical interviews through structured Data Structures & Algorithms progress tracking.**

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=flat&logo=mongodb)](https://mongodb.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Frontend-3178C6?style=flat&logo=typescript)](https://typescriptlang.org/)

[🌟 Features](#features) • [🛠️ Tech Stack](#tech-stack) • [⚡ Quick Start](#quick-start) • [📖 API Documentation](#api-documentation)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Environment Setup](#environment-setup)
- [API Documentation](#api-documentation)
- [Frontend Components](#frontend-components)
- [Future Enhancements](#future-enhancements)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

AlgoTrack is a comprehensive platform that revolutionizes how students approach technical interview preparation. By combining structured progress tracking with AI-powered insights, it creates an optimal learning environment for mastering Data Structures and Algorithms.

### 🎪 Key Highlights

- **📊 Progress Tracking**: Visual analytics and streak monitoring
- **🤖 AI Integration**: Gemini API for real-time code analysis and Big-O complexity insights
- **🔍 Smart Search**: Personalized information retrieval system for coding solutions
- **🧠 Spaced Repetition**: Algorithmic model for enhanced long-term retention
- **👥 Community Impact**: Successfully used by 10+ students

---

## ✨ Features

### 🔐 Authentication & User Management
- Secure JWT-based authentication
- User registration and login
- Protected routes and session management
- User profile with statistics

### 📝 Question Management
- Add custom coding questions
- Categorize by difficulty (Easy, Medium, Hard)
- Topic-based organization
- Sample input/output examples
- Multiple solution storage with explanations

### 📈 Progress Analytics
- Daily streak tracking
- Monthly progress visualization
- Solved questions statistics
- Performance insights with charts

### 💻 Code Editor Integration
- Monaco Editor for syntax highlighting
- Multi-language support
- Code explanation and analysis
- Solution storage and retrieval

### 🎨 Modern UI/UX
- Cyber-themed dark interface
- Responsive design for all devices
- Smooth animations with Framer Motion
- Toast notifications for user feedback

---

## 🛠️ Tech Stack

### Frontend
- **React 18.3.1** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **React Router DOM** - Client-side routing
- **Monaco Editor** - Code editing experience
- **Framer Motion** - Smooth animations
- **Recharts** - Data visualization
- **Axios** - HTTP client

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### Development Tools
- **Nodemon** - Auto-restart development server
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes

---

## ⚡ Quick Start

### Prerequisites

Make sure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas)
- **Git**

### 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/algotrack.git
   cd algotrack
   ```

2. **Backend Setup**
   ```bash
   cd Backend
   npm install
   ```

3. **Frontend Setup**
   ```bash
   cd ../Frontend
   npm install
   ```

### 🌍 Environment Setup

#### Backend Environment (.env)
Create a `.env` file in the `Backend` directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/algotrack
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/algotrack

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Origins (add your deployed frontend URL)
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,https://yourdomain.com
```

#### Frontend Environment (.env.local)
The frontend `.env.local` file is already created:

```env
VITE_API_URL=http://localhost:5000
```

For production, update this to your deployed backend URL.

### 🚀 Running the Application

1. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

2. **Start the Backend Server**
   ```bash
   cd Backend
   npm run dev
   ```
   The backend will run on `http://localhost:5000`

3. **Start the Frontend Development Server**
   ```bash
   cd Frontend
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`

4. **Access the Application**
   Open your browser and navigate to `http://localhost:5173`

---

## 🎨 Frontend Components

### Key Components Overview

- **Dashboard**: Main hub showing progress analytics and recent activity
- **Questions**: Filterable list of all coding questions
- **AddQuestion**: Form to add new coding problems
- **QuestionDetail**: Detailed view with code editor and solutions
- **Profile**: User statistics and account management
- **ProgressChart**: Visual representation of solving progress

---

## 🔮 Future Enhancements

### 🤖 AI Integration (Planned)
- **Gemini API Integration**: Real-time code analysis
- **Line-by-line Explanations**: Detailed code breakdown
- **Big-O Complexity Analysis**: Automatic complexity calculation
- **Smart Suggestions**: AI-powered problem recommendations

### 📚 Advanced Features (Roadmap)
- **Spaced Repetition Algorithm**: Enhanced retention system
- **Collaborative Features**: Study groups and peer reviews
- **Contest Integration**: LeetCode/CodeChef problem sync
- **Mobile Application**: React Native implementation
- **Advanced Analytics**: Detailed performance insights
- **Video Solutions**: Integrated explanation videos

### 🔧 Technical Improvements
- **Microservices Architecture**: Scalable backend design
- **Redis Caching**: Performance optimization
- **Docker Containerization**: Easy deployment
- **CI/CD Pipeline**: Automated testing and deployment
- **Real-time Features**: WebSocket integration

---

## 🤝 Contributing

I welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style and conventions
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

---

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend is running on port 5000
   - Check that frontend URL is in `allowedOrigins` array
   - Verify environment variables are set correctly

2. **Database Connection Issues**
   - Ensure MongoDB is running
   - Check connection string in `.env` file
   - Verify database permissions

3. **Authentication Problems**
   - Clear browser cookies and localStorage
   - Check JWT_SECRET in environment variables
   - Ensure cookies are enabled in browser

### Getting Help

- Check the [Issues](https://github.com/yourusername/algotrack/issues) page
- Create a new issue with detailed description
- Join our community discussions

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ by [Atharva Kharade](https://github.com/yourusername)**

⭐ Star this repository if you found it helpful!

[🔝 Back to Top](#-algotrack---dsa-progress-tracker)

</div>