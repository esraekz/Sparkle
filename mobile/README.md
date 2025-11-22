# Sparkle Mobile App

React Native mobile app for Sparkle - AI personal-branding copilot for LinkedIn.

## Tech Stack

- **Framework**: React Native + Expo SDK 54
- **Language**: TypeScript
- **Navigation**: React Navigation 7 (Bottom Tabs + Native Stack)
- **State Management**: React Query (TanStack Query)
- **HTTP Client**: Axios
- **Storage**: AsyncStorage
- **Validation**: Zod
- **Styling**: StyleSheet (React Native)

## Project Structure

```
mobile/
├── screens/          # Screen components
│   ├── auth/         # Login, Signup
│   ├── onboarding/   # Onboarding flow
│   ├── home/         # Dashboard
│   ├── posts/        # Post creation and management
│   ├── social/       # Content library
│   ├── analytics/    # Analytics and insights
│   └── profile/      # Profile and settings
├── components/       # Reusable UI components
├── navigation/       # Navigation setup
├── services/         # API service layer
│   ├── api.ts           # Axios config
│   ├── auth.service.ts  # Auth endpoints
│   ├── post.service.ts  # Posts endpoints
│   └── onboarding.service.ts  # Onboarding endpoints
├── contexts/         # React Context providers
├── constants/        # Colors, Layout, Typography
├── types/            # TypeScript interfaces
├── utils/            # Helper functions
└── assets/           # Images, fonts, icons

```

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo Go app (for testing on device)
- iOS Simulator (Mac only) or Android Emulator

### Installation

1. **Navigate to mobile folder:**
   ```bash
   cd mobile
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm start
   ```

4. **Run on platform:**
   - iOS: Press `i` or run `npm run ios`
   - Android: Press `a` or run `npm run android`
   - Web: Press `w` or run `npm run web`
   - Scan QR code with Expo Go app

### Backend Connection

The app connects to the FastAPI backend at:
- **Development**: `http://localhost:8000/api/v1`
- **Production**: Configure in `app.json` > `extra.apiUrl`

Make sure the backend is running before testing mobile features.

## Design System

### Colors
- **Primary**: #F5C842 (Sparkle Yellow)
- **Text**: #1A1A1A (near black)
- **Background**: #FFFFFF (white)

See [constants/Colors.ts](constants/Colors.ts) for full palette.

### Touch Targets
Following iOS Human Interface Guidelines:
- Minimum: 44x44pt (iOS), 48x48dp (Android)
- Defined in [constants/Layout.ts](constants/Layout.ts)

### Typography
- iOS: San Francisco (system font)
- Android: Roboto (system font)
- See [constants/Typography.ts](constants/Typography.ts)

## Features Status

### Phase 1 MVP - Mobile

✅ **Completed:**
- [x] Project initialization
- [x] Folder structure
- [x] Navigation setup (5 tabs)
- [x] API service layer
- [x] React Query configuration
- [x] TypeScript types
- [x] Design constants
- [x] Placeholder screens

🚧 **Next (Feature 2 - Authentication):**
- [ ] Login screen
- [ ] Signup screen
- [ ] Auth context
- [ ] Token management
- [ ] Protected routes

🔜 **Upcoming:**
- Feature 3: Onboarding screens (3 screens)
- Feature 4: Post creation and management
- Feature 5-16: Additional features per PROJECT_PHASES.md

## API Services

All API calls are centralized in `/services`:

```typescript
// Authentication
import authService from './services/auth.service';
await authService.login({ email, password });

// Posts
import postService from './services/post.service';
await postService.createPost({ content, hashtags });

// Onboarding
import onboardingService from './services/onboarding.service';
await onboardingService.createBrandBlueprint(data);
```

## React Query Usage

Data fetching with React Query:

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import postService from '../services/post.service';

// Fetch data
const { data, isLoading } = useQuery({
  queryKey: ['posts'],
  queryFn: () => postService.getPosts(),
});

// Mutate data
const mutation = useMutation({
  mutationFn: postService.createPost,
  onSuccess: () => {
    // Invalidate and refetch
  },
});
```

## Development Notes

### Mock Authentication (Phase 1)
- Backend uses mock authentication (USE_MOCK_AUTH=True)
- No real JWT verification required
- Test user: test@sparkle.com

### Platform-Specific Code
Use Platform module for iOS/Android differences:

```typescript
import { Platform } from 'react-native';

const height = Platform.select({
  ios: 44,
  android: 56,
  default: 44,
});
```

## Testing

### On Real Device (Recommended)
1. Install Expo Go from App Store/Play Store
2. Run `npm start`
3. Scan QR code with camera (iOS) or Expo Go (Android)

### On Simulator
- **iOS**: `npm run ios` (Mac only, requires Xcode)
- **Android**: `npm run android` (requires Android Studio)

## Troubleshooting

### Metro bundler issues
```bash
npm start -- --clear
```

### Dependencies issues
```bash
rm -rf node_modules package-lock.json
npm install
```

### Backend connection
Verify backend is running:
```bash
curl http://localhost:8000/health
```

## Documentation

- [Product Requirements (PRD)](docs/PRD.md)
- [UI Flow](docs/UI_FLOW.md)
- [Database Schema](docs/DATABASE_SCHEMA.md)
- [Project Phases](docs/PROJECT_PHASES.md)
- [Design Guidelines](docs/DESIGN_GUIDELINES.md)

## Related

- **Backend**: `/backend` - FastAPI backend
- **GitHub**: https://github.com/esraekz/Sparkle

---

**Status**: Phase 1 MVP - Mobile foundation complete
**Last Updated**: January 2025
