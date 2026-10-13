import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { authService, dbService } from '../lib/firebase';
import { COLORS, SHADOWS } from '../theme';
import MatchCard from '../components/MatchCard';
import { Compass, RotateCcw, Coins, Sparkles } from 'lucide-react-native';

export default function HomeScreen({ navigation }) {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userCoins, setUserCoins] = useState(100);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadUserDataAndProfiles();
  }, []);

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
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
      Alert.alert('Notice', 'Unable to load candidates. Showing demo profiles.');
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
          "It's a Match! 🎉",
          `You and ${matchedName} liked each other! Start a conversation or video call now.`,
          [
            { text: 'Keep Swiping', style: 'cancel' },
            {
              text: 'Send Message',
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
        <Text style={styles.loadingText}>Finding best matches for you...</Text>
      </View>
    );
  }

  const currentProfile = profiles[currentIndex];

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <Text style={styles.brandTitle}>Zivo</Text>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>DISCOVER</Text>
          </View>
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

      {/* Main Swiper Canvas */}
      <View style={styles.cardContainer}>
        {currentProfile ? (
          <MatchCard
            profile={currentProfile}
            onLike={() => handleSwipe('like', currentProfile.user_id)}
            onPass={() => handleSwipe('dislike', currentProfile.user_id)}
            onInfo={() => {
              Alert.alert(
                currentProfile.full_name,
                `Intent: ${currentProfile.intent}\n\nBio: ${currentProfile.bio || 'No bio yet'}`
              );
            }}
          />
        ) : (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconCircle}>
              <Compass color={COLORS.primary} size={48} />
            </View>
            <Text style={styles.emptyTitle}>All Caught Up! 🌍</Text>
            <Text style={styles.emptySub}>
              You've reviewed all active profiles in your area for now.
            </Text>

            <TouchableOpacity style={styles.refreshBtn} onPress={resetProfiles} activeOpacity={0.8}>
              <RotateCcw color="#FFFFFF" size={18} />
              <Text style={styles.refreshBtnText}>Reset & Discover Again</Text>
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
  brandTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: -0.5,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 5,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  liveText: {
    color: COLORS.primaryLight,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    ...SHADOWS.sm,
  },
  coinText: {
    color: COLORS.warning,
    fontSize: 14,
    fontWeight: '800',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 16,
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
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    width: '88%',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.md,
  },
  emptyIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '800',
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
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 24,
    marginTop: 24,
    gap: 8,
    ...SHADOWS.glowPrimary,
  },
  refreshBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
