# CodeShield AI - Complete Project Documentation

---

## Project Overview

**CodeShield AI** is an AI-powered Code Reviewer & Security Auditor that analyzes code for bugs, vulnerabilities, and best practices. It provides intelligent suggestions to improve code quality and security. The product works as a **Web App** and a **GitHub Bot**, with a VS Code Extension planned for the future.

### Live URLs

| Resource | URL |
|----------|-----|
| Frontend (Vercel) | https://revidex.vercel.app |
| Backend (Render) | https://codeshield-ai-v8wm.onrender.com |
| GitHub Repository | https://github.com/Rutik2401/codeshield-ai |

### Vision Statement
> "CodeShield AI empowers every developer to write secure, high-quality code
> by providing instant AI-powered reviews across Web, GitHub, and VS Code --
> making professional code auditing accessible to everyone, for free."

### Architecture Principles
- **Scalable**: Layered architecture -- easy to add new features without breaking existing ones
- **Human-Readable**: Every file, function, and variable is named clearly
- **Secure**: API keys never exposed to frontend -- all AI calls go through backend proxy
- **Multi-Provider**: Gemini primary with Groq and Cerebras as automatic fallbacks
- **Consistent**: Same coding patterns used everywhere

### Brand Colors
```
Primary:    #2563EB  (Blue -- trust, security)
Accent:     #10B981  (Green -- safe, clean code)
Critical:   #EF4444  (Red -- critical issues)
High:       #F97316  (Orange -- high severity)
Medium:     #EAB308  (Yellow -- medium severity)
Low:        #3B82F6  (Blue -- low severity)
Dark BG:    #0F172A  (Slate -- modern dark theme)
Light BG:   #F8FAFC  (Light gray -- clean light theme)
```

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Phase 1: Web Application (COMPLETE)](#phase-1-web-application-complete)
3. [Phase 2: GitHub Integration (COMPLETE)](#phase-2-github-integration-complete)
4. [Phase 3: VS Code Extension (PLANNED)](#phase-3-vs-code-extension-planned)
5. [Backend API Endpoints](#backend-api-endpoints)
6. [Database Schema](#database-schema)
7. [Environment Variables](#environment-variables)
8. [Deployment](#deployment)

---

## Tech Stack

| Layer | Technology | Why This Choice |
|-------|-----------|-----------------|
| Frontend | Angular 19.2 (Standalone Components) + Tailwind CSS 4.2 | Modern Angular with standalone components, fast styling |
| Code Editor | Monaco Editor (ngx-monaco-editor-v2) | Same editor as VS Code -- syntax highlighting for 50+ languages |
| Charts | Chart.js + ng2-charts | Dashboard statistics visualization |
| Animations | GSAP | Smooth page transitions and UI animations |
| Toasts | ngx-sonner | Toast notifications for success/error feedback |
| Backend | Spring Boot 4.0.5 + Java 22 | Enterprise-grade, built-in security and OAuth |
| Database | PostgreSQL (Render) | Relational storage for users, reviews, repos, notifications |
| Local Dev DB | H2 (in-memory) | Fast local development without PostgreSQL setup |
| ORM | Spring Data JPA + Hibernate | Industry standard, auto-generates queries |
| DB Migrations | Flyway | Safe database versioning (5 migrations: V1-V5) |
| AI (Primary) | Google Gemini API (gemini-2.5-flash, gemini-2.5-flash-lite, gemini-flash-latest) | Free, powerful, great for code analysis |
| AI (Fallback 1) | Groq API (llama-3.3-70b-versatile) | Fast inference fallback |
| AI (Fallback 2) | Cerebras API (llama3.3-70b) | Additional fallback provider |
| Auth | Spring Security + JWT (jjwt) + bcrypt | Local signup/signin + Google OAuth + GitHub OAuth |
| HTTP Client | WebClient (Spring WebFlux) | Non-blocking API calls to Gemini, Groq, Cerebras, GitHub |
| PDF Export | OpenPDF | Server-side PDF generation for review reports |
| Caching | Caffeine Cache | In-memory caching for performance |
| Code Utils | Lombok | Reduces Java boilerplate |
| Frontend Hosting | Vercel | Free, auto-deploy from GitHub |
| Backend Hosting | Render | Free tier, auto-deploy from GitHub |

---

## Phase 1: Web Application (COMPLETE)

### Overview
A web application where users paste code (or select a language) and get instant AI-powered code reviews with security analysis. The backend proxies all AI calls so API keys are never exposed in the browser.

### Architecture Flow
```
User's Browser (Angular 19)
    |
    | 1. User pastes code + selects language
    | 2. Clicks "Review Code" button
    |
    v
Spring Boot Backend (REST API)          <-- Keeps API keys safe on server
    |
    | 3. Backend builds prompt + calls AI provider
    | 4. Tries Gemini first, falls back to Groq, then Cerebras
    |
    v
AI Provider (Gemini / Groq / Cerebras)
    |
    | 5. AI analyzes code for bugs, security, best practices
    | 6. Returns JSON review
    |
    v
Spring Boot Backend
    |
    | 7. Parses & validates response
    | 8. Saves review to PostgreSQL
    | 9. Returns ReviewResponse to Angular
    |
    v
Angular Frontend
    |
    | 10. Displays results: issues, severity, fixes, score
    | 11. User can export as PDF or Markdown
    v
Done!
```

### Features (All Implemented)
- [x] Monaco Code Editor (same as VS Code) -- syntax highlighting for 50+ languages
- [x] Multi-language support (JavaScript, Python, Java, C++, Go, Rust, etc.)
- [x] AI-powered code review (bugs, logic errors, code smells, best practices)
- [x] Multi-AI provider: Gemini (primary), Groq and Cerebras (automatic fallbacks)
- [x] Security vulnerability detection (OWASP Top 10 -- XSS, SQL Injection, etc.)
- [x] Severity scoring with color-coded badges (Critical=Red / High=Orange / Medium=Yellow / Low=Blue)
- [x] Overall code quality score (0-100) with circular progress indicator
- [x] AI-generated fix suggestions with "Apply Fix" button
- [x] PDF export (backend-generated with OpenPDF)
- [x] Markdown export
- [x] Review history stored in PostgreSQL (migrated from localStorage)
- [x] Dashboard with stats cards, charts (Chart.js), search and filter
- [x] User authentication: Local signup/signin + Google OAuth + GitHub OAuth
- [x] JWT tokens (24h access, 7d refresh) with bcrypt password hashing
- [x] Loading skeleton animations while AI is analyzing
- [x] GSAP animations for smooth UI transitions
- [x] Toast notifications (ngx-sonner) for success/error feedback
- [x] Responsive design (mobile-friendly)
- [x] Deployed: Frontend on Vercel, Backend on Render

### Angular Frontend Structure
```
codeshield-ai/frontend/
├── src/
│   ├── app/
│   │   ├── core/                                        # Singleton services, guards, interceptors
│   │   │   ├── interceptors/
│   │   │   │   ├── api.interceptor.ts                   # Adds base URL + JWT token to API calls
│   │   │   │   └── error.interceptor.ts                 # Catches HTTP errors, shows toast notifications
│   │   │   ├── guards/
│   │   │   │   └── auth.guard.ts                        # Protects routes that require authentication
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts                      # Login, signup, logout, JWT storage, OAuth flows
│   │   │   │   ├── review.service.ts                    # Submit code for review, fetch review history
│   │   │   │   ├── export.service.ts                    # PDF and Markdown export
│   │   │   │   ├── repository.service.ts                # GitHub repo connection CRUD
│   │   │   │   ├── notification.service.ts              # Notification polling, mark read, delete
│   │   │   │   └── theme.service.ts                     # Dark mode styling
│   │   │   └── constants/
│   │   │       ├── api.constants.ts                     # API endpoint URLs
│   │   │       └── language.constants.ts                # Supported languages list with Monaco IDs
│   │   │
│   │   ├── shared/                                      # Reusable components and pipes
│   │   │   ├── components/
│   │   │   │   ├── skeleton-loader/                     # Placeholder shimmer while content loads
│   │   │   │   ├── severity-badge/                      # Color-coded severity badge
│   │   │   │   ├── score-circle/                        # Circular progress indicator (0-100)
│   │   │   │   └── empty-state/                         # "No results yet" placeholder
│   │   │   └── pipes/
│   │   │       ├── time-ago.pipe.ts                     # "2 hours ago" formatting
│   │   │       └── truncate.pipe.ts                     # Truncate long text
│   │   │
│   │   ├── features/                                    # Feature modules (each page)
│   │   │   ├── landing/                                 # Landing page with hero, features, how-it-works
│   │   │   ├── reviewer/                                # Main review page: Monaco editor + results panel
│   │   │   ├── dashboard/                               # Review history with stats cards and charts
│   │   │   ├── repositories/                            # GitHub repo management (Phase 2)
│   │   │   ├── pr-reviews/                              # PR review dashboard (Phase 2)
│   │   │   ├── oauth-callback/                          # OAuth redirect handler
│   │   │   ├── settings/                                # User settings
│   │   │   ├── pricing/                                 # Pricing page
│   │   │   └── learn/                                   # Educational content
│   │   │
│   │   ├── layout/                                      # Layout components (every page)
│   │   │   ├── navbar/                                  # Top nav: logo, links, auth buttons, notification bell
│   │   │   └── footer/                                  # Footer: copyright, GitHub link
│   │   │
│   │   ├── models/                                      # TypeScript interfaces
│   │   │   ├── review.model.ts                          # ReviewResponse, Issue, SecurityAudit, Metrics
│   │   │   └── history-item.model.ts                    # Review history item
│   │   │
│   │   ├── app.component.ts                             # Root component (navbar + router-outlet + footer)
│   │   ├── app.config.ts                                # provideHttpClient, provideRouter, provideAnimations
│   │   └── app.routes.ts                                # Routes: /, /reviewer, /dashboard, /repositories, etc.
│   │
│   ├── environments/
│   │   ├── environment.ts                               # dev: { apiUrl: 'http://localhost:8081/api/v1' }
│   │   └── environment.prod.ts                          # prod: { apiUrl: 'https://codeshield-ai-v8wm.onrender.com/api/v1' }
│   ├── styles.css                                       # Tailwind CSS 4.2 imports
│   └── main.ts                                          # bootstrapApplication(AppComponent, appConfig)
├── angular.json
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

### Spring Boot Backend Structure
```
codeshield-ai/backend/
├── src/main/java/com/codeshield/
│   ├── CodeShieldAiApiApplication.java          # @SpringBootApplication -- main entry point
│   │
│   ├── config/
│   │   ├── SecurityConfig.java                  # Spring Security: JWT filter, public/protected routes, OAuth
│   │   ├── CorsConfig.java                      # CORS: allow Angular frontend origins
│   │   ├── WebClientConfig.java                 # WebClient beans for Gemini, Groq, Cerebras, GitHub APIs
│   │   ├── CacheConfig.java                     # Caffeine cache configuration
│   │   └── RateLimitInterceptor.java            # Rate limiting for API calls
│   │
│   ├── controller/
│   │   ├── AuthController.java                  # POST /signup, /signin, /refresh
│   │   ├── OAuth2Controller.java                # Google OAuth + GitHub OAuth endpoints
│   │   ├── ReviewController.java                # POST /review, GET /reviews, GET /reviews/{id}, DELETE, PDF export
│   │   ├── RepositoryController.java            # GitHub repo CRUD, PR reviews, manual review trigger
│   │   ├── WebhookController.java               # POST /webhooks/github -- receive PR events
│   │   └── NotificationController.java          # Notification CRUD, mark read, clear all
│   │
│   ├── service/
│   │   ├── GeminiService.java                   # Gemini API calls with fallback to Groq/Cerebras
│   │   ├── PromptService.java                   # Builds AI prompts for code review
│   │   ├── CodeChunkService.java                # Splits large code into reviewable chunks
│   │   ├── ReviewPersistenceService.java        # Save/load reviews from PostgreSQL
│   │   ├── PdfExportService.java                # Generate PDF reports using OpenPDF
│   │   ├── AuthService.java                     # User registration, login, JWT token management
│   │   ├── GitHubService.java                   # GitHub API: fetch repos, PR files, post review comments
│   │   ├── WebhookService.java                  # Webhook signature verification, PR event processing
│   │   ├── PrReviewPipelineService.java         # Orchestrates: fetch PR files -> AI review -> post to GitHub
│   │   └── NotificationService.java             # Create, list, mark read, delete notifications
│   │
│   ├── entity/
│   │   ├── User.java                            # UUID id, email, name, password_hash, provider, avatar
│   │   ├── Review.java                          # UUID id, user_id, code, language, score, issues_json, metrics
│   │   ├── ConnectedRepository.java             # UUID id, user_id, github_repo_id, name, owner, webhook_id
│   │   ├── PrReview.java                        # UUID id, repository_id, pr_number, status, score, review_result
│   │   └── Notification.java                    # UUID id, user_id, type, title, message, link, is_read
│   │
│   ├── repository/
│   │   ├── UserRepository.java                  # findByEmail(), findByProviderAndProviderId()
│   │   ├── ReviewRepository.java                # findByUserIdOrderByCreatedAtDesc()
│   │   ├── ConnectedRepositoryRepository.java   # findByUserId(), findByGithubRepoId()
│   │   ├── PrReviewRepository.java              # findByRepositoryId(), findByPrNumber()
│   │   └── NotificationRepository.java          # findByUserIdOrderByCreatedAtDesc(), countByUserIdAndIsReadFalse()
│   │
│   ├── dto/
│   │   ├── ReviewRequest.java                   # { code, language }
│   │   ├── ReviewResponse.java                  # { summary, score, issues[], securityAudit, metrics }
│   │   ├── ReviewHistoryItem.java               # Review list item for dashboard
│   │   ├── SignUpRequest.java                   # { name, email, password }
│   │   ├── SignInRequest.java                   # { email, password }
│   │   ├── AuthResponse.java                    # { accessToken, refreshToken, user }
│   │   ├── ExportRequest.java                   # PDF export request data
│   │   ├── ConnectRepoRequest.java              # { githubRepoId, name, fullName, owner, ... }
│   │   ├── ConnectedRepoResponse.java           # Connected repo with settings
│   │   └── PrReviewResponse.java                # PR review summary
│   │
│   ├── security/
│   │   ├── JwtService.java                      # Generate/validate JWT tokens (24h access, 7d refresh)
│   │   └── JwtAuthFilter.java                   # Filter: reads JWT from Authorization header
│   │
│   └── exception/
│       └── GlobalExceptionHandler.java          # @ControllerAdvice: catches all errors -> clean JSON
│
├── src/main/resources/
│   ├── application.properties                   # Main config (datasource, JPA, AI keys, OAuth, CORS)
│   └── db/migration/                            # Flyway migrations (V1-V5)
│       ├── V1__create_users_table.sql
│       ├── V2__create_reviews_table.sql
│       ├── V3__create_connected_repositories_table.sql
│       ├── V4__create_pr_reviews_table.sql
│       └── V5__create_notifications_table.sql
│
├── pom.xml
└── Dockerfile
```

### AI Prompt Design
```
System Prompt for Gemini / Groq / Cerebras:
"You are CodeShield AI, an expert code reviewer and security auditor.
Analyze the following {language} code and return ONLY valid JSON with this structure:

{
  "summary": "Brief 1-2 sentence overview of what this code does",
  "score": 72,
  "issues": [
    {
      "id": "ISS-001",
      "type": "security",           // "bug" | "security" | "performance" | "style" | "best-practice"
      "severity": "critical",       // "critical" | "high" | "medium" | "low"
      "line": 15,
      "title": "SQL Injection Risk",
      "description": "User input is directly concatenated into SQL query...",
      "suggestion": "Use parameterized queries instead of string concatenation.",
      "fixedCode": "db.query('SELECT * FROM users WHERE id = ?', [userId])"
    }
  ],
  "securityAudit": {
    "vulnerabilities": [
      {
        "owasp": "A03:2021 Injection",
        "description": "SQL injection via unsanitized user input",
        "severity": "critical",
        "remediation": "Use parameterized queries"
      }
    ],
    "riskLevel": "high",
    "recommendations": [...]
  },
  "metrics": {
    "totalIssues": 5,
    "critical": 1,
    "high": 2,
    "medium": 1,
    "low": 1
  }
}

Rules:
- Return ONLY valid JSON. No markdown. No text before or after.
- If no issues, return empty issues array and score 95-100.
- Always check for OWASP Top 10 vulnerabilities.
- Be specific about line numbers.
- Provide working fixedCode that can directly replace the buggy code."
```

---

## Phase 2: GitHub Integration (COMPLETE)

### Overview
CodeShield AI functions as a GitHub Bot that automatically reviews Pull Requests. When a developer opens a PR, it analyzes the code changes and posts professional review comments directly on the PR with inline comments on specific diff lines.

### Features (All Implemented)
- [x] GitHub OAuth login ("Continue with GitHub" button)
- [x] Connect/disconnect GitHub repositories
- [x] Webhook listener (POST /api/v1/webhooks/github) with HMAC-SHA256 signature verification
- [x] Automated PR review pipeline: fetch PR files, AI analyze each file, post review to GitHub
- [x] Professional review format posted on GitHub PRs:
  - Shield icon header with overall assessment verdict
  - Issue summary table with severity counts
  - Collapsible file-wise review sections
  - Each issue: severity icon, line number, type, impact, suggestion, code fix
  - Final decision with verdict and reason
- [x] Inline comments on PR diff lines (using diff position mapping)
- [x] Fallback: retry without inline comments on 422 errors from GitHub API
- [x] Repository management page (connect, disconnect, auto-review toggle, manual PR review trigger)
- [x] PR Reviews dashboard with stats
- [x] Notification system:
  - Bell icon in navbar with unread count badge
  - Notification dropdown panel (list, mark read, delete, clear all)
  - Toast popup (bottom-right) for new notifications
  - Smart polling: 30s interval, pause when tab hidden, skip when logged out
  - Notifications created on review complete/fail
- [x] Rate limiting: 4s delay between file reviews for Gemini free tier
- [x] All reviews stored in PostgreSQL

### Webhook Flow (How Auto-Review Works)
```
Developer opens PR on GitHub
        |
        v
GitHub sends webhook POST to Spring Boot backend
  (POST /api/v1/webhooks/github with X-Hub-Signature-256 header)
        |
        v
WebhookController receives event
  1. Verifies webhook signature (HMAC-SHA256) -- prevents fake requests
  2. Checks event type = "pull_request"
  3. Checks action = "opened" or "synchronize" (new PR or new commits pushed)
        |
        v
WebhookService processes the PR event
  1. Finds the connected repository in database
  2. Checks if auto-review is enabled
        |
        v
GitHubService fetches PR details
  1. GET /repos/{owner}/{repo}/pulls/{number}/files -- list changed files
  2. For each file: fetch raw content and diff
        |
        v
PrReviewPipelineService orchestrates the review
  1. For each changed file (with 4s delay between files for rate limiting):
     - Builds prompt with file content + language
     - Calls Gemini API (falls back to Groq, then Cerebras)
     - Parses JSON response
  2. Aggregates all file reviews into overall assessment
        |
        v
GitHubService posts review on GitHub PR
  1. Creates a PR review via GitHub API
  2. Posts inline comments on specific diff lines (with position mapping)
  3. Falls back to body-only review on 422 errors
  4. Professional format: shield header, severity table, collapsible sections
        |
        v
NotificationService creates notification
  1. Notifies user that review is complete (or failed)
  2. User sees bell icon badge + toast popup
        |
        v
PrReview saved to database with score, issues, status
        |
        v
Developer sees AI review comments on their PR!
```

### GitHub PR Review Format (Posted on PRs)
```markdown
## Shield CodeShield AI - Code Review

### Overall Assessment: NEEDS IMPROVEMENT

| Severity | Count |
|----------|-------|
| Critical | 1     |
| High     | 2     |
| Medium   | 3     |
| Low      | 1     |

<details>
<summary>src/main/java/UserService.java (3 issues)</summary>

**CRITICAL** | Line 45 | Security
SQL Injection via unsanitized user input
**Impact**: Attackers can execute arbitrary SQL commands
**Suggestion**: Use parameterized queries
```java
// Fixed code here
```

</details>

### Decision: REQUEST_CHANGES
**Reason**: Critical security vulnerability found that must be addressed.
```

---

## Phase 3: VS Code Extension (PLANNED)

### Overview
A VS Code Extension that provides real-time AI-powered code review directly inside the editor. Developers can review files, get inline warnings, and fix issues without leaving VS Code.

### Planned Features
- [ ] Right-click any file -> "Review with CodeShield AI"
- [ ] Inline diagnostics (yellow/red squiggles for issues)
- [ ] Quick fix suggestions (lightbulb icon)
- [ ] Security scan on file save (optional)
- [ ] Side panel with full review report
- [ ] Status bar showing code health score
- [ ] Settings for severity thresholds and languages
- [ ] Integration with CodeShield AI web account (sync history via backend API)
- [ ] Published on VS Code Marketplace

### Extension Structure (Planned)
```
codeshield-ai-vscode/
├── src/
│   ├── extension.ts                   # Main entry point -- registers commands, providers, views
│   ├── commands/
│   │   ├── reviewFile.ts              # "CodeShield AI: Review This File"
│   │   ├── reviewSelection.ts         # "CodeShield AI: Review Selection"
│   │   └── reviewWorkspace.ts         # "CodeShield AI: Scan Workspace"
│   ├── providers/
│   │   ├── diagnosticProvider.ts      # Creates squiggles on lines with issues
│   │   ├── codeActionProvider.ts      # Lightbulb icon with "Apply AI Fix" option
│   │   ├── hoverProvider.ts           # Issue description on hover
│   │   └── sidebarProvider.ts         # Full review report in sidebar panel
│   ├── services/
│   │   ├── backendService.ts          # Calls Spring Boot API (syncs history)
│   │   ├── reviewEngine.ts            # Parses AI response -> VS Code diagnostics
│   │   └── cacheService.ts            # Caches review results per file
│   └── views/
│       └── sidebar/
│           ├── index.html
│           ├── style.css
│           └── script.js
├── package.json
├── tsconfig.json
└── README.md
```

---

## Backend API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/signup` | Register with email/password |
| POST | `/api/v1/auth/signin` | Login with email/password |
| POST | `/api/v1/auth/refresh` | Refresh JWT access token |
| GET | `/api/v1/auth/oauth2/google/url` | Get Google OAuth redirect URL |
| POST | `/api/v1/auth/oauth2/google/callback` | Handle Google OAuth callback |
| GET | `/api/v1/auth/oauth2/github/url` | Get GitHub OAuth redirect URL |
| POST | `/api/v1/auth/oauth2/github/callback` | Handle GitHub OAuth callback |

### Code Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/review` | Submit code for AI review |
| GET | `/api/v1/reviews` | Get user's review history |
| GET | `/api/v1/reviews/{id}` | Get single review detail |
| DELETE | `/api/v1/reviews/{id}` | Delete a review |
| POST | `/api/v1/export/pdf` | Export review as PDF |

### Repository Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/repositories` | List connected repositories |
| GET | `/api/v1/repositories/github` | Browse user's GitHub repositories |
| POST | `/api/v1/repositories/connect` | Connect a GitHub repository |
| DELETE | `/api/v1/repositories/{id}` | Disconnect a repository |
| PUT | `/api/v1/repositories/{id}/settings` | Update repo settings (auto-review toggle) |
| GET | `/api/v1/repositories/{id}/pr-reviews` | Get PR reviews for a specific repo |
| GET | `/api/v1/repositories/pr-reviews` | Get all PR reviews across repos |
| POST | `/api/v1/repositories/{id}/review-pr/{prNumber}` | Trigger manual PR review |

### Webhooks
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/webhooks/github` | GitHub webhook receiver (HMAC-SHA256 verified) |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/notifications` | List user's notifications |
| GET | `/api/v1/notifications/unread-count` | Get unread notification count |
| POST | `/api/v1/notifications/mark-all-read` | Mark all notifications as read |
| POST | `/api/v1/notifications/{id}/read` | Mark single notification as read |
| DELETE | `/api/v1/notifications/{id}` | Delete a notification |
| DELETE | `/api/v1/notifications` | Clear all notifications |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/health` | Health check |

---

## Database Schema

All tables use UUID primary keys generated with `gen_random_uuid()`. The database is managed by Flyway with 5 migration files.

### Entity-Relationship Diagram
```
users (1) ────< (many) reviews
  |
  └────< (many) connected_repositories (1) ────< (many) pr_reviews
  |
  └────< (many) notifications
```

### V1: Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255),              -- bcrypt hashed (null for OAuth users)
    avatar VARCHAR(10),                      -- emoji avatar
    provider VARCHAR(20) NOT NULL DEFAULT 'LOCAL',  -- LOCAL, GOOGLE, GITHUB
    provider_id VARCHAR(255),                -- OAuth provider user ID
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
```

### V2: Reviews Table
```sql
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    language VARCHAR(50) NOT NULL,
    summary TEXT,
    score INT NOT NULL DEFAULT 0,            -- 0-100 quality score
    issues_json TEXT,                         -- JSON array of issues
    security_audit_json TEXT,                 -- JSON security audit object
    total_issues INT NOT NULL DEFAULT 0,
    critical INT NOT NULL DEFAULT 0,
    high INT NOT NULL DEFAULT 0,
    medium INT NOT NULL DEFAULT 0,
    low INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);
```

### V3: Connected Repositories Table
```sql
CREATE TABLE connected_repositories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    github_repo_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,              -- e.g., "my-project"
    full_name VARCHAR(512) NOT NULL,         -- e.g., "rutik/my-project"
    owner VARCHAR(255) NOT NULL,
    default_branch VARCHAR(100) DEFAULT 'main',
    is_private BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    auto_review BOOLEAN DEFAULT true,        -- auto-review new PRs?
    webhook_id BIGINT,                       -- GitHub webhook ID
    github_access_token TEXT,                -- user's GitHub token for API calls
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, github_repo_id)
);

CREATE INDEX idx_connected_repos_user_id ON connected_repositories(user_id);
CREATE INDEX idx_connected_repos_github_id ON connected_repositories(github_repo_id);
```

### V4: PR Reviews Table
```sql
CREATE TABLE pr_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repository_id UUID NOT NULL REFERENCES connected_repositories(id) ON DELETE CASCADE,
    pr_number INT NOT NULL,
    pr_title VARCHAR(512),
    pr_author VARCHAR(255),
    head_sha VARCHAR(40),                    -- commit SHA that was reviewed
    status VARCHAR(20) DEFAULT 'PENDING',    -- PENDING, IN_PROGRESS, COMPLETED, FAILED
    score INT DEFAULT 0,
    total_issues INT DEFAULT 0,
    critical INT DEFAULT 0,
    high INT DEFAULT 0,
    medium INT DEFAULT 0,
    low INT DEFAULT 0,
    files_reviewed INT DEFAULT 0,
    review_result_json TEXT,                 -- full review result JSON
    github_review_id BIGINT,                -- GitHub's review ID
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE INDEX idx_pr_reviews_repo_id ON pr_reviews(repository_id);
CREATE INDEX idx_pr_reviews_pr_number ON pr_reviews(pr_number);
CREATE INDEX idx_pr_reviews_created_at ON pr_reviews(created_at DESC);
```

### V5: Notifications Table
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL,               -- REVIEW_COMPLETE, REVIEW_FAILED, etc.
    title VARCHAR(255) NOT NULL,
    message TEXT,
    link VARCHAR(512),                       -- link to review or PR
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
```

---

## Environment Variables

```bash
# AI Providers
GEMINI_API_KEY=your_gemini_key              # Primary AI provider
GROQ_API_KEY=your_groq_key                  # Fallback AI provider 1
CEREBRAS_API_KEY=your_cerebras_key          # Fallback AI provider 2

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# GitHub OAuth & Webhooks
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_WEBHOOK_SECRET=your_webhook_secret

# JWT Authentication
JWT_SECRET=your_jwt_secret                   # Must be at least 256 bits for HMAC

# Database (PostgreSQL)
DATABASE_URL=jdbc:postgresql://host:5432/codeshield
DATABASE_USERNAME=your_db_user
DATABASE_PASSWORD=your_db_password

# App URLs
FRONTEND_URL=https://revidex.vercel.app
BACKEND_URL=https://codeshield-ai-v8wm.onrender.com
PORT=8081
```

---

## Deployment

### Current Deployment
```
Vercel (FREE)
├── Frontend: Angular 19.2 production build
├── URL: https://revidex.vercel.app
└── Auto-deploys from GitHub main branch

Render (FREE tier)
├── Backend: Spring Boot 4.0.5 (Java 22) JAR
├── URL: https://codeshield-ai-v8wm.onrender.com
├── PostgreSQL: Render managed database
├── Environment: All env variables configured in Render dashboard
└── Auto-deploys from GitHub main branch
```

### Dockerfile
```dockerfile
# Stage 1: Build the JAR file
FROM eclipse-temurin:22-jdk-alpine AS build
WORKDIR /app
COPY . .
RUN ./mvnw clean package -DskipTests

# Stage 2: Run the JAR (smaller image)
FROM eclipse-temurin:22-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
```

---

## Summary

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1: Web Application | COMPLETE | Angular 19 + Spring Boot + Multi-AI review + Auth + Dashboard + Export |
| Phase 2: GitHub Integration | COMPLETE | GitHub OAuth + Repo management + Webhook PR reviews + Notifications |
| Phase 3: VS Code Extension | PLANNED | Inline diagnostics + Quick fixes + Sidebar panel |

### Total Cost: $0 (all services on free tiers)

---

*Documentation by Rutik Pimpale*
*Project: CodeShield AI -- AI Code Reviewer & Security Auditor*
*Tech Stack: Angular 19.2 | Spring Boot 4.0.5 | Java 22 | PostgreSQL | Gemini + Groq + Cerebras*
*Last updated: April 2026*
