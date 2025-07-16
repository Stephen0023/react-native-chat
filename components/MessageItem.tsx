import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Message = {
  uuid: string;
  text: string;
  authorUuid: string;
  sentAt: number;
  updatedAt?: number;
  imageUrl?: string;
  reactions?: Record<string, number>;
  replyToMessage?: string;
  attachments?: Array<{
    uuid: string;
    type: string;
    imageUrl?: string;
    url?: string;
  }>;
};

type Participant = {
  uuid: string;
  name: string;
  avatarUrl?: string;
};

type Props = {
  message: Message;
  participant?: Participant;
  showHeader: boolean;
  onPressReaction?: () => void;
  onPressParticipant?: () => void;
  onPressImage?: (imageUrl: string) => void;
};

export const MessageItem: React.FC<Props> = ({
  message,
  participant,
  showHeader,
  onPressReaction,
  onPressParticipant,
  onPressImage,
}) => {
  const author = (message as any).authorUuid;
  const isMe = author === "you";

  // Support both message.attachments (array) and message.imageUrl (string)
  const attachments = (message as any).attachments || [];
  const hasImageAttachment =
    attachments.some((a: any) => a.type === "image" || a.imageUrl) ||
    message.imageUrl;

  return (
    <View
      style={[styles.container, isMe ? styles.rightAlign : styles.leftAlign]}
    >
      {showHeader && (
        <TouchableOpacity style={styles.header} onPress={onPressParticipant} activeOpacity={0.7}>
          {participant?.avatarUrl ? (
            <Image
              source={{ uri: participant.avatarUrl }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder} />
          )}
          <Text style={styles.name}>
            {participant?.name || author}
          </Text>
          <Text style={styles.time}>
            {new Date(message.sentAt).toLocaleTimeString()}
          </Text>
        </TouchableOpacity>
      )}
      <View style={[styles.body, isMe ? styles.bodyRight : styles.bodyLeft]}>
        <View
          style={[styles.bubble, isMe ? styles.bubbleRight : styles.bubbleLeft]}
        >
          {attachments.map((att: any, idx: number) =>
            att.type === "image" || att.imageUrl ? (
              <TouchableOpacity
                key={att.uuid || idx}
                onPress={() => {
                  const url = att.imageUrl || att.url;
                  if (onPressImage && url) onPressImage(url);
                }}
                activeOpacity={0.8}
              >
                <Image
                  source={{ uri: att.imageUrl || att.url }}
                  style={styles.image}
                />
              </TouchableOpacity>
            ) : null
          )}
          {/* Render imageUrl if present */}
          {message.imageUrl && (
            <TouchableOpacity
              onPress={() => {
                if (onPressImage && message.imageUrl) onPressImage(message.imageUrl);
              }}
              activeOpacity={0.8}
            >
              <Image source={{ uri: message.imageUrl }} style={styles.image} />
            </TouchableOpacity>
          )}
          <Text style={styles.text}>{message.text}</Text>
          {message.sentAt !== message.updatedAt && (
            <Text style={styles.edited}>(edited)</Text>
          )}
        </View>
        {/* Reactions row */}
        {message.reactions && Object.keys(message.reactions).length > 0 && (
          <TouchableOpacity
            onPress={onPressReaction}
            activeOpacity={0.7}
            style={styles.reactions}
          >
            {Array.isArray(message.reactions)
              ? message.reactions.map((reaction: any, idx: number) => (
                  <View
                    key={reaction.uuid || idx}
                    style={styles.reactionBubble}
                  >
                    <Text style={styles.reactionText}>
                      {reaction.value} {reaction.count || 1}
                    </Text>
                  </View>
                ))
              : Object.entries(message.reactions).map(([emoji, count]) => (
                  <View key={emoji} style={styles.reactionBubble}>
                    <Text style={styles.reactionText}>
                      {emoji} {count}
                    </Text>
                  </View>
                ))}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: "#f5f6fa",
    borderRadius: 12,
  },
  leftAlign: { alignItems: "flex-start" },
  rightAlign: { alignItems: "flex-end" },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 2 },
  avatar: { width: 28, height: 28, borderRadius: 14, marginRight: 8 },
  avatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#ccc",
    marginRight: 8,
  },
  name: { fontWeight: "bold", marginRight: 8 },
  time: { color: "#888", fontSize: 12 },
  body: { flexDirection: "column", maxWidth: "80%" },
  bodyLeft: { alignItems: "flex-start" },
  bodyRight: { alignItems: "flex-end" },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 2,
    backgroundColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  bubbleLeft: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderTopLeftRadius: 4,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  bubbleRight: {
    backgroundColor: "#d1e7ff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  text: { fontSize: 16 },
  edited: { fontSize: 12, color: "#888", marginLeft: 4 },
  image: { width: 180, height: 120, borderRadius: 8, marginVertical: 4 },
  reactions: { flexDirection: "row", marginTop: 2 },
  reactionBubble: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e3f0ff", // soft blue for reactions
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#b3d4fc",
  },
  reactionText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
});
