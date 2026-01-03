# Mobile Access Setup Guide

## 🔴 Problem: "Domain Not Authorized" Error on Mobile

When accessing the app from your mobile device, you see this error because Firebase only allows certain domains to authenticate.

---

## ✅ Solution: Add Authorized Domains to Firebase

### **Quick Fix - Add Your Network Domain**

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select**: virtual-lab-5d05f
3. **Navigate**: Authentication → Settings
4. **Scroll to**: "Authorized domains"
5. **Click**: "Add domain"
6. **Add BOTH of these**:
   - `192.168.1.76` (your local network IP)
   - `crazy-planets-pump.loca.lt` (public tunnel URL - see below)

---

## 🌐 Public Access with Tunnel (RECOMMENDED)

I've set up a public tunnel for you! Your app is now accessible at:

### **Public URL**: https://crazy-planets-pump.loca.lt

**Important Steps:**

### 1. Add the Tunnel Domain to Firebase
- Go to Firebase Console → Authentication → Settings → Authorized domains
- Click "Add domain"
- Enter: `crazy-planets-pump.loca.lt`
- Click "Add"

### 2. Access from Any Device
- **From your mobile**: Open https://crazy-planets-pump.loca.lt
- **From any computer**: Open https://crazy-planets-pump.loca.lt
- First time you visit, click "Continue" on the localtunnel warning page

---

## 📱 Multiple Ways to Access Your App

| Method | URL | Best For |
|--------|-----|----------|
| **Localhost** | http://localhost:8080/ | Your computer only |
| **Local Network** | http://192.168.1.76:8080/ | Devices on same WiFi |
| **Public Tunnel** | https://crazy-planets-pump.loca.lt | Anyone, anywhere |

---

## 🔧 How to Keep the Tunnel Running

The tunnel is currently running. To start it again later:

```bash
npx -y localtunnel --port 8080
```

**Note**: The URL will change each time you restart the tunnel. You'll need to update Firebase authorized domains with the new URL.

---

## 🎯 For Production/Demo

If you want a permanent URL, consider:

1. **Deploy to Vercel/Netlify** (recommended)
2. **Use ngrok** with a static domain
3. **Deploy to Firebase Hosting**

For now, the localtunnel works great for testing on mobile!

---

## ⚠️ Security Note

For production, remove development domains and only keep your production domain authorized.

Current authorized domains should include:
- `localhost` (for development)
- `192.168.1.76` (for local network testing)
- `crazy-planets-pump.loca.lt` (for mobile/public testing)
- Your production domain when deployed

---

## 🚀 Quick Start Checklist

- [ ] Add `crazy-planets-pump.loca.lt` to Firebase authorized domains
- [ ] Access https://crazy-planets-pump.loca.lt from your mobile
- [ ] Click "Continue" on the localtunnel warning page
- [ ] Try logging in with Google
- [ ] Success! ✨
