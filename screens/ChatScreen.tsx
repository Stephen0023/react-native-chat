import { FlashList } from "@shopify/flash-list";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useRef, useState } from "react";
import {
  Button,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Modal,
  Image,
  Pressable,
} from "react-native";
import {
  fetchLatestMessages,
  fetchOlderMessages,
  fetchParticipants,
  sendMessage,
} from "../api/chatApi";
import { DateSeparator } from "../components/DateSeparator";
import { MessageGroup } from "../components/MessageGroup";
import { ParticipantSheet } from "../components/ParticipantSheet";
import { ReactionSheet } from "../components/ReactionSheet";
import type { Message } from "@/types/chat";
import type { Participant } from "@/types/chat";
import { useChatStore } from '../store/useChatStore';
import { useParticipantsStore } from '../store/useParticipantsStore';

export default function ChatScreen() {
  const [input, setInput] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [reactionSheet, setReactionSheet] = useState<null | {
    message: Message;
    reactions: any[];
  }>(null);
  const [participantSheet, setParticipantSheet] = useState<null | Participant>(
    null
  );
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const flatListRef = useRef<FlashList<Message>>(null);
  const queryClient = useQueryClient();

  // Zustand stores
  const messages = useChatStore((state) => state.messages);
  const setMessages = useChatStore((state) => state.setMessages);
  const addMessage = useChatStore((state) => state.addMessage);
  const participants = useParticipantsStore((state) => state.participants);
  const setParticipants = useParticipantsStore((state) => state.setParticipants);

  // Fetch participants
  React.useEffect(() => {
    (async () => {
      const all = await fetchParticipants();
      setParticipants(all);
    })();
  }, [setParticipants]);

  // Initial fetch: latest 25 messages
  React.useEffect(() => {
    (async () => {
      const latest = await fetchLatestMessages();
      setMessages(latest);
      setHasMore(latest.length === 25);
    })();
  }, [setMessages]);

  // Poll for new messages every 5 seconds
  React.useEffect(() => {
    const interval = setInterval(async () => {
      if (!messages.length) return;
      const since = Math.max(...messages.map((m) => m.updatedAt || m.sentAt));
      // You can implement fetchMessagesUpdates if needed
      // const updates = await fetchMessagesUpdates(since);
      // if (updates.length) setMessages((prev) => mergeMessages(prev, updates));
    }, 5000);
    return () => clearInterval(interval);
  }, [messages]);

  // Fetch older messages (infinite scroll up)
  const fetchMore = async () => {
    if (loadingMore || !hasMore || !messages.length) return;
    setLoadingMore(true);
    const oldest = messages[messages.length - 1];
    const older = await fetchOlderMessages(oldest.uuid);
    setMessages([...messages, ...older]);
    setHasMore(older.length === 25);
    setLoadingMore(false);
  };

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: sendMessage,
    onSuccess: (newMessage) => {
      addMessage(newMessage);
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessageMutation.mutate(input.trim());
    setInput("");
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  // Helper to get relative date label
  function getRelativeDateLabel(dateString: string) {
    const today = new Date();
    const date = new Date(dateString);
    // Set both to midnight for accurate day comparison
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    const diffDays = Math.floor(
      (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";

    // Get the start of this week (Monday)
    const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay(); // Sunday=0, so treat as 7
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - (dayOfWeek - 1));
    startOfWeek.setHours(0, 0, 0, 0);

    // If the date is within this week
    if (date >= startOfWeek) {
      return date.toLocaleDateString(undefined, { weekday: "long" });
    }

    // Otherwise, show the date (e.g., 7/10/2025)
    return date.toLocaleDateString();
  }

  // Helper to group consecutive messages by sender and insert date separators
  const groupedMessagesWithDateSeparators = React.useMemo(() => {
    if (!messages.length) return [];
    // Ensure messages are in chronological order
    const ordered = [...messages].reverse();
    const groups: Array<any> = [];
    let lastSender: string | null = null;
    let currentGroup: any = null;
    let lastDate: string | null = null;

    ordered.forEach((msg) => {
      const msgDate = new Date(msg.sentAt).toDateString();
      if (msgDate !== lastDate) {
        groups.push({ type: "date", date: msgDate, key: `date-${msgDate}` });
        lastDate = msgDate;
        lastSender = null; // reset sender for new day
        currentGroup = null;
      }
      if (msg.authorUuid !== lastSender) {
        const participant = participants.find((p) => p.uuid === msg.authorUuid);
        currentGroup = {
          type: "group",
          groupId: msg.uuid,
          participant,
          messages: [msg],
          key: msg.uuid,
        };
        groups.push(currentGroup);
        lastSender = msg.authorUuid;
      } else {
        currentGroup.messages.push(msg);
      }
    });
    // Reverse for display (newest at bottom)
    return groups.reverse();
  }, [messages, participants]);

  // Helper to get participant name by uuid
  const getParticipantName = (uuid: string) => {
    const p = participants.find((p) => p.uuid === uuid);
    return p ? p.name : uuid;
  };

  // Render a group of messages or a date separator
  const renderGroupOrDate = ({ item }: { item: any }) => {
    if (item.type === "date") {
      return <DateSeparator label={getRelativeDateLabel(item.date)} />;
    }
    // group
    return (
      <MessageGroup
        group={item}
        onPressReaction={(msg) => {
          let reactions: any[] = [];
          if (Array.isArray(msg.reactions)) {
            reactions = msg.reactions.map((r) => ({
              ...r,
              participant: participants.find((p) => p.uuid === r.participantUuid),
            }));
          } else if (msg.reactions) {
            reactions = Object.entries(msg.reactions).map(([value, count]) => ({
              value,
              count,
            }));
          }
          setReactionSheet({ message: msg, reactions });
        }}
        onPressParticipant={(participant) => setParticipantSheet(participant)}
        onPressImage={(url) => setPreviewImageUrl(url)}
      />
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#f5f6fa' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <FlashList
        ref={flatListRef}
        data={groupedMessagesWithDateSeparators}
        renderItem={renderGroupOrDate}
        keyExtractor={(item) => item.key}
        inverted
        contentContainerStyle={{ paddingVertical: 8 }}
        refreshing={false}
        onRefresh={async () => {
          const latest = await fetchLatestMessages();
          setMessages(latest);
          setHasMore(latest.length === 25);
        }}
        onEndReached={fetchMore}
        onEndReachedThreshold={0.2}
        estimatedItemSize={100}
        ListFooterComponent={
          loadingMore ? (
            <Text style={{ textAlign: "center", color: "#888", margin: 8 }}>
              Loading more...
            </Text>
          ) : null
        }
      />
      <ReactionSheet
        visible={!!reactionSheet}
        reactions={reactionSheet?.reactions || []}
        onClose={() => setReactionSheet(null)}
      />
      <ParticipantSheet
        visible={!!participantSheet}
        participant={participantSheet}
        onClose={() => setParticipantSheet(null)}
      />
      <SafeAreaView style={{ backgroundColor: '#f5f6fa' }}>
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type a message..."
          />
          <Button
            title={sendMessageMutation.isPending ? "Sending..." : "Send"}
            onPress={handleSend}
            disabled={sendMessageMutation.isPending}
          />
        </View>
      </SafeAreaView>
      {/* Image Preview Modal */}
      <Modal
        visible={!!previewImageUrl}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewImageUrl(null)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' }}
          onPress={() => setPreviewImageUrl(null)}
        >
          {previewImageUrl && (
            <Image
              source={{ uri: previewImageUrl }}
              style={{ width: '90%', height: '70%', resizeMode: 'contain', borderRadius: 12 }}
            />
          )}
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderTopWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#f5f6fa",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
});
