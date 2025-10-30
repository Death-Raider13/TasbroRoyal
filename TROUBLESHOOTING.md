# Troubleshooting Guide

## Common Issues and Solutions

### 1. Tailwind CSS PostCSS Error

**Error:**
```
[postcss] It looks like you're trying to use `tailwindcss` directly as a PostCSS plugin.
```

**Solution:**
Tailwind CSS v4 requires a separate PostCSS plugin. This has been fixed by:
1. Installing `@tailwindcss/postcss`
2. Updating `postcss.config.js` to use `@tailwindcss/postcss`

**If you still see this error:**
```bash
npm install @tailwindcss/postcss --save-dev --legacy-peer-deps
```

### 2. Unknown @tailwind Rule Warnings

**Warning in IDE:**
```
Unknown at rule @tailwind
```

**Explanation:**
This is a CSS linter warning and can be safely ignored. The `@tailwind` directives are PostCSS directives that will be processed correctly by Tailwind CSS during build time.

**To suppress (optional):**
Add this to your VS Code settings:
```json
{
  "css.lint.unknownAtRules": "ignore"
}
```

### 3. npm install Fails with Peer Dependency Errors

**Error:**
```
ERESOLVE unable to resolve dependency tree
```

**Solution:**
```bash
npm install --legacy-peer-deps
```

This is due to React 19 being newer than some package peer dependencies expect.

### 4. Port 5173 Already in Use

**Error:**
```
Port 5173 is already in use
```

**Solution:**
```bash
# Option 1: Kill the existing process
# On Windows: Open Task Manager and end Node.js process

# Option 2: Use a different port
npm run dev -- --port 3000
```

### 5. Firebase Configuration Errors

**Error:**
```
Firebase: Error (auth/invalid-api-key)
```

**Solution:**
1. Check that `.env.local` file exists in the root directory
2. Verify all Firebase environment variables are correct
3. Ensure no extra spaces or quotes in the values
4. Restart the dev server after changing `.env.local`

### 6. Paystack Not Loading

**Error:**
Payment modal doesn't open or Paystack is undefined

**Solution:**
1. Check that Paystack script is loaded in `index.html`:
   ```html
   <script src="https://js.paystack.co/v1/inline.js"></script>
   ```
2. Verify `VITE_PAYSTACK_PUBLIC_KEY` is set in `.env.local`
3. Check browser console for script loading errors
4. Ensure you're using the correct key (test vs live)

### 7. Video Upload Fails

**Error:**
Cloudinary upload fails or returns error

**Solution:**
1. Verify Cloudinary credentials in `.env.local`
2. Check that upload preset is set to "unsigned"
3. Ensure file size is within limits (500MB for videos)
4. Check browser console for specific error messages
5. Verify Cloudinary account is active

### 8. Firestore Permission Denied

**Error:**
```
FirebaseError: Missing or insufficient permissions
```

**Solution:**
1. Deploy Firestore security rules:
   ```bash
   firebase deploy --only firestore:rules
   ```
2. Check that user is authenticated
3. Verify user role in Firestore matches required role
4. For testing, you can temporarily use test mode rules (not recommended for production)

### 9. Build Fails

**Error:**
```
npm run build fails with errors
```

**Solution:**
1. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules
   npm install --legacy-peer-deps
   ```
2. Clear Vite cache:
   ```bash
   rm -rf node_modules/.vite
   ```
3. Check for TypeScript errors (if any .ts files)
4. Verify all imports are correct

### 10. Images Not Loading

**Error:**
Images show broken icon

**Solution:**
1. Check image URLs are valid
2. Verify Firebase Storage rules allow read access
3. Check CORS settings if loading from external sources
4. Ensure images are uploaded correctly to Firebase Storage

### 11. Routes Not Working After Deployment

**Error:**
404 errors on page refresh in production

**Solution:**
This is already configured in `firebase.json` with rewrites. If still having issues:
1. Verify `firebase.json` has the rewrite rule:
   ```json
   "rewrites": [
     {
       "source": "**",
       "destination": "/index.html"
     }
   ]
   ```
2. Redeploy: `firebase deploy --only hosting`

### 12. Slow Development Server

**Issue:**
Dev server is slow or unresponsive

**Solution:**
1. Clear Vite cache:
   ```bash
   rm -rf node_modules/.vite
   ```
2. Restart dev server
3. Check for large files in `public` folder
4. Disable browser extensions that might interfere
5. Close other resource-intensive applications

### 13. Authentication State Not Persisting

**Issue:**
User gets logged out on page refresh

**Solution:**
1. Check that `initAuth()` is called in `App.jsx`
2. Verify Firebase persistence is enabled (default)
3. Check browser localStorage is not disabled
4. Clear browser cache and try again

### 14. Styles Not Applying

**Issue:**
Tailwind classes not working

**Solution:**
1. Verify `tailwind.config.js` content paths are correct
2. Check that `@tailwind` directives are in `src/index.css`
3. Restart dev server
4. Clear browser cache
5. Check for CSS specificity conflicts

### 15. Environment Variables Not Working

**Issue:**
`import.meta.env.VITE_*` returns undefined

**Solution:**
1. Ensure variable names start with `VITE_`
2. Restart dev server after adding new variables
3. Check `.env.local` is in the root directory (not in src)
4. Verify no syntax errors in `.env.local`
5. Don't use quotes around values in `.env.local`

## Development Tips

### Hot Module Replacement (HMR) Not Working
- Save the file again
- Refresh the browser manually
- Restart the dev server

### Console Errors
Always check the browser console (F12) for detailed error messages.

### Network Tab
Use the Network tab in DevTools to debug API calls and failed requests.

### React DevTools
Install React DevTools browser extension for better debugging.

## Getting More Help

1. **Check Documentation:**
   - README.md
   - SETUP_GUIDE.md
   - TESTING_GUIDE.md

2. **Firebase Console:**
   - Check Authentication users
   - View Firestore data
   - Check Storage files
   - Review security rules

3. **Browser DevTools:**
   - Console for errors
   - Network for failed requests
   - Application for localStorage/cookies

4. **Firebase Logs:**
   ```bash
   firebase functions:log
   ```

## Preventive Measures

- Always use `--legacy-peer-deps` when installing packages
- Keep `.env.local` backed up securely
- Test in incognito mode to rule out cache issues
- Use the same Node.js version across team
- Commit `package-lock.json` to version control
- Don't commit `.env.local` to git

---

**Still having issues?** Check the browser console and Firebase Console for specific error messages.
