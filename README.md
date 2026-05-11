# Syncup: AI-Powered Job Matching Workspace

Syncup is a full-stack job platform designed to bridge the gap between candidates and recruiters using AI-driven match signals. This project was built as a technical assignment to demonstrate expertise in building secure, high-performance web applications with modern technology stacks.

## 🚀 Key Features

### For Candidates
- **AI Resume Matching**: Upload a resume (PDF) and get an instant AI match score against job descriptions using **Groq (Llama 3.1)**.
- **Smart Dashboard**: Track applications, match scores, and status updates in real-time.
- **Persistent Auth**: Robust "Stay Logged In" functionality using rotating refresh tokens and JWT.

### For Recruiters
- **Role Management**: Post and manage job listings with rich context for better matching.
- **Candidate Signal**: Review applicants with pre-calculated AI fit summaries, highlighting skill gaps and strengths.
- **Live Notifications**: Real-time updates via WebSockets for new applications and status changes.

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14 (App Router), TypeScript, CSS Modules, Lucide React |
| **Backend** | Node.js, Express, TypeScript, Prisma ORM |
| **Database** | PostgreSQL (Neon DB), Upstash Redis (Caching) |
| **AI/ML** | Groq SDK (Llama 3.1 8B) for high-speed LLM processing |
| **Storage** | Cloudinary (Resume file hosting) |
| **Auth** | JWT with HTTP-only rotating refresh cookies |
| **Deployment** | Vercel (Frontend & Backend) |

## 📐 Architecture & Performance

- **Optimized Latency**: Backend deployed in the same region as the database (Singapore/sin1) to ensure millisecond response times.
- **Asynchronous Processing**: AI matching is offloaded to background threads to keep the UI snappy and responsive.
- **Security First**: Password hashing with Bcrypt, protected API routes with custom middleware, and CSRF-resistant cookie handling.

## 🛠 Setup & Installation

### Prerequisites
- Node.js (v18+)
- PostgreSQL (Neon or local)
- Cloudinary & Groq API Keys

### Quick Start
1. **Clone the repo**
   ```bash
   git clone https://github.com/PranitShrivastava010/Syncup-Assignment.git
   cd Syncup-Assignment
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Create .env based on .env.example
   npx prisma db push
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   # Create .env based on .env.example
   npm run dev
   ```

## 🌐 Deployment

The application is fully container-ready and currently deployed on **Vercel**. 
- **Frontend**: [https://syncup-assignment-d5hh.vercel.app](https://syncup-assignment-d5hh.vercel.app)
- **Backend**: [https://syncup-assignment-ashen.vercel.app](https://syncup-assignment-ashen.vercel.app)

---
*Created by [Pranit Shrivastava](https://github.com/PranitShrivastava010)*
