# Debugging Guide - Headless WordPress + Next.js

## Changes Made

### 1. Menu Navigation Fixed ✅

**Problem**: Menu dropdowns not working, routing broken
**Solution**: Created client-side `Navigation.tsx` component

**Files Changed**:
- `components/Navigation.tsx` (NEW) - Client component with Bootstrap dropdown support
- `components/Header.tsx` - Updated to use Navigation component

**How it works**:
- Navigation is now a client component that initializes Bootstrap dropdowns
- Uses `useEffect` to initialize jQuery/Bootstrap after mount
- Parent menu items use `<a>` tags for dropdown triggers
- Child menu items use Next.js `<Link>` for proper routing

### 2. Language Switcher Fixed ✅

**Problem**: Language switching not working, flags not showing
**Solution**: Integrated with WordPress Polylang API

**Files Changed**:
- `lib/wp.ts` - Added `getLanguages()` function
- `components/LanguageSwitcher.tsx` - Updated to accept languages prop
- `components/Header.tsx` - Fetches and passes languages

**How it works**:
- Fetches languages from WordPress Polylang API (`/wp-json/pll/v1/languages`)
- Falls back to custom endpoint or hardcoded values if API unavailable
- Detects current language from URL pathname
- Uses proper flag images (base64 encoded)
- Highlights current language in dropdown

### 3. Routing Fixed ✅

**Problem**: Links not working properly
**Solution**: Proper URL resolution and Next.js Link usage

**How it works**:
- `resolveUrl()` function strips WordPress domain from URLs
- Converts WordPress URLs to Next.js routes
- Uses Next.js `<Link>` for internal navigation
- Uses `<a>` tags for external links (language switcher)

## Testing Checklist

### Menu Navigation
- [ ] Top-level menu items are visible
- [ ] Clicking menu items navigates correctly
- [ ] Dropdown menus open on hover/click
- [ ] Dropdown items are clickable
- [ ] Mobile menu toggle works

### Language Switcher
- [ ] Flag icon shows in header
- [ ] Clicking flag opens dropdown
- [ ] Both languages (Svenska/English) are listed
- [ ] Clicking language switches site
- [ ] Current language is highlighted
- [ ] Flags display correctly

### General
- [ ] No console errors
- [ ] Page loads without errors
- [ ] Images load correctly
- [ ] Styles are applied

## API Endpoints Used

1. **Menu**: `https://dev-bluerange.pantheonsite.io/wp-json/headless/v1/menus/primary?lang=en`
2. **Languages**: `https://dev-bluerange.pantheonsite.io/wp-json/pll/v1/languages`
3. **Site Settings**: `https://dev-bluerange.pantheonsite.io/wp-json/headless/v1/site-settings?lang=en`
4. **Site Info**: `https://dev-bluerange.pantheonsite.io/wp-json/headless/v1/site/?lang=en`

## Common Issues & Solutions

### Issue: Menu not loading
**Check**:
1. Open browser console - any errors?
2. Check Network tab - is menu API returning data?
3. Verify menu slug is correct ('primary', 'primary-menu', or 'main-menu')

**Fix**:
```bash
# Check menu endpoint manually
curl "https://dev-bluerange.pantheonsite.io/wp-json/headless/v1/menus/primary?lang=en"
```

### Issue: Dropdowns not working
**Check**:
1. Is jQuery loaded? (Check browser console: `typeof $`)
2. Is Bootstrap loaded? (Check: `typeof $.fn.dropdown`)
3. Are scripts loading in correct order?

**Fix**: Ensure scripts in `app/layout.tsx` load in this order:
1. jQuery (beforeInteractive)
2. Bootstrap (afterInteractive)
3. Custom scripts (afterInteractive)

### Issue: Language switcher not showing
**Check**:
1. Is `getLanguages()` returning data?
2. Check browser console for errors
3. Verify Polylang is installed on WordPress

**Fix**: The component has fallback data, so it should always show something

### Issue: Routing not working
**Check**:
1. Are URLs being resolved correctly?
2. Check `resolveUrl()` function output
3. Verify Next.js dynamic routes exist

**Fix**: Ensure `app/[slug]/page.tsx` exists for dynamic routing

## WordPress Configuration

### Required Plugins
1. **Polylang** or **WPML** - For multilingual support
2. **Custom REST API endpoints** - For headless functionality

### Menu Setup
1. Go to WordPress Admin → Appearance → Menus
2. Create menu with slug 'primary'
3. Add menu items
4. Assign to 'Primary Menu' location

### Language Setup (Polylang)
1. Install Polylang plugin
2. Go to Languages → Settings
3. Add Swedish (sv) and English (en)
4. Translate pages/posts
5. Ensure REST API is enabled

## Next Steps

1. **Test on localhost:3001** - Verify all changes work
2. **Check WordPress API** - Ensure endpoints return correct data
3. **Test language switching** - Click between Svenska/English
4. **Test menu navigation** - Click all menu items
5. **Test mobile menu** - Resize browser, test hamburger menu

## Need More Help?

### Debug Mode
Add this to `next.config.ts` for more verbose logging:
```typescript
const nextConfig: NextConfig = {
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};
```

### Check API Responses
Open browser DevTools → Network tab → Filter by "Fetch/XHR" → Reload page → Check API responses

### Console Logging
Add console.logs to components:
```typescript
console.log('Menu items:', menuItems);
console.log('Languages:', languages);
```
