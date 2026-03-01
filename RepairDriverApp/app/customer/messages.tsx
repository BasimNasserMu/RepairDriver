import React, { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../src/lib/constants";

interface ChatThread {
  id: string;
  techName: string;
  techRating: number;
  service: string;
  lastMessage: string;
  time: string;
  unread: number;
  status: string;
}

const DEMO_THREADS: ChatThread[] = [
  {
    id: "1",
    techName: "أحمد محمد",
    techRating: 4.9,
    service: "تكييف",
    lastMessage: "أنا في الطريق، سأصل خلال 5 دقائق",
    time: "الآن",
    unread: 2,
    status: "متصل",
  },
  {
    id: "2",
    techName: "خالد عبدالله",
    techRating: 4.7,
    service: "سباكة",
    lastMessage: "تم إرسال عرض السعر، يرجى مراجعته",
    time: "منذ ساعة",
    unread: 0,
    status: "غير متصل",
  },
  {
    id: "3",
    techName: "فهد سعد",
    techRating: 4.8,
    service: "كهرباء",
    lastMessage: "شكراً لك، تم إنجاز العمل بنجاح",
    time: "أمس",
    unread: 0,
    status: "غير متصل",
  },
];

export default function MessagesScreen() {
  const { t } = useTranslation();
  const [selectedThread, setSelectedThread] = useState<string | null>(null);

  if (selectedThread) {
    return (
      <ChatView
        threadId={selectedThread}
        onBack={() => setSelectedThread(null)}
      />
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-light">
      {/* Header */}
      <View className="px-6 pt-4 pb-4">
        <Text className="text-2xl font-bold text-gray-800 text-right">
          {t("customer.messages")}
        </Text>
      </View>

      {/* Thread List */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {DEMO_THREADS.map((thread) => (
          <TouchableOpacity
            key={thread.id}
            onPress={() => setSelectedThread(thread.id)}
            className="px-6 py-4 bg-white border-b border-gray-50"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <View className="flex-1">
                <View className="flex-row items-center justify-end gap-2 mb-1">
                  <Text className="text-gray-800 font-bold text-base">
                    {thread.techName}
                  </Text>
                  <View className="w-12 h-12 bg-primary/10 rounded-full items-center justify-center">
                    <Text className="text-primary font-bold text-lg">
                      {thread.techName.charAt(0)}
                    </Text>
                  </View>
                </View>
                <View className="flex-row items-center justify-end gap-2">
                  <Text className="text-gray-500 text-sm">{thread.service}</Text>
                  <View className="flex-row items-center gap-0.5">
                    <Text className="text-yellow-500 text-xs">{thread.techRating}</Text>
                    <Ionicons name="star" size={10} color="#eab308" />
                  </View>
                </View>
                <Text
                  className="text-gray-500 text-sm text-right mt-2"
                  numberOfLines={1}
                >
                  {thread.lastMessage}
                </Text>
              </View>
            </View>
            <View className="flex-row items-center justify-between mt-2">
              <View>
                {thread.unread > 0 && (
                  <View className="bg-primary w-5 h-5 rounded-full items-center justify-center">
                    <Text className="text-white text-[10px] font-bold">
                      {thread.unread}
                    </Text>
                  </View>
                )}
              </View>
              <Text className="text-gray-400 text-xs">{thread.time}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

// Inline Chat View Component
function ChatView({
  threadId,
  onBack,
}: {
  threadId: string;
  onBack: () => void;
}) {
  const { t } = useTranslation();
  const [message, setMessage] = useState("");
  const scrollRef = useRef<ScrollView>(null);

  const thread = DEMO_THREADS.find((t) => t.id === threadId);

  const DEMO_MESSAGES = [
    {
      id: "1",
      sender: "tech",
      content: "مرحباً، تم قبول طلبك",
      time: "10:30 ص",
    },
    {
      id: "2",
      sender: "tech",
      content: "سأكون عندك خلال 15 دقيقة",
      time: "10:31 ص",
    },
    {
      id: "3",
      sender: "customer",
      content: "ممتاز، رمز البوابة 1234",
      time: "10:32 ص",
    },
    {
      id: "4",
      sender: "tech",
      content: "أنا في الطريق، سأصل خلال 5 دقائق",
      time: "10:45 ص",
    },
  ];

  const handleSend = () => {
    if (!message.trim()) return;
    setMessage("");
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light">
      {/* Chat Header */}
      <View className="bg-white px-4 py-3 flex-row items-center border-b border-gray-100">
        <TouchableOpacity
          onPress={() => {}}
          className="w-10 h-10 bg-success/10 rounded-full items-center justify-center"
        >
          <Ionicons name="call-outline" size={20} color={COLORS.success} />
        </TouchableOpacity>
        <View className="flex-1 mx-3 items-end">
          <Text className="text-gray-800 font-bold text-base">
            {thread?.techName}
          </Text>
          <View className="flex-row items-center gap-1">
            <Text className="text-success text-xs">{thread?.status}</Text>
            <View className="w-2 h-2 bg-success rounded-full" />
          </View>
        </View>
        <TouchableOpacity
          onPress={onBack}
          className="w-10 h-10 items-center justify-center"
        >
          <Ionicons name="arrow-forward" size={22} color={COLORS.gray[600]} />
        </TouchableOpacity>
      </View>

      {/* Status Card */}
      <View className="mx-4 mt-3 bg-primary/5 rounded-xl p-3 flex-row items-center justify-end">
        <View className="items-end mr-2">
          <Text className="text-primary font-semibold text-sm">
            {t("tracking.technicianOnTheWay")}
          </Text>
          <Text className="text-gray-500 text-xs">
            {t("tracking.estimatedArrival")}: 5 {t("tracking.minutes")}
          </Text>
        </View>
        <View className="w-8 h-8 bg-primary/10 rounded-full items-center justify-center">
          <Ionicons name="navigate" size={18} color={COLORS.primary} />
        </View>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={90}
      >
        <ScrollView
          ref={scrollRef}
          className="flex-1 px-4 py-3"
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            scrollRef.current?.scrollToEnd({ animated: true })
          }
        >
          {DEMO_MESSAGES.map((msg) => (
            <View
              key={msg.id}
              className={`mb-3 max-w-[80%] ${
                msg.sender === "customer" ? "self-start" : "self-end"
              }`}
            >
              <View
                className={`px-4 py-3 rounded-2xl ${
                  msg.sender === "customer"
                    ? "bg-primary rounded-bl-sm"
                    : "bg-white rounded-br-sm"
                }`}
              >
                <Text
                  className={`text-base ${
                    msg.sender === "customer" ? "text-white" : "text-gray-800"
                  }`}
                >
                  {msg.content}
                </Text>
              </View>
              <Text
                className={`text-xs text-gray-400 mt-1 ${
                  msg.sender === "customer" ? "text-left" : "text-right"
                }`}
              >
                {msg.time}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Message Input */}
        <View className="bg-white px-4 py-3 border-t border-gray-100 flex-row items-center gap-2">
          <TouchableOpacity
            onPress={handleSend}
            className="w-10 h-10 bg-primary rounded-full items-center justify-center"
          >
            <Ionicons name="send" size={18} color="#fff" />
          </TouchableOpacity>
          <TextInput
            className="flex-1 bg-gray-50 rounded-full px-4 py-2.5 text-right text-base"
            placeholder={t("chat.typeMessage")}
            placeholderTextColor={COLORS.gray[400]}
            value={message}
            onChangeText={setMessage}
            style={{ writingDirection: "rtl" }}
          />
          <TouchableOpacity>
            <Ionicons name="attach-outline" size={24} color={COLORS.gray[400]} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
