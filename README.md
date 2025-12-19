# SkillPath AI Backend

A NestJS backend for an AI-driven adaptive learning platform that generates personalized learning paths based on assessment results and dynamically adapts them based on user progress.

## Tech Stack

- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based with Passport
- **AI Integration**: Ollama (free, open-source, runs locally - abstracted for easy provider swapping)
- **Validation**: class-validator, DTO-based

## Architecture

The backend follows clean architecture principles with clear separation of concerns:

- **Controllers Layer**: Handle HTTP requests and responses
- **Services Layer**: Business logic and AI orchestration
- **Data Access Layer**: Prisma repository pattern
- **Database**: PostgreSQL

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- Ollama (free, open-source AI - see setup instructions below)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory. You can copy from the example file:

```bash
# Copy the example environment file
cp .env.example .env
```

Or create `.env` manually with the following content:

```env
# Database Configuration
# Replace with your PostgreSQL connection details
DATABASE_URL="postgresql://user:password@localhost:5432/skillpath_ai?schema=public"

# JWT Configuration
# Generate a strong secret key for production (e.g., using: openssl rand -base64 32)
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"

# Ollama Configuration
# Ollama runs locally by default on port 11434
# These are optional - defaults will work if Ollama is running locally
OLLAMA_BASE_URL="http://localhost:11434"
OLLAMA_MODEL="llama3.2:3b"

# Server Configuration
PORT=3000
```

**Important:**

- Replace `user` and `password` in `DATABASE_URL` with your PostgreSQL credentials
- Generate a strong `JWT_SECRET` for production (you can use: `openssl rand -base64 32`)
- Ollama configuration is optional - defaults work if Ollama is running locally

### 3. Set Up Ollama (Free AI Provider)

Ollama is a free, open-source AI that runs locally. Install it:

#### macOS Installation

**Option 1: Official Installer (Recommended)**

```bash
# Install Ollama using the official installer
curl -fsSL https://ollama.com/install.sh | sh
```

**Option 2: Homebrew**

```bash
# If you have Homebrew installed
brew install ollama
```

#### Start Ollama Service

```bash
# Start Ollama service (runs in background)
ollama serve

# Keep this terminal open, or run it in the background:
ollama serve &
```

#### Download AI Model

Open a **new terminal window** and run:

```bash
# Pull a lightweight model (recommended for development)
# This model is ~2GB and works well for most use cases
ollama pull llama3.2:3b

# Verify the model was downloaded
ollama list
```

**Alternative Models (if you have more RAM):**

```bash
# More capable model (~4GB RAM required)
ollama pull llama3.2

# Or try Mistral (alternative model)
ollama pull mistral

# Or try Phi-3 (Microsoft's lightweight model)
ollama pull phi3
```

#### Verify Ollama is Running

```bash
# Check if Ollama is responding
curl http://localhost:11434/api/tags

# You should see a JSON response with available models
# Example output:
# {"models":[{"name":"llama3.2:3b","modified_at":"2024-01-01T00:00:00Z"}]}
```

#### Troubleshooting on macOS

```bash
# Check if Ollama process is running
ps aux | grep ollama

# Check if port 11434 is in use
lsof -i :11434

# Restart Ollama if needed
pkill ollama
ollama serve

# Test Ollama with a simple prompt
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2:3b",
  "prompt": "Hello, how are you?",
  "stream": false
}'
```

**Note:** The default model `llama3.2:3b` is lightweight (~2GB) and works well for most use cases. For production or better quality, consider using `llama3.2` or `mistral`.

#### Windows Installation

Download the installer from [ollama.com](https://ollama.com/download) and follow the installation wizard.

### 4. Set Up Database

```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# (Optional) Seed initial data
# You can create a seed script in prisma/seed.ts
```

### 5. Run the Application

```bash
# Development mode (with hot reload)
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

## API Endpoints

### Authentication

#### POST `/auth/register`

Register a new user.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "learningRole": "Frontend Developer" // optional
}
```

**Response:**

```json
{
  "access_token": "jwt-token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "USER",
    "learningRole": "Frontend Developer"
  }
}
```

#### POST `/auth/login`

Login and receive JWT token.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "access_token": "jwt-token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "USER",
    "learningRole": "Frontend Developer"
  }
}
```

### Users

#### GET `/users/profile`

Get current user profile. Requires authentication.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

#### PATCH `/users/profile`

Update user profile. Requires authentication.

**Request Body:**

```json
{
  "learningRole": "Backend Developer" // optional
}
```

### Assessment

#### POST `/assessment/start`

Start a new assessment (role-based or skill-based). Requires authentication.

**Request Body:**

```json
{
  "type": "ROLE_BASED", // or "SKILL_BASED"
  "skillId": "uuid" // required if type is SKILL_BASED
}
```

**Response:**

```json
{
  "id": "assessment-uuid",
  "type": "ROLE_BASED",
  "status": "IN_PROGRESS",
  "questions": [
    {
      "id": "question-uuid",
      "question": "What is React?",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "order": 1
    }
  ]
}
```

#### POST `/assessment/submit`

Submit assessment answers. Requires authentication.

**Request Body:**

```json
{
  "assessmentId": "assessment-uuid",
  "answers": [
    {
      "questionId": "question-uuid",
      "selectedAnswer": 0 // index of selected option
    }
  ]
}
```

**Response:**

```json
{
  "assessmentId": "assessment-uuid",
  "score": 80.0,
  "correctCount": 4,
  "totalQuestions": 5,
  "answers": [
    {
      "questionId": "question-uuid",
      "question": "What is React?",
      "selectedAnswer": 0,
      "correctAnswer": 0,
      "isCorrect": true,
      "explanation": "React is a JavaScript library..."
    }
  ]
}
```

### Learning Path

#### GET `/learning-path`

Get current user's learning path. Requires authentication.

**Response:**

```json
{
  "id": "path-uuid",
  "userId": "user-uuid",
  "status": "ACTIVE",
  "nodes": [
    {
      "id": "node-uuid",
      "skillId": "skill-uuid",
      "skillName": "JavaScript Basics",
      "order": 1,
      "nodeType": "SKILL",
      "status": "PENDING",
      "insertedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

#### POST `/learning-path/adapt`

Trigger learning path adaptation based on progress. Requires authentication.

**Request Body:**

```json
{
  "triggerReason": "Manual trigger" // optional
}
```

### Progress

#### POST `/progress/update`

Update progress for a skill. Requires authentication.

**Request Body:**

```json
{
  "skillId": "skill-uuid",
  "score": 85.5,
  "assessmentId": "assessment-uuid" // optional
}
```

#### GET `/progress/summary`

Get progress summary for current user. Requires authentication.

**Response:**

```json
{
  "totalSkills": 10,
  "completed": 3,
  "inProgress": 5,
  "needsRevision": 2,
  "averageScore": 72.5,
  "progress": [...]
}
```

### AI

#### POST `/ai/explain`

Get explanation for a wrong answer. Requires authentication.

**Request Body:**

```json
{
  "questionId": "question-uuid",
  "userAnswer": "Selected option text",
  "correctAnswer": "Correct option text"
}
```

**Response:**

```json
{
  "explanation": "The correct answer is..."
}
```

## Adaptive Learning Path Logic

The learning path adapts based on the following rules:

1. **Score >= 80%**: Mark skill as completed
2. **Score 50-79%**: Allow progression but flag for revision if multiple attempts
3. **Score < 50%**: Insert revision node before next skill
4. **Repeated failures (3+ attempts with score < 50%)**: Insert micro-practice node

AI suggestions support these decisions but don't override the rule-based logic.

## Project Structure

```
src/
├── auth/              # Authentication module
├── users/             # User management
├── assessment/        # Assessment generation and evaluation
├── learning-path/     # Learning path generation and adaptation
├── progress/          # Progress tracking
├── ai/                # AI service abstraction
├── common/            # Shared guards, decorators, pipes
├── config/            # Configuration files
└── prisma/            # Prisma service and module
```

## Database Schema

Key models:

- **User**: User accounts and profiles
- **Skill**: Skills available for learning
- **LearningPath**: User's learning path
- **LearningPathNode**: Individual nodes in the path (skills, revisions, micro-practice)
- **Assessment**: Assessment records
- **AssessmentQuestion**: Questions in assessments
- **AssessmentAnswer**: User answers
- **Progress**: User progress per skill

## Development

### Running Migrations

```bash
# Create a new migration
npx prisma migrate dev --name migration-name

# Apply migrations in production
npx prisma migrate deploy
```

### Prisma Studio

View and edit your database data:

```bash
npx prisma studio
```

### Linting

```bash
npm run lint
```

### Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Environment Variables

| Variable          | Description                                           | Required           |
| ----------------- | ----------------------------------------------------- | ------------------ |
| `DATABASE_URL`    | PostgreSQL connection string                          | Yes                |
| `JWT_SECRET`      | Secret key for JWT signing                            | Yes                |
| `JWT_EXPIRES_IN`  | JWT token expiration (e.g., "7d")                     | No (default: "7d") |
| `OLLAMA_BASE_URL` | Ollama API base URL (default: http://localhost:11434) | No                 |
| `OLLAMA_MODEL`    | Ollama model to use (default: llama3.2:3b)            | No                 |
| `PORT`            | Server port                                           | No (default: 3000) |

## Future Enhancements

- [ ] Unit and integration tests
- [ ] Rate limiting
- [ ] Caching layer (Redis) for AI responses
- [ ] WebSocket for real-time progress updates
- [ ] Analytics endpoints
- [ ] Skill prerequisite graph validation
- [ ] Learning path templates
- [ ] Admin dashboard endpoints
- [ ] Comprehensive logging and monitoring

## License

MIT
