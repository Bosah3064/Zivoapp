import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Alert,
  Image,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { BlurView } from 'expo-blur';
import {
  PhoneOff,
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  ShieldAlert,
  Coins,
  Lock,
} from 'lucide-react-native';
import { authService, dbService } from '../lib/firebase';
import { COLORS, SHADOWS } from '../theme';

const { width, height } = Dimensions.get('window');
const CALL_COST_PER_MINUTE = 10;

export default function VideoCallScreen({ navigation, route }) {
  const { matchId, receiverName = 'Alex', receiverId } = route.params || {};
  const [isAccepted, setIsAccepted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [showBlur, setShowBlur] = useState(true);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);

  const timerRef = useRef(null);
  const billingIntervalRef = useRef(null);

  useEffect(() => {
    authService.getCurrentUser().then(setUser => setCurrentUser(setUser));

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (billingIntervalRef.current) clearInterval(billingIntervalRef.current);
    };
  }, []);

  const handleAccept = () => {
    setIsAccepted(true);
    // Safety blur dissolves after 2 seconds
    setTimeout(() => setShowBlur(false), 2200);

    // Start call timer
    timerRef.current = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);

    // Initial deduction & recurring every 60 seconds
    deductCoins();
    billingIntervalRef.current = setInterval(() => {
      deductCoins();
    }, 60000);
  };

  const deductCoins = async () => {
    if (!currentUser || !receiverId) return;

    const res = await dbService.handleCallBilling(currentUser.id, receiverId, CALL_COST_PER_MINUTE, 10);
    if (!res.success) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (billingIntervalRef.current) clearInterval(billingIntervalRef.current);

      Alert.alert(
        'Call Ended',
        'You have run out of coins. Please recharge your balance to continue video calls.',
        [
          {
            text: 'Recharge Now',
            onPress: () => navigation.navigate('Chat', { rechargeNeeded: true, matchId }),
          },
        ]
      );
    }
  };

  const handleReport = () => {
    Alert.alert(
      'Safety Center',
      `Report or block ${receiverName}? This will end the call immediately.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Report & Block User',
          style: 'destructive',
          onPress: async () => {
            if (currentUser && receiverId) {
              await dbService.reportUser(
                currentUser.id,
                receiverId,
                'Emergency report during video call',
                'User triggered in-call safety action'
              );
            }
            Alert.alert('User Blocked', 'You will no longer see this person.');
            handleEndCall();
          },
        },
      ]
    );
  };

  const handleEndCall = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (billingIntervalRef.current) clearInterval(billingIntervalRef.current);
    navigation.goBack();
  };

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Remote Video Canvas */}
      <View style={styles.remoteVideoContainer}>
        {isAccepted ? (
          <>
            <Video
              source={{
                uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800',
              }}
              style={styles.fullVideo}
              resizeMode={ResizeMode.COVER}
              shouldPlay
              isLooping
            />
            {showBlur && (
              <BlurView intensity={90} style={StyleSheet.absoluteFill} tint="dark">
                <View style={styles.blurOverlay}>
                  <View style={styles.blurCard}>
                    <Lock color={COLORS.primaryLight} size={28} />
                    <Text style={styles.blurTitle}>Encrypted Connection</Text>
                    <Text style={styles.blurText}>Verifying secure video preview...</Text>
                  </View>
                </View>
              </BlurView>
            )}
          </>
        ) : (
          <View style={styles.incomingCall}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800',
              }}
              style={styles.incomingAvatar}
            />
            <Text style={styles.callerName}>{receiverName}</Text>
            <Text style={styles.callerSub}>Incoming Video Call • 10 Coins/min</Text>
          </View>
        )}
      </View>

      {/* Floating Header Info */}
      {isAccepted && (
        <View style={styles.callHeader}>
          <View style={styles.callHeaderBadge}>
            <View style={styles.activeCallDot} />
            <Text style={styles.callTimerText}>{formatTimer(secondsElapsed)}</Text>
          </View>

          <View style={styles.rateBadge}>
            <Coins color={COLORS.warning} size={14} />
            <Text style={styles.rateText}>10/min</Text>
          </View>
        </View>
      )}

      {/* Local Preview Pip */}
      {isAccepted && (
        <View style={styles.localPreview}>
          {!isVideoOff ? (
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
              }}
              style={styles.localVideo}
            />
          ) : (
            <View style={styles.videoOffPlaceholder}>
              <VideoOff color="#FFFFFF" size={24} />
            </View>
          )}
        </View>
      )}

      {/* Call Controls */}
      <View style={styles.controls}>
        {!isAccepted ? (
          <View style={styles.incomingActions}>
            <TouchableOpacity
              style={[styles.btnCircle, styles.declineBtn, SHADOWS.lg]}
              onPress={handleEndCall}
              activeOpacity={0.8}
            >
              <PhoneOff color="#FFFFFF" size={28} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btnCircle, styles.acceptBtn, SHADOWS.lg]}
              onPress={handleAccept}
              activeOpacity={0.8}
            >
              <VideoIcon color="#FFFFFF" size={28} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.activeControls}>
            <TouchableOpacity
              style={[styles.controlBtn, isMuted && styles.controlBtnInactive]}
              onPress={() => setIsMuted(!isMuted)}
              activeOpacity={0.8}
            >
              {isMuted ? <MicOff color={COLORS.danger} size={22} /> : <Mic color="#FFFFFF" size={22} />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btnCircle, styles.declineBtn, SHADOWS.lg]}
              onPress={handleEndCall}
              activeOpacity={0.8}
            >
              <PhoneOff color="#FFFFFF" size={26} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlBtn, isVideoOff && styles.controlBtnInactive]}
              onPress={() => setIsVideoOff(!isVideoOff)}
              activeOpacity={0.8}
            >
              {isVideoOff ? (
                <VideoOff color={COLORS.danger} size={22} />
              ) : (
                <VideoIcon color="#FFFFFF" size={22} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlBtn, styles.reportBtn]}
              onPress={handleReport}
              activeOpacity={0.8}
            >
              <ShieldAlert color={COLORS.danger} size={22} />
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
    backgroundColor: '#000000',
  },
  remoteVideoContainer: {
    flex: 1,
    backgroundColor: '#0B0E14',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullVideo: {
    ...StyleSheet.absoluteFillObject,
  },
  blurOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  blurCard: {
    backgroundColor: 'rgba(17, 22, 34, 0.88)',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    ...SHADOWS.md,
  },
  blurTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 12,
  },
  blurText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 6,
    textAlign: 'center',
  },
  incomingCall: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  incomingAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: COLORS.primary,
    marginBottom: 20,
  },
  callerName: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
  },
  callerSub: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 8,
    fontWeight: '500',
  },
  callHeader: {
    position: 'absolute',
    top: 54,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  callHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(11, 14, 20, 0.75)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeCallDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
  },
  callTimerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  rateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(11, 14, 20, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rateText: {
    color: COLORS.warning,
    fontSize: 13,
    fontWeight: '800',
  },
  localPreview: {
    position: 'absolute',
    top: 100,
    right: 20,
    width: 105,
    height: 150,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    ...SHADOWS.lg,
  },
  localVideo: {
    width: '100%',
    height: '100%',
  },
  videoOffPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  controls: {
    position: 'absolute',
    bottom: 36,
    left: 0,
    right: 0,
    paddingHorizontal: 28,
  },
  incomingActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  activeControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(17, 22, 34, 0.85)',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.md,
  },
  btnCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptBtn: {
    backgroundColor: COLORS.success,
  },
  declineBtn: {
    backgroundColor: COLORS.danger,
  },
  controlBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlBtnInactive: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  reportBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
});
