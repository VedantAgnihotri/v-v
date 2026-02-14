# Canvas Real-Time Sync Setup Guide

This guide explains how to set up Firebase for the collaborative canvas feature.

## Features
- ✅ Real-time sync between two users
- ✅ Lock/Unlock element behavior
- ✅ Text editing with Bold/Italic/Underline styles
- ✅ Image rotation and resizing
- ✅ Persistent cloud storage
- ✅ Floating control panels
- ✅ Automatic sync status indicator

## Setup Instructions

### 1. Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project"
3. Name it (e.g., "valentine-canvas")
4. Accept the defaults and create

### 2. Enable Firestore Database
1. In Firebase Console, go to **Build** → **Firestore Database**
2. Click **Create database**
3. Start in **Test mode** (for development only)
4. Select a region close to you
5. Click **Enable**

### 3. Enable Cloud Storage
1. Go to **Build** → **Storage**
2. Click **Get started**
3. Start in **Test mode**
4. Select the same region as Firestore
5. Click **Done**

### 4. Get Your Firebase Config
1. Go to **Project Settings** (gear icon → Project settings)
2. Scroll down to "Your apps" section
3. Click the **`</>`** (web) icon if no web app exists
4. Register the app (name it "canvas")
5. Copy the entire `firebaseConfig` object

### 5. Update canvas.js with Your Config
1. Open `canvas.js` in your editor
2. Find the `firebaseConfig` object at the top (around line 30)
3. Replace the placeholder values:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT.firebaseapp.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT.appspot.com",
     messagingSenderId: "YOUR_MESSAGING_ID",
     appId: "YOUR_APP_ID"
   };
   ```
4. Save the file

### 6. Set Firestore Security Rules
1. In Firebase Console, go to **Firestore Database** → **Rules** tab
2. Replace the rules with:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /canvas/{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```
3. Click **Publish**

⚠️ **WARNING:** These rules allow anyone to read/write. For production:
- Change `if true` to `if request.auth != null` for authenticated users only
- Add user-specific rules for privacy

### 7. (Optional) Set Storage Security Rules
1. Go to **Storage** → **Rules** tab
2. Use these rules:
   ```
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /canvas/{allPaths=**} {
         allow read, write: if true;
       }
     }
   }
   ```

## How It Works

### Element Lifecycle
1. **Create**: User adds text or image → Auto-saved to Firebase
2. **Edit**: Click to unlock → Drag/resize/rotate → Click outside to lock
3. **Store**: All changes sync in real-time to Firebase
4. **Delete**: Control panel delete button removes from both users

### Data Structure
```javascript
{
  type: 'text' | 'image',
  // Text fields
  text: "Your text",
  color: "#000000",
  fontSize: "16px",
  bold: false,
  italic: false,
  underline: false,
  // Image fields
  src: "data:image/jpeg;base64,...",
  rotation: 0,
  // Common fields
  x: 100,
  y: 200,
  width: "150px",
  height: "auto",
  locked: true
}
```

### Sync Status Indicator
- 🔄 Syncing... - Data being sent to Firebase
- ✓ Synced - Successfully saved
- ✓ Ready - No pending changes
- ✗ Error - Firebase connection issue

## Troubleshooting

### "Sync Status shows Error"
- Check Firebase Console → Firestore → Data (should be empty initially)
- Verify your config values in `canvas.js`
- Check browser console for Firebase errors (F12)
- Ensure Firestore Database and Auth are enabled

### "Changes not syncing between users"
- Check both users are on same page
- Verify Firestore Rules allow read/write
- Check browser console for errors
- Hard refresh page (Ctrl+Shift+R)

### "Images not saving"
- Currently using base64 encoding (stored in Firestore)
- For large images, consider Cloud Storage integration
- Max Firestore document size is 1MB

### "Permission Denied" errors
- Ensure Firestore Rules are set correctly
- Test mode allows all access (⚠️ not for production)
- Check rules don't have typos

## Testing the Canvas

### Single User Testing
1. Open the canvas in one browser tab
2. Add text/images → they save to Firebase
3. Refresh the page → elements should reappear

### Two-User Testing
1. Open canvas in two browser windows/tabs
2. Add element in window 1
3. Watch it appear in window 2 instantly
4. Edit in window 1 → see updates in window 2

## Production Checklist
- [ ] Update Firestore rules to require authentication
- [ ] Implement Firebase Auth (Google/Email sign-in)
- [ ] Use Cloud Storage for images instead of base64
- [ ] Add user ID to canvas path for privacy
- [ ] Set up Firestore backups
- [ ] Test with both users on different devices
- [ ] Remove test mode restrictions

## File Structure
```
/home/vedant/valen/
├── canvas.js          ← Main canvas logic + Firebase config
├── style.css          ← Canvas styling
├── index.html         ← Firebase script loading
└── CANVAS_SETUP.md    ← This file
```

## Need Help?
- Firebase Docs: https://firebase.google.com/docs
- Firestore Guide: https://firebase.google.com/docs/firestore
- Real-time Database: https://firebase.google.com/docs/database

---
**Last Updated:** February 14, 2026
