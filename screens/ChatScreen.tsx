import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useRef, useState } from "react";
import {
  Button,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import {
  fetchLatestMessages,
  fetchParticipants,
  sendMessage,
} from "../api/chatApi";
import { MessageItem } from "../components/MessageItem";
import type { Message } from "../store/useChatStore";
import type { Participant } from "../store/useParticipantsStore";

export default function ChatScreen() {
  const [input, setInput] = useState("");
  const flatListRef = useRef<FlatList>(null);
  const queryClient = useQueryClient();

  // Fetch messages
  const {
    data: messages = [],
    isLoading: messagesLoading,
    refetch: refetchMessages,
  } = useQuery<Message[]>({
    queryKey: ["messages"],
    queryFn: fetchLatestMessages,
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
  const renderItem = ({ item, index }: { item: Message; index: number }) => {
    const prev = messages[index + 1];
    const showHeader = !prev || prev.senderUuid !== item.senderUuid;
    const participant = participants.find(
      (p: Participant) => p.uuid === item.senderUuid
    );
    return (
      <MessageItem
        message={item}
        participant={participant}
        showHeader={showHeader}
      />
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.uuid}
        inverted
        contentContainerStyle={{ paddingVertical: 8 }}
        refreshing={messagesLoading || participantsLoading}
        onRefresh={() => {
          refetchMessages();
        }}
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
