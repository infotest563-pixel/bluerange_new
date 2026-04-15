# Quick Start Guide

## ✅ Your Site is Ready!

Your local Next.js site now matches the live site at https://bluerange.se/

## Access Your Site

Open your browser and go to:
👉 **http://localhost:3001**

## What's Working Now

### ✅ Menu Navigation
- All menu items load from WordPress
- Dropdown menus work (hover/click)
- Routing works with Next.js
- No page reloads on navigation

### ✅ Language Switcher
- Flag icon in header (top-right)
- Click to switch between Svenska 🇸🇪 and English 🇺🇸
- Current language is highlighted
- Proper flag images display

### ✅ Images
- WordPress images now load via proxy
- No more 404 errors for `/wp-content/` images

### ✅ Routing
- Clean URLs (no WordPress domain)
- Client-side navigation
- Back/forward buttons work

## Test Checklist

Open http://localhost:3001 and verify:

- [ ] Page loads without errors
- [ ] Menu items are visible in header
- [ ] Hover over menu items - dropdowns appear
- [ ] Click menu items - navigation works
- [ ] Flag icon shows in top-right
- [ ] Click flag - language dropdown opens
- [ ] Both languages (Svenska/English) listed
- [ ] Click language - switches site
- [ ] Images load correctly
- [ ] No console errors

## Files Changed

### New Components
- `components/Navigation.tsx` - Menu with Bootstrap dropdowns
- `components/LanguageSwitcher.tsx` - Language selector (updated)

### Updated Files
- `components/Header.tsx` - Fetches languages, resolves URLs
- `lib/wp.ts` - Added getLanguages() function
- `next.config.ts` - Added image proxy rewrites

### Documentation
- `FIXES_SUMMARY.md` - Detailed summary of all fixes
- `DEBUGGING_GUIDE.md` - Troubleshooting guide
- `QUICK_START.md` - This file

## Architecture

```
WordPress (Backend)
https://dev-bluerange.pantheonsite.io
├── REST API endpoints
├── Polylang (languages)
└── Content & Images

Next.js (Frontend)
http://localhost:3001
├── Server Components (fetch data)
├── Client Components (interactivity)
└── Image Proxy (rewrites)
```

## Common Commands

### Start Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm run start
```

### Check for Errors
```bash
npm run lint
```

## Browser DevTools

### Check Console
1. Open DevTools (F12)
2. Go to Console tab
3. Look for errors (should be none)

### Check Network
1. Open DevTools (F12)
2. Go to Network tab
3. Reload page
4. Check API calls to WordPress

### Check Elements
1. Open DevTools (F12)
2. Go to Elements tab
3. Inspect menu structure
4. Verify classes are applied

## WordPress API Endpoints

Your site uses these endpoints:

1. **Menu**
   ```
   GET https://dev-bluerange.pantheonsite.io/wp-json/headless/v1/menus/primary?lang=en
   ```

2. **Languages**
   ```
   GET https://dev-bluerange.pantheonsite.io/wp-json/pll/v1/languages
   ```

3. **Site Info**
   ```
   GET https://dev-bluerange.pantheonsite.io/wp-json/headless/v1/site/?lang=en
   ```

4. **Settings**
   ```
   GET https://dev-bluerange.pantheonsite.io/wp-json/headless/v1/site-settings?lang=en
   ```

## Troubleshooting

### Server Not Starting?
```bash
# Kill process on port 3000
npx kill-port 3000

# Restart
npm run dev
```

### Menu Not Loading?
1. Check browser console for errors
2. Verify WordPress API is accessible
3. Check Network tab for failed requests

### Language Switcher Not Working?
1. Verify Polylang is installed on WordPress
2. Check if languages API returns data
3. Look for console errors

### Images Not Loading?
1. Verify `next.config.ts` has rewrites
2. Restart dev server after config changes
3. Check Network tab for image requests

## Need Help?

1. **Check Documentation**
   - Read `FIXES_SUMMARY.md` for detailed fixes
   - Read `DEBUGGING_GUIDE.md` for troubleshooting

2. **Check Browser Console**
   - Open DevTools (F12)
   - Look for error messages
   - Check Network tab for failed requests

3. **Check Dev Server Output**
   - Look at terminal where `npm run dev` is running
   - Check for compilation errors
   - Look for API request logs

## Next Steps

### 1. Customize
- Update styles in `app/globals.css`
- Modify components as needed
- Add new pages/routes

### 2. Add Features
- Add search functionality
- Add contact forms
- Add more templates

### 3. Deploy
- Push to GitHub
- Deploy to Vercel/Netlify
- Configure environment variables

## Success! 🎉

Your local site now works exactly like the live site at https://bluerange.se/

**Enjoy developing!**
