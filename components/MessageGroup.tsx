import React from "react";
import { View } from "react-native";
import { MessageItem } from "./MessageItem";

export const MessageGroup: React.FC<{
  group: any;
  messages: any[];
  onPressReaction: (msg: any) => void;
  onPressParticipant: (participant: any) => void;
  onPressImage?: (url: string) => void;
}> = ({ group, messages, onPressReaction, onPressParticipant, onPressImage }) => (
  <View style={{ marginBottom: 8 }}>
    {group.messages.map((msg: any, idx: number) => (
      <MessageItem
        key={msg.uuid}
        message={msg}
        participant={group.participant}
        showHeader={idx === 0}
        messages={messages}
        onPressReaction={() => onPressReaction(msg)}
        onPressParticipant={() =>
          group.participant && onPressParticipant(group.participant)
        }
        onPressImage={onPressImage}
      />
    ))}
  </View>
);
