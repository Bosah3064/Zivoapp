# Zivo Smart Video Dating App 💫

Welcome to **Zivo**, a video-first dating and connection application built with React Native (Expo) and **Firebase** (Auth & Cloud Firestore).

---

## 🎨 UI/UX & Color System Upgrades
The application has been overhauled with a high-contrast, cohesive visual design:
- **No White-on-White or Muddy Text**: Every component uses the centralized design system in `frontend/src/theme.js`.
- **Card Media Scrims**: Background videos and photos on cards feature dark gradient scrims ensuring user names, ages, and bios remain 100% legible even against pure white or bright backgrounds.
- **Explicit Input Styling**: All text fields specify explicit dark backgrounds (`#131825`), crisp white typography (`#FFFFFF`), and slate placeholder colors (`#64748B`).
- **Semantic Color Coding**:
  - 💜 **Electric Violet (`#8B5CF6`)**: Primary brand actions and matches
  - 🌸 **Rose Accent (`#EC4899`)**: Discover highlights and badges
  - 🪙 **Amber Gold (`#F59E0B`)**: Coins, rewards, and store deals
  - 🟢 **Emerald Green (`#10B981`)**: Likes, mutual matches, and verified badges
  - 🔴 **Ruby Red (`#EF4444`)**: Passes, declines, and safety blocks

---

## 🔥 Firebase Setup

Supabase has been replaced with Firebase.

### 1. Get Your Firebase Config
1. Go to the [Firebase Console](https://console.firebase.google.com).
2. Create a new project (e.g., `zivo-dating-app`).
3. Under **Project Settings > General > Your apps**, add a **Web app**.
4. Copy your configuration credentials:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`

### 2. Configure Your Apps
Paste your credentials into:
- **Mobile App**: `frontend/src/lib/firebase.js` in `firebaseConfig`
- **Admin Dashboard**: `admin/src/lib/firebase.js` in `firebaseConfig`

### 3. Enable Firebase Services
1. **Authentication**:
   - Enable **Email/Password** provider (and optionally Google provider).
2. **Cloud Firestore**:
   - Create a Firestore database in **production mode** or **test mode**.
   - Collections used:
     - `profiles`: User information, coin balances, photos, bio, interests, intent.
     - `swipes`: User likes and passes.
     - `matches`: Mutual connections and conversation pointers.
     - `messages`: Real-time chat messages between matched users.
     - `transactions`: Coin purchases, call charges, and reward claims.
     - `safety_reports`: Flagged users and moderation actions.
     - `settings`: Global app pricing and reward values.

---

## 🚀 Running the Apps

### Frontend (Mobile App - Expo)
```bash
cd frontend
npm install
npx expo start
```
- Press `a` for Android Emulator, `i` for iOS Simulator, or scan the QR code using the **Expo Go** app on your phone.

### Admin Dashboard (Web)
```bash
cd admin
npm install
npm run dev
```
- Open `http://localhost:5173` to access the moderation and management console.

---

## 🛡️ Built-in Offline & Demo Mode
If you run the app before configuring live Firebase credentials, Zivo includes an automatic offline storage engine (`AsyncStorage` / `localStorage`) preloaded with demo profiles, real-time messaging simulator, coin rewards, and mutual matching. The app will never crash with blank screens.
