# 🎅 Santa's Flight

A festive daily challenge game where you navigate Santa's sleigh through clouds and rooftops!

## About

Santa's Flight is a mobile-optimised endless flyer game with a daily challenge. Each day features a deterministically generated course based on the date, so everyone plays the same challenge!

## Features

- 🎮 Simple one-button control (gravity handles descent)
- 📱 Mobile-optimised for portrait mode
- 🎯 Daily deterministic challenges
- ❄️ Beautiful snowstorm effects
- 🦌 Team of 5 reindeer pulling Santa's sleigh
- 📊 Share your results
- 🚀 Fast and responsive

## How to Play

1. Press the "⬆️ FLY UP" button to make Santa's sleigh rise
2. Release to let gravity pull you down
3. Navigate between the clouds above and rooftops below
4. Try to fly as far as possible!
5. Share your daily score with friends

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment to Cloudflare Pages

This game is optimised for deployment on Cloudflare Pages:

### Via Cloudflare Dashboard

1. Connect your GitHub repository to Cloudflare Pages
2. Set build command: `npm run build`
3. Set build output directory: `dist`
4. Deploy!

### Via Wrangler CLI

```bash
# Install Wrangler
npm install -g wrangler

# Deploy
npm run build
wrangler pages deploy dist
```

## Technical Details

- **Framework**: React + TypeScript + Vite
- **Rendering**: HTML5 Canvas
- **RNG**: Mulberry32 seeded random number generator
- **Deployment**: Cloudflare Pages ready

## Scoring

Your score is measured in metres travelled. The further you fly, the better!

Share format: `🎅 Santa's Flight 2025-12-02: 847m 🎄 [link]`

---

Made with ❤️ for the holidays
