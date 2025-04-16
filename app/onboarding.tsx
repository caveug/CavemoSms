import React, { useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { MessageSquare, Users, BarChart2, Calendar } from "lucide-react-native";
import { Button } from "./components/ui/Button";

const { width } = Dimensions.get("window");

type OnboardingItem = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
};

const onboardingData: OnboardingItem[] = [
  {
    id: "1",
    title: "Create SMS Campaigns",
    description:
      "Easily create and manage bulk SMS campaigns with our intuitive interface",
    icon: <MessageSquare size={80} color="#6366F1" />,
  },
  {
    id: "2",
    title: "Manage Contacts",
    description:
      "Import, organize, and segment your contacts into custom groups",
    icon: <Users size={80} color="#6366F1" />,
  },
  {
    id: "3",
    title: "Schedule Messages",
    description:
      "Set up campaigns to be sent at the perfect time for your audience",
    icon: <Calendar size={80} color="#6366F1" />,
  },
  {
    id: "4",
    title: "Track Performance",
    description:
      "Get detailed analytics on delivery rates, engagement, and more",
    icon: <BarChart2 size={80} color="#6366F1" />,
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();

  const renderItem = ({ item }: { item: OnboardingItem }) => {
    return (
      <View
        className="w-full items-center justify-center px-8"
        style={{ width }}
      >
        <View className="w-40 h-40 bg-indigo-100 rounded-full items-center justify-center mb-8">
          {item.icon}
        </View>
        <Text className="text-2xl font-bold text-gray-800 mb-4 text-center">
          {item.title}
        </Text>
        <Text className="text-base text-gray-600 text-center mb-8">
          {item.description}
        </Text>
      </View>
    );
  };

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
      setCurrentIndex(currentIndex + 1);
    } else {
      completeOnboarding();
    }
  };

  const completeOnboarding = () => {
    // Navigate to auth screen
    router.replace("/auth");
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  return (
    <View className="flex-1 bg-white">
      <View className="flex-1">
        <FlatList
          ref={flatListRef}
          data={onboardingData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / width);
            setCurrentIndex(index);
          }}
        />
      </View>

      {/* Pagination dots */}
      <View className="flex-row justify-center mb-8">
        {onboardingData.map((_, index) => (
          <View
            key={index}
            className={`h-2 w-2 rounded-full mx-1 ${index === currentIndex ? "bg-indigo-600" : "bg-gray-300"}`}
          />
        ))}
      </View>

      {/* Bottom buttons */}
      <View className="px-8 pb-12">
        <Button
          variant="default"
          className="mb-4 bg-indigo-600"
          onPress={handleNext}
        >
          {currentIndex === onboardingData.length - 1 ? "Get Started" : "Next"}
        </Button>

        {currentIndex < onboardingData.length - 1 && (
          <TouchableOpacity onPress={handleSkip}>
            <Text className="text-center text-indigo-600 font-medium">
              Skip
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
