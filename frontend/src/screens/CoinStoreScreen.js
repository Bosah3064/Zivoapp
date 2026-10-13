import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Alert,
} from 'react-native';
import { authService, dbService } from '../lib/firebase';
import { COLORS, SHADOWS } from '../theme';
import { Coins, Gift, Share2, ArrowLeft, Zap, Sparkles, Flame, Check } from 'lucide-react-native';

const COIN_PACKS = [
  { id: '1', amount: 100, price: '$0.99', extra: '0%', tier: 'Starter', color: '#CD7F32' },
  { id: '2', amount: 550, price: '$4.99', extra: '10%', tier: 'Popular', color: '#CBD5E1' },
  { id: '3', amount: 1200, price: '$9.99', extra: '20%', tier: 'Best Value', color: '#FFD700', popular: true },
  { id: '4', amount: 3000, price: '$19.99', extra: '50%', tier: 'VIP Gold', color: '#FF7588' },
];

const STREAK_DAYS = [
  { day: 1, amount: 50, claimed: true },
  { day: 2, amount: 75, claimed: false, current: true },
  { day: 3, amount: 100, claimed: false },
  { day: 4, amount: 125, claimed: false },
  { day: 5, amount: 150, claimed: false },
  { day: 6, amount: 200, claimed: false },
  { day: 7, amount: 500, claimed: false, bonus: true },
];

export default function CoinStoreScreen({ navigation }) {
  const [balance, setBalance] = useState(100);
  const [isClaimed, setIsClaimed] = useState(false);
  const [flashDiscount, setFlashDiscount] = useState(30);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const user = await authService.getCurrentUser();
    setCurrentUser(user);

    if (user) {
      const profile = await dbService.getProfile(user.id);
      if (profile) {
        setBalance(profile.coins || 100);
        if (profile.last_reward_claim) {
          const lastClaim = new Date(profile.last_reward_claim);
          const now = new Date();
          setIsClaimed(now - lastClaim < 24 * 60 * 60 * 1000);
        }
      }
    }
  };

  const claimReward = async () => {
    if (!currentUser) return;

    const res = await dbService.claimDailyReward(currentUser.id);
    if (res.success) {
      setBalance(res.newBalance);
      setIsClaimed(true);
      Alert.alert('Streak Claimed! 🔥', `You received ${res.amount} coins for checking in!`);
    } else {
      Alert.alert('Daily Bonus', res.message);
    }
  };

  const purchaseCoins = async (pack) => {
    Alert.alert(
      'Confirm Pack Purchase',
      `Add ${pack.amount} Coins to your wallet for ${pack.price}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            if (currentUser) {
              const newTotal = balance + pack.amount;
              await dbService.updateProfile(currentUser.id, { coins: newTotal });
              setBalance(newTotal);
              Alert.alert('Wallet Recharged! 🪙', `${pack.amount} Coins successfully added.`);
            }
          },
        },
      ]
    );
  };

  const shareApp = async () => {
    if (currentUser) {
      const bonus = 50;
      const newTotal = balance + bonus;
      await dbService.updateProfile(currentUser.id, { coins: newTotal });
      setBalance(newTotal);
      Alert.alert('Bonus Unlocked! 🎁', `Thanks for inviting your friends! +${bonus} coins added.`);
    }
  };

  const renderCoinPack = ({ item }) => {
    const originalPrice = parseFloat(item.price.replace('$', ''));
    const discountedPrice = (originalPrice * (1 - flashDiscount / 100)).toFixed(2);

    return (
      <TouchableOpacity
        style={[styles.packCard, item.popular && styles.popularPack, SHADOWS.sm]}
        onPress={() => purchaseCoins(item)}
        activeOpacity={0.8}
      >
        {item.popular && (
          <View style={styles.popularBadge}>
            <Sparkles color="#FFFFFF" size={10} />
            <Text style={styles.popularText}>POPULAR</Text>
          </View>
        )}
        <View style={[styles.coinIconCircle, { backgroundColor: item.color + '22' }]}>
          <Coins color={item.color} size={36} />
        </View>

        <Text style={styles.packAmount}>{item.amount.toLocaleString()}</Text>
        <Text style={styles.packTier}>{item.tier}</Text>

        {item.extra !== '0%' && (
          <View style={styles.extraBadge}>
            <Text style={styles.extraText}>+{item.extra} Bonus</Text>
          </View>
        )}

        <View style={styles.priceBtn}>
          {flashDiscount > 0 ? (
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.originalPriceText}>${originalPrice.toFixed(2)}</Text>
              <Text style={styles.priceText}>${discountedPrice}</Text>
            </View>
          ) : (
            <Text style={styles.priceText}>{item.price}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color={COLORS.textPrimary} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Coin Store</Text>
        <View style={styles.balanceBadge}>
          <Coins color={COLORS.warning} size={18} />
          <Text style={styles.balanceText}>{balance}</Text>
        </View>
      </View>

      {/* Flash Banner */}
      {flashDiscount > 0 && (
        <View style={styles.flashBanner}>
          <Zap color="#FFFFFF" size={16} fill="#FFFFFF" />
          <Text style={styles.flashText}>
            LIMITED TIME: {flashDiscount}% OFF ALL COIN BUNDLES
          </Text>
        </View>
      )}

      <FlatList
        data={COIN_PACKS}
        renderItem={renderCoinPack}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {/* 7-Day Streak Rewards Tracker */}
            <View style={styles.streakCard}>
              <View style={styles.streakHeader}>
                <View style={styles.streakTitleRow}>
                  <Flame color={COLORS.warning} size={22} fill={COLORS.warning} />
                  <Text style={styles.streakTitle}>Daily Login Streak</Text>
                </View>
                <Text style={styles.streakCount}>Day 2 / 7</Text>
              </View>

              <View style={styles.streakDaysRow}>
                {STREAK_DAYS.map((d) => (
                  <View
                    key={d.day}
                    style={[
                      styles.streakDayItem,
                      d.claimed && styles.streakDayClaimed,
                      d.current && styles.streakDayCurrent,
                      d.bonus && styles.streakDayBonus,
                    ]}
                  >
                    <Text style={styles.streakDayLabel}>D{d.day}</Text>
                    {d.claimed ? (
                      <Check color={COLORS.success} size={14} strokeWidth={3} />
                    ) : (
                      <Text style={styles.streakDayCoins}>+{d.amount}</Text>
                    )}
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.claimStreakBtn, isClaimed && styles.disabledClaimBtn, SHADOWS.glowGold]}
                onPress={claimReward}
                disabled={isClaimed}
                activeOpacity={0.8}
              >
                <Text style={styles.claimStreakBtnText}>
                  {isClaimed ? 'Claimed Today (Come back tomorrow)' : 'Claim Day 2 Bonus (+75 Coins)'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Invite & Earn Referral Section */}
            <View style={styles.referralCard}>
              <View style={styles.referralIcon}>
                <Share2 color={COLORS.primaryLight} size={26} />
              </View>
              <View style={styles.referralInfo}>
                <Text style={styles.referralTitle}>Invite Friends & Earn</Text>
                <Text style={styles.referralSub}>Get +50 coins for every friend who joins</Text>
              </View>
              <TouchableOpacity style={styles.inviteBtn} onPress={shareApp} activeOpacity={0.8}>
                <Text style={styles.inviteBtnText}>Invite</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Get More Coins</Text>
          </>
        }
      />
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '900',
  },
  balanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 22,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 0, 0.4)',
  },
  balanceText: {
    color: COLORS.warning,
    fontWeight: '800',
    fontSize: 15,
  },
  flashBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryDark,
    paddingVertical: 10,
    gap: 8,
  },
  flashText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 36,
  },
  streakCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 18,
    marginHorizontal: 8,
    marginTop: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 0, 0.3)',
    ...SHADOWS.sm,
  },
  streakHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  streakTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  streakCount: {
    color: COLORS.warning,
    fontSize: 13,
    fontWeight: '800',
  },
  streakDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
    marginBottom: 16,
  },
  streakDayItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  streakDayClaimed: {
    borderColor: COLORS.success,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  streakDayCurrent: {
    borderColor: COLORS.warning,
    borderWidth: 1.5,
    backgroundColor: 'rgba(255, 184, 0, 0.15)',
  },
  streakDayBonus: {
    borderColor: COLORS.primary,
  },
  streakDayLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4,
  },
  streakDayCoins: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: '800',
  },
  claimStreakBtn: {
    backgroundColor: COLORS.warning,
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
  },
  disabledClaimBtn: {
    backgroundColor: COLORS.surfaceLight,
    opacity: 0.6,
  },
  claimStreakBtnText: {
    color: '#090B10',
    fontSize: 14,
    fontWeight: '900',
  },
  referralCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 22,
    marginHorizontal: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  referralIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 78, 100, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  referralInfo: {
    flex: 1,
    marginLeft: 14,
  },
  referralTitle: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  referralSub: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  inviteBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 16,
  },
  inviteBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontWeight: '800',
    marginLeft: 12,
    marginTop: 8,
    marginBottom: 10,
  },
  packCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    margin: 6,
    padding: 18,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
  },
  popularPack: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    backgroundColor: COLORS.surfaceElevated,
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  coinIconCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 8,
  },
  packAmount: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '900',
  },
  packTier: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  extraBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  extraText: {
    color: COLORS.success,
    fontSize: 11,
    fontWeight: '800',
  },
  priceBtn: {
    backgroundColor: COLORS.surfaceLight,
    marginTop: 14,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  priceText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  originalPriceText: {
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
    fontSize: 11,
    marginBottom: 2,
  },
});
