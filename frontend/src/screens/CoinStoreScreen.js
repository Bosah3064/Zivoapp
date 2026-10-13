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
import { Coins, Gift, Share2, ArrowLeft, Zap, Sparkles } from 'lucide-react-native';

const COIN_PACKS = [
  { id: '1', amount: 100, price: '$0.99', extra: '0%', tier: 'Starter', color: '#CD7F32' },
  { id: '2', amount: 550, price: '$4.99', extra: '10%', tier: 'Popular', color: '#CBD5E1' },
  { id: '3', amount: 1200, price: '$9.99', extra: '20%', tier: 'Best Value', color: '#FFD700', popular: true },
  { id: '4', amount: 3000, price: '$19.99', extra: '50%', tier: 'VIP Gold', color: '#A78BFA' },
];

export default function CoinStoreScreen({ navigation }) {
  const [balance, setBalance] = useState(100);
  const [isClaimed, setIsClaimed] = useState(false);
  const [flashDiscount, setFlashDiscount] = useState(25);
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
      Alert.alert('Congratulations! 🎉', `You claimed ${res.amount} free coins.`);
    } else {
      Alert.alert('Daily Bonus', res.message);
    }
  };

  const purchaseCoins = async (pack) => {
    Alert.alert(
      'Confirm Purchase',
      `Add ${pack.amount} Zivo Coins for ${pack.price}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Buy Now',
          onPress: async () => {
            if (currentUser) {
              const newTotal = balance + pack.amount;
              await dbService.updateProfile(currentUser.id, { coins: newTotal });
              setBalance(newTotal);
              Alert.alert('Success! 🪙', `${pack.amount} Coins have been added to your balance.`);
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
      Alert.alert('Bonus Earned! 🎁', `Thanks for sharing Zivo! +${bonus} coins added.`);
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
            <Text style={styles.popularText}>MOST POPULAR</Text>
          </View>
        )}
        <View style={[styles.coinIconCircle, { backgroundColor: item.color + '22' }]}>
          <Coins color={item.color} size={36} />
        </View>

        <Text style={styles.packAmount}>{item.amount.toLocaleString()} Coins</Text>
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
      {/* Header */}
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
            SPECIAL DEAL: {flashDiscount}% OFF ALL COIN PACKS
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
            {/* Free Rewards Section */}
            <View style={styles.rewardSection}>
              <Text style={styles.sectionTitle}>Free Daily Rewards</Text>

              <TouchableOpacity
                style={[styles.rewardCard, isClaimed && styles.disabledReward, SHADOWS.sm]}
                onPress={claimReward}
                disabled={isClaimed}
                activeOpacity={0.8}
              >
                <View style={styles.rewardIconBg}>
                  <Gift color={isClaimed ? COLORS.textSubtle : COLORS.secondary} size={28} />
                </View>
                <View style={styles.rewardInfo}>
                  <Text style={styles.rewardTitle}>Daily Check-In Bonus</Text>
                  <Text style={styles.rewardSub}>
                    {isClaimed ? 'Claimed today • Resets in 24h' : 'Claim your free 50 coins today'}
                  </Text>
                </View>
                {!isClaimed ? (
                  <View style={styles.claimBadge}>
                    <Text style={styles.claimText}>+50 FREE</Text>
                  </View>
                ) : (
                  <Text style={styles.claimedLabel}>DONE</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.rewardCard, SHADOWS.sm]}
                onPress={shareApp}
                activeOpacity={0.8}
              >
                <View style={[styles.rewardIconBg, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
                  <Share2 color={COLORS.primaryLight} size={28} />
                </View>
                <View style={styles.rewardInfo}>
                  <Text style={styles.rewardTitle}>Invite & Earn</Text>
                  <Text style={styles.rewardSub}>Share Zivo to receive 50 bonus coins</Text>
                </View>
                <View style={[styles.claimBadge, { backgroundColor: COLORS.primary }]}>
                  <Text style={styles.claimText}>+50 COINS</Text>
                </View>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Choose a Coin Pack</Text>
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
    fontWeight: '800',
  },
  balanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
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
    paddingBottom: 32,
  },
  rewardSection: {
    paddingHorizontal: 8,
    paddingTop: 16,
    marginBottom: 10,
    gap: 12,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontWeight: '800',
    marginLeft: 8,
    marginTop: 12,
    marginBottom: 8,
  },
  rewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  disabledReward: {
    opacity: 0.55,
  },
  rewardIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(236, 72, 153, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rewardInfo: {
    flex: 1,
    marginLeft: 14,
  },
  rewardTitle: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  rewardSub: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  claimBadge: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  claimText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  claimedLabel: {
    color: COLORS.textSubtle,
    fontSize: 12,
    fontWeight: '700',
    marginRight: 6,
  },
  packCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    margin: 8,
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
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 8,
  },
  packAmount: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '800',
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
    paddingHorizontal: 20,
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
