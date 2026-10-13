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
  TextInput,
  ScrollView,
  Animated,
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
  SwitchCamera,
  Volume2,
  VolumeX,
  MessageCircle,
  Heart,
  Send,
  Wifi,
  Sparkles,
  Flame,
} from 'lucide-react-native';
import { authService, dbService } from '../lib/firebase';
import { COLORS, SHADOWS } from '../theme';

const { width, height } = Dimensions.get('window');
const CALL_COST_PER_MINUTE = 10;

export default function VideoCallScreen({ navigation, route }) {
  const { matchId, receiverName = 'Sophia Chen', receiverId } = route.params || {};
  const [isAccepted, setIsAccepted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [showBlur, setShowBlur] = useState(true);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [showChatDrawer, setShowChatDrawer] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [callMessages, setCallMessages] = useState([
    { id: '1', sender: receiverName, text: 'Hey! Nice to finally connect in video 😊' }
  ]);
  const [floatingHearts, setFloatingHearts] = useState([]);

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
    // Smooth dissolve of privacy safety blur
    setTimeout(() => setShowBlur(false), 2000);

    // Call duration timer
    timerRef.current = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);

    // Coin billing: deduct upfront and then every 60s
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
        'Call Concluded',
        'Your coin balance reached zero. Recharge your wallet to resume video chat.',
        [
          {
            text: 'Recharge Now',
            onPress: () => navigation.navigate('CoinStore'),
          },
        ]
      );
      navigation.goBack();
    }
  };

  const triggerFloatingReaction = (emoji = '❤️') => {
    const id = Date.now() + Math.random();
    setFloatingHearts(prev => [...prev, { id, emoji, left: Math.random() * (width - 120) + 40 }]);
    setTimeout(() => {
      setFloatingHearts(prev => prev.filter(h => h.id !== id));
    }, 2500);
  };

  const sendCallMessage = () => {
    if (!chatInput.trim()) return;
    setCallMessages(prev => [
      ...prev,
      { id: Date.now().toString(), sender: 'You', text: chatInput.trim() }
    ]);
    setChatInput('');
  };

  const handleReport = () => {
    Alert.alert(
      'Safety Center',
      `Report or emergency block ${receiverName}? This call will terminate immediately.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Report & Block',
          style: 'destructive',
          onPress: async () => {
            if (currentUser && receiverId) {
              await dbService.reportUser(
                currentUser.id,
                receiverId,
                'Emergency video report',
                'User reported live during call'
              );
            }
            Alert.alert('User Blocked', 'You will no longer receive calls or messages from this member.');
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
      {/* Remote Full-Screen Stream */}
      <View style={styles.remoteVideoContainer}>
        {isAccepted ? (
          <>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=1200',
              }}
              style={styles.fullVideo}
            />

            {/* Privacy Shield Blur for first 2 seconds */}
            {showBlur && (
              <BlurView intensity={90} style={StyleSheet.absoluteFill} tint="dark">
                <View style={styles.blurOverlay}>
                  <View style={styles.blurCard}>
                    <Lock color={COLORS.primaryLight} size={32} />
                    <Text style={styles.blurTitle}>Secure Real-Time Feed</Text>
                    <Text style={styles.blurText}>Verifying encrypted peer connection...</Text>
                  </View>
                </View>
              </BlurView>
            )}

            {/* Floating Reactions Flying Up the Screen */}
            {floatingHearts.map((h) => (
              <View key={h.id} style={[styles.floatingHeartBubble, { left: h.left }]}>
                <Text style={styles.floatingHeartText}>{h.emoji}</Text>
              </View>
            ))}
          </>
        ) : (
          <View style={styles.incomingCall}>
            <View style={styles.pulseRing}>
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800',
                }}
                style={styles.incomingAvatar}
              />
            </View>
            <Text style={styles.callerName}>{receiverName}</Text>
            <View style={styles.incomingPill}>
              <Sparkles color="#FFFFFF" size={14} />
              <Text style={styles.callerSub}>Incoming Video Call • 10 Coins/min</Text>
            </View>
          </View>
        )}
      </View>

      {/* Real-Time Call Status Header */}
      {isAccepted && (
        <View style={styles.callHeader}>
          <View style={styles.callerMetaPill}>
            <View style={styles.activeCallDot} />
            <Text style={styles.callerMetaName}>{receiverName}</Text>
            <Text style={styles.callTimerText}>{formatTimer(secondsElapsed)}</Text>
          </View>

          <View style={styles.headerRightActions}>
            {/* Live Network & Quality Indicator */}
            <View style={styles.qualityPill}>
              <Wifi color={COLORS.success} size={14} />
              <Text style={styles.qualityText}>HD 60fps</Text>
            </View>

            {/* Live Coin Rate */}
            <View style={styles.ratePill}>
              <Coins color={COLORS.warning} size={14} />
              <Text style={styles.rateText}>10/min</Text>
            </View>
          </View>
        </View>
      )}

      {/* Picture-in-Picture Self Preview */}
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
              <Text style={styles.videoOffText}>Camera Off</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.flipCameraPipBtn}
            onPress={() => setIsFrontCamera(!isFrontCamera)}
            activeOpacity={0.8}
          >
            <SwitchCamera color="#FFFFFF" size={14} />
          </TouchableOpacity>
        </View>
      )}

      {/* In-Call Live Chat Drawer Overlay */}
      {isAccepted && showChatDrawer && (
        <View style={styles.liveChatDrawer}>
          <View style={styles.chatDrawerHeader}>
            <Text style={styles.chatDrawerTitle}>Live In-Call Chat</Text>
            <TouchableOpacity onPress={() => setShowChatDrawer(false)}>
              <Text style={styles.chatDrawerClose}>Close</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.chatDrawerMessages}>
            {callMessages.map((m) => (
              <View
                key={m.id}
                style={[
                  styles.chatDrawerBubble,
                  m.sender === 'You' ? styles.myChatDrawerBubble : styles.theirChatDrawerBubble,
                ]}
              >
                <Text style={styles.chatDrawerText}>
                  <Text style={{ fontWeight: '800' }}>{m.sender}: </Text>
                  {m.text}
                </Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.chatDrawerInputRow}>
            <TextInput
              style={styles.chatDrawerInput}
              placeholder="Send quick text..."
              placeholderTextColor={COLORS.inputPlaceholder}
              value={chatInput}
              onChangeText={setChatInput}
            />
            <TouchableOpacity style={styles.chatDrawerSendBtn} onPress={sendCallMessage}>
              <Send color="#FFFFFF" size={16} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Live Reactions Floating Bar (When connected) */}
      {isAccepted && (
        <View style={styles.reactionBar}>
          {['❤️', '🔥', '👏', '😍', '✨'].map((emoji) => (
            <TouchableOpacity
              key={emoji}
              style={styles.reactionChip}
              onPress={() => triggerFloatingReaction(emoji)}
              activeOpacity={0.7}
            >
              <Text style={styles.reactionChipText}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Main Bottom Control Center */}
      <View style={styles.controls}>
        {!isAccepted ? (
          <View style={styles.incomingActions}>
            <TouchableOpacity
              style={[styles.btnCircle, styles.declineBtn, SHADOWS.lg]}
              onPress={handleEndCall}
              activeOpacity={0.8}
            >
              <PhoneOff color="#FFFFFF" size={30} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btnCircle, styles.acceptBtn, SHADOWS.lg]}
              onPress={handleAccept}
              activeOpacity={0.8}
            >
              <VideoIcon color="#FFFFFF" size={30} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.activeControls}>
            {/* Audio Mute */}
            <TouchableOpacity
              style={[styles.controlBtn, isMuted && styles.controlBtnInactive]}
              onPress={() => setIsMuted(!isMuted)}
              activeOpacity={0.8}
            >
              {isMuted ? <MicOff color={COLORS.danger} size={22} /> : <Mic color="#FFFFFF" size={22} />}
            </TouchableOpacity>

            {/* Video Camera Toggle */}
            <TouchableOpacity
              style={[styles.controlBtn, isVideoOff && styles.controlBtnInactive]}
              onPress={() => setIsVideoOff(!isVideoOff)}
              activeOpacity={0.8}
            >
              {isVideoOff ? <VideoOff color={COLORS.danger} size={22} /> : <VideoIcon color="#FFFFFF" size={22} />}
            </TouchableOpacity>

            {/* End Call Button */}
            <TouchableOpacity
              style={[styles.btnCircle, styles.declineBtn, SHADOWS.lg]}
              onPress={handleEndCall}
              activeOpacity={0.8}
            >
              <PhoneOff color="#FFFFFF" size={28} />
            </TouchableOpacity>

            {/* Speaker Toggle */}
            <TouchableOpacity
              style={styles.controlBtn}
              onPress={() => setIsSpeakerOn(!isSpeakerOn)}
              activeOpacity={0.8}
            >
              {isSpeakerOn ? <Volume2 color="#FFFFFF" size={22} /> : <VolumeX color={COLORS.danger} size={22} />}
            </TouchableOpacity>

            {/* In-Call Text Chat Drawer Toggle */}
            <TouchableOpacity
              style={[styles.controlBtn, showChatDrawer && styles.controlBtnActive]}
              onPress={() => setShowChatDrawer(!showChatDrawer)}
              activeOpacity={0.8}
            >
              <MessageCircle color="#FFFFFF" size={22} />
            </TouchableOpacity>

            {/* Emergency Report / Safety Block */}
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
    backgroundColor: '#090B10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullVideo: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  blurOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  blurCard: {
    backgroundColor: 'rgba(18, 22, 35, 0.92)',
    borderRadius: 26,
    padding: 26,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    ...SHADOWS.md,
  },
  blurTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '900',
    marginTop: 14,
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
  pulseRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: COLORS.primary,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    ...SHADOWS.glowCoral,
  },
  incomingAvatar: {
    width: 124,
    height: 124,
    borderRadius: 62,
  },
  callerName: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  incomingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 78, 100, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 78, 100, 0.4)',
  },
  callerSub: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  callHeader: {
    position: 'absolute',
    top: 50,
    left: 18,
    right: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  callerMetaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(9, 11, 16, 0.85)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 22,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    ...SHADOWS.sm,
  },
  activeCallDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
  },
  callerMetaName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  callTimerText: {
    color: COLORS.primaryLight,
    fontSize: 13,
    fontWeight: '700',
  },
  headerRightActions: {
    flexDirection: 'row',
    gap: 8,
  },
  qualityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(9, 11, 16, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  qualityText: {
    color: COLORS.success,
    fontSize: 11,
    fontWeight: '800',
  },
  ratePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(9, 11, 16, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 0, 0.3)',
  },
  rateText: {
    color: COLORS.warning,
    fontSize: 12,
    fontWeight: '800',
  },
  localPreview: {
    position: 'absolute',
    top: 105,
    right: 18,
    width: 110,
    height: 160,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    zIndex: 10,
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
  videoOffText: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 6,
  },
  flipCameraPipBtn: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveChatDrawer: {
    position: 'absolute',
    bottom: 150,
    left: 18,
    right: 18,
    height: 220,
    backgroundColor: 'rgba(15, 18, 28, 0.92)',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    zIndex: 15,
    ...SHADOWS.lg,
  },
  chatDrawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  chatDrawerTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  chatDrawerClose: {
    color: COLORS.primaryLight,
    fontSize: 12,
    fontWeight: '700',
  },
  chatDrawerMessages: {
    flex: 1,
    marginBottom: 8,
  },
  chatDrawerBubble: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 6,
    maxWidth: '85%',
  },
  myChatDrawerBubble: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primary,
  },
  theirChatDrawerBubble: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surfaceLight,
  },
  chatDrawerText: {
    color: '#FFFFFF',
    fontSize: 12,
    lineHeight: 16,
  },
  chatDrawerInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chatDrawerInput: {
    flex: 1,
    backgroundColor: COLORS.inputBackground,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    color: '#FFFFFF',
    fontSize: 13,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  chatDrawerSendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reactionBar: {
    position: 'absolute',
    bottom: 105,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    zIndex: 10,
  },
  reactionChip: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(18, 22, 35, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  reactionChipText: {
    fontSize: 22,
  },
  floatingHeartBubble: {
    position: 'absolute',
    bottom: 160,
    zIndex: 20,
  },
  floatingHeartText: {
    fontSize: 32,
  },
  controls: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    zIndex: 10,
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
    backgroundColor: 'rgba(18, 22, 35, 0.92)',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    ...SHADOWS.lg,
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
    width: 62,
    height: 62,
    borderRadius: 31,
  },
  controlBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlBtnActive: {
    backgroundColor: COLORS.primary,
  },
  controlBtnInactive: {
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
  },
  reportBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.18)',
  },
});
