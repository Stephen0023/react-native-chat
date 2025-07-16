import React from "react";
import { Text, View } from "react-native";

export const DateSeparator: React.FC<{ label: string }> = ({ label }) => (
  <View style={{ alignItems: "center", marginVertical: 16 }}>
    <View
      style={{
        backgroundColor: "#e3f0ff",
        borderRadius: 16,
        paddingHorizontal: 18,
        paddingVertical: 4,
        shadowColor: "#b3d4fc",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.18,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: "#b3d4fc",
      }}
    >
      <Text
        style={{
          color: "#3a4a5a",
          fontSize: 14,
          fontWeight: "600",
          letterSpacing: 0.5,
        }}
      >
        {label}
      </Text>
    </View>
  </View>
);
