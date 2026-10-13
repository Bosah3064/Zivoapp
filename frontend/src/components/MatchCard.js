import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Heart, X, Info, ShieldCheck, Sparkles, Star, MapPin, Zap } from 'lucide-react-native';
import { COLORS, SHADOWS } from '../theme';

const { width, height } = Dimensions.get('window');
const FALLBACK_PHOTO = 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=800';

export default function MatchCard({ profile, onLike, onPass, onSuperLike, onInfo }) {
  const {
    full_name,
    age,
    bio,
    photos = [],
    video_url,
    compatibility_score,
    is_verified,
    interests = [],
    intent,
  } = profile || {};

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const photoList = photos && photos.length > 0 ? photos : [FALLBACK_PHOTO];
  const currentPhoto = photoList[activePhotoIndex] || photoList[0];

  const handleNextPhoto = () => {
    if (activePhotoIndex < photoList.length - 1) {
      setActivePhotoIndex((prev) => prev + 1);
    } else {
      setActivePhotoIndex(0);
    }
  };

  const handlePrevPhoto = () => {
    if (activePhotoIndex > 0) {
      setActivePhotoIndex((prev) => prev - 1);
    } else {
      setActivePhotoIndex(photoList.length - 1);
    }
  };

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
        <Image source={{ uri: currentPhoto }} style={styles.media} />
      )}

      {/* Touch Areas for Left/Right Story Photo Flipping */}
      <View style={styles.photoNavOverlay}>
        <TouchableOpacity style={styles.navTouchArea} onPress={handlePrevPhoto} activeOpacity={1} />
        <TouchableOpacity style={styles.navTouchArea} onPress={handleNextPhoto} activeOpacity={1} />
      </View>

      {/* Story Progress Indicators (Instagram Style) */}
      {photoList.length > 1 && (
        <View style={styles.storySegmentsRow}>
          {photoList.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.storySegment,
                idx === activePhotoIndex ? styles.storySegmentActive : styles.storySegmentInactive,
              ]}
            />
          ))}
        </View>
      )}

      {/* Protective Dark Gradient Scrim to guarantee high-contrast legibility */}
      <View style={styles.gradientScrim} pointerEvents="none" />

      {/* Top Badges (Compatibility, Verified, Distance) */}
      <View style={styles.topBadgeRow} pointerEvents="box-none">
        <View style={styles.topBadgeLeft}>
          {compatibility_score ? (
            <View style={styles.scoreBadge}>
              <Sparkles color="#FFFFFF" size={13} />
              <Text style={styles.scoreText}>{compatibility_score}% Match</Text>
            </View>
          ) : null}

          {is_verified && (
            <View style={styles.verifiedBadge}>
              <ShieldCheck color="#FFFFFF" size={13} />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}
        </View>

        <View style={styles.distanceBadge}>
          <MapPin color={COLORS.textSecondary} size={12} />
          <Text style={styles.distanceText}>2.4 km</Text>
        </View>
      </View>

      {/* Bottom Profile Details & Action Controls */}
      <View style={styles.bottomSection} pointerEvents="box-none">
        {/* Profile Card */}
        <View style={styles.infoCard}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {full_name}, {age}
            </Text>
            {intent && (
              <View style={styles.intentPill}>
                <Text style={styles.intentText}>{intent}</Text>
              </View>
            )}
          </View>

          {bio ? (
            <Text style={styles.bio} numberOfLines={2}>
              {bio}
            </Text>
          ) : null}

          {/* Interests Pill Tags */}
          {interests.length > 0 && (
            <View style={styles.interestsRow}>
              {interests.slice(0, 3).map((item, idx) => (
                <View key={idx} style={styles.interestChip}>
                  <Text style={styles.interestText}>#{item}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Action Controls: Pass, Super Like, Info, Like */}
        <View style={styles.actionsRow}>
          {/* Pass / Dislike */}
          <TouchableOpacity
            style={[styles.actionBtn, styles.passBtn, SHADOWS.md]}
            onPress={onPass}
            activeOpacity={0.8}
          >
            <X color={COLORS.danger} size={30} strokeWidth={2.5} />
          </TouchableOpacity>

          {/* Super Like Star */}
          <TouchableOpacity
            style={[styles.actionBtn, styles.superLikeBtn, SHADOWS.md]}
            onPress={onSuperLike || onLike}
            activeOpacity={0.8}
          >
            <Star color={COLORS.warning} size={24} fill={COLORS.warning} />
          </TouchableOpacity>

          {/* Info Details */}
          <TouchableOpacity
            style={[styles.actionBtn, styles.infoBtn, SHADOWS.md]}
            onPress={onInfo}
            activeOpacity={0.8}
          >
            <Info color="#FFFFFF" size={22} strokeWidth={2} />
          </TouchableOpacity>

          {/* Like / Heart */}
          <TouchableOpacity
            style={[styles.actionBtn, styles.likeBtn, SHADOWS.glowCoral]}
            onPress={onLike}
            activeOpacity={0.8}
          >
            <Heart color="#FFFFFF" size={32} fill="#FFFFFF" strokeWidth={1.5} />
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
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.lg,
  },
  media: {
    ...StyleSheet.absoluteFillObject,
  },
  photoNavOverlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    zIndex: 1,
  },
  navTouchArea: {
    flex: 1,
  },
  storySegmentsRow: {
    position: 'absolute',
    top: 12,
    left: 14,
    right: 14,
    flexDirection: 'row',
    gap: 6,
    zIndex: 4,
  },
  storySegment: {
    flex: 1,
    height: 3.5,
    borderRadius: 2,
  },
  storySegmentActive: {
    backgroundColor: '#FFFFFF',
  },
  storySegmentInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  gradientScrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '65%',
    backgroundColor: COLORS.scrimDark,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    zIndex: 2,
  },
  topBadgeRow: {
    position: 'absolute',
    top: 24,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 5,
  },
  topBadgeLeft: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
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
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.95)',
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
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(9, 11, 16, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  distanceText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  bottomSection: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    paddingBottom: 22,
    zIndex: 5,
  },
  infoCard: {
    backgroundColor: 'rgba(18, 22, 35, 0.88)',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    marginBottom: 16,
    ...SHADOWS.md,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.65)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  intentPill: {
    backgroundColor: 'rgba(255, 78, 100, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 78, 100, 0.4)',
  },
  intentText: {
    color: COLORS.primaryLight,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
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
    gap: 8,
    marginTop: 10,
  },
  interestChip: {
    backgroundColor: 'rgba(139, 92, 246, 0.22)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.4)',
  },
  interestText: {
    color: COLORS.secondaryLight,
    fontSize: 11,
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  actionBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1.5,
  },
  passBtn: {
    borderColor: COLORS.danger,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  superLikeBtn: {
    borderColor: COLORS.warning,
    backgroundColor: 'rgba(255, 184, 0, 0.15)',
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  infoBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderColor: COLORS.borderLight,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  likeBtn: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
    width: 66,
    height: 66,
    borderRadius: 33,
  },
});
