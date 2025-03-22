import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

interface TouchableActionProps {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
}

export default function TouchableAction({
  icon,
  label,
  onPress,
}: TouchableActionProps) {
  return (
    <TouchableOpacity className="w-1/4 items-center mb-4" onPress={onPress}>
      <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center mb-1">
        {icon}
      </View>
      <Text className="text-xs text-gray-700 text-center">{label}</Text>
    </TouchableOpacity>
  );
}
