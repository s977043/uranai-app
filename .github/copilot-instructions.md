# Uranai Fortune Telling App

Uranai is a Next.js fortune telling application featuring numerology, tarot, and Mayan calendar functionality. The app uses TypeScript, Tailwind CSS, and is designed for deployment as both a web application and Progressive Web App (PWA).

**ALWAYS reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the information here.**

## Working Effectively

### Initial Setup and Dependencies
- **Node.js Version**: Requires Node.js 20.19.5+ and npm 10.8.2+
- **Install dependencies**: `npm install` -- takes 12-30 seconds (depends on cache). ALWAYS run this first in a fresh environment.
- **Copy environment file**: `cp .env.example .env` -- configure environment variables for development

### Development Workflow  
- **Start development server**: `npm run dev` -- starts in ~1.3 seconds. Server runs on `http://localhost:3000`
- **Build production**: `npm run build` -- takes 18-20 seconds. NEVER CANCEL - set timeout to 120+ seconds
- **Start production server**: `npm run start` -- starts in ~0.6 seconds after successful build (must run build first)
- **Lint code**: `npm run lint` -- runs in ~1.5 seconds, always check before committing (may show warnings, not errors)

### Docker Development (Alternative - HAS KNOWN ISSUES)
- **Start with Docker**: `docker compose up -d` -- NEVER CANCEL: takes 86-90 seconds for initial build, 3-5 seconds for restart
- **Stop Docker**: `docker compose down` -- stops all services and cleans up
- **View Docker logs**: `docker compose logs web --tail 10` -- check application status
- **Note**: Docker setup includes PostgreSQL database service automatically
- **IMPORTANT**: Docker web container may fail with SWC binary issues in restricted environments. Use local development instead.

### Build Times and Timeouts (NEVER CANCEL - ALWAYS WAIT FOR COMPLETION)
- **npm install**: 12-30 seconds (set timeout: 120 seconds)
- **npm run build**: 18-20 seconds (set timeout: 120 seconds) 
- **npm run dev startup**: ~1.3 seconds (set timeout: 30 seconds)
- **npm run start**: ~0.6 seconds (set timeout: 30 seconds)
- **npm run lint**: ~1.5 seconds (set timeout: 30 seconds)
- **Docker compose up (initial)**: 86-90 seconds (set timeout: 180 seconds) - NEVER CANCEL
- **Docker compose up (restart)**: 3-5 seconds (set timeout: 30 seconds)

### Critical Build Notes
- **NEVER CANCEL builds or Docker operations** - they take 1-2 minutes but will complete successfully
- Build may show warnings about fonts, telemetry, or SWC - these are normal and non-blocking
- If build fails, check that all required dependencies are installed with `npm install`
- Always run `npm run build` before `npm run start` for production testing
- Docker may have issues in restricted environments - prefer local development

## Validation and Testing

### Manual Validation Requirements
After making changes, ALWAYS perform these validation steps:

1. **Dependency check**: `npm install` -- ensure all dependencies are current
2. **Lint check**: `npm run lint` -- must pass (warnings OK, errors must be fixed)
3. **Build test**: `npm run build` -- must complete successfully 
4. **Development server test**: Start `npm run dev` and verify it loads at `http://localhost:3000`
5. **Production test**: Run `npm run start` after build and verify it starts correctly

### User Scenario Testing
When making functional changes, test these scenarios:
- **Homepage load**: Navigate to `http://localhost:3000` and verify the fortune telling app loads with title "Uranai Fortune Telling App"
- **Basic UI**: Confirm Tailwind CSS styling is applied correctly (responsive layout, typography)
- **Environment variables**: Verify `.env` file is loaded (check for environment indicator in Next.js logs)
- **Page navigation**: Verify all routes load correctly and show appropriate content

### Docker Validation (If Used - Not Recommended Due to Known Issues)
- **Container status**: `docker compose ps` -- db container should be running, web may fail
- **Application logs**: `docker compose logs web` -- may show SWC binary errors (known issue)
- **Database connectivity**: Database container should start without errors
- **Fallback**: If Docker web fails, use local development with `npm run dev`

## Common Tasks and Troubleshooting

### Repository Structure
```
uranai-app/
├── .github/                 # GitHub workflows and Copilot instructions
│   └── copilot-instructions.md
├── app/                     # Next.js App Router pages and components
│   ├── page.tsx            # Homepage component
│   ├── layout.tsx          # Root layout with metadata
│   └── globals.css         # Global Tailwind CSS styles
├── node_modules/           # Dependencies (auto-generated, gitignored)
├── .next/                  # Build output (auto-generated, gitignored)
├── .env                    # Environment variables (copy from .env.example)
├── .env.example            # Environment variable template
├── package.json            # Dependencies and scripts
├── package-lock.json       # Dependency lock file
├── tsconfig.json           # TypeScript configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── postcss.config.mjs      # PostCSS/Tailwind build configuration
├── eslint.config.mjs       # ESLint configuration
├── next.config.ts          # Next.js configuration
├── Dockerfile              # Docker development container
├── docker-compose.yml      # Docker services (web + PostgreSQL)
├── development_notes.md    # Japanese documentation about project goals
└── README.md               # Project overview
```

### Key Configuration Files
- **package.json**: Contains all npm scripts and dependencies. Main scripts: `dev`, `build`, `start`, `lint`
- **tsconfig.json**: TypeScript compiler configuration for Next.js App Router
- **tailwind.config.ts**: Tailwind CSS configuration with content paths for proper purging
- **postcss.config.mjs**: PostCSS setup for `@tailwindcss/postcss` and `autoprefixer` processing
- **eslint.config.mjs**: ESLint configuration for Next.js/TypeScript with proper ignores
- **next.config.ts**: Next.js application configuration (minimal setup)

### Environment Variables
Required variables in `.env`:
- `POSTGRES_USER`: Database user (default: postgres)  
- `POSTGRES_PASSWORD`: Database password (default: postgres)
- `POSTGRES_DB`: Database name (default: uranai_app)
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase URL (optional, for external DB)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon key (optional)
- `OPENAI_API_KEY`: OpenAI API key (optional, for AI-generated content)
- `PORT`: Application port (default: 3000)

### Dependency Management
- **Add new dependency**: `npm install <package>` -- updates package.json and package-lock.json
- **Add dev dependency**: `npm install --save-dev <package>`
- **Update dependencies**: `npm update` -- updates within semver ranges
- **Install specific version**: `npm install <package>@<version>`
- **Key dependencies**: `next` (15.5.2), `react` (19.1.0), `tailwindcss` (v4), `@tailwindcss/postcss`, `autoprefixer`

### Common Issues and Solutions

**Build fails with PostCSS errors:**
- Ensure `@tailwindcss/postcss` and `autoprefixer` are installed: `npm install @tailwindcss/postcss autoprefixer`
- Check `postcss.config.mjs` uses `@tailwindcss/postcss` (not `tailwindcss` directly)

**Development server permission errors:**
- Clean build directory: `sudo rm -rf .next` then rebuild with `npm run build`
- Check file permissions on project directory

**"Production build not found" error:**
- Always run `npm run build` before `npm run start`
- Check that `.next` directory exists after build

**Docker build timeouts or failures:**
- Set longer timeout values (180+ seconds) for initial Docker builds
- Never cancel Docker builds - they will complete successfully
- If Docker web container fails with SWC errors, use local development instead
- Check Docker is running: `docker --version`

**Lint warnings (non-blocking):**
- Lint may show warnings about anonymous default exports - these are normal
- Focus on fixing errors, warnings can often be left as-is
- Run `npm run lint` to see specific issues

**Environment variables not loading:**
- Verify `.env` file exists (copy from `.env.example`)
- Restart development server after changing `.env`
- Check variables are prefixed with `NEXT_PUBLIC_` for client-side access

**Dependency installation issues:**
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and `package-lock.json`, then run `npm install`
- Check Node.js version compatibility (requires 20.19.5+)

### Technology Stack Details
- **Frontend**: Next.js 15.5.2 with App Router, TypeScript, React 19.1.0
- **Styling**: Tailwind CSS v4 with PostCSS processing, responsive design
- **Database**: PostgreSQL 15 (via Docker) or Supabase (optional)
- **AI Integration**: OpenAI API for generated content (planned)
- **Development**: Docker Compose for local development environment (has known issues)
- **Linting**: ESLint with Next.js configuration
- **Deployment**: Designed for Vercel or similar platforms

### Future Development Notes
Based on `development_notes.md`, the application will implement:
1. **Numerology**: Life path number calculations from birth dates/names
2. **Tarot Reading**: Card shuffling and interpretation with AI-generated descriptions  
3. **Mayan Calendar**: KIN number and glyph calculations from dates
4. **User Authentication**: Save readings and personal journal entries
5. **PWA Support**: Offline functionality and mobile app-like experience

Always check the development notes for context about feature requirements and Japanese documentation about the project's goals and technical decisions.

### Recommended Development Workflow
1. Start with `npm install` to ensure dependencies
2. Copy `.env.example` to `.env` 
3. Use `npm run dev` for development (prefer over Docker due to known issues)
4. Run `npm run lint` before making commits
5. Test builds with `npm run build` and `npm run start`
6. Make incremental changes and test frequently