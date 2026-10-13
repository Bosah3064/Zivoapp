# 🔥 Complete Supabase to Firebase Migration Guide for Zivo

This guide provides step-by-step instructions for moving your users, database records, and media storage from **Supabase** to **Firebase** (Cloud Firestore, Firebase Authentication, and Cloud Storage).

---

## 📋 Table of Contents
1. [Overview & Concept Mapping](#1-overview--concept-mapping)
2. [Step 1: Create Your Firebase Project](#step-1-create-your-firebase-project)
3. [Step 2: Enable Firebase Authentication](#step-2-enable-firebase-authentication)
4. [Step 3: Create Cloud Firestore Database](#step-3-create-cloud-firestore-database)
5. [Step 4: Enable Cloud Storage for Photos & Videos](#step-4-enable-cloud-storage-for-photos--videos)
6. [Step 5: Apply Security Rules](#step-5-apply-security-rules)
7. [Step 6: Linking Credentials in the Code](#step-6-linking-credentials-in-the-code)
8. [Step 7: Automated Data Migration Script](#step-7-automated-data-migration-script)
9. [Verification & Testing Checklist](#verification--testing-checklist)

---

## 1. Overview & Concept Mapping

| Feature | Supabase (PostgreSQL) | Firebase (NoSQL & Auth) |
| :--- | :--- | :--- |
| **User Accounts** | `auth.users` | **Firebase Authentication** (`users`) |
| **Profile Records** | `public.profiles` table | **`profiles`** collection |
| **Swipes & Likes** | `public.swipes` table | **`swipes`** collection |
| **Mutual Connections** | `public.matches` table | **`matches`** collection |
| **Realtime Chat** | `public.messages` + Postgres Channels | **`messages`** collection + `onSnapshot` |
| **Coins & History** | `public.transactions` table | **`transactions`** collection |
| **Safety Moderation** | `public.safety_reports` table | **`safety_reports`** collection |
| **Platform Config** | `public.settings` table | **`settings`** collection |
| **Photos & Videos** | Supabase Storage Buckets | **Firebase Cloud Storage** |

---

## Step 1: Create Your Firebase Project & Register Apps

1. Open the [Firebase Console](https://console.firebase.google.com).
2. Click **Add project** (or *Create a project*).
3. Name your project (e.g. `zivo-dating`).
4. (Optional) Enable Google Analytics and click **Create Project**.

### A. Register the Web App (Used by Admin Dashboard & Mobile Web)
1. On the Project Overview page, click the **Web icon (`</>`)**:
   - **App nickname**: `Zivo Web`
   - Click **Register app**.
2. Copy the generated `firebaseConfig` object:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyB...",
     authDomain: "zivo-dating.firebaseapp.com",
     projectId: "zivo-dating",
     storageBucket: "zivo-dating.appspot.com",
     messagingSenderId: "123456789...",
     appId: "1:123456789:web:abcdef..."
   };
   ```
   Paste these credentials into [`frontend/src/lib/firebase.js`](frontend/src/lib/firebase.js) and [`admin/src/lib/firebase.js`](admin/src/lib/firebase.js).

---

### B. Register the Android App (For Mobile App Builds)
1. In Firebase Console, click **Add app** (or the **Android icon 🤖**):
2. Fill in the exact Android fields:
   - **Android package name**: `com.zivo.dating`
   - **App nickname**: `Zivo Android`
   - **Debug signing certificate SHA-1** (Optional, required for Google Sign-In):
     * Run this command to generate your local debug SHA-1:
       ```bash
       keytool -list -v -keystore "%USERPROFILE%\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android
       ```
     * Or if using EAS Build: run `npx eas credentials`
3. Click **Register app**.
4. Download **`google-services.json`** and place it in the `frontend/` folder:
   ```
   frontend/google-services.json
   ```

---

### C. Register the iOS App (For Apple Builds)
1. In Firebase Console, click **Add app** (or the **Apple icon 🍏**):
2. Fill in the exact iOS fields:
   - **Apple bundle ID**: `com.zivo.dating`
   - **App nickname**: `Zivo iOS`
3. Click **Register app**.
4. Download **`GoogleService-Info.plist`** and place it in the `frontend/` folder:
   ```
   frontend/GoogleService-Info.plist
   ```

---

## Step 2: Enable Firebase Authentication

1. In the left navigation of the Firebase Console, click **Build > Authentication**.
2. Click **Get Started**.
3. In the **Sign-in method** tab:
   - **Email/Password**: Click, toggle **Enable**, and click **Save**.
   - (Optional) **Google**: Click, toggle **Enable**, enter your support email, and save.

---

## Step 3: Create Cloud Firestore Database

1. In the left navigation, click **Build > Firestore Database**.
2. Click **Create database**.
3. Choose a location closest to your users (e.g., `us-central` or `eur3`).
4. Choose **Start in production mode** (or test mode for local development) and click **Create**.

### Collections Schema:
When documents are added, Firestore will use these collection structures:

#### `profiles` (Collection)
Document ID: `userId` (matches `auth.currentUser.uid`)
```json
{
  "id": "user_123",
  "full_name": "Sophia Chen",
  "email": "sophia@example.com",
  "age": 24,
  "gender": "female",
  "intent": "dating",
  "bio": "Photographer & coffee lover ☕",
  "interests": ["photography", "travel", "coffee"],
  "photos": ["https://...photo1.jpg", "https://...photo2.jpg"],
  "video_url": null,
  "coins": 250,
  "is_verified": true,
  "last_reward_claim": "2026-10-13T10:00:00.000Z",
  "created_at": "2026-10-13T10:00:00.000Z"
}
```

#### `matches` (Collection)
Document ID: `match_uid1_uid2`
```json
{
  "id": "match_uid1_uid2",
  "user_1": "uid1",
  "user_2": "uid2",
  "created_at": "2026-10-13T10:30:00.000Z",
  "last_message": "Hey! Loved your photos ✨"
}
```

#### `messages` (Collection)
Document ID: Auto-generated
```json
{
  "id": "msg_abc",
  "match_id": "match_uid1_uid2",
  "sender_id": "uid1",
  "content": "Hey! Loved your photos ✨",
  "type": "text",
  "created_at": "2026-10-13T10:31:00.000Z"
}
```

#### `swipes` (Collection)
```json
{
  "swiper_id": "uid1",
  "swiped_id": "uid2",
  "type": "like",
  "created_at": "2026-10-13T10:30:00.000Z"
}
```

#### `transactions` (Collection)
```json
{
  "user_id": "uid1",
  "amount": 50,
  "type": "reward",
  "details": "Daily login reward",
  "created_at": "2026-10-13T10:00:00.000Z"
}
```

#### `safety_reports` (Collection)
```json
{
  "reporter_id": "uid1",
  "reported_id": "uid2",
  "reason": "Inappropriate behavior",
  "details": "Emergency video report",
  "created_at": "2026-10-13T11:00:00.000Z"
}
```

#### `settings` (Collection)
Document ID: `coin_prices`
```json
{
  "key": "coin_prices",
  "value": [
    { "id": "1", "amount": 100, "price": 0.99 },
    { "id": "2", "amount": 550, "price": 4.99 },
    { "id": "3", "amount": 1200, "price": 9.99 },
    { "id": "4", "amount": 3000, "price": 19.99 }
  ]
}
```

---

## Step 4: Enable Cloud Storage for Photos & Videos

1. In the left navigation, click **Build > Storage**.
2. Click **Get Started** and select your location.
3. Once initialized, your storage buckets will support:
   - `avatars/{userId}/` for profile pictures
   - `profile-videos/{userId}/` for intro videos
   - `chat-media/{matchId}/` for media messages

---

## Step 5: Apply Security Rules

Copy and paste the rules from your repository into Firebase:

1. **Firestore Rules**:
   - In Firebase Console, go to **Firestore Database > Rules**.
   - Paste the contents of [`firestore.rules`](file:///c:/Users/lame3/OneDrive/Desktop/Zivo%20app/firestore.rules).
   - Click **Publish**.

2. **Storage Rules**:
   - In Firebase Console, go to **Storage > Rules**.
   - Paste the contents of [`storage.rules`](file:///c:/Users/lame3/OneDrive/Desktop/Zivo%20app/storage.rules).
   - Click **Publish**.

---

## Step 6: Linking Credentials in the Code

Paste your credentials into these two files:

1. **Mobile App**:
   Open [`frontend/src/lib/firebase.js`](file:///c:/Users/lame3/OneDrive/Desktop/Zivo%20app/frontend/src/lib/firebase.js) and update `firebaseConfig`:
   ```javascript
   export const firebaseConfig = {
     apiKey: "YOUR_FIREBASE_API_KEY",
     authDomain: "YOUR_PROJECT.firebaseapp.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT.appspot.com",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

2. **Admin Web Console**:
   Open [`admin/src/lib/firebase.js`](file:///c:/Users/lame3/OneDrive/Desktop/Zivo%20app/admin/src/lib/firebase.js) and update `firebaseConfig` identically.

---

## Step 7: Automated Data Migration Script

To export data from your existing Supabase database:

1. In terminal:
   ```bash
   node scripts/migrate_supabase_to_firebase.js
   ```
2. The script will automatically fetch all existing tables (`profiles`, `matches`, `messages`, `swipes`, `settings`) from your Supabase instance and save a clean backup JSON file in:
   `backups/supabase_export_<timestamp>.json`
3. You can inspect the backup file or use the Firebase Admin SDK to batch write them into Firestore.

---

## Verification & Testing Checklist

- [x] **Sign Up & Sign In**: Create an account on AuthScreen; verify the new record in Firebase Authentication.
- [x] **Profile Document**: Verify a new document appears in the `profiles` collection with coin balance (`100`).
- [x] **Discovery Swiping**: Swipe left/right on profiles; verify mutual likes automatically create a document in `matches`.
- [x] **Real-Time Chat**: Send messages between two users; verify sub-second delivery via `onSnapshot`.
- [x] **Video Call Billing**: Enter a video call; verify 10 coins/min are deducted and the receiver gets credited.
- [x] **Daily Login Streak**: Claim bonus in CoinStoreScreen; verify transaction logged and balance updated.
- [x] **Admin Console**: Open admin panel at `http://localhost:5173`; adjust coins and verify instant sync.
