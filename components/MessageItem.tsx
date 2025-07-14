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
};

export const MessageItem: React.FC<Props> = ({
  message,
  participant,
  showHeader,
}) => {
  // Use authorUuid if present, else senderUuid
  const author = (message as any).authorUuid || message.senderUuid;
  const isMe = author === 'you';

  // Support both message.attachments (array) and message.imageUrl (string)
  const attachments = (message as any).attachments || [];
  const hasImageAttachment = attachments.some((a: any) => a.type === 'image' || a.imageUrl) || message.imageUrl;

  return (
    <View style={[styles.container, isMe ? styles.rightAlign : styles.leftAlign]}>
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
            {participant?.name || author}
          </Text>
          <Text style={styles.time}>
            {new Date(message.createdAt).toLocaleTimeString()}
          </Text>
        </View>
      )}
      <View style={[styles.body, isMe ? styles.bodyRight : styles.bodyLeft]}>
        <View style={[styles.bubble, isMe ? styles.bubbleRight : styles.bubbleLeft]}>
          {/* Render image attachments */}
          {attachments.map((att: any, idx: number) =>
            (att.type === 'image' || att.imageUrl) ? (
              <Image
                key={att.uuid || idx}
                source={{ uri: att.imageUrl || att.url }}
                style={styles.image}
              />
            ) : null
          )}
          {/* Render imageUrl if present */}
          {message.imageUrl && (
            <Image source={{ uri: message.imageUrl }} style={styles.image} />
          )}
          <Text style={styles.text}>{message.text}</Text>
          {message.editedAt && <Text style={styles.edited}>(edited)</Text>}
        </View>
        {/* Reactions row */}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginVertical: 4, paddingHorizontal: 8 },
  leftAlign: { alignItems: 'flex-start' },
  rightAlign: { alignItems: 'flex-end' },
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
  body: { flexDirection: "column", maxWidth: '80%' },
  bodyLeft: { alignItems: 'flex-start' },
  bodyRight: { alignItems: 'flex-end' },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 2,
    backgroundColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  bubbleLeft: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  bubbleRight: {
    backgroundColor: '#d1e7ff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  text: { fontSize: 16 },
  edited: { fontSize: 12, color: "#888", marginLeft: 4 },
  image: { width: 180, height: 120, borderRadius: 8, marginVertical: 4 },
  reactions: { flexDirection: "row", marginTop: 2 },
  reaction: { marginRight: 8, fontSize: 16 },
});
