# ClearView Studio Player

ClearView Studio Player is a professional web multimedia analysis and playback workstation designed to overcome native browser playback limitations. It provides real-time Web Audio digital signal processing (DSP), visual video calibration, transcription and intelligence with AI models, internationalization (i18n), full accessibility (a11y), and client-side rendering for exporting and downloading modified videos.

Interactive technical documentation and the complete Web Audio DSP graph specification are available on the application route `/docs` (access at http://localhost:5173/docs or via the header shortcut).

---

## 1. Repository Architecture

The project follows a modular architecture organized by domain and responsibility:

```text
clearview-player/
├── .github/
│   └── workflows/
│       └── ci.yml                 # Continuous Integration pipeline (CI)
├── src/
│   ├── __tests__/                 # Automated test suite
│   │   ├── a11y.test.ts
│   │   ├── aiIntelligence.test.ts
│   │   ├── audioDsp.test.ts
│   │   ├── i18n.test.ts
│   │   ├── playerFeatures.test.ts
│   │   ├── playerStorage.test.ts
│   │   ├── subtitles.test.ts
│   │   └── videoExport.test.ts
│   ├── components/
│   │   ├── common/                # Shared UI components
│   │   │   ├── Header.tsx         # Header, navigation, language and theme switch
│   │   │   └── VideoExportModal.tsx # Export configuration modal dialog
│   │   ├── inspector/             # Studio Inspector panel modules
│   │   │   ├── tabs/              # Inspector tabs (Audio, Video, Subtitles, AI, etc.)
│   │   │   ├── CompactSlider.tsx  # High-precision slider control
│   │   │   └── StudioInspector.tsx# Responsive sidebar drawer
│   │   ├── player/                # Video player components
│   │   │   ├── PlayerControls.tsx # Progress bar, scrubber, and playback controls
│   │   │   ├── PlayerOverlays.tsx # Subtitles overlay, notifications, and visual feedback
│   │   │   ├── SampleVideoBanner.tsx # Demo video quick load action
│   │   │   ├── SpeedMenu.tsx      # Accessible playback speed selector
│   │   │   └── VideoPlayer.tsx    # Central HTMLVideo orchestrator
│   │   ├── ApiKeyModal.tsx        # Local API key manager
│   │   └── DropZone.tsx           # Drag and drop area and URL loader
│   ├── hooks/                     # Custom business logic hooks
│   │   ├── useVideoAudioEnhancer.ts # Web Audio DSP graph, filters, and equalizer
│   │   └── useVideoExport.ts      # Video recording and rendering pipeline
│   ├── i18n/                      # Internationalization layer
│   │   ├── locales/               # Locales in Portuguese (pt) and English (en)
│   │   ├── I18nContext.tsx        # React provider and useTranslation hook
│   │   └── types.ts               # Strongly-typed translation schemas
│   ├── pages/
│   │   └── DocsPage.tsx           # Technical documentation route
│   ├── services/                  # Business services
│   │   ├── aiIntelligenceService.ts # AI chapters, summaries, and chat
│   │   ├── playerStorageService.ts # Local persistence (localStorage)
│   │   ├── transcriptionService.ts # AI clients (Groq, Gemini, OpenAI)
│   │   └── videoExportService.ts  # Canvas 2D + MediaRecorder renderer
│   ├── types/                     # Central TypeScript types and interfaces
│   │   ├── exportTypes.ts
│   │   └── playerSettings.ts
│   ├── utils/                     # Utilities (a11y, subtitles, sample data)
│   ├── App.tsx                    # Root application component
│   └── main.tsx                   # React entry point
├── CONTRIBUTING.md                # Contributor guidelines and workflow
├── eslint.config.js               # ESLint 9 configuration
└── package.json
```

---

## 2. Environment Requirements

- Node.js version 20.0 or higher (see `.nvmrc`).
- Modern browser with support for Web Audio API, Canvas 2D, and MediaRecorder (Chrome, Edge, Firefox, or Safari).

---

## 3. Installation and Development

### 3.1 Install Dependencies

```bash
npm install
```

### 3.2 Run Development Server

```bash
npm run dev
```

Once running, navigate to:

- Main Player: `http://localhost:5173/`
- Documentation: `http://localhost:5173/docs`

### 3.3 Available Scripts

| Script                 | Description                                              |
| ---------------------- | -------------------------------------------------------- |
| `npm run dev`          | Starts the Vite development server                       |
| `npm run build`        | Runs type checking and builds production bundle          |
| `npm run preview`      | Serves production build locally                          |
| `npm test`             | Runs unit tests once via Vitest                          |
| `npm run test:watch`   | Runs unit tests in watch mode                            |
| `npm run typecheck`    | Runs TypeScript compiler without emitting files          |
| `npm run lint`         | Runs ESLint with zero-warning tolerance                  |
| `npm run lint:fix`     | Runs ESLint and applies automatic fixes                  |
| `npm run format`       | Formats all project files using Prettier                 |
| `npm run format:check` | Verifies formatting compliance                           |
| `npm run validate`     | Runs format check, lint, typecheck, and tests in order   |

---

## 4. Key Features

### 4.1 Client-Side Video Export and Download

- Rendered 100% in the browser with no server uploads required.
- Frame-by-frame color and contrast adjustments recorded via Canvas 2D.
- Audio track tapped directly from the Web Audio limiter with active EQ, noise gate, and channel matrix routing.
- Styled subtitles (solid, translucent, yellow, none) rasterized directly into video frames.
- Export range selection (entire media or Loop A-B segment) with automatic WebM or MP4 format negotiation.

### 4.2 Integrated Demo Video

- "Load Demo Video" button available on the home screen for immediate evaluation.
- Loads high-definition sample media with pre-configured subtitles, chapters, and bookmarks without manual uploads.

### 4.3 Complete Internationalization (i18n)

- Native support for Portuguese (pt) and English (en).
- Instant language toggle with persistent browser storage.
- Strongly-typed locale dictionaries verified by automated parity tests.

### 4.4 Accessibility (a11y: WCAG 2.1 AA)

- ARIA landmark regions (`role="region"`, `role="toolbar"`, `role="menu"`).
- Dynamic screen reader announcements (`aria-live="polite"` and `aria-atomic="true"`).
- Complete keyboard navigation and dialog dismissal via Escape key.

### 4.5 Digital Signal Processing (DSP)

- Real-time FFT spectrum analyzer covering 20 Hz to 20 kHz.
- 5-band graphic equalizer (60 Hz, 250 Hz, 1 kHz, 4 kHz, 12 kHz).
- Channel matrix routing: Stereo, Mono downmix, Left-only, and Right-only (corrects single-channel mic inputs).
- Dynamic Noise Gate with RMS calculation and release hysteresis.
- High-pass (wind and rumble), low-pass (de-hiss), and notch filters (50 Hz / 60 Hz hum elimination).
- Brickwall limiter with ceiling set at -1.0 dBFS to prevent clipping.

### 4.6 Visual Calibration and Magnifier

- Controls for brightness, contrast, saturation, sepia, grayscale, invert, and blur.
- Aspect ratio modes: Contain (original), Cover, Fill, forced 16:9, and forced 4:3.
- Continuous zoom from 100% to 400% with interactive Pan by click and drag.
- Original-resolution frame capture (PNG) preserving applied filters.

### 4.7 Artificial Intelligence and Study Tools

- Direct connectivity with Groq (Whisper Large v3 Turbo), OpenAI, and Google Gemini.
- Automatic chapter generation with timeline markers.
- Structured executive summary and contextual chat grounded in video transcripts.
- Synchronized subtitle translation.
- Timestamped bookmarks with notes and Markdown export.
- Loop A-B with seamless repeating and single-frame stepping (1/30s).

---

## 5. Keyboard Shortcuts

| Key                   | Action                                              |
| :-------------------- | :-------------------------------------------------- |
| Space or K            | Toggle play and pause                               |
| J or Left Arrow       | Rewind 10 seconds                                   |
| L or Right Arrow      | Forward 10 seconds                                  |
| Comma (,)             | Step back 1 frame (1/30 second)                     |
| Period (.)            | Step forward 1 frame (1/30 second)                  |
| Left Bracket ([)      | Decrease playback speed by 0.25x                    |
| Right Bracket (])     | Increase playback speed by 0.25x                    |
| M                     | Toggle mute and audio                               |
| F                     | Toggle fullscreen mode                              |
| C                     | Toggle subtitle visibility                          |
| B                     | Add bookmark at current timestamp                   |
| S                     | Capture and download video frame in high resolution |
| P                     | Toggle Picture-in-Picture mode                      |

---

## 6. Continuous Integration (CI/CD)

The repository includes a GitHub Actions pipeline configured in `.github/workflows/ci.yml`. On every push and pull request targeting `main` or `master`, the workflow executes:

1. **Lint and format**: Verifies code formatting with Prettier and checks ESLint rules.
2. **Type check**: Compiles TypeScript without emitting files (`tsc --noEmit`).
3. **Unit tests**: Executes the full Vitest suite in CI mode (`vitest run`).
4. **Production build**: Runs after verification passes and stores `dist` as a build artifact.

---

## 7. Code Standards

- Strict TypeScript with zero implicit any types.
- Modular component architecture separating state, UI, and business logic.
- Strictly no em-dash characters in code, comments, or user-facing text.
- Strictly no emoji characters anywhere in the codebase.
- Comments used sparingly, reserved only for non-obvious complex logic.
