import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { authService, dbService } from '../lib/firebase';
import { COLORS, SHADOWS } from '../theme';
import {
  Coins,
  ShieldCheck,
  Edit3,
  LogOut,
  Sparkles,
  Heart,
  Settings as SettingsIcon,
  Check,
  X,
  Flame,
} from 'lucide-react-native';

export default function ProfileScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editAge, setEditAge] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editIntent, setEditIntent] = useState('dating');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
    const unsubscribe = navigation.addListener('focus', () => {
      loadProfile();
    });
    return unsubscribe;
  }, [navigation]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const user = await authService.getCurrentUser();
      if (user) {
        const data = await dbService.getProfile(user.id);
        if (data) {
          setProfile(data);
          setEditName(data.full_name || '');
          setEditAge(String(data.age || 25));
          setEditBio(data.bio || '');
          setEditIntent(data.intent || 'dating');
        }
      }
    } catch (e) {
      console.error('Error loading profile:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const updated = await dbService.updateProfile(profile.id, {
        full_name: editName.trim(),
        age: parseInt(editAge, 10) || profile.age,
        bio: editBio.trim(),
        intent: editIntent,
      });

      if (updated) {
        setProfile(updated);
        setEditModalVisible(false);
        Alert.alert('Profile Saved ✨', 'Your public information has been updated.');
      }
    } catch (e) {
      Alert.alert('Error', 'Unable to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out of Zivo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await authService.signOut();
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  const avatarUri =
    profile?.photos?.[0] ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Bar */}
        <View style={styles.header}>
          <Text style={styles.title}>My Profile</Text>
          <TouchableOpacity
            style={styles.editHeaderBtn}
            onPress={() => setEditModalVisible(true)}
            activeOpacity={0.8}
          >
            <Edit3 color={COLORS.primaryLight} size={18} />
            <Text style={styles.editHeaderText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
            <TouchableOpacity
              style={[styles.avatarBadge, SHADOWS.glowCoral]}
              onPress={() => setEditModalVisible(true)}
            >
              <Edit3 color="#FFFFFF" size={14} />
            </TouchableOpacity>
          </View>

          <View style={styles.userNameRow}>
            <Text style={styles.userName}>
              {profile?.full_name || 'Zivo Member'}, {profile?.age || 25}
            </Text>
            {profile?.is_verified && (
              <ShieldCheck color={COLORS.success} size={20} />
            )}
          </View>

          <View style={styles.intentPill}>
            <Text style={styles.intentText}>
              Looking for {profile?.intent || 'Dating'}
            </Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => navigation.navigate('Coins')}
            activeOpacity={0.8}
          >
            <Coins color={COLORS.warning} size={24} />
            <Text style={styles.statValue}>{profile?.coins || 0}</Text>
            <Text style={styles.statLabel}>Coins Wallet</Text>
          </TouchableOpacity>

          <View style={styles.statCard}>
            <Sparkles color={COLORS.secondary} size={24} />
            <Text style={styles.statValue}>94%</Text>
            <Text style={styles.statLabel}>Match Rate</Text>
          </View>

          <View style={styles.statCard}>
            <Flame color={COLORS.primary} size={24} fill={COLORS.primary} />
            <Text style={styles.statValue}>🔥 2d</Text>
            <Text style={styles.statLabel}>Active Streak</Text>
          </View>
        </View>

        {/* About & Bio Card */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>About Me</Text>
          <Text style={styles.bioText}>
            {profile?.bio ||
              'No bio added yet. Tell people what excites you, your favorite weekend routine, or music tastes!'}
          </Text>

          {profile?.interests && profile.interests.length > 0 && (
            <View style={styles.interestsContainer}>
              {profile.interests.map((item, idx) => (
                <View key={idx} style={styles.interestChip}>
                  <Text style={styles.interestChipText}>#{item}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Preferences & Settings */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Perks & Security</Text>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => navigation.navigate('Coins')}
          >
            <View style={styles.actionRowLeft}>
              <Coins color={COLORS.warning} size={20} />
              <Text style={styles.actionRowText}>Coin Store & Streaks</Text>
            </View>
            <Text style={styles.actionRowRight}>Recharge &gt;</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => Alert.alert('Safety Features', 'Video call preview blur and end-to-end user moderation are actively enabled.')}
          >
            <View style={styles.actionRowLeft}>
              <SettingsIcon color={COLORS.textMuted} size={20} />
              <Text style={styles.actionRowText}>Call Blur & Safety Filter</Text>
            </View>
            <Text style={[styles.actionRowRight, { color: COLORS.success }]}>Protected</Text>
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={handleSignOut}
          activeOpacity={0.8}
        >
          <LogOut color={COLORS.danger} size={20} />
          <Text style={styles.signOutText}>Log Out of Zivo</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <SafeAreaView style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <X color={COLORS.textPrimary} size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.modalInput}
                value={editName}
                onChangeText={setEditName}
                placeholderTextColor={COLORS.inputPlaceholder}
              />

              <Text style={styles.inputLabel}>Age</Text>
              <TextInput
                style={styles.modalInput}
                value={editAge}
                onChangeText={setEditAge}
                keyboardType="numeric"
                placeholderTextColor={COLORS.inputPlaceholder}
              />

              <Text style={styles.inputLabel}>I'm Looking For</Text>
              <View style={styles.intentSelector}>
                {['dating', 'friendship', 'networking'].map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.intentOption,
                      editIntent === item && styles.intentOptionActive,
                    ]}
                    onPress={() => setEditIntent(item)}
                  >
                    <Text
                      style={[
                        styles.intentOptionText,
                        editIntent === item && styles.intentOptionTextActive,
                      ]}
                    >
                      {item.charAt(0).toUpperCase() + item.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Bio</Text>
              <TextInput
                style={[styles.modalInput, styles.bioInput]}
                value={editBio}
                onChangeText={setEditBio}
                multiline
                numberOfLines={4}
                placeholder="Share your passions, vibe, and what makes you smile..."
                placeholderTextColor={COLORS.inputPlaceholder}
              />

              <TouchableOpacity
                style={[styles.saveBtn, SHADOWS.glowCoral]}
                onPress={handleSaveProfile}
                disabled={saving}
                activeOpacity={0.85}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Check color="#FFFFFF" size={20} />
                    <Text style={styles.saveBtnText}>Save Profile</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 36,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  editHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 78, 100, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 78, 100, 0.35)',
  },
  editHeaderText: {
    color: COLORS.primaryLight,
    fontWeight: '800',
    fontSize: 13,
  },
  userCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 26,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.md,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 14,
  },
  avatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 3.5,
    borderColor: COLORS.primary,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '800',
  },
  intentPill: {
    backgroundColor: 'rgba(255, 78, 100, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 78, 100, 0.3)',
  },
  intentText: {
    color: COLORS.primaryLight,
    fontSize: 12,
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  statValue: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontWeight: '900',
    marginTop: 6,
  },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10,
  },
  bioText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '400',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  interestChip: {
    backgroundColor: 'rgba(139, 92, 246, 0.18)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.35)',
  },
  interestChipText: {
    color: COLORS.secondaryLight,
    fontSize: 12,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  actionRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionRowText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  actionRowRight: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  signOutBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    paddingVertical: 16,
    borderRadius: 22,
    marginTop: 8,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  signOutText: {
    color: COLORS.danger,
    fontSize: 16,
    fontWeight: '700',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surfaceElevated,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '800',
  },
  inputLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 10,
  },
  modalInput: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: COLORS.inputText,
    fontSize: 15,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  intentSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  intentOption: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  intentOptionActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  intentOptionText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  intentOptionTextActive: {
    color: '#FFFFFF',
  },
  saveBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
    gap: 8,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
