import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
} from "react-native";
import { Button } from "./ui/Button";
import {
  Calendar,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Save,
  Send,
} from "lucide-react-native";

type ScheduleOption = "now" | "later" | "recurring";

export default function SchedulingScreen() {
  const [scheduleOption, setScheduleOption] = useState<ScheduleOption>("now");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly">(
    "weekly",
  );
  const [showFrequencyOptions, setShowFrequencyOptions] = useState(false);
  const [endDate, setEndDate] = useState("");
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // Dummy dates for the date picker
  const dummyDates = [
    "2023-11-01",
    "2023-11-02",
    "2023-11-03",
    "2023-11-04",
    "2023-11-05",
    "2023-11-06",
    "2023-11-07",
    "2023-11-08",
    "2023-11-09",
    "2023-11-10",
  ];

  // Dummy times for the time picker
  const dummyTimes = [
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "01:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
    "05:00 PM",
    "06:00 PM",
  ];

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView>
        <View className="p-4 bg-white border-b border-gray-200">
          <Text className="text-2xl font-bold mb-4">Schedule Campaign</Text>

          {/* Campaign Summary */}
          <View className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <Text className="text-lg font-medium mb-2">Campaign Summary</Text>
            <View className="flex-row justify-between mb-1">
              <Text className="text-gray-500">Campaign Name:</Text>
              <Text className="font-medium">October Promotion</Text>
            </View>
            <View className="flex-row justify-between mb-1">
              <Text className="text-gray-500">Recipients:</Text>
              <Text className="font-medium">250 contacts</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-500">Message Length:</Text>
              <Text className="font-medium">120 characters (1 SMS)</Text>
            </View>
          </View>

          {/* Schedule Options */}
          <Text className="text-lg font-medium mb-3">When to Send</Text>

          <View className="mb-4">
            <TouchableOpacity
              className={`flex-row items-center p-3 border rounded-lg mb-2 ${scheduleOption === "now" ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white"}`}
              onPress={() => setScheduleOption("now")}
            >
              <View
                className={`w-5 h-5 rounded-full mr-3 border ${scheduleOption === "now" ? "border-blue-500 bg-blue-500" : "border-gray-400"}`}
              />
              <View>
                <Text className="font-medium">Send Immediately</Text>
                <Text className="text-gray-500 text-sm">
                  Campaign will be sent right away
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-row items-center p-3 border rounded-lg mb-2 ${scheduleOption === "later" ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white"}`}
              onPress={() => {
                setScheduleOption("later");
                setIsRecurring(false);
              }}
            >
              <View
                className={`w-5 h-5 rounded-full mr-3 border ${scheduleOption === "later" ? "border-blue-500 bg-blue-500" : "border-gray-400"}`}
              />
              <View>
                <Text className="font-medium">Schedule for Later</Text>
                <Text className="text-gray-500 text-sm">
                  Set a specific date and time
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-row items-center p-3 border rounded-lg ${scheduleOption === "recurring" ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white"}`}
              onPress={() => {
                setScheduleOption("recurring");
                setIsRecurring(true);
              }}
            >
              <View
                className={`w-5 h-5 rounded-full mr-3 border ${scheduleOption === "recurring" ? "border-blue-500 bg-blue-500" : "border-gray-400"}`}
              />
              <View>
                <Text className="font-medium">Recurring Campaign</Text>
                <Text className="text-gray-500 text-sm">
                  Send on a regular schedule
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Date and Time Selection */}
          {(scheduleOption === "later" || scheduleOption === "recurring") && (
            <View className="mb-4">
              <Text className="text-base font-medium mb-2">
                Select Date & Time
              </Text>

              <TouchableOpacity
                className="flex-row items-center justify-between p-3 border border-gray-300 rounded-lg bg-white mb-2"
                onPress={() => setShowDatePicker(!showDatePicker)}
              >
                <View className="flex-row items-center">
                  <Calendar size={20} color="#4B5563" className="mr-2" />
                  <Text>{selectedDate || "Select Date"}</Text>
                </View>
                {showDatePicker ? (
                  <ChevronUp size={20} color="#4B5563" />
                ) : (
                  <ChevronDown size={20} color="#4B5563" />
                )}
              </TouchableOpacity>

              {showDatePicker && (
                <View className="mb-2 p-2 border border-gray-300 rounded-lg bg-white">
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {dummyDates.map((date, index) => (
                      <TouchableOpacity
                        key={index}
                        className={`px-4 py-2 mx-1 rounded-lg ${selectedDate === date ? "bg-blue-500" : "bg-gray-100"}`}
                        onPress={() => {
                          setSelectedDate(date);
                          setShowDatePicker(false);
                        }}
                      >
                        <Text
                          className={
                            selectedDate === date
                              ? "text-white"
                              : "text-gray-800"
                          }
                        >
                          {date}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              <TouchableOpacity
                className="flex-row items-center justify-between p-3 border border-gray-300 rounded-lg bg-white"
                onPress={() => setShowTimePicker(!showTimePicker)}
              >
                <View className="flex-row items-center">
                  <Clock size={20} color="#4B5563" className="mr-2" />
                  <Text>{selectedTime || "Select Time"}</Text>
                </View>
                {showTimePicker ? (
                  <ChevronUp size={20} color="#4B5563" />
                ) : (
                  <ChevronDown size={20} color="#4B5563" />
                )}
              </TouchableOpacity>

              {showTimePicker && (
                <View className="mt-2 p-2 border border-gray-300 rounded-lg bg-white">
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {dummyTimes.map((time, index) => (
                      <TouchableOpacity
                        key={index}
                        className={`px-4 py-2 mx-1 rounded-lg ${selectedTime === time ? "bg-blue-500" : "bg-gray-100"}`}
                        onPress={() => {
                          setSelectedTime(time);
                          setShowTimePicker(false);
                        }}
                      >
                        <Text
                          className={
                            selectedTime === time
                              ? "text-white"
                              : "text-gray-800"
                          }
                        >
                          {time}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          )}

          {/* Recurring Options */}
          {isRecurring && (
            <View className="mb-4">
              <Text className="text-base font-medium mb-2">
                Recurring Settings
              </Text>

              <TouchableOpacity
                className="flex-row items-center justify-between p-3 border border-gray-300 rounded-lg bg-white mb-2"
                onPress={() => setShowFrequencyOptions(!showFrequencyOptions)}
              >
                <Text>
                  Frequency:{" "}
                  {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
                </Text>
                {showFrequencyOptions ? (
                  <ChevronUp size={20} color="#4B5563" />
                ) : (
                  <ChevronDown size={20} color="#4B5563" />
                )}
              </TouchableOpacity>

              {showFrequencyOptions && (
                <View className="mb-2 p-2 border border-gray-300 rounded-lg bg-white">
                  <TouchableOpacity
                    className={`p-2 ${frequency === "daily" ? "bg-blue-100" : ""}`}
                    onPress={() => {
                      setFrequency("daily");
                      setShowFrequencyOptions(false);
                    }}
                  >
                    <Text
                      className={
                        frequency === "daily"
                          ? "text-blue-800"
                          : "text-gray-800"
                      }
                    >
                      Daily
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={`p-2 ${frequency === "weekly" ? "bg-blue-100" : ""}`}
                    onPress={() => {
                      setFrequency("weekly");
                      setShowFrequencyOptions(false);
                    }}
                  >
                    <Text
                      className={
                        frequency === "weekly"
                          ? "text-blue-800"
                          : "text-gray-800"
                      }
                    >
                      Weekly
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={`p-2 ${frequency === "monthly" ? "bg-blue-100" : ""}`}
                    onPress={() => {
                      setFrequency("monthly");
                      setShowFrequencyOptions(false);
                    }}
                  >
                    <Text
                      className={
                        frequency === "monthly"
                          ? "text-blue-800"
                          : "text-gray-800"
                      }
                    >
                      Monthly
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity
                className="flex-row items-center justify-between p-3 border border-gray-300 rounded-lg bg-white"
                onPress={() => setShowEndDatePicker(!showEndDatePicker)}
              >
                <View className="flex-row items-center">
                  <Calendar size={20} color="#4B5563" className="mr-2" />
                  <Text>{endDate || "End Date (Optional)"}</Text>
                </View>
                {showEndDatePicker ? (
                  <ChevronUp size={20} color="#4B5563" />
                ) : (
                  <ChevronDown size={20} color="#4B5563" />
                )}
              </TouchableOpacity>

              {showEndDatePicker && (
                <View className="mt-2 p-2 border border-gray-300 rounded-lg bg-white">
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {dummyDates.map((date, index) => (
                      <TouchableOpacity
                        key={index}
                        className={`px-4 py-2 mx-1 rounded-lg ${endDate === date ? "bg-blue-500" : "bg-gray-100"}`}
                        onPress={() => {
                          setEndDate(date);
                          setShowEndDatePicker(false);
                        }}
                      >
                        <Text
                          className={
                            endDate === date ? "text-white" : "text-gray-800"
                          }
                        >
                          {date}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          )}

          {/* Warning Message */}
          {scheduleOption !== "now" && (!selectedDate || !selectedTime) && (
            <View className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex-row items-center">
              <AlertCircle size={20} color="#F59E0B" className="mr-2" />
              <Text className="text-yellow-800">
                Please select both date and time to schedule your campaign.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View className="p-4 bg-white border-t border-gray-200">
        <View className="flex-row">
          <Button variant="outline" className="flex-1 mr-2">
            <Save size={20} color="#4B5563" className="mr-2" />
            Save Draft
          </Button>
          <Button
            variant="default"
            className="flex-1"
            disabled={
              scheduleOption !== "now" && (!selectedDate || !selectedTime)
            }
          >
            <Send size={20} color="white" className="mr-2" />
            {scheduleOption === "now" ? "Send Now" : "Schedule"}
          </Button>
        </View>
      </View>
    </View>
  );
}
