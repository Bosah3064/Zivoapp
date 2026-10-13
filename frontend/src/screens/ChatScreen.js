import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { authService, dbService } from '../lib/firebase';
import { COLORS, SHADOWS } from '../theme';
import { Send, Camera, ArrowLeft, Sparkles, Mic, CheckCheck } from 'lucide-react-native';

const QUICK_EMOJIS = ['👋', '🔥', '😍', '☕', '🥂', '✨'];
const ICEBREAKERS = [
  'What’s your dream travel destination? ✈️',
  'Coffee or matcha in the morning? ☕',
  'What song are you playing on repeat right now? 🎧',
];

export default function ChatScreen({ route, navigation }) {
  const { matchId, receiverName = 'Match', receiverId, rechargeNeeded } = route.params || {};
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const flatListRef = useRef();

  useEffect(() => {
    if (rechargeNeeded) {
      Alert.alert(
        'Out of Coins',
        'Your video call ended because you ran out of coins. Recharge now to continue calling!',
        [
          { text: 'Later', style: 'cancel' },
          { text: 'Recharge', onPress: () => navigation.navigate('CoinStore') },
        ]
      );
    }

    setupChat();

    // Subscribe to realtime messages using Firebase subscriber
    const unsubscribe = dbService.subscribeToMessages(matchId, (newMsg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [matchId]);

  const setupChat = async () => {
    const user = await authService.getCurrentUser();
    setCurrentUser(user);

    if (matchId) {
      const data = await dbService.getMessages(matchId);
      setMessages(data || []);
    }
  };

  const sendMessage = async (textToSend) => {
    const content = (textToSend || inputText).trim();
    if (!content || !currentUser || !matchId) return;

    if (!textToSend) setInputText('');

    const newMsg = await dbService.sendMessage(matchId, currentUser.id, content, 'text');
    setMessages((prev) => {
      if (prev.some((m) => m.id === newMsg.id)) return prev;
      return [...prev, newMsg];
    });
  };

  const renderMessage = ({ item }) => {
    const isMe = item.sender_id === currentUser?.id;
    return (
      <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.theirMessage]}>
        <Text style={[styles.messageText, isMe ? styles.myText : styles.theirText]}>
          {item.content}
        </Text>
        <View style={styles.bubbleFooter}>
          <Text style={[styles.timeText, isMe ? styles.myTime : styles.theirTime]}>
            {new Date(item.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
          {isMe && <CheckCheck color="rgba(255,255,255,0.7)" size={14} style={{ marginLeft: 4 }} />}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft color={COLORS.textPrimary} size={24} />
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>{receiverName}</Text>
            <View style={styles.statusRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.headerStatus}>Online now</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.callBtn, SHADOWS.glowCoral]}
            onPress={() => navigation.navigate('VideoCall', { matchId, receiverName, receiverId })}
            activeOpacity={0.8}
          >
            <Camera color="#FFFFFF" size={20} />
          </TouchableOpacity>
        </View>

        {/* Message Stream */}
        {messages.length === 0 ? (
          <View style={styles.emptyChat}>
            <Sparkles color={COLORS.primary} size={40} />
            <Text style={styles.emptyChatTitle}>You & {receiverName} Matched!</Text>
            <Text style={styles.emptyChatSub}>
              Break the ice with one of these fun conversation starters:
            </Text>

            <View style={styles.icebreakersList}>
              {ICEBREAKERS.map((prompt, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.icebreakerChip}
                  onPress={() => sendMessage(prompt)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.icebreakerText}>{prompt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderMessage}
            contentContainerStyle={styles.listContent}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
        )}

        {/* Quick Emoji Reaction Strip */}
        <View style={styles.emojiBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.emojiScroll}>
            {QUICK_EMOJIS.map((emoji, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.emojiBtn}
                onPress={() => sendMessage(emoji)}
                activeOpacity={0.7}
              >
                <Text style={styles.emojiText}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={`Message ${receiverName}...`}
            placeholderTextColor={COLORS.inputPlaceholder}
            value={inputText}
            onChangeText={setInputText}
            multiline={false}
          />

          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled, SHADOWS.sm]}
            onPress={() => sendMessage()}
            disabled={!inputText.trim()}
            activeOpacity={0.85}
          >
            <Send color="#FFFFFF" size={18} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  backBtn: {
    padding: 6,
    marginRight: 8,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontWeight: '800',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
  },
  headerStatus: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  callBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  messageBubble: {
    maxWidth: '78%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 22,
    marginBottom: 10,
    ...SHADOWS.sm,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  myText: {
    color: '#FFFFFF',
  },
  theirText: {
    color: COLORS.textPrimary,
  },
  bubbleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  timeText: {
    fontSize: 10,
    fontWeight: '500',
  },
  myTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  theirTime: {
    color: COLORS.textSubtle,
  },
  emptyChat: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  emptyChatTitle: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    marginTop: 14,
    textAlign: 'center',
  },
  emptyChatSub: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
    marginBottom: 20,
  },
  icebreakersList: {
    width: '100%',
    gap: 10,
  },
  icebreakerChip: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  icebreakerText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  emojiBar: {
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.backgroundSecondary,
  },
  emojiScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  emojiBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
  },
  emojiText: {
    fontSize: 18,
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.inputBackground,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 10,
    color: COLORS.inputText,
    fontSize: 15,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.surfaceLight,
    opacity: 0.5,
  },
});
