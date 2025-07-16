import React from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View, Image } from "react-native";

export type ReactionSheetProps = {
  visible: boolean;
  reactions: any[];
  onClose: () => void;
};

export const ReactionSheet: React.FC<ReactionSheetProps> = ({
  visible,
  reactions,
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
          padding: 20,
          minHeight: 180,
        }}
      >
        <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 12 }}>
          Reactions
        </Text>
        <ScrollView>
          {reactions.map((r, idx) => (
            <View
              key={r.value || idx}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <Text style={{ fontSize: 20, marginRight: 8 }}>{r.value}</Text>
              <Text style={{ fontSize: 16, color: "#555", marginRight: 8 }}>
                x{r.count || 1}
              </Text>
              {r.participant && (
                <>
                  {r.participant.avatarUrl && (
                    <View style={{ marginRight: 6 }}>
                      <Image
                        source={{ uri: r.participant.avatarUrl }}
                        style={{ width: 24, height: 24, borderRadius: 12 }}
                      />

                    </View>
                  )}
                  <Text style={{ fontSize: 15, color: "#333" }}>{r.participant.name}</Text>
                </>
              )}
            </View>
          ))}
        </ScrollView>
      </View>
    </TouchableOpacity>
  </Modal>
);
