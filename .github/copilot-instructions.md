# Uranai App - Fortune Telling Application

Uranai App is a Next.js fortune-telling application with numerology, tarot, and Mayan calendar features. Built with TypeScript, Tailwind CSS, and designed to integrate with Supabase (PostgreSQL) and OpenAI API for AI-generated fortune text.

**ALWAYS reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

## Working Effectively

### Bootstrap and Build
- Install dependencies: `npm install` -- takes ~8 seconds
- Start development server: `npm run dev` -- starts in ~1 second, runs on http://localhost:3000
- Build for production: `npm run build` -- takes ~15 seconds. NEVER CANCEL. Set timeout to 60+ seconds
- Start production server: `npm run start` -- starts in ~1 second after build
- Lint code: `npm run lint` -- takes ~2 seconds

### Docker Setup (Optional)
- Copy environment file: `cp .env.example .env`
- Build Docker image: `docker compose build` -- takes ~90 seconds. NEVER CANCEL. Set timeout to 120+ seconds
- **WARNING**: Docker Compose may fail with SWC binary issues in Alpine containers. If you see "failed-loading-swc" errors, use the npm commands directly instead
- Run with Docker: `docker compose up` -- starts PostgreSQL database and Next.js app

### Environment Setup
- Node.js version: 20.x (verified working)
- Package manager: npm (not yarn or pnpm)
- The app uses Turbopack for faster builds (Next.js 15.5.2 feature)

## Validation

### ALWAYS run through these validation steps after making changes:
1. **Build validation**: Run `npm run build` and ensure it completes without errors
2. **Lint validation**: Run `npm run lint` and fix any issues
3. **Runtime validation**: Start `npm run dev` and navigate to http://localhost:3000
4. **Manual testing**: Verify the Next.js welcome page loads with "Uranai App - Fortune Telling" title
5. **Production validation**: Run `npm run build && npm run start` and test production mode

### User Scenario Testing
- **Basic functionality**: Navigate to http://localhost:3000 and verify the Next.js default page loads
- **Visual verification**: The page should display "Get started by editing src/app/page.tsx" with Next.js logo
- **Title verification**: Browser tab should show "Uranai App - Fortune Telling"
- **Development workflow**: Make a small change to `src/app/page.tsx` and verify hot reload works
- **Build process**: Ensure production build generates static pages successfully

## Common Tasks

### Repository Structure
```
uranai-app/
├── .env.example              # Environment variables template
├── .github/                  # GitHub configuration
├── development_notes.md      # Japanese documentation about app concept
├── docker-compose.yml        # Docker setup with PostgreSQL
├── Dockerfile               # Node.js container definition
├── src/app/                 # Next.js App Router pages
│   ├── page.tsx            # Main page
│   ├── layout.tsx          # Root layout
│   └── globals.css         # Global styles
├── public/                  # Static assets
├── package.json            # Dependencies and scripts
└── tsconfig.json           # TypeScript configuration
```

### Package.json Scripts
```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build --turbopack", 
    "start": "next start",
    "lint": "eslint"
  }
}
```

### Key Dependencies
- Next.js 15.5.2 with Turbopack
- React 19.1.0
- TypeScript 5.x
- Tailwind CSS 4.x
- ESLint with Next.js configuration

### Environment Variables (.env)
```
# Database configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=uranai_app

# Supabase (when used instead of local Postgres)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# OpenAI API for fortune text generation
OPENAI_API_KEY=

# Development port (optional)
PORT=3000
```

## Troubleshooting

### Build Issues
- **Font loading errors**: Google Fonts access may be blocked. The default fonts have been removed from layout.tsx
- **Turbopack warnings**: Network-related warnings during build are normal in restricted environments

### Docker Issues  
- **SWC binary errors**: Alpine containers may have library compatibility issues. Use npm commands directly instead
- **Port conflicts**: Ensure port 3000 is available or change PORT environment variable

### Development Workflow
- **Hot reload not working**: Restart `npm run dev` if file changes aren't detected
- **Build cache issues**: Delete `.next` directory if builds behave unexpectedly
- **Type errors**: Run `npm run lint` to catch TypeScript issues early

## Future Development Notes

Based on development_notes.md, the planned features include:
- **Numerology**: Calculate life path numbers from birth dates and names
- **Tarot**: Card shuffle and meaning interpretation with AI-generated readings
- **Mayan Calendar**: Convert dates to Mayan calendar system (KIN numbers, glyphs)
- **User Authentication**: Supabase Auth or Firebase Authentication
- **Data Storage**: User reading history and personal notes
- **AI Integration**: OpenAI API for personalized fortune text generation

## Performance Expectations

- Development server startup: ~1 second
- Production build: ~15 seconds (NEVER CANCEL - allow 60+ second timeout)
- Lint check: ~2 seconds  
- Docker build: ~90 seconds (NEVER CANCEL - allow 120+ second timeout)
- Production server startup: ~1 second

**CRITICAL**: Do not cancel long-running operations. Build processes may vary in different environments but should complete within the specified timeouts.