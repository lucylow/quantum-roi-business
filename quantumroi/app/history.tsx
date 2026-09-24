import { router } from "expo-router";
import { useEffect, useState } from "react";
import { listSavedExperiments } from "@/src/experiment-storage";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

const experiments = [
  { title: "Friday delivery routes", date: "Today, 10:42 AM", method: "Quantum-inspired", savings: "$8,420/mo", status: "Completed" },
  { title: "Miami service territory", date: "Yesterday, 4:18 PM", method: "Classical baseline", savings: "$3,180/mo", status: "Demo mode" },
  { title: "Warehouse replenishment", date: "Aug 18, 2:06 PM", method: "Classical baseline", savings: "$1,960/mo", status: "Completed" },
];

export default function HistoryScreen() {
  const colors = useColors();
  const [saved, setSaved] = useState<typeof experiments>(experiments);
  useEffect(() => { listSavedExperiments().then((items) => { if (items.length) setSaved(items.map((item) => ({ title: item.businessName + " routes", date: "Saved locally", method: item.recommendedMethod, savings: `$${item.estimatedMonthlySavings.toLocaleString()}/mo`, status: item.status }))); }); }, []);
  return <ScreenContainer edges={["top", "left", "right", "bottom"]} className="px-5 pt-3" containerClassName="bg-background"><FlatList data={saved} keyExtractor={(item) => item.title} contentContainerStyle={styles.content} ListHeaderComponent={<><Text style={[styles.eyebrow, { color: colors.primary }]}>WORKSPACE</Text><Text accessibilityRole="header" style={[styles.title, { color: colors.foreground }]}>Experiment history</Text><Text style={[styles.copy, { color: colors.muted }]}>A record of the decisions behind your business value.</Text></>} renderItem={({ item }) => <Pressable accessibilityRole="button" style={({ pressed }) => [styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.pressed]}><View style={[styles.dot, { backgroundColor: item.status === "Demo mode" ? colors.warning : colors.success }]} /><View style={styles.body}><Text style={[styles.name, { color: colors.foreground }]}>{item.title}</Text><Text style={[styles.meta, { color: colors.muted }]}>{item.date} · {item.method}</Text></View><View style={styles.value}><Text style={[styles.savings, { color: colors.success }]}>{item.savings}</Text><Text style={[styles.status, { color: colors.muted }]}>{item.status}</Text></View></Pressable>} ListFooterComponent={<View style={[styles.empty, { borderColor: colors.border }]}><Text style={[styles.emptyTitle, { color: colors.foreground }]}>Keep testing assumptions</Text><Text style={[styles.emptyCopy, { color: colors.muted }]}>Results marked as estimated become more useful when you add measured outcomes from your operation.</Text><Pressable accessibilityRole="button" onPress={() => router.push("/optimize")}><Text style={[styles.link, { color: colors.primary }]}>Start a new experiment</Text></Pressable></View>} /></ScreenContainer>;
}
const styles = StyleSheet.create({ content: { paddingBottom: 28, gap: 12 }, eyebrow: { fontSize: 11, letterSpacing: 1.4, fontWeight: "800", marginTop: 4 }, title: { fontSize: 29, fontWeight: "800", marginTop: 2 }, copy: { fontSize: 14, lineHeight: 21, marginBottom: 7 }, card: { borderRadius: 16, borderWidth: 1, padding: 14, flexDirection: "row", alignItems: "center" }, dot: { width: 9, height: 9, borderRadius: 5 }, body: { flex: 1, marginLeft: 11 }, name: { fontSize: 14, fontWeight: "800" }, meta: { fontSize: 11, marginTop: 5 }, value: { alignItems: "flex-end" }, savings: { fontSize: 12, fontWeight: "800" }, status: { fontSize: 11, marginTop: 5 }, empty: { borderWidth: 1, borderStyle: "dashed", borderRadius: 16, padding: 17, marginTop: 6 }, emptyTitle: { fontSize: 14, fontWeight: "800" }, emptyCopy: { fontSize: 12, lineHeight: 18, marginTop: 5 }, link: { fontSize: 13, fontWeight: "800", marginTop: 13 }, pressed: { opacity: .78 } });
