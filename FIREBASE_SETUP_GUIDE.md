# Firebase Setup Guide - Fix Google Authentication

## Error Identified
`FirebaseError: Firebase: Error (auth/configuration-not-found)`

This means your Firebase project needs to be properly configured. Follow these steps:

---

## 🔧 Steps to Fix

### 1. **Go to Firebase Console**
Visit: [https://console.firebase.google.com/](https://console.firebase.google.com/)

### 2. **Select Your Project**
Open the project: **virtual-lab-5d05f**

### 3. **Enable Google Authentication**

1. In the left sidebar, click on **"Authentication"**
2. Click on **"Get Started"** (if you haven't set up Authentication yet)
3. Click on the **"Sign-in method"** tab
4. Find **"Google"** in the list of providers
5. Click on **Google** to expand it
6. Toggle the **"Enable"** switch to ON
7. Add a **public-facing name** for your project (e.g., "VirtualLab")
8. Add a **support email** (your email address)
9. Click **"Save"**

### 4. **Add Authorized Domains**

Still in the Authentication section:
1. Go to the **"Settings"** tab
2. Scroll down to **"Authorized domains"**
3. Make sure these domains are added:
   - `localhost` (should be there by default)
   - Any other domains where you'll host this app

### 5. **Verify Firestore Database**

1. In the left sidebar, click on **"Firestore Database"**
2. If not created, click **"Create database"**
3. Choose **"Start in test mode"** or **"production mode"** based on your needs
4. Select a location (choose one closest to your users)
5. Click **"Enable"**

### 6. **Set Firestore Rules (Important!)**

After creating Firestore, set up proper security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - users can read/write their own data
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Classrooms collection
    match /classrooms/{classroomId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        (get(/databases/$(database)/documents/classrooms/$(classroomId)).data.teacherId == request.auth.uid);
    }
    
    // Other collections - adjust as needed
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 🧪 Testing After Setup

1. **Restart your development server** if it's running
2. **Clear browser cache** (or open in incognito mode)
3. Try logging in with Google again
4. You should see the Google sign-in popup

---

## 🚨 Common Issues

### Issue: "auth/unauthorized-domain"
**Solution:** Add your domain to authorized domains in Firebase Console → Authentication → Settings

### Issue: Popup blocked
**Solution:** Allow popups for localhost in your browser settings

### Issue: "auth/popup-closed-by-user"
**Solution:** User closed the popup - just try again

---

## ✅ Verification

After completing these steps, you should:
1. See no console errors
2. Be able to click "Continue with Google"
3. See a Google sign-in popup
4. Successfully authenticate and be redirected

---

## 📝 Notes

- Your current Firebase config in `src/lib/firebase.ts`:
  - Project ID: `virtual-lab-5d05f`
  - API Key: `AIzaSyD4VzdbQox3aNVtzb1Y3Oh3b85oeZTRwAM`
  
- Make sure you're logged into the Google account that owns this Firebase project

---

Need help? Check the [Firebase Authentication Documentation](https://firebase.google.com/docs/auth/web/google-signin)
