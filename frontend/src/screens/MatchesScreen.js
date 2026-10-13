import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { authService, dbService } from '../lib/firebase';
import { COLORS, SHADOWS } from '../theme';
import { Search, MessageSquare, Video as VideoIcon, Sparkles, Heart } from 'lucide-react-native';

export default function MatchesScreen({ navigation }) {
  const [matches, setMatches] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMatches();
    const unsubscribe = navigation.addListener('focus', () => {
      loadMatches();
    });
    return unsubscribe;
  }, [navigation]);

  const loadMatches = async () => {
    try {
      setLoading(true);
      const user = await authService.getCurrentUser();
      if (user) {
        const data = await dbService.getMatches(user.id);
        setMatches(data || []);
      }
    } catch (e) {
      console.error('Error loading matches:', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredMatches = matches.filter((m) => {
    const name = m.matched_user?.full_name || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const renderNewMatchItem = ({ item }) => {
    const user = item.matched_user;
    if (!user) return null;

    return (
      <TouchableOpacity
        style={styles.newMatchStory}
        onPress={() =>
          navigation.navigate('Chat', {
            matchId: item.id,
            receiverName: user.full_name,
            receiverId: user.id,
          })
        }
        activeOpacity={0.8}
      >
        <View style={styles.storyRing}>
          <Image
            source={{
              uri:
                user.photos?.[0] ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800',
            }}
            style={styles.storyAvatar}
          />
          <View style={styles.onlineBadge} />
        </View>
        <Text style={styles.storyName} numberOfLines={1}>
          {user.full_name?.split(' ')[0]}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderMatchRow = ({ item }) => {
    const user = item.matched_user;
    if (!user) return null;

    return (
      <TouchableOpacity
        style={styles.matchCard}
        onPress={() =>
          navigation.navigate('Chat', {
            matchId: item.id,
            receiverName: user.full_name,
            receiverId: user.id,
          })
        }
        activeOpacity={0.75}
      >
        <View style={styles.avatarContainer}>
          <Image
            source={{
              uri:
                user.photos?.[0] ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800',
            }}
            style={styles.avatar}
          />
          <View style={styles.activeDot} />
        </View>

        <View style={styles.matchInfo}>
          <View style={styles.nameHeader}>
            <Text style={styles.matchName}>{user.full_name}</Text>
            {user.compatibility_score ? (
              <View style={styles.scorePill}>
                <Sparkles color="#FFFFFF" size={10} />
                <Text style={styles.scorePillText}>{user.compatibility_score}%</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.last_message || 'New match! Tap to start chatting ✨'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.videoQuickBtn}
          onPress={() =>
            navigation.navigate('VideoCall', {
              matchId: item.id,
              receiverName: user.full_name,
              receiverId: user.id,
            })
          }
        >
          <VideoIcon color={COLORS.primaryLight} size={20} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Matches</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{matches.length} Connections</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <Search color={COLORS.textMuted} size={18} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search matches..."
          placeholderTextColor={COLORS.inputPlaceholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={COLORS.primary} size="large" />
        </View>
      ) : matches.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconCircle}>
            <Heart color={COLORS.secondary} size={44} fill={COLORS.secondary} />
          </View>
          <Text style={styles.emptyTitle}>No Matches Yet</Text>
          <Text style={styles.emptySub}>
            Swipe right on profiles you like. When they like you back, they will appear right here!
          </Text>
          <TouchableOpacity
            style={styles.discoverBtn}
            onPress={() => navigation.navigate('Swipe')}
            activeOpacity={0.8}
          >
            <Text style={styles.discoverBtnText}>Start Discovering</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredMatches}
          keyExtractor={(item) => item.id}
          renderItem={renderMatchRow}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            matches.length > 0 ? (
              <View style={styles.storiesContainer}>
                <Text style={styles.sectionHeader}>New Matches</Text>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={matches}
                  keyExtractor={(item) => 'story_' + item.id}
                  renderItem={renderNewMatchItem}
                  contentContainerStyle={styles.storiesList}
                />
                <Text style={styles.sectionHeader}>All Conversations</Text>
              </View>
            ) : null
          }
        />
      )}
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
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  countBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  countText: {
    color: COLORS.primaryLight,
    fontSize: 12,
    fontWeight: '700',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: COLORS.inputText,
    fontSize: 14,
    fontWeight: '500',
  },
  storiesContainer: {
    marginBottom: 12,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  storiesList: {
    paddingBottom: 16,
    gap: 16,
  },
  newMatchStory: {
    alignItems: 'center',
    width: 68,
  },
  storyRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2.5,
    borderColor: COLORS.primary,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  storyName: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  matchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  activeDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  matchInfo: {
    flex: 1,
    marginLeft: 14,
    marginRight: 10,
  },
  nameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  matchName: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  scorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 3,
  },
  scorePillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  lastMessage: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 4,
    fontWeight: '400',
  },
  videoQuickBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 36,
  },
  emptyIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(236, 72, 153, 0.12)',
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
  discoverBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 26,
    paddingVertical: 14,
    borderRadius: 24,
    marginTop: 24,
    ...SHADOWS.glowPrimary,
  },
  discoverBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
