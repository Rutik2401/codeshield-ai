# AI Code Reviewer & Security Auditor - Complete Project Documentation

---

## Brand Options (Pick One Before Building)

| # | Name | Domain | Tagline | GitHub Repo |
|---|------|--------|---------|-------------|
| 1 | **CodeShield AI** | codeshield.ai | "AI-Powered Code Security. Review. Audit. Protect." | github.com/rutik/codeshield-ai |
| 2 | **CodeSentry** | codesentry.ai | "Your AI Sentry for Cleaner, Safer Code" | github.com/rutik/codesentry |
| 3 | **AuditLens** | auditlens.dev | "See Every Bug. Fix Every Vulnerability." | github.com/rutik/auditlens |

### Brand Colors (Works for all 3 names)
```
Primary:    #2563EB  (Blue — trust, security)
Accent:     #10B981  (Green — safe, clean code)
Critical:   #EF4444  (Red — critical issues)
High:       #F97316  (Orange — high severity)
Medium:     #EAB308  (Yellow — medium severity)
Low:        #3B82F6  (Blue — low severity)
Dark BG:    #0F172A  (Slate — modern dark theme)
Light BG:   #F8FAFC  (Light gray — clean light theme)
```

### Domains & URLs (Update these once you pick a name)
```
Replace these placeholders throughout the project:

PRODUCT_NAME     = CodeShield AI | CodeSentry | AuditLens
DOMAIN           = codeshield.ai | codesentry.ai | auditlens.dev
FRONTEND_DOMAIN  = codeshield.vercel.app | codesentry.vercel.app | auditlens.vercel.app
BACKEND_DOMAIN   = codeshield-api.railway.app | codesentry-api.railway.app | auditlens-api.railway.app
GITHUB_REPO      = codeshield-ai | codesentry | auditlens
VSCODE_EXT_ID    = codeshield-ai | codesentry | auditlens
FOLDER_NAME      = codeshield-ai | codesentry | auditlens
PACKAGE_NAME     = com.codeshield | com.codesentry | com.auditlens
DB_NAME          = codeshield | codesentry | auditlens
```

---

## Project Overview

**{PRODUCT_NAME}** is an AI-powered Code Reviewer & Security Auditor that analyzes code for bugs, vulnerabilities, and best practices. It provides intelligent suggestions to improve code quality and security.

### Vision
Build a full-ecosystem product that works as a Web App, GitHub Bot, and VS Code Extension — making code reviews faster, smarter, and accessible to every developer.

### Vision Statement
> "{PRODUCT_NAME} empowers every developer to write secure, high-quality code
> by providing instant AI-powered reviews across Web, GitHub, and VS Code —
> making professional code auditing accessible to everyone, for free."

### Architecture Principles
- **Scalable**: Layered architecture — easy to add new features without breaking existing ones
- **Human-Readable**: Every file, function, and variable is named clearly with detailed comments
- **Secure**: API keys never exposed to frontend — all AI calls go through backend proxy
- **Testable**: Every service has unit tests, every API has integration tests
- **Consistent**: Same coding patterns used everywhere — once you learn one service, you know them all

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [APIs Required (All Phases)](#apis-required-all-phases)
3. [Phase 1: Web Application](#phase-1-web-application)
4. [Phase 2: GitHub Integration](#phase-2-github-integration)
5. [Phase 3: VS Code Extension](#phase-3-vs-code-extension)
6. [Database Schema](#database-schema)
7. [Testing Strategy](#testing-strategy)
8. [Deployment Guide](#deployment-guide)
9. [Monetization Strategy](#monetization-strategy)

---

## Tech Stack

| Layer             | Technology                                        | Why This Choice                                |
|------------------|---------------------------------------------------|------------------------------------------------|
| Frontend         | Angular 17+ (Standalone Components) + Tailwind CSS | You already know Angular — ship faster          |
| Code Editor      | Monaco Editor (ngx-monaco-editor-v2)               | Same editor as VS Code — impressive & powerful  |
| Backend          | Spring Boot 4.0.4 + Java 21                       | Enterprise-grade, built-in security & OAuth     |
| Database         | PostgreSQL (free via Neon/Supabase)                | Native JSONB for AI responses, free hosting     |
| ORM              | Spring Data JPA + Hibernate                        | Industry standard, auto-generates queries       |
| DB Migrations    | Flyway                                             | Safe database versioning (never lose data)      |
| AI Engine        | Google Gemini API (free)                           | Free, powerful, great for code analysis         |
| Auth             | Spring Security + GitHub OAuth2                    | Battle-tested security, no custom auth needed   |
| API Docs         | SpringDoc OpenAPI (Swagger)                        | Auto-generated API docs at /swagger-ui          |
| Testing          | JUnit 5 + Mockito (BE) / Jasmine + Karma (FE)     | Industry standard testing tools                 |
| Hosting          | Vercel (frontend) + Railway (backend)              | Both free, auto-deploy from GitHub              |
| VS Code          | VS Code Extension API                              | Direct integration into developer workflow      |

---

## APIs Required (All Phases)

### Phase 1 - Web App (All FREE)

| API / Service       | Purpose                        | Cost   | How to Get                           |
|--------------------|--------------------------------|--------|--------------------------------------|
| Google Gemini API  | AI code analysis engine        | FREE   | https://aistudio.google.com/apikey   |
| Railway / Render   | Host Spring Boot proxy backend | FREE   | https://railway.app                  |

> **IMPORTANT**: Even in Phase 1, we use a small Spring Boot backend as a proxy
> to call Gemini API. This prevents your API key from being exposed in the browser.
> Never call AI APIs directly from frontend — anyone can steal your key from DevTools.

**Phase 1 Total Cost: $0**

---

### Phase 2 - GitHub Integration (All FREE)

| API / Service         | Purpose                              | Cost        | How to Get                                      |
|----------------------|--------------------------------------|-------------|--------------------------------------------------|
| Google Gemini API    | AI code analysis engine              | FREE        | https://aistudio.google.com/apikey               |
| GitHub OAuth App     | User login with GitHub               | FREE        | https://github.com/settings/developers           |
| GitHub REST API      | Read PRs, post review comments       | FREE        | Comes with GitHub OAuth                          |
| GitHub Webhooks      | Listen for new PRs automatically     | FREE        | Configured in GitHub App settings                |
| PostgreSQL (Neon)    | Store users, reviews, history        | FREE (0.5GB)| https://neon.tech                                |
| Railway / Render     | Host Spring Boot backend             | FREE tier   | https://railway.app or https://render.com        |
| Vercel               | Host Angular frontend                | FREE        | https://vercel.com                               |

**Phase 2 Total Cost: $0**

---

### Phase 3 - VS Code Extension (All FREE)

| API / Service              | Purpose                          | Cost   | How to Get                                          |
|---------------------------|----------------------------------|--------|------------------------------------------------------|
| Google Gemini API         | AI code analysis engine          | FREE   | https://aistudio.google.com/apikey                   |
| VS Code Extension API     | Build the extension              | FREE   | Built into VS Code SDK                               |
| VS Code Marketplace       | Publish the extension            | FREE   | https://marketplace.visualstudio.com/manage          |
| Azure DevOps (Publisher)  | Required to publish extensions   | FREE   | https://dev.azure.com                                |

**Phase 3 Total Cost: $0**

---

### Optional Paid Upgrades (Future Scope — When You Scale)

> These are ONLY needed when your product grows and you have paying users.
> Everything above is 100% FREE. No credit card required for any service.

| API / Service     | Purpose                      | Cost             | When to Use                    |
|------------------|------------------------------|------------------|--------------------------------|
| Claude API       | Better code analysis         | $3/M input tokens| When you have paying users     |
| OpenAI GPT-4     | Alternative AI engine        | $10/M tokens     | For multi-model comparison     |
| Stripe API       | Payment processing           | 2.9% per txn     | When you add paid plans        |
| Redis             | Rate limiting & caching      | Free tier         | When traffic grows             |
| Sentry            | Error monitoring             | Free tier         | Production monitoring          |

---

## Phase 1: Web Application

### Overview
A beautiful web app where users paste code (or upload files) and get instant AI-powered code reviews with security analysis. Even though this is "Phase 1", we build it properly with a small backend proxy so the architecture is ready to scale into Phase 2.

### How Phase 1 Works (Architecture)
```
User's Browser (Angular)
    |
    | 1. User pastes code + selects language
    | 2. Clicks "Review Code" button
    |
    v
Spring Boot Backend (Proxy API)          <-- Keeps API key safe on server
    |
    | 3. Backend adds API key + builds prompt
    | 4. Calls Gemini API securely
    |
    v
Google Gemini API (FREE)
    |
    | 5. Gemini analyzes code
    | 6. Returns JSON review
    |
    v
Spring Boot backend (folder structure is the same as generated by Spring Initializer) to run the backend in IntelliJ IDEA.”
    |
    | 7. Parses & validates response
    | 8. Returns clean ReviewResponse to Angular
    |
    v
Angular Frontend
    |
    | 9. Displays results: issues, severity, fixes, score
    | 10. User can export as PDF/Markdown
    v
Done!
```

### Features
- Monaco Code Editor (same as VS Code) — syntax highlighting for 50+ languages
- Multi-language support (JavaScript, Python, Java, C++, Go, Rust, etc.)
- AI-powered code review (bugs, logic errors, code smells, best practices)
- Security vulnerability detection (OWASP Top 10 — XSS, SQL Injection, etc.)
- Severity scoring with color-coded badges (Critical=Red / High=Orange / Medium=Yellow / Low=Blue)
- AI-generated fix suggestions with before/after diff view
- Overall code quality score (0-100) with circular progress indicator
- Export review as PDF / Markdown report
- Review history (saved in localStorage for Phase 1, PostgreSQL in Phase 2)
- Responsive design (mobile-friendly)
- Loading skeleton animations while AI is analyzing
- Toast notifications for success/error feedback
- Keyboard shortcuts (Ctrl+Enter to review, Ctrl+S to export)

### Step-by-Step Build Plan

#### Step 1: Project Setup

**Angular Frontend**
```bash
ng new {FOLDER_NAME} --standalone --style=scss --routing
cd {FOLDER_NAME}
npm install ngx-monaco-editor-v2          # Monaco code editor for Angular
npm install ngx-markdown                   # Render markdown in review results
npm install html2pdf.js                    # Export review as PDF
npm install file-saver @types/file-saver   # Export review as Markdown file
npm install tailwindcss @tailwindcss/typography postcss autoprefixer
npm install ngx-sonner                     # Toast notifications (like react-hot-toast)
npm install chart.js ng2-charts            # Charts for dashboard stats
npx tailwindcss init
```

**Spring Boot Backend (Proxy for Phase 1)**
```bash
# Use Spring Initializr (https://start.spring.io)
# Project: Maven | Language: Java 21 | Spring Boot: 4.0.4
# Dependencies:
#   - Spring Web          (REST API endpoints)
#   - Spring WebFlux      (WebClient for calling Gemini API)
#   - Validation          (validate incoming requests)
#   - Lombok              (reduce boilerplate code)
#   - Spring Actuator     (health check endpoint: /actuator/health)
#   - SpringDoc OpenAPI   (auto API docs at /swagger-ui)
```

#### Step 2: Angular Frontend Folder Structure
```
{FOLDER_NAME}/
├── src/
│   ├── app/
│   │   │
│   │   ├── core/                                        # --- CORE MODULE (singleton services, guards, interceptors) ---
│   │   │   ├── interceptors/
│   │   │   │   ├── api.interceptor.ts                   # Adds base URL to all API calls automatically
│   │   │   │   ├── error.interceptor.ts                 # Catches all HTTP errors, shows toast notifications
│   │   │   │   └── loading.interceptor.ts               # Shows/hides global loading spinner on API calls
│   │   │   ├── guards/
│   │   │   │   └── auth.guard.ts                        # Protects routes that need login (Phase 2)
│   │   │   ├── services/
│   │   │   │   ├── gemini.service.ts                    # Calls Spring Boot proxy -> Gemini API
│   │   │   │   ├── review-engine.service.ts             # Builds prompts, parses AI responses
│   │   │   │   ├── export.service.ts                    # Generates PDF and Markdown files
│   │   │   │   ├── history.service.ts                   # Saves/loads reviews from localStorage
│   │   │   │   ├── theme.service.ts                     # Toggles dark/light mode, saves preference
│   │   │   │   ├── loading.service.ts                   # Global loading state (BehaviorSubject)
│   │   │   │   └── toast.service.ts                     # Wrapper around ngx-sonner for notifications
│   │   │   └── constants/
│   │   │       ├── api.constants.ts                     # API endpoints: '/api/v1/review', etc.
│   │   │       ├── language.constants.ts                # Supported languages list with Monaco IDs
│   │   │       └── prompt.constants.ts                  # AI prompt templates (system + user prompts)
│   │   │
│   │   ├── shared/                                      # --- SHARED MODULE (reusable components, pipes, directives) ---
│   │   │   ├── components/
│   │   │   │   ├── loading-spinner/
│   │   │   │   │   └── loading-spinner.component.ts     # Full-page loading overlay with animation
│   │   │   │   ├── skeleton-loader/
│   │   │   │   │   └── skeleton-loader.component.ts     # Placeholder shimmer while content loads
│   │   │   │   ├── severity-badge/
│   │   │   │   │   └── severity-badge.component.ts      # Color-coded badge: Critical(red) High(orange) Med(yellow) Low(blue)
│   │   │   │   ├── score-circle/
│   │   │   │   │   └── score-circle.component.ts        # Circular progress indicator (0-100 score)
│   │   │   │   ├── empty-state/
│   │   │   │   │   └── empty-state.component.ts         # "No results yet" placeholder with illustration
│   │   │   │   └── confirm-dialog/
│   │   │   │       └── confirm-dialog.component.ts      # Reusable confirmation popup
│   │   │   ├── pipes/
│   │   │   │   ├── time-ago.pipe.ts                     # "2 hours ago", "3 days ago" formatting
│   │   │   │   ├── truncate.pipe.ts                     # Truncate long text with "..."
│   │   │   │   └── highlight.pipe.ts                    # Highlight search terms in text
│   │   │   └── directives/
│   │   │       └── click-outside.directive.ts           # Close dropdowns when clicking outside
│   │   │
│   │   ├── features/                                    # --- FEATURE MODULES (each page is a feature) ---
│   │   │   │
│   │   │   ├── landing/                                 # LANDING PAGE (Home)
│   │   │   │   ├── landing.component.ts                 # Parent component - assembles all landing sections
│   │   │   │   ├── hero/
│   │   │   │   │   └── hero.component.ts                # Hero banner: title, subtitle, CTA "Try Now" button
│   │   │   │   ├── features-showcase/
│   │   │   │   │   └── features-showcase.component.ts   # Grid of feature cards with icons
│   │   │   │   ├── demo-preview/
│   │   │   │   │   └── demo-preview.component.ts        # Animated preview showing the tool in action
│   │   │   │   ├── how-it-works/
│   │   │   │   │   └── how-it-works.component.ts        # 3-step process: Paste -> Review -> Fix
│   │   │   │   └── testimonials/
│   │   │   │       └── testimonials.component.ts        # User testimonials / trust badges
│   │   │   │
│   │   │   ├── reviewer/                                # MAIN REVIEW PAGE (Core Feature)
│   │   │   │   ├── reviewer.component.ts                # Parent: split layout — editor(left) + results(right)
│   │   │   │   ├── code-editor/
│   │   │   │   │   └── code-editor.component.ts         # Monaco editor wrapper with language selector
│   │   │   │   ├── language-selector/
│   │   │   │   │   └── language-selector.component.ts   # Dropdown: JavaScript, Python, Java, etc.
│   │   │   │   ├── file-upload/
│   │   │   │   │   └── file-upload.component.ts         # Drag & drop zone to upload code files
│   │   │   │   ├── review-panel/
│   │   │   │   │   └── review-panel.component.ts        # Container for all review results
│   │   │   │   ├── review-summary/
│   │   │   │   │   └── review-summary.component.ts      # Score circle + metrics overview (5 critical, 3 high...)
│   │   │   │   ├── issue-card/
│   │   │   │   │   └── issue-card.component.ts          # Single issue: severity + title + description + line number
│   │   │   │   ├── fix-suggestion/
│   │   │   │   │   └── fix-suggestion.component.ts      # Before/after code diff with "Apply Fix" button
│   │   │   │   ├── security-audit/
│   │   │   │   │   └── security-audit.component.ts      # OWASP Top 10 findings panel
│   │   │   │   └── export-options/
│   │   │   │       └── export-options.component.ts      # Buttons: "Export PDF" / "Export Markdown"
│   │   │   │
│   │   │   └── dashboard/                               # DASHBOARD PAGE (Review History)
│   │   │       ├── dashboard.component.ts               # Parent: stats + history list
│   │   │       ├── stats-cards/
│   │   │       │   └── stats-cards.component.ts         # Total reviews, avg score, most common issues
│   │   │       ├── review-history/
│   │   │       │   └── review-history.component.ts      # List of past reviews with search + filter
│   │   │       ├── review-detail-modal/
│   │   │       │   └── review-detail-modal.component.ts # Click a history item -> see full review in modal
│   │   │       └── charts/
│   │   │           └── charts.component.ts              # Bar chart: issues by type, line chart: score over time
│   │   │
│   │   ├── layout/                                      # --- LAYOUT COMPONENTS (appear on every page) ---
│   │   │   ├── navbar/
│   │   │   │   └── navbar.component.ts                  # Top nav: logo, links (Home, Reviewer, Dashboard), theme toggle
│   │   │   ├── footer/
│   │   │   │   └── footer.component.ts                  # Footer: copyright, GitHub link, social links
│   │   │   └── sidebar/
│   │   │       └── sidebar.component.ts                 # Mobile sidebar menu (hamburger)
│   │   │
│   │   ├── models/                                      # --- TYPESCRIPT INTERFACES (type safety) ---
│   │   │   ├── review.model.ts                          # ReviewResponse { summary, score, issues[], securityAudit, metrics }
│   │   │   ├── issue.model.ts                           # Issue { id, type, severity, line, title, description, suggestion, fixedCode }
│   │   │   ├── metrics.model.ts                         # Metrics { totalIssues, critical, high, medium, low }
│   │   │   ├── security-audit.model.ts                  # SecurityAudit { vulnerabilities[], riskLevel, recommendations[] }
│   │   │   └── history-item.model.ts                    # HistoryItem { id, code, language, review, createdAt }
│   │   │
│   │   ├── app.component.ts                             # Root component — layout wrapper (navbar + router-outlet + footer)
│   │   ├── app.config.ts                                # provideHttpClient, provideRouter, provideAnimations
│   │   └── app.routes.ts                                # Routes: / (landing), /reviewer, /dashboard
│   │
│   ├── environments/
│   │   ├── environment.ts                               # dev: { apiUrl: 'http://localhost:8080/api/v1' }
│   │   └── environment.prod.ts                          # prod: { apiUrl: 'https://{BACKEND_DOMAIN}/api/v1' }
│   ├── assets/
│   │   ├── images/                                      # Logo, illustrations, icons
│   │   └── fonts/                                       # Custom fonts if needed
│   ├── styles.scss                                      # @tailwind base; @tailwind components; @tailwind utilities;
│   └── main.ts                                          # bootstrapApplication(AppComponent, appConfig)
├── angular.json
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

#### Step 3: Spring Boot Proxy Backend (Phase 1 — Minimal)
```
{FOLDER_NAME}-backend/
├── src/main/java/com/{PACKAGE_NAME}/
│   ├── Application.java              # @SpringBootApplication — main entry point
│   │
│   ├── config/
│   │   ├── CorsConfig.java                    # Allow Angular frontend origin (localhost:4200 + vercel)
│   │   └── WebClientConfig.java               # Configure WebClient bean for calling Gemini API
│   │
│   ├── controller/
│   │   └── ReviewController.java              # POST /api/v1/review — accepts code, returns AI review
│   │
│   ├── service/
│   │   ├── GeminiService.java                 # Calls Gemini API using WebClient (API key stays on server!)
│   │   └── PromptService.java                 # Builds the AI prompt from code + language
│   │
│   ├── dto/
│   │   ├── ReviewRequest.java                 # { code: string, language: string }
│   │   └── ReviewResponse.java                # { summary, score, issues[], securityAudit, metrics }
│   │
│   └── exception/
│       └── GlobalExceptionHandler.java        # @ControllerAdvice — catches all errors, returns clean JSON
│
├── src/main/resources/
│   ├── application.yml                        # Server port, Gemini API key, CORS origins
│   └── application-dev.yml                    # Dev-specific config (localhost)
├── pom.xml
└── Dockerfile
```

> **Why a backend even in Phase 1?**
> If you call Gemini API directly from Angular, your API key is visible in browser
> DevTools (Network tab). Anyone can copy it and use your quota. The backend proxy
> keeps the key safe on the server. Plus, this same backend grows into Phase 2.

#### Step 4: Core AI Prompt Design
```
System Prompt for Gemini:
"You are {PRODUCT_NAME}, an expert code reviewer and security auditor.
You analyze code with the same rigor as a senior developer doing a thorough code review.

Analyze the following {language} code and return ONLY a valid JSON response (no markdown, no explanation outside JSON) with this exact structure:

{
  "summary": "Brief 1-2 sentence overview of what this code does",
  "score": 72,                          // Code quality score 0-100 (100 = perfect)
  "issues": [
    {
      "id": "ISS-001",                  // Unique ID for each issue
      "type": "security",               // "bug" | "security" | "performance" | "style" | "best-practice"
      "severity": "critical",           // "critical" | "high" | "medium" | "low"
      "line": 15,                       // Line number where issue exists
      "title": "SQL Injection Risk",    // Short 3-5 word title
      "description": "User input is directly concatenated into SQL query without sanitization, allowing attackers to execute arbitrary SQL commands.",
      "suggestion": "Use parameterized queries or prepared statements instead of string concatenation.",
      "fixedCode": "db.query('SELECT * FROM users WHERE id = ?', [userId])"
    }
  ],
  "securityAudit": {
    "vulnerabilities": [
      {
        "owasp": "A03:2021 Injection",  // OWASP Top 10 category
        "description": "SQL injection via unsanitized user input",
        "severity": "critical",
        "remediation": "Use parameterized queries"
      }
    ],
    "riskLevel": "high",                // "critical" | "high" | "medium" | "low" | "safe"
    "recommendations": [
      "Implement input validation on all user inputs",
      "Use ORM instead of raw SQL queries"
    ]
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
- Return ONLY valid JSON. No markdown code blocks. No text before or after.
- If the code has no issues, return an empty issues array and score of 95-100.
- Always check for OWASP Top 10 vulnerabilities.
- Be specific about line numbers.
- Provide working fixedCode that can directly replace the buggy code."
```

#### Step 5: API Integration

**Angular gemini.service.ts (calls backend proxy, NOT Gemini directly)**
```typescript
// This service calls YOUR Spring Boot backend, which then calls Gemini API.
// The API key never touches the frontend — it stays safe on the server.

@Injectable({ providedIn: 'root' })
export class GeminiService {

  // This URL points to YOUR backend, not to Gemini directly
  private apiUrl = environment.apiUrl;  // 'http://localhost:8080/api/v1' or 'https://{BACKEND_DOMAIN}/api/v1'

  constructor(private http: HttpClient) {}

  /**
   * Send code to backend for AI review.
   * Backend will securely call Gemini API and return parsed results.
   *
   * @param code     - The source code string to review
   * @param language - Programming language (e.g., 'javascript', 'python')
   * @returns Observable<ReviewResponse> - Parsed review with issues, score, security audit
   */
  reviewCode(code: string, language: string): Observable<ReviewResponse> {
    return this.http.post<ReviewResponse>(`${this.apiUrl}/review`, {
      code,
      language
    });
  }
}
```

**Spring Boot ReviewController.java**
```java
/**
 * REST controller for code review operations.
 * This is the main entry point for the Angular frontend.
 *
 * Flow: Angular -> ReviewController -> GeminiService -> Gemini API -> Response
 */
@RestController
@RequestMapping("/api/v1")               // API versioning: /api/v1/review
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class ReviewController {

    private final GeminiService geminiService;

    // Constructor injection (recommended over @Autowired)
    public ReviewController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    /**
     * POST /api/v1/review
     * Accepts code + language, sends to Gemini AI, returns structured review.
     *
     * @param request - { code: "...", language: "javascript" }
     * @return ReviewResponse - { summary, score, issues[], securityAudit, metrics }
     */
    @PostMapping("/review")
    public ResponseEntity<ReviewResponse> reviewCode(@Valid @RequestBody ReviewRequest request) {
        ReviewResponse review = geminiService.analyzeCode(request.getCode(), request.getLanguage());
        return ResponseEntity.ok(review);
    }
}
```

**Spring Boot GeminiService.java**
```java
/**
 * Service that communicates with Google Gemini API.
 * API key is stored in application.yml (server-side only — never sent to frontend).
 *
 * This service:
 * 1. Builds the AI prompt using PromptService
 * 2. Sends HTTP POST to Gemini API via WebClient
 * 3. Parses the JSON response into ReviewResponse DTO
 */
@Service
public class GeminiService {

    private final WebClient webClient;
    private final PromptService promptService;
    private final ObjectMapper objectMapper;

    @Value("${app.gemini.api-key}")
    private String apiKey;                 // Loaded from environment variable — never hardcoded

    public GeminiService(WebClient.Builder builder, PromptService promptService, ObjectMapper objectMapper) {
        this.webClient = builder
            .baseUrl("https://generativelanguage.googleapis.com/v1beta")
            .build();
        this.promptService = promptService;
        this.objectMapper = objectMapper;
    }

    /**
     * Send code to Gemini API for analysis and return structured review.
     *
     * @param code     - Source code to analyze
     * @param language - Programming language
     * @return ReviewResponse - Parsed review results
     */
    public ReviewResponse analyzeCode(String code, String language) {
        // Step 1: Build the prompt with code and language
        String prompt = promptService.buildReviewPrompt(code, language);

        // Step 2: Call Gemini API (synchronous — using .block() for simplicity in MVC)
        String rawResponse = webClient.post()
            .uri("/models/gemini-2.0-flash:generateContent?key={key}", apiKey)
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(Map.of(
                "contents", List.of(Map.of(
                    "parts", List.of(Map.of("text", prompt))
                ))
            ))
            .retrieve()
            .bodyToMono(String.class)
            .block();                      // .block() converts Mono to sync for Spring MVC

        // Step 3: Extract the text content from Gemini's response structure
        String jsonContent = extractTextFromGeminiResponse(rawResponse);

        // Step 4: Parse JSON string into ReviewResponse object
        return objectMapper.readValue(jsonContent, ReviewResponse.class);
    }

    /**
     * Gemini API wraps the actual response inside:
     * { candidates: [{ content: { parts: [{ text: "actual json here" }] } }] }
     * This method extracts the inner "text" field.
     */
    private String extractTextFromGeminiResponse(String rawResponse) {
        // Parse and navigate the nested Gemini response structure
        JsonNode root = objectMapper.readTree(rawResponse);
        return root.at("/candidates/0/content/parts/0/text").asText();
    }
}
```

#### Step 6: UI Pages Design

**Home Page (Landing)**
```
┌─────────────────────────────────────────────────────┐
│  Navbar: [Logo]  Home  Reviewer  Dashboard  [Theme] │
├─────────────────────────────────────────────────────┤
│                                                     │
│           {PRODUCT_NAME}                              │
│   AI-Powered Code Reviewer & Security Auditor       │
│                                                     │
│   [Try Now - Free]    [View on GitHub]              │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│   How It Works:                                     │
│   1. Paste Code  ->  2. AI Reviews  ->  3. Fix      │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│   Features:                                         │
│   [Bug Detection] [Security Audit] [Fix Suggest]    │
│   [Multi-Lang]    [Export PDF]     [Score Card]      │
│                                                     │
├─────────────────────────────────────────────────────┤
│  Footer: Made by Rutik | GitHub | LinkedIn          │
└─────────────────────────────────────────────────────┘
```

**Reviewer Page (Main Feature)**
```
┌─────────────────────────────────────────────────────┐
│  Navbar                                             │
├──────────────────────┬──────────────────────────────┤
│                      │                              │
│   CODE EDITOR        │   REVIEW RESULTS             │
│                      │                              │
│  [Language: ▼ JS]    │   Score: [82/100] (circle)   │
│  [Upload File]       │                              │
│                      │   Summary: "This code..."     │
│  ┌────────────────┐  │                              │
│  │ 1. const app   │  │   Issues (5):                │
│  │ 2. app.get()   │  │   ┌─ CRITICAL: SQL Injection │
│  │ 3. db.query()  │  │   ├─ HIGH: No input valid.   │
│  │ 4. ...         │  │   ├─ MEDIUM: Console.log      │
│  │ 5.             │  │   └─ LOW: Missing semicolon   │
│  └────────────────┘  │                              │
│                      │   Security Audit:             │
│  [Review Code ▶]     │   Risk Level: HIGH            │
│                      │   OWASP: A03 Injection        │
│                      │                              │
│                      │   [Export PDF] [Export MD]     │
├──────────────────────┴──────────────────────────────┤
│  Footer                                             │
└─────────────────────────────────────────────────────┘
```

**Dashboard Page**
```
┌─────────────────────────────────────────────────────┐
│  Navbar                                             │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Stats Cards:                                       │
│  [Total: 24]  [Avg Score: 76]  [Critical: 8]       │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Charts:                                            │
│  [Bar: Issues by Type]    [Line: Score Over Time]   │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Review History:  [Search...] [Filter by: ▼]        │
│  ┌────────────────────────────────────────────┐     │
│  │ #1  JavaScript  Score: 82  3 issues  2h ago│     │
│  │ #2  Python      Score: 91  1 issue   1d ago│     │
│  │ #3  Java        Score: 65  7 issues  3d ago│     │
│  └────────────────────────────────────────────┘     │
│                                                     │
├─────────────────────────────────────────────────────┤
│  Footer                                             │
└─────────────────────────────────────────────────────┘
```

#### Step 7: Export & History
- Save reviews to localStorage with timestamp using history.service.ts
- Export as PDF using html2pdf.js (captures the review panel as styled PDF)
- Export as Markdown file using file-saver (generates .md with all issues listed)

#### Step 8: Deploy Phase 1
```bash
# Angular frontend -> Vercel
ng build --configuration=production
npx vercel deploy

# Spring Boot backend -> Railway
# Push to GitHub -> Connect repo in Railway -> Auto-deploys
# Set environment variable: GEMINI_API_KEY=your_key
```

### Phase 1 Deliverables
- [ ] Spring Boot proxy backend with POST /api/v1/review
- [ ] Landing page with hero, features showcase, how-it-works
- [ ] Monaco code editor with language selector dropdown
- [ ] File upload (drag & drop)
- [ ] Gemini AI integration via secure backend proxy
- [ ] Security vulnerability detection (OWASP Top 10)
- [ ] Severity badges (Critical/High/Medium/Low) with colors
- [ ] Code quality score with circular progress indicator
- [ ] Fix suggestions with before/after diff view
- [ ] Review history dashboard with search & filter
- [ ] Stats cards & charts (issues by type, score over time)
- [ ] PDF/Markdown export
- [ ] Dark/Light theme toggle
- [ ] Loading skeletons & toast notifications
- [ ] Responsive design (mobile-friendly)
- [ ] Unit tests for services (Angular + Spring Boot)
- [ ] Deployed: Angular on Vercel, Spring Boot on Railway

### Estimated Timeline: 1-2 weeks

---

## Phase 2: GitHub Integration

### Overview
Transform {PRODUCT_NAME} into a GitHub Bot that automatically reviews Pull Requests. When a developer opens a PR, {PRODUCT_NAME} analyzes the code changes and posts review comments directly on the PR. The Phase 1 proxy backend expands into a full backend.

### New Features (Added on top of Phase 1)
- GitHub OAuth login ("Sign in with GitHub")
- Connect GitHub repositories to {PRODUCT_NAME}
- Automatic PR review when a new PR is opened
- Inline review comments posted directly on PR diffs
- Repository dashboard (all connected repos + review stats per repo)
- Team management (invite team members to review repos together)
- Webhook management (enable/disable auto-review per repo)
- Review rules configuration (severity threshold, languages to review)
- All reviews stored in PostgreSQL (replaces localStorage from Phase 1)
- Paginated review history with filters

### APIs & Services Setup

#### Step 1: Create GitHub OAuth App
```
1. Go to: https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in:
   - Application name: {PRODUCT_NAME}
   - Homepage URL: https://{FRONTEND_DOMAIN}
   - Callback URL: https://your-backend.railway.app/api/v1/auth/github/callback
4. Save Client ID and Client Secret
```

#### Step 2: Create GitHub App (for Webhooks & Bot)
```
1. Go to: https://github.com/settings/apps
2. Click "New GitHub App"
3. Fill in:
   - Name: {PRODUCT_NAME} Bot
   - Homepage URL: your-app-url
   - Webhook URL: https://your-backend.railway.app/api/v1/webhooks/github
   - Webhook Secret: generate-a-random-secret
4. Permissions needed:
   - Pull requests: Read & Write       (to read PR diffs + post review comments)
   - Contents: Read                     (to read file contents)
   - Checks: Read & Write              (to create check runs with results)
   - Metadata: Read                     (to read repo info)
5. Subscribe to events:
   - Pull request                       (triggers when PR is opened/updated)
   - Pull request review                (triggers when review is submitted)
6. Save App ID, Private Key, Client ID, Client Secret
```

#### Step 3: Expand Spring Boot Backend
```bash
# Add these dependencies to existing pom.xml:
#   - Spring Security        (authentication & authorization)
#   - Spring Data JPA        (database ORM — auto-generates SQL queries)
#   - PostgreSQL Driver      (connects to PostgreSQL database)
#   - OAuth2 Client          (GitHub OAuth login)
#   - Flyway                 (database migration versioning — safe schema changes)
#   - JJWT                   (JWT token creation & validation)
```

#### Step 4: Full Spring Boot Backend Folder Structure (Phase 2)
```
{FOLDER_NAME}-backend/
├── src/main/java/com/{PACKAGE_NAME}/
│   ├── Application.java                   # @SpringBootApplication — app entry point
│   │
│   ├── config/                                      # --- CONFIGURATION (how the app behaves) ---
│   │   ├── SecurityConfig.java                      # Spring Security: OAuth2 login, JWT filter, public/protected routes
│   │   ├── CorsConfig.java                          # CORS: allow Angular frontend origin
│   │   ├── WebClientConfig.java                     # WebClient bean: used by GeminiService & GitHubService
│   │   └── OpenApiConfig.java                       # Swagger/OpenAPI: auto-generate API docs at /swagger-ui
│   │
│   ├── controller/                                  # --- REST CONTROLLERS (API endpoints) ---
│   │   ├── AuthController.java                      # POST /api/v1/auth/github          — GitHub OAuth login
│   │   │                                            # GET  /api/v1/auth/me               — get current user
│   │   │                                            # POST /api/v1/auth/logout           — logout
│   │   ├── ReviewController.java                    # POST /api/v1/review                — manual code review (paste code)
│   │   │                                            # GET  /api/v1/reviews               — paginated review history
│   │   │                                            # GET  /api/v1/reviews/{id}          — single review detail
│   │   │                                            # GET  /api/v1/reviews/stats         — dashboard statistics
│   │   ├── RepositoryController.java                # GET  /api/v1/repos                 — list connected repos
│   │   │                                            # POST /api/v1/repos/connect         — connect a GitHub repo
│   │   │                                            # DELETE /api/v1/repos/{id}          — disconnect repo
│   │   │                                            # PUT  /api/v1/repos/{id}/settings   — update review settings
│   │   └── WebhookController.java                   # POST /api/v1/webhooks/github       — receive GitHub PR events
│   │
│   ├── service/                                     # --- BUSINESS LOGIC (where the magic happens) ---
│   │   ├── GeminiService.java                       # Calls Gemini API with prompt, parses AI response
│   │   ├── PromptService.java                       # Builds system + user prompts for different review types
│   │   ├── ReviewService.java                       # Orchestrates: receive code -> call AI -> save to DB -> return
│   │   ├── GitHubService.java                       # GitHub API wrapper: fetch PR files, post review comments
│   │   ├── WebhookService.java                      # Verifies webhook signature, processes PR events
│   │   ├── CommentService.java                      # Formats AI review into GitHub PR review comments
│   │   └── UserService.java                         # User CRUD, find by GitHub ID, update tokens
│   │
│   ├── entity/                                      # --- JPA ENTITIES (database tables as Java classes) ---
│   │   ├── User.java                                # @Entity: id, githubId, username, email, avatar, plan
│   │   ├── Repository.java                          # @Entity: id, userId, githubRepoId, name, fullName, isActive
│   │   ├── Review.java                              # @Entity: id, userId, repoId, score, issues(JSONB), metrics(JSONB)
│   │   └── ReviewSettings.java                      # @Entity: id, repoId, autoReview, severityThreshold, languages
│   │
│   ├── repository/                                  # --- JPA REPOSITORIES (database queries — auto-generated) ---
│   │   ├── UserRepository.java                      # findByGithubId(), existsByUsername()
│   │   ├── RepoRepository.java                      # findByUserId(), findByUserIdAndGithubRepoId()
│   │   ├── ReviewRepository.java                    # findByUserId(Pageable), countByUserId(), avgScoreByUserId()
│   │   └── ReviewSettingsRepository.java            # findByRepositoryId()
│   │
│   ├── dto/                                         # --- DATA TRANSFER OBJECTS (what goes in/out of API) ---
│   │   ├── request/
│   │   │   ├── ReviewRequest.java                   # { code, language }
│   │   │   ├── ConnectRepoRequest.java              # { githubRepoId, name, fullName }
│   │   │   └── UpdateSettingsRequest.java           # { autoReview, severityThreshold, languages[] }
│   │   └── response/
│   │       ├── ReviewResponse.java                  # { id, summary, score, issues[], securityAudit, metrics }
│   │       ├── UserResponse.java                    # { id, username, email, avatar, plan }
│   │       ├── RepoResponse.java                    # { id, name, fullName, isActive, settings }
│   │       ├── StatsResponse.java                   # { totalReviews, avgScore, criticalCount, ... }
│   │       └── PageResponse.java                    # { content[], totalPages, totalElements, currentPage }
│   │
│   ├── mapper/                                      # --- MAPPERS (convert Entity <-> DTO cleanly) ---
│   │   ├── ReviewMapper.java                        # Review entity -> ReviewResponse dto (and vice versa)
│   │   ├── UserMapper.java                          # User entity -> UserResponse dto
│   │   └── RepoMapper.java                          # Repository entity -> RepoResponse dto
│   │
│   ├── enums/                                       # --- ENUMS (type-safe constants) ---
│   │   ├── Severity.java                            # CRITICAL, HIGH, MEDIUM, LOW
│   │   ├── IssueType.java                           # BUG, SECURITY, PERFORMANCE, STYLE, BEST_PRACTICE
│   │   ├── ReviewSource.java                        # WEB, GITHUB, VSCODE
│   │   ├── RiskLevel.java                           # CRITICAL, HIGH, MEDIUM, LOW, SAFE
│   │   └── Plan.java                                # FREE, PRO, TEAM, ENTERPRISE
│   │
│   ├── security/                                    # --- SECURITY (auth, JWT, OAuth) ---
│   │   ├── JwtTokenProvider.java                    # Generate JWT token, validate token, extract userId
│   │   ├── JwtAuthFilter.java                       # Filter: reads JWT from Authorization header on every request
│   │   └── GitHubOAuth2UserService.java             # Custom OAuth2: create/update user in DB after GitHub login
│   │
│   └── exception/                                   # --- ERROR HANDLING (clean error responses) ---
│       ├── GlobalExceptionHandler.java              # @ControllerAdvice: catches ALL errors -> returns { error, message, status }
│       ├── ApiException.java                        # Custom exception with HTTP status code
│       ├── ResourceNotFoundException.java           # 404: "Review not found"
│       └── UnauthorizedException.java               # 401: "Not authenticated"
│
├── src/main/resources/
│   ├── application.yml                              # Main config (datasource, JPA, security, custom props)
│   ├── application-dev.yml                          # Dev: localhost DB, debug logging
│   ├── application-prod.yml                         # Prod: Neon DB, info logging
│   └── db/migration/                                # --- FLYWAY MIGRATIONS (versioned SQL files) ---
│       ├── V1__create_users_table.sql               # CREATE TABLE users (...)
│       ├── V2__create_repositories_table.sql        # CREATE TABLE repositories (...)
│       ├── V3__create_review_settings_table.sql     # CREATE TABLE review_settings (...)
│       ├── V4__create_reviews_table.sql             # CREATE TABLE reviews (...) with JSONB + indexes
│       └── V5__add_indexes.sql                      # CREATE INDEX for performance
│
├── src/test/java/com/{PACKAGE_NAME}/                     # --- TESTS ---
│   ├── controller/
│   │   ├── ReviewControllerTest.java                # Test API endpoints with MockMvc
│   │   └── WebhookControllerTest.java               # Test webhook signature verification
│   ├── service/
│   │   ├── GeminiServiceTest.java                   # Test AI response parsing with mock WebClient
│   │   ├── ReviewServiceTest.java                   # Test review orchestration logic
│   │   └── WebhookServiceTest.java                  # Test PR event processing
│   └── repository/
│       └── ReviewRepositoryTest.java                # Test custom queries with @DataJpaTest
│
├── pom.xml
└── Dockerfile
```

#### Step 5: application.yml Configuration
```yaml
server:
  port: 8080

spring:
  # --- DATABASE ---
  datasource:
    url: jdbc:postgresql://${DB_HOST:localhost}:5432/${DB_NAME:{DB_NAME}}
    username: ${DB_USERNAME:postgres}
    password: ${DB_PASSWORD:postgres}
    driver-class-name: org.postgresql.Driver

  jpa:
    hibernate:
      ddl-auto: validate              # Flyway handles schema — Hibernate only validates
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true

  # --- FLYWAY (database migrations) ---
  flyway:
    enabled: true
    locations: classpath:db/migration   # SQL files in src/main/resources/db/migration/

  # --- GITHUB OAuth2 ---
  security:
    oauth2:
      client:
        registration:
          github:
            client-id: ${GITHUB_CLIENT_ID}
            client-secret: ${GITHUB_CLIENT_SECRET}
            scope: read:user,user:email,repo

# --- CUSTOM PROPERTIES ---
app:
  gemini:
    api-key: ${GEMINI_API_KEY}
    model: gemini-2.0-flash
  github:
    app-id: ${GITHUB_APP_ID}
    private-key: ${GITHUB_PRIVATE_KEY}
    webhook-secret: ${GITHUB_WEBHOOK_SECRET}
  jwt:
    secret: ${JWT_SECRET}
    expiration: 86400000               # 24 hours in milliseconds
  cors:
    allowed-origins: ${FRONTEND_URL:http://localhost:4200}

# --- API DOCS ---
springdoc:
  api-docs:
    path: /api-docs
  swagger-ui:
    path: /swagger-ui
```

#### Step 6: Webhook Flow (How Auto-Review Works)
```
Developer opens PR on GitHub
        |
        v
GitHub sends webhook POST to Spring Boot backend
  (POST /api/v1/webhooks/github with X-Hub-Signature-256 header)
        |
        v
WebhookController receives event
  1. Verifies webhook signature (HMAC-SHA256) — prevents fake requests
  2. Checks event type = "pull_request"
  3. Checks action = "opened" or "synchronize" (new PR or new commits pushed)
        |
        v
WebhookService processes the PR event
  1. Finds the connected repository in database
  2. Checks if auto-review is enabled in ReviewSettings
  3. Checks language filter (only review configured languages)
        |
        v
GitHubService fetches PR details
  1. GET /repos/{owner}/{repo}/pulls/{number}/files — list changed files
  2. For each file: GET raw content via download_url
  3. Combines file diffs into reviewable chunks
        |
        v
GeminiService analyzes each file
  1. Builds prompt with file content + language
  2. Calls Gemini API for each changed file
  3. Parses JSON response into ReviewResponse
        |
        v
CommentService posts review on GitHub PR
  1. Creates a PR review via GitHub API
  2. Posts inline comments on specific lines where issues found
  3. Sets review status: APPROVE (score > 80), REQUEST_CHANGES (score < 60), COMMENT (60-80)
        |
        v
ReviewService saves to database
  1. Saves full review to PostgreSQL (reviews table)
  2. Updates repository stats
        |
        v
Developer sees AI review comments on their PR!
```

#### Step 7: Angular Frontend Updates for Phase 2
```
New Angular components to add:
├── features/
│   ├── auth/
│   │   ├── login/
│   │   │   └── login.component.ts                    # "Sign in with GitHub" button
│   │   └── callback/
│   │       └── callback.component.ts                 # Handles OAuth redirect, saves JWT
│   ├── repositories/
│   │   ├── repo-list/
│   │   │   └── repo-list.component.ts                # List connected repos with status badges
│   │   ├── repo-connect/
│   │   │   └── repo-connect.component.ts             # Search & connect GitHub repos
│   │   └── repo-settings/
│   │       └── repo-settings.component.ts            # Configure auto-review, languages, severity
│   ├── pr-reviews/
│   │   ├── pr-review-list/
│   │   │   └── pr-review-list.component.ts           # All PR reviews for a repo (paginated)
│   │   └── pr-review-detail/
│   │       └── pr-review-detail.component.ts         # Full review detail with inline comments
│   └── settings/
│       └── settings.component.ts                     # User profile, plan, preferences

Update existing:
├── core/
│   ├── services/
│   │   ├── auth.service.ts                           # Login, logout, get current user, JWT storage
│   │   └── repo.service.ts                           # CRUD for repositories
│   ├── interceptors/
│   │   └── auth.interceptor.ts                       # Attach JWT token to all API requests
│   └── guards/
│       └── auth.guard.ts                             # Redirect to login if not authenticated
```

#### Step 8: Deploy Phase 2
```bash
# Angular frontend -> Vercel (same as Phase 1)
ng build --configuration=production
npx vercel deploy

# Spring Boot backend -> Railway
# Set environment variables in Railway dashboard:
#   DB_HOST, DB_USERNAME, DB_PASSWORD, DB_NAME
#   GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
#   GITHUB_APP_ID, GITHUB_PRIVATE_KEY, GITHUB_WEBHOOK_SECRET
#   GEMINI_API_KEY, JWT_SECRET, FRONTEND_URL

# PostgreSQL -> Neon (free)
# Create database at https://neon.tech
# Copy connection string -> set as DB_HOST in Railway
```

### Environment Variables (All Phase 2)
```
# Database (Neon PostgreSQL)
DB_HOST=your-neon-host.neon.tech
DB_NAME={DB_NAME}
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password

# GitHub OAuth
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret

# GitHub App (Bot)
GITHUB_APP_ID=your_app_id
GITHUB_PRIVATE_KEY=your_private_key
GITHUB_WEBHOOK_SECRET=your_webhook_secret

# AI
GEMINI_API_KEY=your_gemini_key

# JWT Authentication
JWT_SECRET=your_jwt_secret

# App URLs
FRONTEND_URL=https://{FRONTEND_DOMAIN}
```

### Phase 2 Deliverables
- [ ] Spring Boot full backend with REST APIs (versioned: /api/v1/)
- [ ] Flyway database migrations (safe schema versioning)
- [ ] GitHub OAuth2 login via Spring Security
- [ ] JWT authentication with interceptors
- [ ] Repository connection & management
- [ ] GitHub App with webhook listener
- [ ] Webhook signature verification (HMAC-SHA256)
- [ ] Automatic PR review on new PRs
- [ ] Inline review comments on PR diffs
- [ ] Paginated review history with filters
- [ ] Review settings & rules configuration per repo
- [ ] Dashboard stats (total reviews, avg score, etc.)
- [ ] Mapper layer (Entity <-> DTO)
- [ ] Enum types (Severity, IssueType, ReviewSource)
- [ ] Global error handling (@ControllerAdvice)
- [ ] Swagger API docs at /swagger-ui
- [ ] Unit + Integration tests
- [ ] Backend deployed on Railway
- [ ] PostgreSQL database on Neon (free)

### Estimated Timeline: 2-3 weeks

---

## Phase 3: VS Code Extension

### Overview
A VS Code Extension that provides real-time AI-powered code review directly inside the editor. Developers can review files, get inline warnings, and fix issues without leaving VS Code.

### Features
- Right-click any file -> "Review with {PRODUCT_NAME}"
- Inline diagnostics (yellow/red squiggles for issues)
- Quick fix suggestions (lightbulb icon)
- Security scan on file save (optional)
- Side panel with full review report
- Status bar showing code health score
- Settings for severity thresholds & languages
- Integration with {PRODUCT_NAME} web account (sync history via Spring Boot API)

### Setup

#### Step 1: Scaffold Extension
```bash
npm install -g yo generator-code
yo code
# Select: New Extension (TypeScript)
# Name: {FOLDER_NAME}
# Identifier: {VSCODE_EXT_ID}
# Description: AI-powered code reviewer & security auditor
```

#### Step 2: Extension Folder Structure
```
{FOLDER_NAME}-vscode/
├── src/
│   ├── extension.ts                   # Main entry point — registers all commands, providers, views
│   │
│   ├── commands/                      # --- USER COMMANDS (triggered from command palette or right-click) ---
│   │   ├── reviewFile.ts              # "{PRODUCT_NAME}: Review This File" — sends full file to AI
│   │   ├── reviewSelection.ts         # "{PRODUCT_NAME}: Review Selection" — sends highlighted code to AI
│   │   └── reviewWorkspace.ts         # "{PRODUCT_NAME}: Scan Workspace" — reviews all files in project
│   │
│   ├── providers/                     # --- VS CODE PROVIDERS (integrate with editor features) ---
│   │   ├── diagnosticProvider.ts      # Creates yellow/red squiggles on lines with issues
│   │   ├── codeActionProvider.ts      # Shows lightbulb icon with "Apply AI Fix" option
│   │   ├── hoverProvider.ts           # Shows issue description when hovering over squiggly line
│   │   └── sidebarProvider.ts         # Full review report in a custom sidebar panel
│   │
│   ├── services/                      # --- API & LOGIC ---
│   │   ├── geminiService.ts           # Direct Gemini API calls (uses user's own API key)
│   │   ├── backendService.ts          # Calls Spring Boot API (if user is logged in — syncs history)
│   │   ├── reviewEngine.ts            # Parses AI response -> converts to VS Code diagnostics
│   │   └── cacheService.ts            # Caches review results per file (avoids re-reviewing unchanged files)
│   │
│   ├── views/                         # --- WEBVIEW (sidebar HTML/CSS/JS) ---
│   │   └── sidebar/
│   │       ├── index.html             # Sidebar webview layout
│   │       ├── style.css              # Sidebar styling (matches VS Code theme)
│   │       └── script.js              # Sidebar interactivity (expand/collapse issues)
│   │
│   └── utils/
│       ├── config.ts                  # Read extension settings (API key, backend URL, etc.)
│       └── constants.ts               # Prompt templates, severity colors, etc.
│
├── package.json                       # Extension manifest (commands, menus, settings, views)
├── tsconfig.json
└── README.md                          # Marketplace listing (features, screenshots, install guide)
```

#### Step 3: Extension Manifest (package.json) Key Parts
```json
{
  "contributes": {
    "commands": [
      {
        "command": "{VSCODE_EXT_ID}.reviewFile",
        "title": "{PRODUCT_NAME}: Review This File"
      },
      {
        "command": "{VSCODE_EXT_ID}.reviewSelection",
        "title": "{PRODUCT_NAME}: Review Selection"
      },
      {
        "command": "{VSCODE_EXT_ID}.scanWorkspace",
        "title": "{PRODUCT_NAME}: Scan Workspace"
      }
    ],
    "menus": {
      "editor/context": [
        {
          "command": "{VSCODE_EXT_ID}.reviewFile",
          "group": "{VSCODE_EXT_ID}"
        },
        {
          "command": "{VSCODE_EXT_ID}.reviewSelection",
          "group": "{VSCODE_EXT_ID}",
          "when": "editorHasSelection"
        }
      ]
    },
    "configuration": {
      "title": "{PRODUCT_NAME}",
      "properties": {
        "{VSCODE_EXT_ID}.apiKey": {
          "type": "string",
          "description": "Your Gemini API Key (get free at https://aistudio.google.com/apikey)"
        },
        "{VSCODE_EXT_ID}.backendUrl": {
          "type": "string",
          "default": "https://{BACKEND_DOMAIN}",
          "description": "{PRODUCT_NAME} Backend URL (for syncing reviews to web dashboard)"
        },
        "{VSCODE_EXT_ID}.reviewOnSave": {
          "type": "boolean",
          "default": false,
          "description": "Automatically review files when you save them"
        },
        "{VSCODE_EXT_ID}.severityThreshold": {
          "type": "string",
          "enum": ["low", "medium", "high", "critical"],
          "default": "medium",
          "description": "Only show issues at or above this severity level"
        }
      }
    },
    "viewsContainers": {
      "activitybar": [
        {
          "id": "{VSCODE_EXT_ID}-sidebar",
          "title": "{PRODUCT_NAME}",
          "icon": "resources/icon.svg"
        }
      ]
    }
  }
}
```

#### Step 4: Core Flow
```
User right-clicks file -> "Review with {PRODUCT_NAME}"
        |
        v
Extension reads file content + detects language
        |
        v
Sends code to Gemini API (direct — uses user's API key from settings)
  OR sends to Spring Boot API (if user is logged in — for history sync)
        |
        v
AI returns JSON review response
        |
        v
reviewEngine.ts parses response into VS Code diagnostics
        |
        v
diagnosticProvider creates squiggles on affected lines:
  - Red squiggle = Critical/High severity
  - Yellow squiggle = Medium severity
  - Blue squiggle = Low severity
        |
        v
User hovers on squiggle -> hoverProvider shows:
  "CRITICAL: SQL Injection on line 15
   User input is directly concatenated into SQL query..."
        |
        v
User clicks lightbulb (Quick Fix) -> codeActionProvider shows:
  "Apply AI Fix: Use parameterized queries"
        |
        v
User clicks "Apply Fix" -> VS Code replaces code with fixed version
        |
        v
sidebarProvider shows full report:
  Score, all issues, security audit, export options
        |
        v
(Optional) If logged in -> backendService syncs review to web dashboard
```

#### Step 5: Publish to VS Code Marketplace
```bash
# Install publishing tool
npm install -g @vscode/vsce

# Create publisher account at:
# https://marketplace.visualstudio.com/manage
# (requires free Azure DevOps account: https://dev.azure.com)

# Package the extension into .vsix file
vsce package

# Publish to marketplace
vsce publish
```

### Phase 3 Deliverables
- [ ] VS Code extension scaffolded with TypeScript
- [ ] "Review File" command (full file review)
- [ ] "Review Selection" command (review highlighted code)
- [ ] "Scan Workspace" command (review all files)
- [ ] Inline diagnostics (red/yellow/blue squiggles)
- [ ] Quick fix code actions (lightbulb -> apply AI fix)
- [ ] Hover provider (show issue details on hover)
- [ ] Sidebar panel with full review report
- [ ] Status bar health score indicator
- [ ] Extension settings (API key, severity, auto-review)
- [ ] File-level caching (skip unchanged files)
- [ ] Review on save (optional auto-review)
- [ ] Sync with web dashboard via Spring Boot API
- [ ] Published on VS Code Marketplace

### Estimated Timeline: 2-3 weeks

---

## Database Schema (Phase 2+ | PostgreSQL)

### Entity-Relationship Diagram
```
users (1) ────────< (many) repositories
  |                         |
  |                         └── (1) review_settings
  |
  └────────< (many) reviews >────────── (many) repositories
```

### Flyway Migration: V1__create_users_table.sql
```sql
-- Users who sign in via GitHub OAuth
CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    github_id       BIGINT UNIQUE NOT NULL,          -- GitHub user ID (unique identifier)
    username        VARCHAR(100) NOT NULL,            -- GitHub username
    email           VARCHAR(255),                     -- GitHub email (can be null if private)
    avatar_url      VARCHAR(500),                     -- GitHub profile picture URL
    access_token    VARCHAR(500),                     -- Encrypted GitHub access token
    plan            VARCHAR(20) DEFAULT 'FREE',       -- FREE, PRO, TEAM, ENTERPRISE
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index: quickly find user by GitHub ID during OAuth login
CREATE INDEX idx_users_github_id ON users(github_id);
```

### Flyway Migration: V2__create_repositories_table.sql
```sql
-- GitHub repositories connected to {PRODUCT_NAME}
CREATE TABLE repositories (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    github_repo_id  BIGINT NOT NULL,                  -- GitHub repository ID
    name            VARCHAR(255) NOT NULL,            -- Repo name: "my-project"
    full_name       VARCHAR(500) NOT NULL,            -- Full name: "rutik/my-project"
    is_active       BOOLEAN DEFAULT true,             -- Is auto-review enabled?
    connected_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Prevent connecting same repo twice
    CONSTRAINT uk_user_repo UNIQUE (user_id, github_repo_id)
);

-- Index: quickly list all repos for a user
CREATE INDEX idx_repositories_user_id ON repositories(user_id);
```

### Flyway Migration: V3__create_review_settings_table.sql
```sql
-- Review configuration per repository
CREATE TABLE review_settings (
    id                  BIGSERIAL PRIMARY KEY,
    repository_id       BIGINT UNIQUE NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    auto_review         BOOLEAN DEFAULT true,              -- Auto-review new PRs?
    severity_threshold  VARCHAR(20) DEFAULT 'MEDIUM',      -- Minimum severity to report
    languages           TEXT[] DEFAULT '{}',                -- Languages to review: {"javascript","python"}
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Flyway Migration: V4__create_reviews_table.sql
```sql
-- Code reviews (from web app, GitHub PRs, or VS Code extension)
CREATE TABLE reviews (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT REFERENCES users(id) ON DELETE CASCADE,
    repository_id   BIGINT REFERENCES repositories(id) ON DELETE SET NULL,
    pr_number       INTEGER,                               -- PR number (null for web/vscode reviews)
    pr_title        VARCHAR(500),                          -- PR title (null for web/vscode reviews)
    code_snippet    TEXT,                                   -- Original code (for web reviews)
    language        VARCHAR(50) NOT NULL,                   -- Programming language
    score           INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),  -- Quality score 0-100
    issues          JSONB NOT NULL DEFAULT '[]',           -- Full issues array as JSONB
    security_audit  JSONB DEFAULT '{}',                    -- Security findings as JSONB
    metrics         JSONB NOT NULL DEFAULT '{}',           -- { totalIssues, critical, high, medium, low }
    source          VARCHAR(20) NOT NULL DEFAULT 'WEB',    -- WEB, GITHUB, VSCODE
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Flyway Migration: V5__add_indexes.sql
```sql
-- Performance indexes for common queries

-- Dashboard: list reviews for a user (newest first)
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);

-- Repo page: list reviews for a specific repository
CREATE INDEX idx_reviews_repository_id ON reviews(repository_id);

-- Stats: filter by source (web vs github vs vscode)
CREATE INDEX idx_reviews_source ON reviews(source);

-- Search: query inside JSONB issues (e.g., find all critical security issues)
CREATE INDEX idx_reviews_issues ON reviews USING GIN(issues);

-- Composite: user's reviews by date (most common dashboard query)
CREATE INDEX idx_reviews_user_created ON reviews(user_id, created_at DESC);
```

### Spring Data JPA Entity Example
```java
/**
 * Review entity — maps to the "reviews" table in PostgreSQL.
 *
 * Stores the complete AI review including:
 * - Code quality score (0-100)
 * - Issues found (stored as JSONB for flexible schema)
 * - Security audit results
 * - Metrics summary
 *
 * Reviews can come from 3 sources: WEB (paste code), GITHUB (PR review), VSCODE (extension)
 */
@Entity
@Table(name = "reviews")
@Getter @Setter                         // Lombok: auto-generates getters and setters
@NoArgsConstructor                      // Lombok: auto-generates empty constructor
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)  // Load user only when accessed (performance)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "repository_id")
    private Repository repository;

    private Integer prNumber;           // Null for web/vscode reviews
    private String prTitle;             // Null for web/vscode reviews

    @Column(columnDefinition = "TEXT")
    private String codeSnippet;         // Original code (for web reviews)

    @Column(nullable = false)
    private String language;            // "javascript", "python", "java", etc.

    @Column(nullable = false)
    private Integer score;              // 0-100 quality score

    @Column(columnDefinition = "jsonb", nullable = false)
    private String issues;              // JSONB: [{type, severity, line, title, ...}]

    @Column(columnDefinition = "jsonb")
    private String securityAudit;       // JSONB: {vulnerabilities[], riskLevel, recommendations[]}

    @Column(columnDefinition = "jsonb", nullable = false)
    private String metrics;             // JSONB: {totalIssues, critical, high, medium, low}

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReviewSource source;        // WEB, GITHUB, VSCODE (enum, not string)

    @CreationTimestamp
    private LocalDateTime createdAt;
}
```

---

## Testing Strategy

### Backend Testing (Spring Boot)

| Test Type | Tool | What to Test | Example |
|-----------|------|-------------|---------|
| Unit Tests | JUnit 5 + Mockito | Services, mappers, utils | GeminiService parses AI response correctly |
| Integration Tests | @SpringBootTest + TestContainers | Controllers + DB | POST /api/v1/review returns 200 with valid review |
| Repository Tests | @DataJpaTest | Custom JPA queries | findByUserIdOrderByCreatedAtDesc returns correct results |
| API Tests | MockMvc | REST endpoints | Webhook with invalid signature returns 401 |

### Frontend Testing (Angular)

| Test Type | Tool | What to Test | Example |
|-----------|------|-------------|---------|
| Unit Tests | Jasmine + Karma | Services, pipes, utils | GeminiService calls correct backend URL |
| Component Tests | Angular Testing Library | Components render correctly | ReviewPanel shows all issues from mock data |
| E2E Tests | Cypress (optional) | Full user flows | User pastes code -> clicks review -> sees results |

### What to Test First (Priority)
1. GeminiService — AI response parsing (most critical, most likely to break)
2. ReviewController — API input validation
3. WebhookController — Signature verification (security-critical)
4. ReviewMapper — Entity <-> DTO conversion
5. Angular GeminiService — correct API calls

---

## Deployment Guide

### Phase 1 (Angular + Spring Boot Proxy)
```
Vercel (FREE)
├── Frontend: Angular production build
├── Environment: (none — API key is on backend)
└── Domain: {FRONTEND_DOMAIN}

Railway (FREE tier)
├── Backend: Spring Boot 4.0.4 (Java 21) — proxy for Gemini API
├── Environment: GEMINI_API_KEY, FRONTEND_URL
└��─ Domain: {BACKEND_DOMAIN}
```

### Phase 2 (Angular + Spring Boot + PostgreSQL)
```
Vercel (FREE)
├── Frontend: Angular production build
└── Domain: {FRONTEND_DOMAIN}

Railway (FREE tier)
├── Backend: Spring Boot 4.0.4 (Java 21) JAR / Docker
├── Environment: All env variables (see Phase 2 section)
└── Domain: {BACKEND_DOMAIN}

Neon PostgreSQL (FREE - 0.5GB)
├── Database: {DB_NAME}
├── Tables: users, repositories, review_settings, reviews
└── Connection: pooled connection string from Neon dashboard
```

### Phase 3 (Extension)
```
VS Code Marketplace (FREE)
├── Extension: {VSCODE_EXT_ID}
└── Publisher: your-publisher-name
```

### Dockerfile for Spring Boot (Railway Deployment)
```dockerfile
# Stage 1: Build the JAR file
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY . .
RUN ./mvnw clean package -DskipTests

# Stage 2: Run the JAR (smaller image — no JDK, only JRE)
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

---

## Monetization Strategy (Future Scope)

### Pricing Tiers

| Plan       | Price      | Features                                       |
|-----------|------------|------------------------------------------------|
| Free       | $0/month   | 10 reviews/day, web app only                   |
| Pro        | $9/month   | Unlimited reviews, GitHub integration, 5 repos |
| Team       | $19/user   | Unlimited repos, team dashboard, priority       |
| Enterprise | Custom     | Self-hosted, custom rules, SSO, SLA            |

### Revenue Streams
1. SaaS subscriptions (main revenue)
2. VS Code Extension premium features
3. API access for CI/CD integration
4. Custom security rules marketplace

---

## Summary: Complete API Checklist

| Phase | API/Service              | Cost | Status |
|-------|--------------------------|------|--------|
| 1     | Google Gemini API        | FREE | Required |
| 1     | Railway (backend proxy)  | FREE | Required |
| 1     | Vercel (frontend)        | FREE | Required |
| 2     | GitHub OAuth App         | FREE | Required |
| 2     | GitHub App (Bot)         | FREE | Required |
| 2     | GitHub REST API          | FREE | Required |
| 2     | PostgreSQL (Neon)        | FREE | Required |
| 2     | Railway (full backend)   | FREE | Required |
| 3     | VS Code Extension API    | FREE | Required |
| 3     | VS Code Marketplace      | FREE | Required |
| 3     | Azure DevOps Publisher   | FREE | Required |
| ALL   | Stripe (payments)        | 2.9% | Future scope |
| ALL   | Claude/OpenAI API        | Paid | Future scope |
| ALL   | Sentry (monitoring)      | FREE | Future scope |
| ALL   | Redis (caching)          | FREE | Future scope |

### Total Cost to Build & Launch All 3 Phases: $0

---

## Next Steps

1. Get your free Gemini API key from https://aistudio.google.com/apikey
2. Start Phase 1 — Build Angular frontend + Spring Boot proxy backend
3. Deploy: Angular on Vercel, Spring Boot on Railway
4. Add to your portfolio
5. Expand to Phase 2 (full backend + GitHub Integration + PostgreSQL)
6. Expand to Phase 3 (VS Code Extension)

---

*Documentation created by Rutik*
*Project: {PRODUCT_NAME} — AI Code Reviewer & Security Auditor*
*Tech Stack: Angular 17+ | Spring Boot 4.0.4 | Java 21 | PostgreSQL | Google Gemini API*
*Brand Options: CodeShield AI (codeshield.ai) | CodeSentry (codesentry.ai) | AuditLens (auditlens.dev)*
*Last updated: March 2026*
