# Design Agent Instructions: Resolution Autopilot
## Behavioral Design for Agents (Not Gimmicks)

**Design Philosophy**: The UI must reflect the sophistication of the agent system beneath it. Don't hide the agent—showcase it.

---

## Brand Identity

### Visual Style
- **Theme**: "AI coach, not algorithm"
- **Inspiration**: Fitbit + Figma + dark mode productivity apps
- **Emotion**: Trustworthy, empowering, slightly technical

### Color Palette

```
Primary Colors:
- Indigo (#6366F1) - Trust, stability, AI
- Green (#10B981) - Success, completion, health
- Amber (#F59E0B) - Gentle nudge, warning, decision point
- Slate (#0F172A) - Background, technical depth

Accent Colors:
- Red (#EF4444) - Drift alert (used sparingly)
- Cyan (#06B6D4) - Agent reasoning (highlights)
- Emerald (#059669) - Milestone achieved

Dark Mode ONLY:
- Background: #0F172A (slate-900)
- Surface: #1E293B (slate-800)
- Card: #334155 (slate-700)
- Text: #F1F5F9 (slate-100)
```

### Typography

```
Headlines: Space Grotesk (bold, technical feel)
Body: Inter (clean, readable)
Monospace: Fira Code (for agent reasoning chains)

Scale:
- H1: 32px (page title)
- H2: 24px (section header)
- H3: 18px (component header)
- Body: 14px
- Small: 12px
- Tiny: 11px
```

### Design Tokens (Tailwind Config)

```javascript
module.exports = {
  theme: {
    colors: {
      'slate': {
        '900': '#0F172A',
        '800': '#1E293B',
        '700': '#334155',
        '600': '#475569',
        '500': '#64748B',
        '100': '#F1F5F9',
      },
      'indigo': { '500': '#6366F1', '600': '#4F46E5' },
      'emerald': { '500': '#10B981', '600': '#059669' },
      'amber': { '500': '#F59E0B', '600': '#D97706' },
      'red': { '500': '#EF4444', '600': '#DC2626' },
      'cyan': { '500': '#06B6D4', '600': '#0891B2' },
    },
    fontFamily: {
      'sans': ['Inter', 'sans-serif'],
      'display': ['Space Grotesk', 'sans-serif'],
      'mono': ['Fira Code', 'monospace'],
    },
    spacing: {
      '4': '1rem',
      '8': '2rem',
      '12': '3rem',
      '16': '4rem',
      '20': '5rem',
      '24': '6rem',
    },
  },
}
```

---

## Design System Components

### 1. Pattern Detection Visualization

**Purpose**: Show user what the agent "sees" in their behavior

**Design Prompt**:

```
Design a pattern detection card showing:
- Timeline of last 7 days
- Each day: workout (✓ green), missed (✗ red), skipped (? amber)
- Hover on day: show full details (time, reason if user provided)
- Below timeline: calculated metrics
  * Completion rate (percentage)
  * Trend (arrow up/down)
  * Drift signals (if any)

Example visual:
┌─────────────────────────────────────┐
│ Last 7 Days Pattern                 │
├─────────────────────────────────────┤
│ M  T  W  T  F  S  S                 │
│ ✓  ✓  ✗  ✗  ?  ✓  (today)         │
├─────────────────────────────────────┤
│ Completion: 50%  ↓ (trend)          │
│ Drift Risk: MEDIUM (87% confidence) │
│ Signals: 2 missed, no future bookings
└─────────────────────────────────────┘

Style: Monochrome with color accents
Hover state: Show tooltip with details
Animation: Smooth fill on load
```

### 2. Agent Reasoning Chain Display

**Purpose**: Show users HOW the agent decided to intervene (transparency)

**Design Prompt**:

```
Design an expandable "Agent Reasoning" panel showing:
- Thought: What the agent was thinking
- Action: Which tool it called
- Observation: What the tool returned
- Decision: What to do next

Format (like code):
┌─────────────────────────────────────────┐
│ 🔍 Agent Reasoning (Click to expand)    │
├─────────────────────────────────────────┤
│ THOUGHT                                 │
│ You missed 2 consecutive workouts.     │
│ Pattern shows you're at 87% risk...    │
│                                         │
│ ACTION                                  │
│ → analyze_calendar(days_back=7)        │
│ → detect_patterns(user_id=...)         │
│                                         │
│ OBSERVATION                             │
│ Calendar: 3/7 workouts completed       │
│ Patterns: High drift, needs intervention
│                                         │
│ DECISION                                │
│ Deploy social accountability nudge      │
│ Reason: User profile shows 73% success  │
│ with peer pressure vs 68% with calendar │
└─────────────────────────────────────────┘

Style: Monospace font (Fira Code)
Colors: Light gray text, cyan for tool names
Animation: Fade in line-by-line on expand
```

### 3. Intervention Button (Context-Aware)

**Purpose**: User decides whether to accept agent's intervention

**Design Prompt**:

```
Design an intervention proposal card:

┌──────────────────────────────────────────┐
│ ⚠️  Drift Detected - Take Action?        │
├──────────────────────────────────────────┤
│                                          │
│ Agent says: "You're at high risk of     │
│ missing the streak. I can:              │
│                                          │
│ ✓ Book Uber to gym tomorrow @ 7am       │
│ ✓ Notify your accountability buddy      │
│ ✓ Set phone reminder (6:30am)           │
│                                          │
│ Your stake at risk: $20 of $100         │
│                                          │
│ ┌─────────────────┬──────────────────┐  │
│ │ Accept Changes  │ Customize First  │  │
│ └─────────────────┴──────────────────┘  │
└──────────────────────────────────────────┘

Button states:
- Primary (green): "Accept Intervention"
- Secondary (slate): "Customize" / "Dismiss"
- Danger (red): "Opt Out of Nudges"

Animation: Slide in from bottom, slight bounce
```

### 4. Smart Contract Status Widget

**Purpose**: Show user's stake, milestones, earnings

**Design Prompt**:

```
Design a blockchain integration widget:

┌─────────────────────────────────────┐
│ 💰 Your Commitment (On-Chain)       │
├─────────────────────────────────────┤
│ Staked: $100 USDC                   │
│ Status: 🟢 Active                   │
│ Earned: +$15 (15% bonus so far)     │
│                                      │
│ Milestones:                          │
│ ✓ Week 1-2 (Completed)              │
│ ◐ Week 3-4 (2 of 4 workouts)        │
│ ○ Week 5-6 (Not started)            │
│ ○ Week 7-8 (Not started)            │
│                                      │
│ [View Contract on Etherscan]        │
│ [Manage Stake]                      │
└─────────────────────────────────────┘

Visual: Progress ring for each milestone
Color: Green for complete, amber for in-progress, gray for future
Link: Etherscan (show transaction hash)
```

### 5. OPIC Evaluation Dashboard

**Purpose**: Show system transparency to judges

**Design Prompt**:

```
Design an evaluation dashboard showing 4 key metrics:

┌──────────────────────────────────────────────────┐
│ 📊 System Evaluation (OPIC Integration)          │
├──────────────────────────────────────────────────┤
│                                                  │
│ ┌─────────────┐  ┌─────────────┐               │
│ │ Intervention│  │    User     │               │
│ │ Precision   │  │ Satisfaction│               │
│ │   87%       │  │    4.3/5    │               │
│ │    ↑        │  │    →        │               │
│ └─────────────┘  └─────────────┘               │
│                                                  │
│ ┌─────────────┐  ┌─────────────┐               │
│ │ Completion  │  │  Agent      │               │
│ │ Rate vs     │  │ Reasoning   │               │
│ │ Baseline    │  │ Quality     │               │
│ │ 7.5x ↑      │  │ 92% (LLM)   │               │
│ └─────────────┘  └─────────────┘               │
│                                                  │
│ [Detailed Traces] [A/B Test Results]           │
└──────────────────────────────────────────────────┘

Cards: 4 metric boxes with sparkline charts
Colors: Green for positive metrics, gray for neutral
Link to detailed traces (show full agent logs)
```

---

## Screen Flows

### Screen 1: Onboarding - Problem Framing

**Design Prompt**:

```
Design mobile onboarding screen 1 of 3.

Visual composition:
- Top 50%: Illustration showing frustrated person, failed resolutions
- Bottom 50%: Copy + CTA

Illustration prompt:
"Illustration style: minimal, flat design, monochrome in slate grays with one pop of amber.
Show a person surrounded by 4 broken symbols: crossed-out gym, clock, calendar, medal.
Person looks exhausted. Dark background."

Copy:
Headline: "92% of resolutions fail by February"
Subheading: "Not because you're weak. Because behavior change needs scaffolding."
CTA: "Continue" (large indigo button)

Design specs:
- Full-screen mobile (375px width)
- Dark background (#0F172A)
- Headline: Space Grotesk 28px bold, white
- Subheading: Inter 14px, slate-400
- Illustration: 200px height, centered
- CTA: 48px height, full width, indigo-500
```

### Screen 2: Solution Reveal

**Design Prompt**:

```
Design mobile onboarding screen 2 of 3.

Show what Resolution Autopilot does:

Top section: "What if something caught you BEFORE you failed?"
Illustration showing 3 steps:
1. Calendar + detection icon → Drift signal detected
2. Agent icon + intervention → Smart intervention deployed
3. Checkmark + person → You stay on track

Middle section: Key features as 3 cards:
- "Detects patterns in real-time"
- "Intervenes at decision points"
- "Learns what works for you"

Bottom: CTA "See Your Commitment" → Screen 3
```

### Screen 3: Commitment Contract

**Design Prompt**:

```
Design mobile onboarding screen 3 of 3.

Show Web3 staking (make it feel SAFE, not scary):

Top: "Lock your commitment with smart contracts"

Illustration: Shield icon + ETH logo (reassuring)

Main content: Staking setup
┌──────────────────────────────┐
│ Your Resolution              │
│ [Gym 4x/week]  (read-only)  │
│                              │
│ Stake Amount                 │
│ Slider: $50 ─────●────── $500│
│ Selected: $100 USDC          │
│                              │
│ Duration: 8 weeks            │
│                              │
│ If you succeed: Get funds back + 10% bonus
│ If you fail: Goes to charity of your choice
│                              │
│ [Select Charity ▼]           │
│ → Cancer Research            │
│ → Environmental              │
│ → Education                  │
│                              │
│ [Connect Wallet] (button)    │
└──────────────────────────────┘

Notes below: "Secured by Ethereum Base (L2)"
"You can view & manage your contract anytime"
```

### Screen 4: Dashboard (Main App)

**Design Prompt**:

```
Design main dashboard (after onboarding):

Layout: 3 sections (vertical stack mobile, grid on desktop)

Section 1 - TODAY (top):
┌──────────────────────────┐
│ Today - January 16       │
├──────────────────────────┤
│ 🎯 Gym: Scheduled 6am    │
│ Current streak: 4 days   │
│ Status: On Track ✓       │
│ [Check In Now]           │
└──────────────────────────┘

Section 2 - PATTERNS (middle):
┌──────────────────────────┐
│ Last 7 Days              │
│ M T W T F S S           │
│ ✓ ✓ ✗ ✗ ? ✓ (today)    │
│ Completion: 50%          │
│ Drift Risk: MEDIUM ⚠️    │
│ [Show Patterns]          │
└──────────────────────────┘

Section 3 - INTERVENTIONS (bottom):
┌──────────────────────────┐
│ Recommended              │
│ I can book Uber to gym   │
│ + notify your buddy      │
│ [Accept] [Dismiss]       │
└──────────────────────────┘

Also on dashboard: Floating menu (top-right)
- [Smart Contract Status]
- [Agent Reasoning]
- [Settings]
- [Evaluate (OPIC)]
```

### Screen 5: Success Celebration

**Design Prompt**:

```
Design celebration screen when milestone completed:

Full-screen celebration:

Top: Confetti animation (Lottie)

Center:
┌──────────────────────────────┐
│ 🎉 Milestone Complete!       │
│                              │
│ Week 1-2: Gym 8/8 Workouts  │
│ You did it!                  │
│                              │
│ [NFT Badge image - holographic]
│ "Consistency Champion"       │
│                              │
│ Smart Contract:              │
│ ✓ Verified on Base           │
│ +$10 released to you         │
│ Total earned: $25            │
│                              │
│ [Share Victory] (Twitter)    │
│ [Continue] → Next milestone  │
└──────────────────────────────┘

Animation: Cards slide in from bottom, confetti from top
Colors: Lots of green and emerald
Tone: Celebratory (all caps for key wins)
```

---

## Accessibility Specs

✅ WCAG AA Compliance:

```
- Contrast: All text ≥ 4.5:1 ratio
- Focus states: Visible 3px outline on all interactive elements
- Keyboard nav: Tab order logical, no keyboard traps
- Screen readers: All icons have aria-labels
- Reduced motion: Disable confetti, animations for `prefers-reduced-motion`
- Text sizing: Responsive font sizes (16px minimum on mobile)
- Color alone: Don't convey status (use icons + text + color)
```

---

## Animation Specs

```
Micro-interactions:

1. Button press:
   - Scale: 0.95 for 100ms
   - Haptic feedback (if mobile)
   
2. Card entrance:
   - Fade + slide up 300ms
   - Easing: cubic-bezier(0.16, 1, 0.3, 1)

3. Progress updates:
   - Number count-up animation 500ms
   - Smooth fill animation on rings

4. Drift alert:
   - Slide in from right 250ms
   - Subtle bounce on landing

5. Success celebration:
   - Confetti burst (Lottie) 2 seconds
   - Each card slides up sequentially 100ms apart

Use Framer Motion or Tailwind CSS animations.
```

---

## Design Deliverables Checklist

### Week 1
- [ ] Figma file created (component library)
- [ ] Color palette defined (Tailwind config)
- [ ] Typography scale set
- [ ] Onboarding flow (3 screens) wireframes

### Week 2
- [ ] Hi-fi mockups for onboarding
- [ ] Dashboard desktop + mobile specs
- [ ] Component library (10+ components)
- [ ] Icon set (15+ SVGs) for interventions

### Week 3
- [ ] Figma prototype (clickable flows)
- [ ] Animation specifications (Lottie)
- [ ] OPIC dashboard design
- [ ] Accessibility audit

### Week 4
- [ ] Export all assets (PNG, SVG)
- [ ] Design tokens JSON file
- [ ] Final Figma file handoff
- [ ] Video pitch storyboards

---

## Design System Components to Build

### Core Components

```
1. PatternCard
   - Input: 7-day data array, completion rate
   - Output: Visual timeline + stats
   - States: Default, drift detected, milestone complete

2. InterventionCard
   - Input: Intervention type, reasoning, actions
   - Output: Proposal card with buttons
   - States: Suggested, accepted, declined

3. ReasoningPanel
   - Input: LLM reasoning chain (thought/action/observation)
   - Output: Expandable monospace display
   - States: Collapsed, expanded, loading

4. SmartContractWidget
   - Input: User stake, milestones, earnings
   - Output: Status + progress rings
   - States: Active, milestone pending, completed

5. MetricCard
   - Input: Metric name, value, trend
   - Output: Number + sparkline + status
   - States: Good, neutral, warning

6. Button (6 variants)
   - Primary (indigo), Secondary (slate), Success (green), Warning (amber), Danger (red), Ghost

7. ProgressRing
   - Input: Percentage, threshold colors
   - Output: Circular progress indicator
   - States: Active animation on load

8. Timeline
   - Input: Events array, status
   - Output: Vertical or horizontal timeline
   - States: Completed, in-progress, future
```

---

## Figma Setup

**Figma Prompt**:

```
Create Figma file "Resolution Autopilot Design System" with:

Pages:
1. Design System (colors, typography, spacing)
2. Components (atomic library)
3. Onboarding Flow (3 screens)
4. Dashboard (mobile + desktop)
5. Interventions (all variants)
6. OPIC Evaluation
7. Success States
8. Prototype (interactive flows)

Settings:
- Frames: 375x667 (mobile), 1920x1080 (desktop)
- Grid: 8px baseline
- All text: Use design tokens
- All colors: Use CSS variables from system
- Components: Use variants for state changes
- Auto-layout: Enabled on all frames
```

---

## Why This Design Works

✅ **Reflects agent sophistication** - UI shows reasoning chains, not hiding the agent  
✅ **Behavioral science-informed** - Design supports habit formation  
✅ **Web3 friendly but safe** - Smart contracts explained clearly  
✅ **Transparent** - Every decision visible to user  
✅ **OPIC-ready** - Metrics, traces, and reasoning all visible  
✅ **Professional** - Production-quality, not prototype-y  

This design will impress judges not just for aesthetics but for strategic thinking about how to showcase agentic reasoning in UI.

Go design. 🎨
