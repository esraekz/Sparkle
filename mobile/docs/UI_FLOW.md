# Sparkle Mobile UI Flow

## Screen Flow Overview

### User Journey
1. **Onboarding** → Brand blueprint setup (3 screens)
2. **Home** → Main dashboard with stats and quick actions
3. **Post Creation/Editing** → AI-powered content workspace (2 screens)
4. **Social** → Inspiration and engagement hub (2 screens)
5. **Analytics** → Performance insights (2 screens)
6. **Profile** → Settings and preferences (2 screens)
7. **Schedule** → View and manage scheduled posts

## Mockup Reference

### Onboarding Flow
- `Onboarding1.png` - Welcome and initial setup
- `Onboarding2.png` - Brand preferences and topics
- `Onboarding3.png` - Posting preferences and goals

### Home Dashboard
- `Home1.png` - Main dashboard with stats, best posting time, and quick actions

### Post Creation & Editing
- `Create_new_post1.png` - Post creation interface (from scratch)
- `Create_new_post2.png` - Post creation with AI suggestions
- `Editpost.png` - Edit existing post or AI-generated draft

### Social Tab
- `social1.png` - Content library and inspiration feed
- `social2.png` - Top voices and trending topics

### Analytics
- `Analytics1.png` - Overall performance metrics
- `Analytics2.png` - Detailed post-level insights

### Profile & Settings
- `Profile1.png` - User profile and account details
- `Profile2.png` - Preferences and settings

### Scheduling
- `Schedule.png` - Calendar view of scheduled posts

## Navigation Structure
```
Home (Dashboard)
├── Create New Post → Editpost
├── View Scheduled Posts → Schedule
└── Quick Actions

Post Tab
├── Daily Suggestions (AI-generated)
├── Create from Scratch → Create_new_post1
└── Edit Draft → Editpost

Social Tab
├── Content Library → social1
├── Inspiration Feed → social1
├── Top Voices → social2
└── Trending Topics → social2

Analytics Tab
├── Overview → Analytics1
└── Post Details → Analytics2

Profile Tab
├── User Info → Profile1
└── Settings → Profile2
```

## Key User Flows

### Creating a Post
1. Home → Tap "Create Post" 
2. Choose: "From Scratch" (Create_new_post1) or "AI Suggestion" (Create_new_post2)
3. Edit content (Editpost)
4. Choose: Publish Now / Schedule / Save Draft

### Onboarding New User
1. Onboarding1 → Welcome screen
2. Onboarding2 → Select topics, tone, goals
3. Onboarding3 → Set posting preferences
4. → Home1 (First dashboard view)

### Scheduling Posts
1. Home or Post tab → Select post
2. Tap "Schedule"
3. Choose date/time (AI suggests optimal time)
4. Confirm → Appears in Schedule.png view

### Finding Inspiration
1. Social tab → social1 (Browse content library)
2. Tap trending topic or top voice
3. View details → social2
4. Option to "Adapt this post" → Create_new_post2

## Design Notes

### Consistency
- Bottom tab navigation (5 tabs: Home, Post, Social, Analytics, Profile)
- Primary action buttons in consistent positions
- AI suggestions clearly marked with sparkle icon ✨

### Interaction Patterns
- Swipe gestures for post suggestions
- Pull-to-refresh for feeds
- Long-press for quick actions
- Modal sheets for editing and scheduling

### States to Consider
- Empty states (no posts yet, no scheduled content)
- Loading states (AI generating content)
- Error states (failed to publish, network error)
- Success confirmations (post published, scheduled)

### Accessibility
- Minimum touch targets: 44x44pt (iOS) / 48x48dp (Android)
- High contrast for readability
- VoiceOver/TalkBack support
- Dynamic Type support for text scaling