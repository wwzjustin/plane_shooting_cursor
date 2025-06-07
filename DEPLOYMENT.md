# Deployment Guide for GitHub Pages

## Quick Setup

1. **Create GitHub Repository**
   ```bash
   # Repository already exists at plane_shooting_cursor
   # Initialize and push your code:
   git init
   git add .
   git commit -m "Initial commit: 3D Plane Game"
   git branch -M main
   git remote add origin https://github.com/wwzjustin/plane_shooting_cursor.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**
   - Go to your repository settings
   - Scroll to "Pages" section
   - Select "Deploy from a branch"
   - Choose "gh-pages" branch
   - Click Save

3. **Deploy**
   ```bash
   npm run deploy
   ```

## Manual Deployment Steps

If you prefer manual deployment:

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to gh-pages branch**
   ```bash
   npx gh-pages -d dist
   ```

## Important Notes

- The `vite.config.js` is configured with the correct base path for GitHub Pages
- Make sure to update the repository URL in the README.md
- The game will be available at: `https://wwzjustin.github.io/plane_shooting_cursor/`
- Audio files are included in the build and will work on GitHub Pages

## Troubleshooting

- **Audio not working**: GitHub Pages serves over HTTPS, ensure audio files are properly loaded
- **404 errors**: Check that the base path in `vite.config.js` matches your repository name
- **Build fails**: Ensure all dependencies are installed with `npm install`

## Repository Structure for GitHub

```
3d-plane-game/
├── .gitignore          # Git ignore file
├── README.md           # Project documentation
├── DEPLOYMENT.md       # This deployment guide
├── package.json        # NPM configuration
├── vite.config.js      # Vite build configuration
├── index.html          # Main HTML file
├── main.js             # Game entry point
├── style.css           # Game styles
├── plane.js            # Aircraft model
├── city.js             # City environment
├── controls.js         # Flight controls
├── audio/              # Audio management
├── combat/             # Combat system
└── docs/               # Game assets (music)
```

The `node_modules/` and `dist/` directories are ignored by git and will be generated during development and deployment. 