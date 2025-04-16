import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import {
  MessageSquare,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  ArrowRight,
} from "lucide-react-native";
import { Button } from "./components/ui/Button";

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async () => {
    if (!email || !password || (!isLogin && !name)) {
      alert("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      // Simulate authentication delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (isLogin) {
        // In a real app, you would validate credentials with your backend
        console.log("Logging in with:", { email, password });
      } else {
        // In a real app, you would register the user with your backend
        console.log("Signing up with:", { name, email, password });
      }

      // Navigate to main app
      router.replace("/");
    } catch (error) {
      console.error("Authentication error:", error);
      alert("Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 p-6">
          {/* Logo and header */}
          <View className="items-center mt-12 mb-8">
            <View className="w-20 h-20 bg-indigo-100 rounded-2xl items-center justify-center mb-4">
              <MessageSquare size={40} color="#6366F1" />
            </View>
            <Text className="text-2xl font-bold text-gray-800 mb-1">
              SMS Campaign Manager
            </Text>
            <Text className="text-base text-gray-500 text-center">
              {isLogin ? "Sign in to your account" : "Create a new account"}
            </Text>
          </View>

          {/* Form */}
          <View className="mb-6">
            {!isLogin && (
              <View className="mb-4">
                <Text className="text-gray-700 font-medium mb-2">
                  Full Name
                </Text>
                <View className="flex-row items-center border border-gray-300 rounded-lg px-3 py-2">
                  <User size={20} color="#6B7280" />
                  <TextInput
                    className="flex-1 ml-2 text-gray-800"
                    placeholder="John Doe"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>
              </View>
            )}

            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">Email</Text>
              <View className="flex-row items-center border border-gray-300 rounded-lg px-3 py-2">
                <Mail size={20} color="#6B7280" />
                <TextInput
                  className="flex-1 ml-2 text-gray-800"
                  placeholder="your@email.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-gray-700 font-medium mb-2">Password</Text>
              <View className="flex-row items-center border border-gray-300 rounded-lg px-3 py-2">
                <Lock size={20} color="#6B7280" />
                <TextInput
                  className="flex-1 ml-2 text-gray-800"
                  placeholder="••••••••"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={20} color="#6B7280" />
                  ) : (
                    <Eye size={20} color="#6B7280" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {isLogin && (
              <TouchableOpacity className="mb-6">
                <Text className="text-indigo-600 text-right font-medium">
                  Forgot password?
                </Text>
              </TouchableOpacity>
            )}

            <Button
              variant="default"
              className="bg-indigo-600"
              onPress={handleAuth}
              disabled={isLoading}
            >
              {isLoading ? (
                <Text className="text-white font-medium">Please wait...</Text>
              ) : (
                <View className="flex-row items-center">
                  <Text className="text-white font-medium mr-2">
                    {isLogin ? "Sign In" : "Create Account"}
                  </Text>
                  <ArrowRight size={18} color="white" />
                </View>
              )}
            </Button>
          </View>

          {/* Toggle between login and signup */}
          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </Text>
            <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
              <Text className="text-indigo-600 font-medium ml-1">
                {isLogin ? "Sign Up" : "Sign In"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
