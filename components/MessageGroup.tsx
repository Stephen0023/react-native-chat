import React from "react";
import { View } from "react-native";
import type { Message, Participant } from "../types/chat";
import { MessageItem } from "./MessageItem";

export const MessageGroup: React.FC<{
  group: any;
  onPressReaction: (msg: Message) => void;
  onPressParticipant: (participant: Participant) => void;
  onPressImage?: (url: string) => void;
}> = ({ group, onPressReaction, onPressParticipant, onPressImage }) => (
  <View style={{ marginBottom: 8 }}>
    {group.messages.map((msg: Message, idx: number) => (
      <MessageItem
        key={msg.uuid}
        message={msg}
        participant={group.participant}
        showHeader={idx === 0}
        onPressReaction={() => onPressReaction({
          ...msg,
          reactions:
            Array.isArray(msg.reactions)
              ? undefined
              : msg.reactions,
        } as Message)}
        onPressParticipant={() =>
          group.participant && onPressParticipant(group.participant)
        }
        onPressImage={onPressImage}
      />
    ))}
  </View>
);
