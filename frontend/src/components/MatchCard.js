import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Heart, X, Info, ShieldCheck, Sparkles } from 'lucide-react-native';
import { COLORS, SHADOWS } from '../theme';

const { width, height } = Dimensions.get('window');
const FALLBACK_PHOTO = 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=800';

export default function MatchCard({ profile, onLike, onPass, onInfo }) {
  const { full_name, age, bio, photos, video_url, compatibility_score, is_verified, interests } = profile || {};
  const photoUri = photos?.[0] || FALLBACK_PHOTO;

  return (
    <View style={styles.card}>
      {/* Background Media */}
      {video_url ? (
        <Video
          source={{ uri: video_url }}
          style={styles.media}
          resizeMode={ResizeMode.COVER}
          isLooping
          shouldPlay
          isMuted
        />
      ) : (
        <Image source={{ uri: photoUri }} style={styles.media} />
      )}

      {/* Multi-layered Dark Gradient Scrim to guarantee 100% text legibility on white/light photos */}
      <View style={styles.gradientScrim} pointerEvents="none" />

      {/* Top Badges (Compatibility & Verification) */}
      <View style={styles.topBadgeRow}>
        {compatibility_score ? (
          <View style={styles.scoreBadge}>
            <Sparkles color="#FFFFFF" size={14} />
            <Text style={styles.scoreText}>{compatibility_score}% Match</Text>
          </View>
        ) : null}

        {is_verified && (
          <View style={styles.verifiedBadge}>
            <ShieldCheck color="#FFFFFF" size={14} />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        )}
      </View>

      {/* Bottom Info & Action Controls */}
      <View style={styles.bottomSection}>
        {/* Profile Details Container */}
        <View style={styles.infoCard}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {full_name}, {age}
            </Text>
          </View>

          {bio ? (
            <Text style={styles.bio} numberOfLines={2}>
              {bio}
            </Text>
          ) : null}

          {/* Interests Chips */}
          {interests && interests.length > 0 && (
            <View style={styles.interestsRow}>
              {interests.slice(0, 3).map((item, idx) => (
                <View key={idx} style={styles.interestChip}>
                  <Text style={styles.interestText}>#{item}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Action Buttons (Pass, Info, Like) */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.passBtn, SHADOWS.md]}
            onPress={onPass}
            activeOpacity={0.75}
          >
            <X color={COLORS.danger} size={30} strokeWidth={2.5} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.infoBtn, SHADOWS.md]}
            onPress={onInfo}
            activeOpacity={0.75}
          >
            <Info color="#FFFFFF" size={22} strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.likeBtn, SHADOWS.md]}
            onPress={onLike}
            activeOpacity={0.75}
          >
            <Heart color={COLORS.success} size={30} fill={COLORS.success} strokeWidth={1.5} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: width * 0.92,
    height: height * 0.72,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.lg,
  },
  media: {
    ...StyleSheet.absoluteFillObject,
  },
  // Dedicated multi-layer scrim ensuring readable white text even on pure white photos
  gradientScrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '65%',
    backgroundColor: 'rgba(11, 14, 20, 0.88)',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  topBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    zIndex: 2,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    ...SHADOWS.sm,
  },
  scoreText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.2,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  verifiedText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 11,
  },
  bottomSection: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    paddingBottom: 22,
    zIndex: 3,
  },
  infoCard: {
    backgroundColor: 'rgba(17, 23, 36, 0.85)',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    marginBottom: 16,
    ...SHADOWS.md,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  bio: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
    fontWeight: '500',
  },
  interestsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  interestChip: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.35)',
  },
  interestText: {
    color: COLORS.primaryLight,
    fontSize: 11,
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  actionBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1.5,
  },
  passBtn: {
    borderColor: COLORS.danger,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
  },
  likeBtn: {
    borderColor: COLORS.success,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  infoBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderColor: COLORS.borderStrong,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});
