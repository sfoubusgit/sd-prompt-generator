# Guided Prompt Interview Creator

A standalone application for building high-quality Stable Diffusion prompts through an adaptive question-and-answer interview system.

## Features

- **Decision-tree driven interview**: Navigate through questions based on your answers
- **Refinement questions**: Get more specific with follow-up questions
- **Weight sliders**: Fine-tune attribute intensity
- **Live preview**: See your prompt update in real-time
- **Modern UI**: Dark theme with violet accents

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

## Project Structure

```
src/
  components/       # UI components
  data/interview/   # JSON decision tree files
  hooks/           # React hooks (interview engine)
  services/        # Prompt assembly logic
  types/           # TypeScript type definitions
  pages/           # Page components
```

## Adding New Questions

To add new interview questions, simply create or modify JSON files in `src/data/interview/`. The application automatically loads all JSON files in that directory.

See the existing files (`root.json`, `character.json`, `environment.json`) for examples of the structure.

## License

MIT





"# sd-prompt-generator" 


"# SD-PG" 
"# SD-PG" 
