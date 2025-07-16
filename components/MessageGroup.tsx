import React from "react";
import { View } from "react-native";
import type { Message } from "../store/useChatStore";
import type { Participant } from "../store/useParticipantsStore";
import { MessageItem } from "./MessageItem";

export const MessageGroup: React.FC<{
  group: any;
  onPressReaction: (msg: Message) => void;
  onPressParticipant: (participant: Participant) => void;
}> = ({ group, onPressReaction, onPressParticipant }) => (
  <View style={{ marginBottom: 8 }}>
    {group.messages.map((msg: Message, idx: number) => (
      <MessageItem
        key={msg.uuid}
        message={msg}
        participant={group.participant}
        showHeader={idx === 0}
        onPressReaction={() => onPressReaction(msg)}
        onPressParticipant={() =>
          group.participant && onPressParticipant(group.participant)
        }
      />
    ))}
  </View>
);
