# Deployment Guide for Santa's Flight

## Quick Deploy to Cloudflare Pages

### Option 1: Via Cloudflare Dashboard (Recommended)

1. Push your code to GitHub
2. Go to [Cloudflare Pages](https://dash.cloudflare.com/)
3. Click "Create a project" → "Connect to Git"
4. Select your repository
5. Configure build settings:
   - **Framework preset**: None
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/`
6. Click "Save and Deploy"

Your game will be live in ~2 minutes!

### Option 2: Via Wrangler CLI

```bash
# Install Wrangler globally (if not already installed)
npm install -g wrangler

# Build the project
npm run build

# Deploy to Cloudflare Pages
wrangler pages deploy dist --project-name santas-flight
```

## Environment Requirements

- Node.js 18 or higher (specified in `.nvmrc`)
- npm or yarn

## Build Configuration

The project is already configured with:
- ✅ Vite for fast builds
- ✅ TypeScript for type safety
- ✅ SPA routing configuration (`wrangler.jsonc`)
- ✅ Production-optimised build settings

## Custom Domain (Optional)

After deployment, you can add a custom domain:
1. Go to your Cloudflare Pages project
2. Click "Custom domains"
3. Add your domain and follow the DNS setup instructions

## Testing Production Build Locally

```bash
# Build the project
npm run build

# Preview the production build
npm run preview
```

The preview server will run at `http://localhost:4173`

## Troubleshooting

### Build fails with TypeScript errors
Run `npm run build` locally first to catch any type errors.

### Game doesn't load
Check browser console for errors and ensure all assets are loading correctly.

### Share button doesn't work
The clipboard API requires HTTPS. It will work once deployed to Cloudflare Pages.

## Performance Tips

The game is already optimised for:
- ✅ Canvas rendering (lightweight)
- ✅ Mobile-first responsive design
- ✅ Minimal bundle size (~64KB gzipped)
- ✅ No external dependencies for game logic

## Analytics (Optional)

Consider adding Cloudflare Web Analytics to track player engagement:
1. Go to Cloudflare Dashboard → Analytics → Web Analytics
2. Add your site
3. Copy the tracking code to `index.html`

---

Happy deploying! 🎅🎄
