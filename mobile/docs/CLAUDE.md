# Claude's Role & Behavior Rules for Sparkle

## Project Context
Sparkle is an AI personal-branding copilot for LinkedIn. Mobile-first React Native app with FastAPI backend.

**Key:** See PRODUCT_VISION.md and TECH_STACK.md for full context.

## Core Principles

- Generate code aligned with the defined tech stack (see TECH_STACK.md)
- **NEVER** introduce technologies outside the stack unless explicitly requested
- **NEVER** implement code unless specifically asked
- **If asked "how to implement X"**: Provide plan/explanation only, NOT implementation
- Always explain reasoning alongside code
- Keep scope focused (one feature/endpoint per request)
- Follow incremental approach: Complete each phase before moving to next
- **Do NOT create new files** unless explicitly requested
- Keep functions minimal - no extra features
- **Always list what changed** in bullet points after code generation

## Database Guidelines

- **Schema**: All Sparkle tables go in the `sparkle` schema (NOT public)
- **Primary Keys**: Use UUID with `gen_random_uuid()`
- **Timestamps**: Always include `created_at TIMESTAMP DEFAULT NOW()`
- **Foreign Keys**: Use proper constraints with `ON DELETE CASCADE`
- **Migrations**: Generate SQL in `/backend/migrations/` folder
- **Naming**: `{number}_{description}.sql` (e.g., `001_initial_schema.sql`)

## API Development

- One endpoint per feature
- Use Pydantic models for request/response validation
- Include proper error handling (try/except with meaningful messages)
- Follow REST conventions (GET, POST, PUT, DELETE)
- Document endpoints with FastAPI docstrings
- Return consistent JSON structure: `{"status": "success/error", "data": {}, "message": ""}`

## Code Style

- **Python**: Follow PEP 8, use type hints
- **Function Length**: Keep functions under 50 lines
- **Naming**: Use descriptive variable names (no single letters except loops)
- **Comments**: Add comments for complex logic only, not obvious code
- **Async**: Use async/await for I/O operations

## AI & LLM Integration

- **Content Generation**: Use GPT models (OpenAI, Anthropic Claude, or compatible APIs)
- **Image Generation**: Flexible provider support (DALL-E, Midjourney, Stable Diffusion, or other services)
- **Embeddings**: Use text-embedding models (OpenAI, Cohere, or open-source alternatives)
  - Store embeddings in pgvector (configure dimension based on model choice)
  - Default dimension: 1536 (OpenAI), 768 (open-source), 1024 (Cohere)
- **Model Configuration**: Keep model provider and parameters in config/environment variables
- **Abstraction**: Create provider-agnostic interfaces for easy switching between LLM services
- Implement RAG for voice learning and knowledge memory
- Keep prompts in separate config/constants file for easy reuse across providers

## Security & Best Practices

- Never commit secrets or API keys
- Use environment variables for all sensitive data
- Validate all user inputs with Pydantic
- Implement rate limiting on public endpoints
- Use parameterized queries (Supabase client handles this)

## Mobile Development
- Reference [DESIGN_GUIDELINES.md](./DESIGN_GUIDELINES.md) for platform-specific patterns
- Follow iOS Human Interface Guidelines and Material Design 3 principles
- Ensure touch targets meet minimum size requirements (44x44pt iOS, 48x48dp Android)
- Design for accessibility from the start

## When In Doubt

Ask clarifying questions before generating code. Better to ask than assume.
End of each implementation or development activity, give a short summary of what you have done.

Before generating any code, Claude should be familiar with:
- **[PRD.md](./PRD.md)** - Product features, user experience, and core functionality
- **[TECH_STACK.md](./TECH_STACK.md)** - Approved technologies and architecture decisions
- **[UI_FLOW.md](./UI_FLOW.md)** - Screen flow and UI mockup references
- **[DESIGN_GUIDELINES.md](./DESIGN_GUIDELINES.md)** - Platform design standards
- **[PROJECT_PHASES.md](./PROJECT_PHASES.md)** - Platform design standards
- **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** - Platform design standards
