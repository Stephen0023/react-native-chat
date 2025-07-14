import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useRef, useState } from "react";
import {
  Button,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { FlashList } from '@shopify/flash-list';
import {
  fetchAllMessages, // <-- use this instead of fetchLatestMessages
  fetchLatestMessages,
  fetchParticipants,
  sendMessage,
} from "../api/chatApi";
import { MessageItem } from "../components/MessageItem";
import type { Message } from "../store/useChatStore";
import type { Participant } from "../store/useParticipantsStore";

export default function ChatScreen() {
  const [input, setInput] = useState("");
  const flatListRef = useRef<FlashList<Message>>(null);
  const queryClient = useQueryClient();

  // Fetch messages
  const {
    data: messages = [],
    isLoading: messagesLoading,
    refetch: refetchMessages,
  } = useQuery<Message[]>({
    queryKey: ["messages"],
    queryFn: fetchAllMessages,
  });

  // Fetch participants
  const { data: participants = [], isLoading: participantsLoading } = useQuery<
    Participant[]
  >({
    queryKey: ["participants"],
    queryFn: fetchParticipants,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: sendMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessageMutation.mutate(input.trim());
    setInput("");
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  // Helper to group consecutive messages by sender
  // Returns an array of { groupId, participant, messages: Message[] }
  const groupedMessages = React.useMemo(() => {
    if (!messages.length) return [];
    const groups: Array<{
      groupId: string;
      participant?: Participant;
      messages: Message[];
    }> = [];
    let lastSender: string | null = null;
    let currentGroup: any = null;
    messages.forEach((msg) => {
      if (msg.senderUuid !== lastSender) {
        const participant = participants.find((p) => p.uuid === msg.senderUuid);
        currentGroup = {
          groupId: msg.uuid,
          participant,
          messages: [msg],
        };
        groups.push(currentGroup);
        lastSender = msg.senderUuid;
      } else {
        currentGroup.messages.push(msg);
      }
    });
    return groups;
  }, [messages, participants]);

  // Render a group of messages
  const renderGroup = ({ item }: { item: any }) => {
    return (
      <View style={{ marginBottom: 8 }}>
        {item.messages.map((msg: Message, idx: number) => (
          <MessageItem
            key={msg.uuid}
            message={msg}
            participant={item.participant}
            showHeader={idx === 0}
          />
        ))}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <FlashList
        ref={flatListRef}
        data={groupedMessages}
        renderItem={renderGroup}
        keyExtractor={(item) => item.groupId}
        inverted
        contentContainerStyle={{ paddingVertical: 8 }}
        refreshing={messagesLoading || participantsLoading}
        onRefresh={() => {
          refetchMessages();
        }}
        estimatedItemSize={100}
      />
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
    backgroundColor: "#fff",
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
