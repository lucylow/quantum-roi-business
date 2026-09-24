import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { router } from "expo-router";
import { orchestrateDemo } from "@/src/ai-orchestration";

type Message = { id: string; role: "assistant" | "user"; text: string };

export default function AiScreen() {
  const colors = useColors();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([{ id: "welcome", role: "assistant", text: "Tell me what you want to improve. I’ll turn it into a structured optimization setup and show you what information is missing." }]);
  function send() {
    const text = input.trim();
    if (!text) return;
    setInput("");
    const response = orchestrateDemo(text);
    const details = `${response.summary}${response.missing.length ? `\n\nStill needed: ${response.missing.join(", ")}.` : ""}${response.warnings.length ? `\n\n${response.warnings.join(" ")}` : ""}${response.requiresApproval ? "\n\nHuman approval is required before any action." : ""}`;
    setMessages((current) => [...current, { id: `${Date.now()}`, role: "user", text }, { id: `${Date.now()}-reply`, role: "assistant", text: details }]);
  }
  return <ScreenContainer edges={["top", "left", "right", "bottom"]} className="px-5 pt-3" containerClassName="bg-background"><View style={styles.header}><View><Text style={[styles.eyebrow, { color: colors.primary }]}>QUANTUMROI GUIDE</Text><Text accessibilityRole="header" style={[styles.title, { color: colors.foreground }]}>AI assistant</Text></View><View style={[styles.demo, { backgroundColor: colors.warning + "18" }]}><Text style={[styles.demoText, { color: colors.warning }]}>DEMO</Text></View></View><Text style={[styles.copy, { color: colors.muted }]}>Describe an operational challenge in plain language. No provider credentials are stored in the mobile app.</Text><ScrollView contentContainerStyle={styles.messages}>{messages.map((message) => <View key={message.id} style={[styles.bubble, message.role === "user" ? { backgroundColor: colors.primary, alignSelf: "flex-end" } : { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, alignSelf: "flex-start" }]}><Text style={[styles.bubbleText, { color: message.role === "user" ? colors.background : colors.foreground }]}>{message.text}</Text></View>)}</ScrollView><View style={[styles.composer, { backgroundColor: colors.surface, borderColor: colors.border }]}><TextInput accessibilityLabel="Describe your business problem" value={input} onChangeText={setInput} onSubmitEditing={send} returnKeyType="send" placeholder="e.g. 8 drivers, 47 stops…" placeholderTextColor={colors.muted} style={[styles.input, { color: colors.foreground }]} /><Pressable accessibilityRole="button" accessibilityLabel="Send message" onPress={send} style={({ pressed }) => [styles.send, { backgroundColor: colors.primary }, pressed && styles.pressed]}><Text style={[styles.sendText, { color: colors.background }]}>Send</Text></Pressable></View><Pressable accessibilityRole="button" onPress={() => router.push("/optimize")} style={({ pressed }) => [styles.cta, { borderColor: colors.primary }, pressed && styles.pressed]}><Text style={[styles.ctaText, { color: colors.primary }]}>Open delivery setup</Text></Pressable></ScreenContainer>;
}
const styles = StyleSheet.create({ header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, eyebrow: { fontSize: 11, letterSpacing: 1.4, fontWeight: "800" }, title: { fontSize: 29, fontWeight: "800", marginTop: 4 }, demo: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: 7 }, demoText: { fontSize: 10, fontWeight: "800", letterSpacing: 1 }, copy: { fontSize: 14, lineHeight: 21, marginTop: 11 }, messages: { flexGrow: 1, paddingVertical: 18, gap: 10, justifyContent: "flex-end" }, bubble: { maxWidth: "86%", borderRadius: 16, padding: 13 }, bubbleText: { fontSize: 14, lineHeight: 20 }, composer: { minHeight: 54, borderRadius: 15, borderWidth: 1, flexDirection: "row", alignItems: "center", paddingLeft: 13, paddingRight: 6 }, input: { flex: 1, fontSize: 14, minHeight: 45 }, send: { minHeight: 40, paddingHorizontal: 13, borderRadius: 11, justifyContent: "center" }, sendText: { fontSize: 13, fontWeight: "800" }, cta: { minHeight: 49, borderRadius: 14, borderWidth: 1, alignItems: "center", justifyContent: "center", marginTop: 10 }, ctaText: { fontSize: 14, fontWeight: "800" }, pressed: { opacity: .78 } });
