import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  ScrollView,
  TextInput,
} from "react-native";
import { Button } from "./ui/Button";
import {
  Calendar,
  Clock,
  RotateCcw,
  Send,
  ChevronDown,
  ChevronRight,
} from "lucide-react-native";

type TimeSlot = {
  id: string;
  time: string;
  label: string;
};

type RecurrenceOption = {
  id: string;
  label: string;
  value: string;
};

export default function ScheduleCampaignScreen() {
  const [sendNow, setSendNow] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState<string | null>(null);
  const [showRecurrenceOptions, setShowRecurrenceOptions] = useState(false);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const [optimizeDelivery, setOptimizeDelivery] = useState(true);

  // Dummy data for calendar
  const currentDate = new Date();
  const dates = Array.from({ length: 14 }, (_, i) => {
    const date = new Date(currentDate);
    date.setDate(currentDate.getDate() + i);
    return {
      id: i.toString(),
      date: date.toISOString().split("T")[0],
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      dayNum: date.getDate(),
    };
  });

  // Time slots
  const timeSlots: TimeSlot[] = [
    { id: "1", time: "09:00", label: "9:00 AM" },
    { id: "2", time: "12:00", label: "12:00 PM" },
    { id: "3", time: "15:00", label: "3:00 PM" },
    { id: "4", time: "18:00", label: "6:00 PM" },
    { id: "5", time: "20:00", label: "8:00 PM" },
  ];

  // Recurrence options
  const recurrenceOptions: RecurrenceOption[] = [
    { id: "1", label: "Daily", value: "daily" },
    { id: "2", label: "Weekly", value: "weekly" },
    { id: "3", label: "Monthly", value: "monthly" },
    { id: "4", label: "Custom", value: "custom" },
  ];

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <View className="mb-6">
        <Text className="text-xl font-bold text-gray-800 mb-1">
          Schedule Campaign
        </Text>
        <Text className="text-gray-500">
          Set when your campaign will be sent
        </Text>
      </View>

      {/* Send now option */}
      <TouchableOpacity
        onPress={() => setSendNow(!sendNow)}
        className={`flex-row justify-between items-center p-4 rounded-lg mb-4 ${sendNow ? "bg-indigo-50 border border-indigo-200" : "bg-gray-50 border border-gray-200"}`}
      >
        <View className="flex-row items-center">
          <Send size={20} color={sendNow ? "#6366F1" : "#6B7280"} />
          <View className="ml-3">
            <Text
              className={`font-medium ${sendNow ? "text-indigo-700" : "text-gray-800"}`}
            >
              Send Immediately
            </Text>
            <Text className="text-sm text-gray-500">
              Campaign will be sent right away
            </Text>
          </View>
        </View>
        <View
          className={`w-6 h-6 rounded-full ${sendNow ? "bg-indigo-600" : "bg-gray-300"} items-center justify-center`}
        >
          {sendNow && <View className="w-3 h-3 rounded-full bg-white" />}
        </View>
      </TouchableOpacity>

      {/* Schedule for later */}
      <TouchableOpacity
        onPress={() => setSendNow(false)}
        className={`flex-row justify-between items-center p-4 rounded-lg mb-4 ${!sendNow ? "bg-indigo-50 border border-indigo-200" : "bg-gray-50 border border-gray-200"}`}
      >
        <View className="flex-row items-center">
          <Calendar size={20} color={!sendNow ? "#6366F1" : "#6B7280"} />
          <View className="ml-3">
            <Text
              className={`font-medium ${!sendNow ? "text-indigo-700" : "text-gray-800"}`}
            >
              Schedule for Later
            </Text>
            <Text className="text-sm text-gray-500">
              Set a specific date and time
            </Text>
          </View>
        </View>
        <View
          className={`w-6 h-6 rounded-full ${!sendNow ? "bg-indigo-600" : "bg-gray-300"} items-center justify-center`}
        >
          {!sendNow && <View className="w-3 h-3 rounded-full bg-white" />}
        </View>
      </TouchableOpacity>

      {/* Date selection */}
      {!sendNow && (
        <View className="mb-6">
          <Text className="font-medium text-gray-800 mb-2">Select Date</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {dates.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => setSelectedDate(item.date)}
                className={`mr-2 w-16 h-20 rounded-lg items-center justify-center ${selectedDate === item.date ? "bg-indigo-100 border border-indigo-300" : "bg-gray-100 border border-gray-200"}`}
              >
                <Text
                  className={`text-xs ${selectedDate === item.date ? "text-indigo-700" : "text-gray-500"}`}
                >
                  {item.day}
                </Text>
                <Text
                  className={`text-lg font-bold ${selectedDate === item.date ? "text-indigo-700" : "text-gray-800"}`}
                >
                  {item.dayNum}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Time selection */}
      {!sendNow && selectedDate && (
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="font-medium text-gray-800">Select Time</Text>
            <TouchableOpacity onPress={() => setShowTimeSlots(!showTimeSlots)}>
              <Text className="text-indigo-600">
                {showTimeSlots ? "Hide" : "Show"} all times
              </Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row flex-wrap">
            {(showTimeSlots ? timeSlots : timeSlots.slice(0, 3)).map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => setSelectedTime(item.time)}
                className={`mr-2 mb-2 px-4 py-2 rounded-lg ${selectedTime === item.time ? "bg-indigo-100 border border-indigo-300" : "bg-gray-100 border border-gray-200"}`}
              >
                <Text
                  className={`${selectedTime === item.time ? "text-indigo-700" : "text-gray-800"}`}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Recurring option */}
      {!sendNow && selectedDate && selectedTime && (
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center">
              <RotateCcw size={20} color="#6B7280" />
              <Text className="ml-2 font-medium text-gray-800">
                Recurring Campaign
              </Text>
            </View>
            <Switch
              value={isRecurring}
              onValueChange={setIsRecurring}
              trackColor={{ false: "#D1D5DB", true: "#A5B4FC" }}
              thumbColor={isRecurring ? "#6366F1" : "#F3F4F6"}
            />
          </View>

          {isRecurring && (
            <View>
              <TouchableOpacity
                onPress={() => setShowRecurrenceOptions(!showRecurrenceOptions)}
                className="flex-row justify-between items-center p-3 border border-gray-300 rounded-lg mb-3"
              >
                <Text className="text-gray-800">
                  {recurrenceType
                    ? recurrenceOptions.find((o) => o.value === recurrenceType)
                        ?.label
                    : "Select frequency"}
                </Text>
                <ChevronDown size={18} color="#6B7280" />
              </TouchableOpacity>

              {showRecurrenceOptions && (
                <View className="border border-gray-200 rounded-lg mb-3 bg-white">
                  {recurrenceOptions.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      onPress={() => {
                        setRecurrenceType(option.value);
                        setShowRecurrenceOptions(false);
                      }}
                      className="p-3 border-b border-gray-200 flex-row justify-between items-center"
                    >
                      <Text className="text-gray-800">{option.label}</Text>
                      {recurrenceType === option.value && (
                        <View className="w-5 h-5 rounded-full bg-indigo-600 items-center justify-center">
                          <View className="w-2 h-2 rounded-full bg-white" />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <View className="mb-3">
                <Text className="font-medium text-gray-800 mb-2">End Date</Text>
                <TouchableOpacity className="flex-row justify-between items-center p-3 border border-gray-300 rounded-lg">
                  <Text className="text-gray-800">
                    {endDate || "Select end date"}
                  </Text>
                  <Calendar size={18} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Delivery optimization */}
      {!sendNow && (
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-2">
            <View>
              <Text className="font-medium text-gray-800">
                Optimize Delivery
              </Text>
              <Text className="text-sm text-gray-500">
                Send messages in batches to avoid carrier limits
              </Text>
            </View>
            <Switch
              value={optimizeDelivery}
              onValueChange={setOptimizeDelivery}
              trackColor={{ false: "#D1D5DB", true: "#A5B4FC" }}
              thumbColor={optimizeDelivery ? "#6366F1" : "#F3F4F6"}
            />
          </View>
        </View>
      )}

      {/* Campaign summary */}
      <View className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
        <Text className="font-bold text-gray-800 mb-2">Campaign Summary</Text>
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-gray-500">Campaign Name:</Text>
          <Text className="font-medium text-gray-800">October Promotion</Text>
        </View>
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-gray-500">Recipients:</Text>
          <Text className="font-medium text-gray-800">250 contacts</Text>
        </View>
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-gray-500">Delivery:</Text>
          <Text className="font-medium text-gray-800">
            {sendNow
              ? "Immediate"
              : selectedDate && selectedTime
                ? `${selectedDate} at ${selectedTime}`
                : "Not scheduled"}
          </Text>
        </View>
        {isRecurring && recurrenceType && (
          <View className="flex-row justify-between items-center">
            <Text className="text-gray-500">Recurrence:</Text>
            <Text className="font-medium text-gray-800">
              {recurrenceOptions.find((o) => o.value === recurrenceType)?.label}
              {endDate ? ` until ${endDate}` : ""}
            </Text>
          </View>
        )}
      </View>

      {/* Action buttons */}
      <View className="flex-row justify-between">
        <Button onPress={() => {}} variant="outline" className="flex-1 mr-2">
          Back
        </Button>
        <Button
          onPress={() => {}}
          className="flex-1 ml-2 bg-indigo-600"
          disabled={sendNow ? false : !(selectedDate && selectedTime)}
        >
          {sendNow ? "Send Now" : "Schedule"}
        </Button>
      </View>
    </ScrollView>
  );
}
