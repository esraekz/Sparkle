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

**Location**: All mockups are located in `mobile/docs/UI_MOCKUPS/`

### Onboarding Flow (6 screens total)
- `UI_MOCKUPS/Onboarding1.png` - Contains 3 screens:
  - **Step 1: Welcome Screen** - Sparkle logo and introduction ("Hi, I'm Sparkle - your personal branding copilot")
  - **Step 2: Topics of Interest** - Select 3-5 topics to be known for (AI, Leadership, Data, Finance, Innovation, Startups, Marketing, Strategy, Engineering, Design, Product, Growth)
  - **Step 3: Your Goal** - Main LinkedIn goal selection (Build thought leadership, Grow audience, Attract career opportunities, Strengthen professional brand, Become a Top Voice)
- `UI_MOCKUPS/Onboarding2.png` - Contains 3 screens:
  - **Step 4: Inspiration** - Text input for inspirational creators/posts (optional)
  - **Step 5: Your Voice & Tone** - Select tone with descriptions (Warm & Authentic, Professional & Thoughtful, Bold & Innovative, Analytical & Insightful, Assertive & Confident)
  - **Step 6: Posting Preferences** - Set posting frequency, preferred days, best time, and review toggle
- `UI_MOCKUPS/Onboarding3.png` - Final confirmation or summary screen

### Home Dashboard
- `UI_MOCKUPS/Home1.png` - Main dashboard with stats, best posting time, and quick actions

### Post Creation & Editing
- `UI_MOCKUPS/Create_new_post1.png` - Post creation interface (from scratch)
- `UI_MOCKUPS/Create_new_post2.png` - Post creation with AI suggestions
- `UI_MOCKUPS/Editpost.png` - Edit existing post or AI-generated draft

### Social Tab
- `UI_MOCKUPS/social1.png` - Content library and inspiration feed
- `UI_MOCKUPS/social2.png` - Top voices and trending topics

### Analytics
- `UI_MOCKUPS/Analytics1.png` - Overall performance metrics
- `UI_MOCKUPS/Analytics2.png` - Detailed post-level insights

### Profile & Settings
- `UI_MOCKUPS/Profile1.png` - User profile and account details
- `UI_MOCKUPS/Profile2.png` - Preferences and settings

### Scheduling
- `UI_MOCKUPS/Schedule.png` - Calendar view of scheduled posts

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

### Onboarding New User (6-screen flow)
1. **Step 1**: Welcome Screen → Sparkle introduction
2. **Step 2**: Topics of Interest → Select 3-5 topics
3. **Step 3**: Your Goal → Choose main LinkedIn goal
4. **Step 4**: Inspiration → Enter inspirational creators (optional)
5. **Step 5**: Voice & Tone → Select tone with personality descriptions
6. **Step 6**: Posting Preferences → Set frequency, days, time, and review settings
7. → Home1 (First dashboard view)

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

### Critical Layout Rules

#### Button Visibility (MUST-FOLLOW)
**IMPORTANT**: All primary action buttons (Continue, Next, Complete Setup, etc.) MUST be fully visible and accessible at all times.

- ✅ **Use ScrollView with adequate paddingBottom** (minimum 100px) to ensure buttons are never cut off
- ✅ **Place buttons inside ScrollView** when there's scrollable content above them
- ✅ **Test on smallest supported screen size** (iPhone SE) to verify button visibility
- ❌ **NEVER allow buttons to be cut off** by screen edges or keyboard
- ❌ **NEVER use absolute positioning** that could hide buttons on smaller screens

**Implementation Pattern**:
```tsx
<ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
  {/* Content */}
  <View style={styles.buttonContainer}>
    <Button title="Continue" />
  </View>
</ScrollView>
```

**Note**: The mockup images may show buttons partially cut off for presentation purposes, but the actual implementation must ensure full button visibility.

#### Multiple Screenshots = Scrollable Content (MUST-FOLLOW)
**IMPORTANT**: When multiple mockup images exist for the same screen/tab, it indicates the page has scrollable content that extends beyond a single viewport.

**How to recognize**:
- Multiple images with the same tab/screen name (e.g., `social1.png` showing different scroll positions)
- Images showing different content sections of the same page
- Bottom content cut off in one image, then shown fully in another

**Implementation requirements**:
- ✅ **Combine ALL content** from all images for that screen into a single ScrollView
- ✅ **Maintain the order** of content as shown across the images (top to bottom)
- ✅ **Ensure scrollability** allows users to access all content sections
- ✅ **Use ScrollView with adequate padding** to ensure last item is fully visible
- ❌ **NEVER truncate content** shown in mockups
- ❌ **NEVER implement pagination** unless explicitly shown in mockups

**Example**: If `social1.png` shows top content and scrolls to reveal middle content, and another view shows bottom content, implement a single ScrollView containing: top → middle → bottom sections.

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