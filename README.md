# ⚡ Convergence Dashboard

> **Tracking the Transition to a Post-Labour Economy**  
> Based on the theories of **Emad Mostaque** and **David Shapiro**

[![GitHub Pages](https://img.shields.io/badge/GitHub-Pages-blue?logo=github)](https://muxd22-alt.github.io/post_labour_tracker/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## 📖 Overview

The **Convergence Dashboard** is a real-time visualization tool that tracks the global transition toward a post-labour economy. It monitors two competing forces:

| **Mostaque's Pressure** | **Shapiro's Safety Net** |
|------------------------|-------------------------|
| AI-driven cognitive labor obsolescence | Universal Human Income (UHI) readiness |
| Agentic AI capabilities | Capital distribution mechanisms |
| 800-day countdown to obsolescence | UBI, sovereign wealth, ESOPs |

The central **Stability Meter** shows whether we're heading toward *Economic Collapse* or *Post-Scarcity Abundance*.

---

## 🚀 Live Demo

**[View on GitHub Pages](https://muxd22-alt.github.io/post_labour_tracker/)**

---

## 🎯 Features

### 1. Stability Meter
- Real-time needle visualization (0-100 scale)
- **Left (< 30)**: Critical — Collapse Risk
- **Center (30-70)**: Warning — Transition Stress
- **Right (> 70)**: Optimal — Abundance Path
- Dynamically calculated from obsolescence pressure vs. UHI readiness

### 2. Mostaque Tracker (The Pressure)
- **800-Day Countdown Timer** — Deadline: March 31, 2026
- **Agentic Capability Score** — S-curve growth model
- **RSS Feed** — Monitors: Autonomous Agents, OpenClaw, Humanoid Robots, LLM Benchmarks

### 3. Shapiro Tracker (The Safety Net)
- **3-Pillar UHI Checklist** (click to toggle):
  - **Capital**: Sovereign Wealth Funds, ESOPs, Baby Bonds
  - **Transfers**: UBI, Social Security, Carbon Dividends
  - **Wages**: Residual human-centric labor
- **RSS Feed** — Monitors: UBI pilots, wealth funds, employee ownership

### 4. Daily Signal Tracking
- **Split-view news aggregation**:
  - Left: Signals of Obsolescence (job cuts, AI productivity gains)
  - Right: Signals of Abundance (UBI pilots, energy breakthroughs)
- Click any signal to mark as milestone

### 5. Milestone Tracker
- Add custom milestones observed in the news
- Completed milestones shift the Stability Meter toward abundance
- Persistent storage via `localStorage`

---

## 🛠️ Technical Details

| Aspect | Implementation |
|--------|---------------|
| **Architecture** | Single-page application (SPA) |
| **Styling** | CSS Grid, Flexbox, CSS Variables |
| **JavaScript** | Vanilla ES6+ (no frameworks) |
| **Data Persistence** | `localStorage` |
| **RSS Fetching** | rss2json API + fallback demo data |
| **Theme** | Dark-mode "Command Center" aesthetic |
| **Responsive** | Mobile-first design |

### Browser Support
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

---

## 📁 Project Structure

```
post_labour_tracker/
├── docs/
│   └── index.html      # GitHub Pages deployment
├── index.html          # Main dashboard (root)
├── README.md           # This file
└── LICENSE             # MIT License
```

---

## 🚀 Deployment

### GitHub Pages Setup

1. Go to your repository **Settings** → **Pages**
2. Set **Source** to: `Deploy from a branch`
3. Select branch: `main` (or `master`)
4. Folder: `/docs`
5. Click **Save**

Your site will be live at:
```
https://<username>.github.io/post_labour_tracker/
```

### Local Development

Simply open `index.html` in any modern browser:

```bash
# macOS/Linux
open index.html

# Windows
start index.html
```

No build process or server required!

---

## 📊 How the Stability Score is Calculated

```javascript
stabilityScore = UHI_Readiness - (Obsolescence_Pressure - 50) + (Completed_Milestones × 5)
```

| Component | Range | Impact |
|-----------|-------|--------|
| **UHI Readiness** | 0-100 | Based on 3-pillar completion |
| **Obsolescence Pressure** | 0-100 | Agentic capability S-curve |
| **Milestones** | +5 each | Completed milestones boost score |

---

## 🎨 Customization

### Modify RSS Feeds

Edit the `CONFIG` object in `index.html`:

```javascript
const CONFIG = {
    mostaque: {
        rssFeeds: ['YOUR_RSS_URL_HERE']
    },
    shapiro: {
        rssFeeds: ['YOUR_RSS_URL_HERE']
    }
};
```

### Adjust Countdown Deadline

```javascript
const CONFIG = {
    mostaque: {
        deadline: new Date('2026-03-31T00:00:00') // Change here
    }
};
```

### Theme Colors

Modify CSS variables in the `:root` selector:

```css
:root {
    --accent-danger: #ef4444;   /* Red - Obsolescence */
    --accent-success: #10b981;  /* Green - Abundance */
    --accent-info: #3b82f6;     /* Blue - UI elements */
}
```

---

## 📚 Theoretical Background

### Emad Mostaque's Obsolescence Thesis
Former Stability AI CEO Emad Mostaque predicted that **AI agents would render most cognitive labor obsolete within 800 days** from early 2024. This creates "pressure" on the economic system.

### David Shapiro's UHI Framework
Author and educator David Shapiro proposes a **Universal Human Income (UHI)** framework built on three pillars:
1. **Capital** — Distributed ownership of AI/automation
2. **Transfers** — Direct cash mechanisms (UBI, dividends)
3. **Wages** — Residual human-centric work

The dashboard tracks the "convergence" of these two forces.

---

## 🔗 Resources

- [Emad Mostaque's 800-Day Prediction](https://twitter.com/EmadMostaque)
- [David Shapiro's UHI Framework](https://www.davidshapiro.net/)
- [OpenClaw Robotics](https://openclaw.org/)
- [UBI Center](https://ubicenter.org/)

---

## 📝 License

MIT License — See [LICENSE](LICENSE) for details.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📬 Contact

- **Repository**: [github.com/muxd22-alt/post_labour_tracker](https://github.com/muxd22-alt/post_labour_tracker)
- **Issues**: [Report bugs or request features](https://github.com/muxd22-alt/post_labour_tracker/issues)

---

<div align="center">

**⚡ Convergence Dashboard**  
*Tracking the path from scarcity to abundance*

Made with 🖤 for the post-labour future

</div>
