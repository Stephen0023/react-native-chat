import React from "react";
import { Image, Modal, Text, TouchableOpacity, View } from "react-native";
import type { Participant } from "../store/useParticipantsStore";

export type ParticipantSheetProps = {
  visible: boolean;
  participant: Participant | null;
  onClose: () => void;
};

export const ParticipantSheet: React.FC<ParticipantSheetProps> = ({
  visible,
  participant,
  onClose,
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="slide"
    onRequestClose={onClose}
  >
    <TouchableOpacity
      style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.3)" }}
      activeOpacity={1}
      onPress={onClose}
    >
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "#fff",
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
          padding: 24,
          minHeight: 160,
          alignItems: "center",
        }}
      >
        {participant?.avatarUrl && (
          <View style={{ marginBottom: 12 }}>
            <Image
              source={{ uri: participant.avatarUrl }}
              style={{ width: 56, height: 56, borderRadius: 28 }}
            />
          </View>
        )}
        <Text style={{ fontWeight: "bold", fontSize: 18 }}>
          {participant?.name}
        </Text>
        <Text style={{ color: "#888", marginTop: 4 }}>{participant?.uuid}</Text>
      </View>
    </TouchableOpacity>
  </Modal>
);
