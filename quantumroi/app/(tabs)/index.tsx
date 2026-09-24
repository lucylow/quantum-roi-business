import { router } from "expo-router";
import { Alert, Animated, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useEffect, useRef } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

const recent = [
  { name: "Friday delivery routes", meta: "Completed · Quantum-inspired", value: "$8,420/mo", change: "+11.7%" },
  { name: "Miami service territory", meta: "Demo mode · Classical baseline", value: "$3,180/mo", change: "+6.4%" },
];

export default function HomeScreen() {
  const colors = useColors();
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(fade, { toValue: 1, duration: 260, useNativeDriver: true }).start(); }, [fade]);
  return (
    <ScreenContainer className="px-5 pt-3" containerClassName="bg-background">
      <FlatList
        data={recent}
        keyExtractor={(item) => item.name}
        contentContainerStyle={styles.content}
        ListHeaderComponent={<>
          <Animated.View style={[styles.header, { opacity: fade }]}>

            <View>
              <Text style={[styles.eyebrow, { color: colors.primary }]}>QUANTUMROI</Text>
              <Text accessibilityRole="header" style={[styles.title, { color: colors.foreground }]}>Good morning, Alex</Text>
              <Text style={[styles.subtitle, { color: colors.muted }]}>Find the highest-value way forward.</Text>
            </View>
            <View style={[styles.avatar, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.avatarText, { color: colors.primary }]}>A</Text></View>
          </Animated.View>
            <Pressable accessibilityRole="button" accessibilityLabel="Start a new optimization" onPress={() => router.push("/optimize")}
            style={({ pressed }) => [styles.hero, { backgroundColor: colors.primary }, pressed && styles.pressed]}>
            <View style={styles.heroTop}><View style={styles.heroIcon}><IconSymbol name="arrow.triangle.2.circlepath" size={22} color={colors.background} /></View><Text style={[styles.heroKicker, { color: colors.background }]}>NEW EXPERIMENT</Text></View>
            <Text style={[styles.heroTitle, { color: colors.background }]}>What do you want to optimize?</Text>
            <Text style={[styles.heroCopy, { color: colors.background }]}>Turn an operational challenge into a measurable business result.</Text>
            <View style={styles.heroAction}><Text style={[styles.heroActionText, { color: colors.background }]}>Start with delivery routes</Text><IconSymbol name="chevron.right" size={18} color={colors.background} /></View>
          </Pressable>
          <View style={styles.sectionHeader}><Text style={[styles.sectionTitle, { color: colors.foreground }]}>Your business value</Text><Text style={[styles.sectionLink, { color: colors.primary }]}>This month</Text></View>
          <View style={styles.metricsRow}>
            <View style={[styles.metricCard, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.metricLabel, { color: colors.muted }]}>EST. SAVINGS</Text><Text style={[styles.metricValue, { color: colors.foreground }]}>$11.6k</Text><Text style={[styles.metricDelta, { color: colors.success }]}>↑ 18.4%</Text></View>
            <View style={[styles.metricCard, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.metricLabel, { color: colors.muted }]}>EXPERIMENTS</Text><Text style={[styles.metricValue, { color: colors.foreground }]}>12</Text><Text style={[styles.metricDelta, { color: colors.muted }]}>3 remaining</Text></View>
          </View>
          <View style={styles.sectionHeader}><Text style={[styles.sectionTitle, { color: colors.foreground }]}>Explore QuantumROI</Text></View>
          <View style={styles.shortcutRow}>{[{ label: "AI guide", route: "/ai" }, { label: "Quantum Studio", route: "/quantum/studio" }, { label: "Plans & credits", route: "/upgrade" }, { label: "Workspace setup", route: "/onboarding" }, { label: "Quantum learning", route: "/learn" }].map((item) => <Pressable key={item.label} accessibilityRole="button" accessibilityLabel={item.label} onPress={() => router.push(item.route as "/ai" | "/quantum/studio" | "/upgrade" | "/onboarding" | "/learn")} style={({ pressed }) => [styles.shortcut, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.pressed]}><Text style={[styles.shortcutLabel, { color: colors.foreground }]}>{item.label}</Text><IconSymbol name="chevron.right" size={16} color={colors.primary} /></Pressable>)}</View>
          <View style={styles.sectionHeader}><Text style={[styles.sectionTitle, { color: colors.foreground }]}>Quick start</Text></View>
          <View style={styles.quickGrid}>
            {[{ icon: "car.fill" as const, label: "Delivery routes" }, { icon: "calendar" as const, label: "Scheduling" }, { icon: "chart.bar.fill" as const, label: "Allocation" }, { icon: "plus" as const, label: "Custom problem" }].map((item, index) => <Pressable key={item.label} accessibilityRole="button" accessibilityLabel={item.label} onPress={() => index === 0 ? router.push("/optimize") : Alert.alert(item.label, "This workflow is coming soon. Delivery routes are available now.")} style={({ pressed }) => [styles.quickCard, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.pressed]}><IconSymbol name={item.icon} size={22} color={colors.primary} /><Text style={[styles.quickLabel, { color: colors.foreground }]}>{item.label}</Text>{index > 0 && <Text style={[styles.soon, { color: colors.muted }]}>Soon</Text>}</Pressable>)}
          </View>
          <View style={styles.sectionHeader}><Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent experiments</Text><Pressable accessibilityRole="button" onPress={() => router.push("/history")}><Text style={[styles.sectionLink, { color: colors.primary }]}>View all</Text></Pressable></View>
        </>}
        renderItem={({ item }) => <Pressable accessibilityRole="button" style={({ pressed }) => [styles.experiment, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.pressed]}><View style={[styles.experimentIcon, { backgroundColor: colors.primary + "20" }]}><IconSymbol name="arrow.triangle.2.circlepath" size={18} color={colors.primary} /></View><View style={styles.experimentBody}><Text style={[styles.experimentName, { color: colors.foreground }]}>{item.name}</Text><Text style={[styles.experimentMeta, { color: colors.muted }]}>{item.meta}</Text></View><View style={styles.experimentValue}><Text style={[styles.experimentSavings, { color: colors.success }]}>{item.value}</Text><Text style={[styles.experimentChange, { color: colors.muted }]}>{item.change}</Text></View></Pressable>}
        ListFooterComponent={<View style={[styles.usage, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={styles.usageHeader}><Text style={[styles.usageTitle, { color: colors.foreground }]}>Free plan</Text><Text style={[styles.usageCount, { color: colors.muted }]}>12 / 15 used</Text></View><View style={[styles.progressTrack, { backgroundColor: colors.border }]}><View style={[styles.progressFill, { backgroundColor: colors.primary, width: "80%" }]} /></View><Text style={[styles.usageCopy, { color: colors.muted }]}>Keep exploring. Your experiments reset in 14 days.</Text></View>}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({ content: { paddingBottom: 28, gap: 14 }, header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }, eyebrow: { fontSize: 12, fontWeight: "800", letterSpacing: 2.2, marginBottom: 7 }, title: { fontSize: 27, fontWeight: "800", letterSpacing: -0.6 }, subtitle: { fontSize: 15, marginTop: 5 }, avatar: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", borderWidth: 1 }, avatarText: { fontWeight: "800", fontSize: 17 }, hero: { borderRadius: 22, padding: 20, marginTop: 6, minHeight: 188 }, heroTop: { flexDirection: "row", alignItems: "center", gap: 9 }, heroIcon: { width: 34, height: 34, borderRadius: 11, backgroundColor: "rgba(11,17,24,0.14)", alignItems: "center", justifyContent: "center" }, heroKicker: { fontSize: 11, fontWeight: "800", letterSpacing: 1.4 }, heroTitle: { fontSize: 26, lineHeight: 30, fontWeight: "800", marginTop: 18, maxWidth: 300 }, heroCopy: { fontSize: 14, lineHeight: 20, opacity: 0.82, marginTop: 7, maxWidth: 310 }, heroAction: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 18 }, heroActionText: { fontSize: 14, fontWeight: "800" }, sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 12 }, sectionTitle: { fontSize: 17, fontWeight: "800" }, sectionLink: { fontSize: 13, fontWeight: "700" }, metricsRow: { flexDirection: "row", gap: 10 }, metricCard: { flex: 1, padding: 15, borderRadius: 16, borderWidth: 1 }, metricLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 1 }, metricValue: { fontSize: 24, fontWeight: "800", marginTop: 8 }, metricDelta: { fontSize: 12, fontWeight: "700", marginTop: 5 }, shortcutRow: { gap: 8 }, shortcut: { minHeight: 48, borderRadius: 14, borderWidth: 1, paddingHorizontal: 13, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, shortcutLabel: { fontSize: 13, fontWeight: "700" }, quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 }, quickCard: { width: "48%", minHeight: 84, padding: 14, borderRadius: 16, borderWidth: 1 }, quickLabel: { fontSize: 13, fontWeight: "700", marginTop: 10 }, soon: { fontSize: 10, marginTop: 3 }, experiment: { borderRadius: 16, borderWidth: 1, padding: 13, flexDirection: "row", alignItems: "center" }, experimentIcon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" }, experimentBody: { flex: 1, marginLeft: 11 }, experimentName: { fontSize: 14, fontWeight: "700" }, experimentMeta: { fontSize: 11, marginTop: 4 }, experimentValue: { alignItems: "flex-end" }, experimentSavings: { fontSize: 12, fontWeight: "800" }, experimentChange: { fontSize: 11, marginTop: 4 }, usage: { borderRadius: 16, borderWidth: 1, padding: 15, marginTop: 4 }, usageHeader: { flexDirection: "row", justifyContent: "space-between" }, usageTitle: { fontWeight: "800", fontSize: 14 }, usageCount: { fontSize: 12 }, progressTrack: { height: 7, borderRadius: 4, overflow: "hidden", marginTop: 12 }, progressFill: { height: "100%", borderRadius: 4 }, usageCopy: { fontSize: 11, marginTop: 9 }, pressed: { opacity: 0.78, transform: [{ scale: 0.99 }] } });
