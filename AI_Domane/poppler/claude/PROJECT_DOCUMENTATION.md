# AICaffe - Project Documentation

## Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [End-to-End Concept](#end-to-end-concept)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Authentication System](#authentication-system)
- [AI & LLM Integration](#ai--llm-integration)
- [How to Use](#how-to-use)
- [Key Benefits](#key-benefits)

---

## Overview

**AICaffe** is a full-stack AI-powered chatbot platform designed to deliver domain-specific intelligence across multiple industries. It allows users to interact with various Large Language Models (LLMs) through a unified, project-organized interface with real-time streaming responses, file attachment support, and multi-domain solution routing.

The platform targets five core domains: **ESG (Environmental, Social, Governance)**, **Elections**, **Workforce**, **DataCaffe**, and **Insurance** — each with tailored AI models and system prompts optimized for that domain.

---

## Problem Statement

### Problems AICaffe Solves

1. **Fragmented AI Access:** Users typically need to switch between multiple AI tools (ChatGPT, Claude, custom models) for different tasks. AICaffe unifies access to multiple LLMs (Kimi-k2.5, Qwen, GPT, Claude Sonnet, Mistral) under a single interface.

2. **Lack of Domain Expertise:** General-purpose AI chatbots lack specialized knowledge in niche fields like ESG compliance, election analytics, or workforce management. AICaffe routes queries to domain-specific solution pipelines with specialized system prompts and RAG (Retrieval-Augmented Generation) capabilities.

3. **Disorganized Conversations:** Most chatbot tools offer flat, unorganized chat histories. AICaffe provides a **project-based organization system** where users can group related conversations under projects, making it easy to manage research, analysis, and workflows.

4. **No File Context in Chat:** Many AI tools don't allow users to upload documents and have the AI reason over them. AICaffe supports file attachments (PDF, DOCX, CSV, images, JSON, etc.) that are parsed and injected into the LLM context for informed responses.

5. **Security & Session Management Gaps:** Enterprise users need robust authentication, session tracking, and device management. AICaffe implements multi-method authentication (email/password, OTP, Google OAuth), HTTP-only cookies, rate limiting, and per-device session management with IP/location tracking.

6. **Language Accessibility:** AICaffe provides multi-language support (English and Hindi) to serve a broader user base.

---

## End-to-End Concept

### How AICaffe Works (User Journey)

```
Landing Page → Sign Up / Login → Domain Selection → AI Chat Interface
```

1. **Discovery:** A new user visits the marketing landing page, which showcases AICaffe's features, AI model capabilities, and pricing plans (Individual / Team).

2. **Authentication:** The user signs up via one of three methods:
   - **Email + OTP:** Enter email → receive a 6-digit OTP → verify → set name and password.
   - **Email + Password:** Direct registration with name and password.
   - **Google OAuth:** One-click sign-in with a Google account.

3. **Domain Selection (Topic Picker):** After signup, the user selects up to 3 domains of interest (ESG, Election, Workforce, DataCaffe, Insurance). This is saved as their work profile and personalizes their experience.

4. **Welcome Screen:** A brief animated welcome screen introduces the AI models available.

5. **Chat Interface (Main App):** The core experience — a full-featured chat interface where the user can:
   - Start standalone chats or create projects to organize conversations.
   - Select an **AI Model** (e.g., Kimi-k2.5, Qwen3 Coder, Claude Sonnet 4.6).
   - Select a **Solution Domain** (e.g., Brew Generic, ESG, Election, DataCaffe).
   - Type messages or use voice input (Web Speech API).
   - Attach files for context-aware responses.
   - Receive real-time streaming responses via Server-Sent Events (SSE).
   - Browse and search chat history in the sidebar.
   - Manage projects (create, rename, archive, delete).

6. **Session Management:** Users can view all active sessions (with device, IP, and location info), revoke individual sessions, or log out from all devices.

---

## Features

### Authentication & User Management

| Feature | Description |
|---|---|
| Email + OTP Registration | 6-digit OTP sent via SMTP, valid for 5 minutes, max 4 attempts |
| Email + Password Registration | Direct signup with bcrypt-hashed password (cost factor 12) |
| Google OAuth 2.0 | Single sign-on with Google, auto-creates user from Google profile |
| Password Reset | OTP-based password reset flow with session invalidation |
| Session Management | Track active sessions with device, browser, OS, IP, and location |
| Multi-Device Logout | Revoke individual sessions or log out from all devices at once |
| Work Profile | Save user's domain/category preference (up to 3 topics) |

### Chat & Conversations

| Feature | Description |
|---|---|
| Standalone Chats | Quick chats not tied to any project |
| Project-Based Conversations | Organize related chats under named projects |
| Real-Time Streaming | SSE-based token-by-token response streaming |
| File Attachments | Upload PDF, DOCX, CSV, JSON, images (max 10MB per file) |
| File Context Injection | Text files are parsed and injected into LLM prompts |
| Conversation History | Searchable sidebar with full chat history |
| Rename & Delete | Manage conversations with rename and delete options |
| Voice Input | Browser-native speech-to-text via Web Speech API |
| Quick Actions | One-click buttons for ESG, Election, Workforce, DataCaffe, Insurance |

### AI & Model Selection

| Feature | Description |
|---|---|
| Multi-Model Support | Choose from 5+ LLM models per conversation |
| Multi-Solution Routing | Route queries to domain-specific pipelines (Generic, ESG, Election, DataCaffe) |
| Model Fallback Chain | LangGraph service → Direct API calls (OpenAI, Anthropic, Ollama) |
| RAG Pipeline | Retrieval-Augmented Generation for ESG domain knowledge |
| System Prompts | Domain-specific system prompts for each solution type |

### Project Management

| Feature | Description |
|---|---|
| Create Projects | Named projects with descriptions, custom colors, and icons |
| Archive Projects | Soft-archive projects without deleting data |
| Search & Sort | Filter projects by name/description, sort by date or activity |
| Per-Project Conversations | Each project contains its own set of organized conversations |

### User Interface

| Feature | Description |
|---|---|
| Light / Dark / Auto Theme | Theme toggle with system preference auto-detection |
| Multi-Language (i18n) | English and Hindi support across the UI |
| Responsive Design | CSS Modules for scoped, responsive component styling |
| Animated Landing Page | Marketing homepage with AI chip animation and feature showcases |
| Pricing Page | Individual and Team plans with monthly/yearly toggle |
| Settings Modal | In-app settings for customization |
| Profile Menu | Quick access to profile, language, theme, and logout |

### Security

| Feature | Description |
|---|---|
| HTTP-Only Cookies | Tokens stored in HTTP-only cookies (immune to XSS) |
| CORS Whitelisting | Origin-based request filtering |
| Rate Limiting | Auth: 10 req/min, OTP send: 5/min, OTP verify: 10/min |
| Bcrypt Hashing | Passwords hashed with bcrypt (cost 12) |
| JWT Expiration | Access token: 15 min, Refresh token: 10 days |
| Device Fingerprinting | Browser + OS detection from User-Agent headers |
| IP Geolocation | Session location tracking via ip-api.com |
| OTP Brute-Force Protection | Max 4 attempts per OTP, 5-minute expiry |

---

## Tech Stack

### Backend

| Technology | Purpose |
|---|---|
| Node.js + Express 5 | HTTP server and REST API framework |
| TypeScript | Type-safe server-side code |
| Prisma ORM 7.6 | Database modeling, migrations, and queries |
| PostgreSQL | Primary relational database |
| JSON Web Tokens (JWT) | Stateless authentication tokens |
| Bcrypt | Password hashing |
| Nodemailer | SMTP email delivery (OTP codes) |
| Multer | Multipart file upload handling |
| Google APIs | OAuth 2.0 and People API integration |
| node-cron | Scheduled OTP cleanup jobs |
| express-rate-limit | API rate limiting middleware |

### Frontend

| Technology | Purpose |
|---|---|
| React 19 | Component-based UI framework |
| Vite 8 | Fast build tool with HMR and API proxy |
| TypeScript | Type-safe client-side code |
| CSS Modules | Scoped, component-level styling |
| Web Speech API | Browser-native voice input |
| LocalStorage | Client-side state persistence |
| ESLint | Code quality and linting |

### External Services

| Service | Purpose |
|---|---|
| LangGraph (Python) | AI orchestration, solution routing, and RAG pipeline |
| Ollama Cloud | Default LLM provider (Kimi, Qwen, Mistral models) |
| OpenAI API | GPT model fallback |
| Anthropic API | Claude Sonnet model fallback |
| Gmail SMTP | OTP email delivery |
| Google OAuth | Social sign-in |
| ip-api.com | IP-to-location resolution |
| ipify.org | Public IP detection |

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                        FRONTEND                          │
│              React 19 + Vite + TypeScript                │
│                                                          │
│  ┌──────────┐ ┌──────────┐ ┌───────────┐ ┌───────────┐  │
│  │ Landing  │ │  Auth    │ │  Topics   │ │  ChatBot  │  │
│  │  Page    │ │  Pages   │ │  Picker   │ │ (Main UI) │  │
│  └──────────┘ └──────────┘ └───────────┘ └───────────┘  │
│                        │                                 │
│              Vite Proxy (dev) / API calls                │
└────────────────────────┼─────────────────────────────────┘
                         │ HTTP / SSE
┌────────────────────────┼─────────────────────────────────┐
│                     BACKEND                              │
│           Express 5 + TypeScript + Prisma                │
│                                                          │
│  ┌──────────┐ ┌──────────┐ ┌───────────┐ ┌───────────┐  │
│  │  Auth    │ │ Projects │ │  Conver-  │ │   OTP     │  │
│  │ Routes   │ │  Routes  │ │  sations  │ │  Service  │  │
│  └────┬─────┘ └────┬─────┘ └─────┬─────┘ └─────┬─────┘  │
│       │            │             │              │        │
│  ┌────┴────────────┴─────────────┴──────────────┴─────┐  │
│  │              Middleware Layer                       │  │
│  │    (JWT Auth, Rate Limiter, CORS, File Upload)     │  │
│  └────────────────────────┬───────────────────────────┘  │
│                           │                              │
│  ┌────────────────────────┴───────────────────────────┐  │
│  │              Prisma ORM + PostgreSQL               │  │
│  │         (with in-memory fallback storage)          │  │
│  └────────────────────────────────────────────────────┘  │
│                           │                              │
│  ┌────────────────────────┴───────────────────────────┐  │
│  │              AI Routing Layer (utils/ai.ts)        │  │
│  │  LangGraph → Ollama → OpenAI → Anthropic          │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
                         │ SSE Stream
┌────────────────────────┼─────────────────────────────────┐
│              LANGGRAPH SERVICE (Python)                   │
│         AI Orchestration + RAG + Domain Routing          │
└──────────────────────────────────────────────────────────┘
```

---

## Database Schema

### Entity Relationship Overview

```
User ──┬── Session (1:N)
       ├── PasswordReset (1:N)
       ├── UserWorkProfile (1:1)
       ├── Project (1:N) ──── Conversation (1:N)
       └── Conversation (1:N) ──── Message (1:N) ──── Attachment (1:N)
```

### Models

#### User
| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| email | String | Unique email address |
| firstName | String | User's first name |
| lastName | String (optional) | User's last name |
| passwordHash | String (optional) | Bcrypt-hashed password |
| avatar | String (optional) | Profile picture URL |
| isVerified | Boolean | Email verification status |
| lastLoginAt | DateTime (optional) | Last login timestamp |

#### Session
| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| userId | UUID | Foreign key to User |
| refreshTokenHash | String | Bcrypt hash of refresh token |
| expiresAt | DateTime | Session expiration |
| device | String (optional) | Browser and OS info |
| ipAddress | String (optional) | Login IP address |
| location | String (optional) | City, region, country |
| lastActiveAt | DateTime | Last activity timestamp |

#### PasswordReset
| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| userId | UUID | Foreign key to User |
| otpHash | String | Bcrypt hash of OTP code |
| expiresAt | DateTime | OTP expiration (5 minutes) |
| attempts | Int | Verification attempts (max 4) |
| used | Boolean | Whether OTP has been used |

#### Project
| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| userId | UUID | Foreign key to User |
| name | String | Project name |
| description | String (optional) | Project description |
| color | String (optional) | Display color |
| icon | String (optional) | Display icon |
| isArchived | Boolean | Archive status |

#### Conversation
| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| userId | UUID | Foreign key to User |
| projectId | UUID (optional) | Foreign key to Project (null = standalone) |
| title | String | Conversation title |

#### Message
| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| conversationId | UUID | Foreign key to Conversation |
| role | String | "user" or "assistant" |
| content | String | Message text content |

#### Attachment
| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| messageId | UUID | Foreign key to Message |
| fileName | String | Original file name |
| mimeType | String | File MIME type |
| fileSize | Int | File size in bytes |
| storagePath | String | Disk storage path |

#### UserWorkProfile
| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| userId | UUID | Foreign key to User (unique) |
| workCategory | String | Selected domain category |
| customInput | String (optional) | Custom category input |

---

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/check-email` | Check if email exists (determines login vs signup flow) |
| POST | `/verify-email` | Verify email with OTP code |
| GET | `/google` | Initiate Google OAuth 2.0 flow |
| GET | `/google/callback` | Handle Google OAuth callback |
| POST | `/refresh` | Refresh expired access token using refresh token |
| POST | `/logout` | Logout current session (clear cookies) |
| GET | `/sessions` | List all active sessions for current user |
| DELETE | `/sessions/:id` | Revoke a specific session by ID |
| POST | `/logout-all` | Invalidate all sessions across all devices |
| GET | `/me` | Get current authenticated user profile |

### User Auth (`/api/user`)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/check-email` | Check email availability for registration |
| POST | `/register` | Register new user with email, name, and password |
| POST | `/login` | Login with email and password |
| POST | `/forgot-password` | Send password reset OTP to email |
| POST | `/reset-password` | Reset password using OTP and new password |
| GET | `/work` | Get user's work profile (domain selection) |
| POST | `/work` | Save/update work profile |
| GET | `/me` | Get authenticated user info |

### OTP Service (`/api/otp`)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/send-otp` | Send OTP to one or more email addresses |
| POST | `/verify-otp` | Verify a 6-digit OTP code |

### Projects (`/api/projects`)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | List all user projects (searchable, sortable) |
| POST | `/` | Create a new project |
| GET | `/:id` | Get project details by ID |
| PUT | `/:id` | Update project (name, description, color, icon, archive) |
| DELETE | `/:id` | Delete a project and all its conversations |

### Conversations & Chat (`/api`)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/chats` | List all standalone conversations |
| POST | `/chats` | Create a new standalone chat with optional file upload |
| POST | `/chats/stream` | Create a new chat with SSE streaming response |
| GET | `/projects/:projectId/conversations` | List conversations in a project |
| POST | `/projects/:projectId/conversations` | Create a conversation within a project |
| GET | `/conversations/:id` | Get conversation with all messages and attachments |
| POST | `/conversations/:id/messages` | Send a message in a conversation |
| POST | `/conversations/:id/messages/stream` | Send a message with SSE streaming response |
| PUT | `/conversations/:id` | Rename a conversation |
| DELETE | `/conversations/:id` | Delete a conversation and all its messages |
| GET | `/health` | Server health check |

---

## Authentication System

### Authentication Flow Diagram

```
┌─────────────────────────────────────────────────┐
│                  NEW USER                        │
├─────────────┬──────────────────┬────────────────┤
│  Email+OTP  │  Email+Password  │  Google OAuth  │
│             │                  │                │
│ Enter Email │ Enter Email      │ Click Google   │
│     ↓       │ Enter Name       │     ↓          │
│ Receive OTP │ Enter Password   │ Google Consent │
│     ↓       │     ↓            │     ↓          │
│ Verify OTP  │ POST /register   │ Callback URL   │
│     ↓       │     ↓            │     ↓          │
│ Set Name +  │ Account Created  │ Auto-Create    │
│ Password    │                  │ Account        │
└──────┬──────┴────────┬─────────┴───────┬────────┘
       │               │                 │
       └───────────────┴─────────────────┘
                       ↓
              ┌────────────────┐
              │  JWT Tokens    │
              │ Access: 15 min │
              │ Refresh: 10 d  │
              └───────┬────────┘
                      ↓
              ┌────────────────┐
              │  HTTP-Only     │
              │  Cookies Set   │
              └───────┬────────┘
                      ↓
              ┌────────────────┐
              │  Session       │
              │  Created in DB │
              │  (device, IP,  │
              │   location)    │
              └────────────────┘
```

### Token Strategy

- **Access Token:** Short-lived (15 minutes), stored in HTTP-only cookie `access_token`. Carries the user's ID as payload.
- **Refresh Token:** Long-lived (10 days), stored in HTTP-only cookie `refresh_token`. Its bcrypt hash is stored in the database Session table for validation.
- **Cookie Flags:** In production — `Secure: true`, `SameSite: strict`. In development — `SameSite: lax`.

### Password Reset Flow

1. User submits email to `/api/user/forgot-password`.
2. Server generates 6-digit OTP, bcrypt-hashes it, and stores in `PasswordReset` table.
3. OTP sent to user's email via SMTP.
4. User submits OTP + new password to `/api/user/reset-password`.
5. Server verifies OTP (max 4 attempts, 5-minute window).
6. Password updated, all existing sessions invalidated, new session created.

---

## AI & LLM Integration

### Model Selection

Users can select from the following AI models:

| Model | Provider | Description |
|---|---|---|
| Kimi-k2.5 | Ollama Cloud | Default model |
| Qwen3 Coder | Ollama Cloud | Code-focused model |
| GPT | OpenAI | OpenAI's GPT model |
| Claude Sonnet 4.6 | Anthropic | Anthropic's Claude model |
| Mistral Large 3 | Ollama Cloud | Mistral's large model |

### Solution Domains

Users can route their queries through domain-specific solution pipelines:

| Solution | Description |
|---|---|
| Brew Generic | General-purpose AI assistant |
| ESG | Environmental, Social, and Governance analysis |
| Election | Election data analytics and insights |
| DataCaffe | Data analysis and processing |

### AI Routing & Fallback Chain

```
User Message
     ↓
┌─────────────────────┐
│  LangGraph Service  │ ← Primary (Python, RAG, domain routing)
│  POST /api/v1/chat  │
│      /stream        │
└────────┬────────────┘
         │ If unavailable
         ↓
┌─────────────────────┐
│  Direct API Calls   │ ← Fallback
│  Ollama / OpenAI /  │
│  Anthropic          │
└─────────────────────┘
```

1. **Primary Path:** All requests first go to the LangGraph Python service, which handles intelligent routing, RAG retrieval, and domain-specific system prompts.
2. **Fallback Path:** If the LangGraph service is unavailable, the backend routes directly to the appropriate LLM provider API based on the selected model.

### Streaming Response

Responses are streamed in real-time using **Server-Sent Events (SSE)**:
- The backend opens an SSE connection to the LLM service.
- Tokens are forwarded to the frontend as they arrive.
- The frontend renders tokens incrementally in the chat UI.
- On completion, the full response is saved to the database.

---

## How to Use

### Prerequisites

- **Node.js** (v18 or higher)
- **PostgreSQL** database
- **Python** (for LangGraph service, optional)
- **Gmail account** with App Password (for SMTP)
- **Google Cloud Console** project (for OAuth)

### Setup Steps

#### 1. Clone and Install Dependencies

```bash
# Backend
cd Backend
npm install

# Frontend
cd ../Frontend
npm install
```

#### 2. Configure Environment Variables

**Backend** — Create/edit `Backend/.env`:
```env
PORT=3001
FRONTEND_URL=http://localhost:5173
DATABASE_URL=postgresql://postgres:password@localhost:5432/AI_Caffe

JWT_ACCESS_SECRET=<64+ character random string>
JWT_REFRESH_SECRET=<64+ character random string>

GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<your-email@gmail.com>
SMTP_PASS=<your-gmail-app-password>
SMTP_FROM_NAME=AI Caffe
SMTP_FROM_EMAIL=<your-email@gmail.com>

OLLAMA_API_KEY=<your-ollama-api-key>
OLLAMA_BASE_URL=https://ollama.com/v1
```

**Frontend** — Create/edit `Frontend/.env`:
```env
VITE_FIREBASE_API_KEY=<your-firebase-api-key>
VITE_FIREBASE_AUTH_DOMAIN=<your-project>.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=<your-project-id>
VITE_FIREBASE_STORAGE_BUCKET=<your-project>.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=<your-sender-id>
VITE_FIREBASE_APP_ID=<your-app-id>
```

#### 3. Set Up the Database

```bash
cd Backend
npx prisma migrate dev --name init
npx prisma generate
```

#### 4. Start the Application

```bash
# Terminal 1 - Backend
cd Backend
npx tsx index.ts

# Terminal 2 - Frontend
cd Frontend
npm run dev
```

#### 5. Access the Application

Open your browser and navigate to `http://localhost:5173`.

### Using the Chat Interface

1. **Sign up** using email or Google account.
2. **Select your domains** of interest (up to 3).
3. **Create a project** or start a standalone chat.
4. **Choose an AI model** from the dropdown (e.g., Kimi-k2.5).
5. **Choose a solution domain** if needed (e.g., ESG).
6. **Type your message** or use the microphone for voice input.
7. **Attach files** by clicking the attachment button (PDF, DOCX, CSV, etc.).
8. **Send** and watch the AI response stream in real-time.

---

## Key Benefits

### For Users

- **Unified AI Platform** — Access multiple AI models and domain-specific solutions from a single interface instead of switching between tools.
- **Domain Intelligence** — Get specialized responses for ESG, Election, Workforce, and Insurance queries powered by tailored AI pipelines and RAG.
- **Project Organization** — Keep conversations organized under named projects for better workflow management.
- **File-Aware AI** — Upload documents and get AI responses that understand the content of your files.
- **Real-Time Responses** — See AI responses stream token-by-token for a natural, responsive experience.
- **Voice Input** — Speak your queries using built-in speech-to-text.
- **Multi-Language** — Use the platform in English or Hindi.
- **Cross-Device Sessions** — Login from multiple devices with full session visibility and control.

### For Developers

- **Type Safety** — Full TypeScript across frontend and backend reduces bugs and improves developer experience.
- **Modern Stack** — React 19, Vite 8, Express 5, and Prisma 7 ensure access to the latest features and performance improvements.
- **Modular Architecture** — Clean separation between auth, projects, conversations, and AI routing makes the codebase maintainable and extensible.
- **Fallback Resilience** — The AI routing layer gracefully falls back between LangGraph, Ollama, OpenAI, and Anthropic providers.
- **Database Resilience** — In-memory fallback storage ensures the app remains functional even when PostgreSQL is temporarily unavailable.
- **Security First** — HTTP-only cookies, bcrypt hashing, rate limiting, CORS, and session management are built in from the ground up.

### For Organizations

- **Multi-Domain Coverage** — A single platform serving ESG, Elections, Workforce, Data Analytics, and Insurance use cases.
- **Scalable Architecture** — Prisma ORM with PostgreSQL provides a solid foundation for scaling to enterprise workloads.
- **Compliance Ready** — Session tracking with device, IP, and location logging supports audit and compliance requirements.
- **Customizable** — Easily add new AI models, solution domains, or languages as business needs evolve.
- **Cost Efficient** — Model fallback chain allows routing to the most cost-effective LLM provider per use case.

---

*AICaffe — Intelligent Conversations, Domain Expertise, One Platform.*
