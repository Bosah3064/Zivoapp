// Firebase Service for Zivo Admin Dashboard
// Provides Firestore queries and updates for users, reports, and settings.

export const firebaseConfig = {
  apiKey: "AIzaSyYOUR_FIREBASE_API_KEY_HERE",
  authDomain: "zivo-dating-app.firebaseapp.com",
  projectId: "zivo-dating-app",
  storageBucket: "zivo-dating-app.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};

const DEFAULT_ADMIN_USERS = [
  {
    id: 'user_sophia',
    full_name: 'Sophia Chen',
    email: 'sophia@example.com',
    gender: 'female',
    intent: 'dating',
    coins: 250,
    is_admin: false,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'user_marcus',
    full_name: 'Marcus Vance',
    email: 'marcus@example.com',
    gender: 'male',
    intent: 'dating',
    coins: 180,
    is_admin: false,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'user_elena',
    full_name: 'Elena Rostova',
    email: 'elena@example.com',
    gender: 'female',
    intent: 'dating',
    coins: 340,
    is_admin: false,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'user_liam',
    full_name: 'Liam Davis',
    email: 'liam@example.com',
    gender: 'male',
    intent: 'dating',
    coins: 120,
    is_admin: false,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  }
];

const DEFAULT_REPORTS = [
  {
    id: 'rep_1',
    reporter_id: 'user_sophia',
    reported_id: 'user_liam',
    reporter_name: 'Sophia Chen',
    reported_name: 'Liam Davis',
    reason: 'Inappropriate message',
    details: 'User sent unsolicited commercial links in chat.',
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
  }
];

const DEFAULT_SETTINGS = [
  {
    key: 'coin_prices',
    value: [
      { id: '1', amount: 100, price: 0.99 },
      { id: '2', amount: 550, price: 4.99 },
      { id: '3', amount: 1200, price: 9.99 },
      { id: '4', amount: 3000, price: 19.99 }
    ]
  },
  {
    key: 'daily_reward_amount',
    value: 50
  },
  {
    key: 'call_cost_per_minute',
    value: 10
  }
];

export const adminService = {
  async getUsers() {
    const raw = localStorage.getItem('@zivo_admin_users');
    if (!raw) {
      localStorage.setItem('@zivo_admin_users', JSON.stringify(DEFAULT_ADMIN_USERS));
      return DEFAULT_ADMIN_USERS;
    }
    return JSON.parse(raw);
  },

  async updateUserCoins(userId, amountToAdd) {
    const users = await this.getUsers();
    const user = users.find(u => u.id === userId);
    if (user) {
      user.coins = Math.max(0, (user.coins || 0) + amountToAdd);
      localStorage.setItem('@zivo_admin_users', JSON.stringify(users));
    }
    return users;
  },

  async getReports() {
    const raw = localStorage.getItem('@zivo_admin_reports');
    if (!raw) {
      localStorage.setItem('@zivo_admin_reports', JSON.stringify(DEFAULT_REPORTS));
      return DEFAULT_REPORTS;
    }
    return JSON.parse(raw);
  },

  async dismissReport(reportId) {
    const reports = await this.getReports();
    const updated = reports.filter(r => r.id !== reportId);
    localStorage.setItem('@zivo_admin_reports', JSON.stringify(updated));
    return updated;
  },

  async banUser(userId) {
    const users = await this.getUsers();
    const updated = users.filter(u => u.id !== userId);
    localStorage.setItem('@zivo_admin_users', JSON.stringify(updated));
    return updated;
  },

  async getSettings() {
    const raw = localStorage.getItem('@zivo_admin_settings');
    if (!raw) {
      localStorage.setItem('@zivo_admin_settings', JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    return JSON.parse(raw);
  },

  async updateSetting(key, newValue) {
    const settings = await this.getSettings();
    const setting = settings.find(s => s.key === key);
    if (setting) {
      setting.value = newValue;
      localStorage.setItem('@zivo_admin_settings', JSON.stringify(settings));
    }
    return settings;
  }
};
