import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { authService, dbService } from '../lib/firebase';
import { COLORS, SHADOWS } from '../theme';
import MatchCard from '../components/MatchCard';
import { Compass, RotateCcw, Coins, Sparkles, Flame, Sliders } from 'lucide-react-native';

const FILTER_TAGS = ['All', 'Dating', 'Friendship', 'Networking'];

export default function HomeScreen({ navigation }) {
  const [profiles, setProfiles] = useState([]);
  const [filteredProfiles, setFilteredProfiles] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userCoins, setUserCoins] = useState(100);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadUserDataAndProfiles();
  }, []);

  useEffect(() => {
    if (activeFilter === 'All') {
      setFilteredProfiles(profiles);
    } else {
      setFilteredProfiles(
        profiles.filter((p) => p.intent?.toLowerCase() === activeFilter.toLowerCase())
      );
    }
    setCurrentIndex(0);
  }, [activeFilter, profiles]);

  const loadUserDataAndProfiles = async () => {
    try {
      setLoading(true);
      const user = await authService.getCurrentUser();
      setCurrentUser(user);

      if (user) {
        const profile = await dbService.getProfile(user.id);
        if (profile) setUserCoins(profile.coins || 100);

        const recommended = await dbService.getRecommendedMatches(user.id);
        setProfiles(recommended);
        setFilteredProfiles(recommended);
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (type, swipedId) => {
    if (!currentUser) return;

    try {
      const { isMatch, match } = await dbService.recordSwipe(currentUser.id, swipedId, type);

      // Move to next card
      setCurrentIndex((prev) => prev + 1);

      if (isMatch) {
        const matchedName = match?.matched_user?.full_name || 'your match';
        Alert.alert(
          type === 'superlike' ? "Super Match! ⭐" : "It's a Match! 🎉",
          `You and ${matchedName} connected! Start a conversation or jump into video chat.`,
          [
            { text: 'Keep Swiping', style: 'cancel' },
            {
              text: 'Open Chat',
              onPress: () =>
                navigation.navigate('Chat', {
                  matchId: match?.id,
                  receiverName: matchedName,
                  receiverId: swipedId,
                }),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error recording swipe:', error);
    }
  };

  const resetProfiles = async () => {
    setCurrentIndex(0);
    await loadUserDataAndProfiles();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Connecting to community...</Text>
      </View>
    );
  }

  const currentProfile = filteredProfiles[currentIndex];

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Social Header */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.flameCircle}>
            <Flame color="#FFFFFF" size={20} fill="#FFFFFF" />
          </View>
          <Text style={styles.brandTitle}>Zivo</Text>
        </View>

        <TouchableOpacity
          style={styles.coinBadge}
          onPress={() => navigation.navigate('Coins')}
          activeOpacity={0.8}
        >
          <Coins color={COLORS.warning} size={18} />
          <Text style={styles.coinText}>{userCoins}</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs Bar (Dating, Friendship, Networking) */}
      <View style={styles.filtersWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
          {FILTER_TAGS.map((tag) => (
            <TouchableOpacity
              key={tag}
              style={[styles.filterChip, activeFilter === tag && styles.filterChipActive]}
              onPress={() => setActiveFilter(tag)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterChipText, activeFilter === tag && styles.filterChipTextActive]}>
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Card Arena */}
      <View style={styles.cardContainer}>
        {currentProfile ? (
          <MatchCard
            profile={currentProfile}
            onLike={() => handleSwipe('like', currentProfile.user_id)}
            onPass={() => handleSwipe('dislike', currentProfile.user_id)}
            onSuperLike={() => handleSwipe('superlike', currentProfile.user_id)}
            onInfo={() => {
              Alert.alert(
                currentProfile.full_name,
                `Intent: ${currentProfile.intent}\n\nInterests: ${(currentProfile.interests || []).join(', ')}\n\nBio: ${currentProfile.bio || 'No bio yet'}`
              );
            }}
          />
        ) : (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconCircle}>
              <Compass color={COLORS.primary} size={46} />
            </View>
            <Text style={styles.emptyTitle}>You're All Caught Up!</Text>
            <Text style={styles.emptySub}>
              No more profiles found matching "{activeFilter}". Expand your filters or explore other categories.
            </Text>

            <TouchableOpacity style={styles.refreshBtn} onPress={resetProfiles} activeOpacity={0.8}>
              <RotateCcw color="#FFFFFF" size={18} />
              <Text style={styles.refreshBtnText}>Refresh Feed</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  flameCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.glowCoral,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 22,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 0, 0.4)',
    ...SHADOWS.sm,
  },
  coinText: {
    color: COLORS.warning,
    fontSize: 14,
    fontWeight: '800',
  },
  filtersWrapper: {
    paddingBottom: 10,
  },
  filtersScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    ...SHADOWS.glowCoral,
  },
  filterChipText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 12,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 24,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 14,
  },
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 30,
    padding: 32,
    alignItems: 'center',
    width: '88%',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.md,
  },
  emptyIconCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: 'rgba(255, 78, 100, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  emptySub: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
    marginTop: 24,
    gap: 8,
    ...SHADOWS.glowCoral,
  },
  refreshBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
