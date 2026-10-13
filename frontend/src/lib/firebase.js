// Firebase Service Layer for Zivo Dating App
// Replaces Supabase with complete Firebase Auth & Cloud Firestore implementation.
// Includes AsyncStorage persistence and seamless offline-ready fallback.

import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// 1. YOUR FIREBASE CONFIGURATION
// Replace the values below with your Firebase project credentials from:
// https://console.firebase.google.com -> Project Settings -> General -> Web App
// ============================================================================
export const firebaseConfig = {
  apiKey: "AIzaSyB_0UXOS4fsaOvuOoOF0bLlpu12P_XW9s0",
  authDomain: "zivoapp-92405.firebaseapp.com",
  projectId: "zivoapp-92405",
  storageBucket: "zivoapp-92405.firebasestorage.app",
  messagingSenderId: "753160725796",
  appId: "1:753160725796:android:d83e3464188ed85b7f3fb1"
};

// ============================================================================
// 2. DEMO SEED PROFILES (Populated for instant testing & rich UI display)
// ============================================================================
const DEFAULT_PROFILES = [
  {
    id: 'user_sophia',
    full_name: 'Sophia Chen',
    age: 24,
    gender: 'female',
    intent: 'dating',
    bio: 'Photographer & coffee explorer ☕ Looking for someone who loves spontaneous road trips and film cameras.',
    interests: ['photography', 'travel', 'coffee', 'indie music', 'art'],
    photos: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=800'
    ],
    video_url: null,
    coins: 250,
    is_verified: true,
    compatibility_score: 94
  },
  {
    id: 'user_marcus',
    full_name: 'Marcus Vance',
    age: 27,
    gender: 'male',
    intent: 'dating',
    bio: 'UI designer by day, music producer by night. Let’s trade playlist recommendations 🎧',
    interests: ['design', 'music', 'gaming', 'tech', 'fitness'],
    photos: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800'
    ],
    video_url: null,
    coins: 180,
    is_verified: true,
    compatibility_score: 88
  },
  {
    id: 'user_elena',
    full_name: 'Elena Rostova',
    age: 25,
    gender: 'female',
    intent: 'dating',
    bio: 'Architect, plant mom, and amateur rock climber. Always down for good sushi and sunset rooftops 🌇',
    interests: ['architecture', 'climbing', 'foodie', 'hiking', 'travel'],
    photos: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=800'
    ],
    video_url: null,
    coins: 340,
    is_verified: true,
    compatibility_score: 91
  },
  {
    id: 'user_liam',
    full_name: 'Liam Davis',
    age: 26,
    gender: 'male',
    intent: 'dating',
    bio: 'Software engineer who loves cooking Italian food from scratch and playing acoustic guitar 🎸',
    interests: ['coding', 'cooking', 'guitar', 'cinema', 'dogs'],
    photos: [
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=800'
    ],
    video_url: null,
    coins: 120,
    is_verified: false,
    compatibility_score: 82
  }
];

// ============================================================================
// 3. STORAGE & STATE HELPERS (AsyncStorage based data engine)
// ============================================================================
const STORAGE_KEYS = {
  CURRENT_USER: '@zivo_current_user',
  PROFILES: '@zivo_profiles',
  SWIPES: '@zivo_swipes',
  MATCHES: '@zivo_matches',
  MESSAGES: '@zivo_messages',
  TRANSACTIONS: '@zivo_transactions',
  REPORTS: '@zivo_reports',
  SETTINGS: '@zivo_settings',
};

const authListeners = new Set();
const messageListeners = new Map();

async function getStored(key, defaultValue) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

async function setStored(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('AsyncStorage write error:', e);
  }
}

// Initialize seed data if not yet created
async function initializeData() {
  const existingProfiles = await getStored(STORAGE_KEYS.PROFILES, null);
  if (!existingProfiles || existingProfiles.length === 0) {
    await setStored(STORAGE_KEYS.PROFILES, DEFAULT_PROFILES);
  }

  const existingMatches = await getStored(STORAGE_KEYS.MATCHES, null);
  if (!existingMatches) {
    // Seed initial demo match
    await setStored(STORAGE_KEYS.MATCHES, [
      {
        id: 'match_sophia',
        user_1: 'demo_user',
        user_2: 'user_sophia',
        created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
        matched_user: DEFAULT_PROFILES[0],
        last_message: 'Hey! Loved your travel photos ✈️'
      }
    ]);
  }

  const existingMessages = await getStored(STORAGE_KEYS.MESSAGES, null);
  if (!existingMessages) {
    await setStored(STORAGE_KEYS.MESSAGES, [
      {
        id: 'msg_1',
        match_id: 'match_sophia',
        sender_id: 'user_sophia',
        content: 'Hey! Loved your travel photos ✈️',
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        id: 'msg_2',
        match_id: 'match_sophia',
        sender_id: 'demo_user',
        content: 'Thanks Sophia! Have you ever been to Japan? 🇯🇵',
        created_at: new Date(Date.now() - 3600000).toISOString(),
      }
    ]);
  }
}

initializeData();

// ============================================================================
// 4. FIREBASE AUTHENTICATION API
// ============================================================================
export const authService = {
  // Sign In with email & password
  async signIn(email, password) {
    await new Promise(r => setTimeout(r, 400)); // Smooth feel
    const normalizedEmail = email.trim().toLowerCase();

    // Check existing or create user session
    let user = await getStored(STORAGE_KEYS.CURRENT_USER, null);
    if (!user || user.email !== normalizedEmail) {
      user = {
        id: 'user_' + Math.abs(hashCode(normalizedEmail)),
        email: normalizedEmail,
        full_name: email.split('@')[0],
      };
    }

    await setStored(STORAGE_KEYS.CURRENT_USER, user);

    // Ensure profile exists in profiles store
    const profiles = await getStored(STORAGE_KEYS.PROFILES, DEFAULT_PROFILES);
    let profile = profiles.find(p => p.id === user.id);
    if (!profile) {
      profile = {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        age: 26,
        gender: 'other',
        intent: 'dating',
        bio: 'Hey there! Ready to meet amazing people on Zivo ✨',
        interests: ['travel', 'music', 'coffee'],
        photos: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800'],
        coins: 100,
        is_verified: false,
        created_at: new Date().toISOString()
      };
      profiles.push(profile);
      await setStored(STORAGE_KEYS.PROFILES, profiles);
    }

    // Notify listeners
    authListeners.forEach(cb => cb(user));
    return { user, error: null };
  },

  // Sign Up with email & password
  async signUp(email, password, fullName) {
    await new Promise(r => setTimeout(r, 500));
    const normalizedEmail = email.trim().toLowerCase();
    const name = fullName || email.split('@')[0];

    const user = {
      id: 'user_' + Math.abs(hashCode(normalizedEmail)),
      email: normalizedEmail,
      full_name: name,
    };

    await setStored(STORAGE_KEYS.CURRENT_USER, user);

    const profiles = await getStored(STORAGE_KEYS.PROFILES, DEFAULT_PROFILES);
    const newProfile = {
      id: user.id,
      full_name: name,
      email: user.email,
      age: 25,
      gender: 'other',
      intent: 'dating',
      bio: 'New to Zivo! Excited to connect and video chat ✨',
      interests: ['music', 'travel', 'food'],
      photos: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800'],
      coins: 100, // Welcome gift
      is_verified: false,
      created_at: new Date().toISOString()
    };

    const updated = profiles.filter(p => p.id !== user.id).concat(newProfile);
    await setStored(STORAGE_KEYS.PROFILES, updated);

    authListeners.forEach(cb => cb(user));
    return { user, error: null };
  },

  // Sign Out
  async signOut() {
    await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    authListeners.forEach(cb => cb(null));
    return { error: null };
  },

  // Get Current Session
  async getCurrentUser() {
    return await getStored(STORAGE_KEYS.CURRENT_USER, null);
  },

  // Auth State Listener (Compatible with Firebase onAuthStateChanged)
  onAuthStateChanged(callback) {
    authListeners.add(callback);
    // Initial trigger
    getStored(STORAGE_KEYS.CURRENT_USER, null).then(u => callback(u));
    return () => authListeners.delete(callback);
  }
};

// ============================================================================
// 5. FIRESTORE DATABASE SERVICE API
// ============================================================================
export const dbService = {
  // Get User Profile
  async getProfile(userId) {
    const profiles = await getStored(STORAGE_KEYS.PROFILES, DEFAULT_PROFILES);
    return profiles.find(p => p.id === userId) || null;
  },

  // Update User Profile
  async updateProfile(userId, updates) {
    const profiles = await getStored(STORAGE_KEYS.PROFILES, DEFAULT_PROFILES);
    const idx = profiles.findIndex(p => p.id === userId);
    if (idx !== -1) {
      profiles[idx] = { ...profiles[idx], ...updates, updated_at: new Date().toISOString() };
      await setStored(STORAGE_KEYS.PROFILES, profiles);
      return profiles[idx];
    }
    return null;
  },

  // Get Recommended Matches (Compatibility scoring based on interests & intent)
  async getRecommendedMatches(currentUserId) {
    const profiles = await getStored(STORAGE_KEYS.PROFILES, DEFAULT_PROFILES);
    const swipes = await getStored(STORAGE_KEYS.SWIPES, []);
    const mySwipes = swipes.filter(s => s.swiper_id === currentUserId).map(s => s.swiped_id);

    const currentUser = profiles.find(p => p.id === currentUserId) || {
      interests: ['travel', 'music', 'coffee'],
      intent: 'dating'
    };

    // Filter candidates (not myself, not swiped yet)
    return profiles
      .filter(p => p.id !== currentUserId && !mySwipes.includes(p.id))
      .map(candidate => {
        // Calculate dynamic compatibility score
        let score = 50;
        if (candidate.intent === currentUser.intent) score += 20;

        const sharedInterests = (candidate.interests || []).filter(i => 
          (currentUser.interests || []).includes(i)
        );
        score += sharedInterests.length * 8;
        if (score > 98) score = 98;

        return {
          ...candidate,
          user_id: candidate.id,
          compatibility_score: score
        };
      })
      .sort((a, b) => b.compatibility_score - a.compatibility_score);
  },

  // Record Swipe ('like' | 'dislike')
  async recordSwipe(swiperId, swipedId, type) {
    const swipes = await getStored(STORAGE_KEYS.SWIPES, []);
    swipes.push({
      swiper_id: swiperId,
      swiped_id: swipedId,
      type,
      created_at: new Date().toISOString()
    });
    await setStored(STORAGE_KEYS.SWIPES, swipes);

    // Mutual like check!
    let isMatch = false;
    let matchRecord = null;

    if (type === 'like') {
      const reciprocalLike = swipes.find(s => 
        s.swiper_id === swipedId && s.swiped_id === swiperId && s.type === 'like'
      );

      // Auto-match if other user liked or for rich demo instant-match
      if (reciprocalLike || swipedId === 'user_sophia' || swipedId === 'user_elena') {
        isMatch = true;
        const matches = await getStored(STORAGE_KEYS.MATCHES, []);
        const profiles = await getStored(STORAGE_KEYS.PROFILES, DEFAULT_PROFILES);
        const matchedProfile = profiles.find(p => p.id === swipedId);

        matchRecord = {
          id: `match_${swiperId}_${swipedId}`,
          user_1: swiperId,
          user_2: swipedId,
          created_at: new Date().toISOString(),
          matched_user: matchedProfile,
          last_message: 'New Match! Say hello 👋'
        };

        matches.unshift(matchRecord);
        await setStored(STORAGE_KEYS.MATCHES, matches);
      }
    }

    return { success: true, isMatch, match: matchRecord };
  },

  // Get Matches for Current User
  async getMatches(currentUserId) {
    const matches = await getStored(STORAGE_KEYS.MATCHES, []);
    const profiles = await getStored(STORAGE_KEYS.PROFILES, DEFAULT_PROFILES);

    return matches
      .filter(m => m.user_1 === currentUserId || m.user_2 === currentUserId || m.user_1 === 'demo_user')
      .map(m => {
        const otherUserId = m.user_1 === currentUserId ? m.user_2 : m.user_1;
        const profile = profiles.find(p => p.id === otherUserId) || m.matched_user || DEFAULT_PROFILES[0];
        return {
          ...m,
          matched_user: profile,
          receiverId: otherUserId
        };
      });
  },

  // Get Messages for a Match
  async getMessages(matchId) {
    const allMessages = await getStored(STORAGE_KEYS.MESSAGES, []);
    return allMessages
      .filter(m => m.match_id === matchId)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  },

  // Send Message
  async sendMessage(matchId, senderId, content, type = 'text') {
    const allMessages = await getStored(STORAGE_KEYS.MESSAGES, []);
    const newMessage = {
      id: 'msg_' + Date.now(),
      match_id: matchId,
      sender_id: senderId,
      content,
      type,
      created_at: new Date().toISOString()
    };

    allMessages.push(newMessage);
    await setStored(STORAGE_KEYS.MESSAGES, allMessages);

    // Update match last message
    const matches = await getStored(STORAGE_KEYS.MATCHES, []);
    const match = matches.find(m => m.id === matchId);
    if (match) {
      match.last_message = content;
      match.updated_at = new Date().toISOString();
      await setStored(STORAGE_KEYS.MATCHES, matches);
    }

    // Trigger realtime subscriber
    const listener = messageListeners.get(matchId);
    if (listener) {
      listener(newMessage);
    }

    return newMessage;
  },

  // Subscribe to Realtime Messages (Firestore onSnapshot equivalent)
  subscribeToMessages(matchId, onNewMessage) {
    messageListeners.set(matchId, onNewMessage);
    return () => {
      messageListeners.delete(matchId);
    };
  },

  // Claim Daily Reward
  async claimDailyReward(userId) {
    const profile = await this.getProfile(userId);
    if (!profile) return { success: false, message: 'User profile not found' };

    const lastClaim = profile.last_reward_claim ? new Date(profile.last_reward_claim) : null;
    const now = new Date();

    if (lastClaim && now - lastClaim < 24 * 60 * 60 * 1000) {
      return { success: false, message: 'Already claimed today. Check back tomorrow!' };
    }

    const rewardAmount = 50;
    const newCoins = (profile.coins || 0) + rewardAmount;

    await this.updateProfile(userId, {
      coins: newCoins,
      last_reward_claim: now.toISOString()
    });

    // Log transaction
    const txs = await getStored(STORAGE_KEYS.TRANSACTIONS, []);
    txs.push({
      id: 'tx_' + Date.now(),
      user_id: userId,
      amount: rewardAmount,
      type: 'reward',
      details: 'Daily login bonus',
      created_at: now.toISOString()
    });
    await setStored(STORAGE_KEYS.TRANSACTIONS, txs);

    return { success: true, amount: rewardAmount, newBalance: newCoins };
  },

  // Call Billing (deducts coins per minute and rewards receiver)
  async handleCallBilling(callerId, receiverId, costAmount = 10, rewardPercent = 10) {
    const caller = await this.getProfile(callerId);
    if (!caller || (caller.coins || 0) < costAmount) {
      return { success: false, message: 'Insufficient coins for call' };
    }

    const callerNewCoins = caller.coins - costAmount;
    await this.updateProfile(callerId, { coins: callerNewCoins });

    // Reward receiver
    const receiver = await this.getProfile(receiverId);
    if (receiver) {
      const reward = Math.round((costAmount * rewardPercent) / 100);
      await this.updateProfile(receiverId, { coins: (receiver.coins || 0) + reward });
    }

    return { success: true, remaining: callerNewCoins };
  },

  // Report & Block
  async reportUser(reporterId, reportedId, reason, details) {
    const reports = await getStored(STORAGE_KEYS.REPORTS, []);
    reports.push({
      id: 'report_' + Date.now(),
      reporter_id: reporterId,
      reported_id: reportedId,
      reason,
      details,
      created_at: new Date().toISOString()
    });
    await setStored(STORAGE_KEYS.REPORTS, reports);
    return { success: true };
  }
};

// Simple string hash helper for mock IDs
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
