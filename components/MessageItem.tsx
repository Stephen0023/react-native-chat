import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

type Message = {
  uuid: string;
  text: string;
  senderUuid: string;
  createdAt: number;
  editedAt?: number;
  imageUrl?: string;
  reactions?: Record<string, number>;
  replyToMessage?: string;
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
};

export const MessageItem: React.FC<Props> = ({
  message,
  participant,
  showHeader,
}) => {
  return (
    <View style={styles.container}>
      {showHeader && (
        <View style={styles.header}>
          {participant?.avatarUrl ? (
            <Image
              source={{ uri: participant.avatarUrl }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder} />
          )}
          <Text style={styles.name}>
            {participant?.name || message.senderUuid}
          </Text>
          <Text style={styles.time}>
            {new Date(message.createdAt).toLocaleTimeString()}
          </Text>
        </View>
      )}
      <View style={styles.body}>
        {message.imageUrl && (
          <Image source={{ uri: message.imageUrl }} style={styles.image} />
        )}
        <Text style={styles.text}>{message.text}</Text>
        {message.editedAt && <Text style={styles.edited}>(edited)</Text>}
      </View>
      {message.reactions && Object.keys(message.reactions).length > 0 && (
        <View style={styles.reactions}>
          {Array.isArray(message.reactions)
            ? message.reactions.map((reaction: any, idx: number) => (
                <Text key={reaction.uuid || idx} style={styles.reaction}>
                  {reaction.value} {reaction.count || 1}
                </Text>
              ))
            : Object.entries(message.reactions).map(([emoji, count]) => (
                <Text key={emoji} style={styles.reaction}>
                  {emoji} {count}
                </Text>
              ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginVertical: 4, paddingHorizontal: 8 },
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
  body: { flexDirection: "column", marginLeft: 36 },
  text: { fontSize: 16 },
  edited: { fontSize: 12, color: "#888", marginLeft: 4 },
  image: { width: 180, height: 120, borderRadius: 8, marginVertical: 4 },
  reactions: { flexDirection: "row", marginLeft: 36, marginTop: 2 },
  reaction: { marginRight: 8, fontSize: 16 },
});
