import { router } from "expo-router";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { runDemoOptimization, validateRouteInput, type RouteInput } from "@/src/quantumroi-mvp";

export default function OptimizeScreen() {
  const colors = useColors();
  const [businessName, setBusinessName] = useState("Harbor & Pine Delivery");
  const [depot, setDepot] = useState("Miami, FL");
  const [stops, setStops] = useState("47");
  const [vehicles, setVehicles] = useState("8");
  const [maxHours, setMaxHours] = useState("8");
  const [costPerMile, setCostPerMile] = useState("1.15");
  const [goal, setGoal] = useState("Minimize driving time while keeping every route under 8 hours.");

  function run() {
    const input: RouteInput = { businessName, depot, stops: Number(stops), vehicles: Number(vehicles), maxHours: Number(maxHours), costPerMile: Number(costPerMile) };
    const errors = validateRouteInput(input);
    if (errors.length) return Alert.alert("Review your inputs", errors.join("\n"));
    const result = runDemoOptimization(input);
    router.push({ pathname: "/results", params: { payload: JSON.stringify(result) } });
  }

  return <ScreenContainer edges={["top", "left", "right", "bottom"]} className="px-5 pt-3" containerClassName="bg-background">
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.eyebrow, { color: colors.primary }]}>DELIVERY ROUTES · STEP 1 OF 2</Text>
        <Text accessibilityRole="header" style={[styles.title, { color: colors.foreground }]}>Tell us about the route.</Text>
        <Text style={[styles.copy, { color: colors.muted }]}>We’ll compare practical approaches and make every assumption visible.</Text>
        <View style={[styles.info, { backgroundColor: colors.primary + "14", borderColor: colors.primary + "44" }]}><Text style={[styles.infoTitle, { color: colors.primary }]}>Demo mode enabled</Text><Text style={[styles.infoCopy, { color: colors.muted }]}>This run is deterministic and uses simulated data. It will not submit work to quantum hardware.</Text></View>
        <Field label="Business name" value={businessName} onChangeText={setBusinessName} colors={colors} />
        <Field label="Depot location" value={depot} onChangeText={setDepot} colors={colors} />
        <View style={styles.row}><Field label="Delivery stops" value={stops} onChangeText={setStops} colors={colors} numeric /><Field label="Vehicles" value={vehicles} onChangeText={setVehicles} colors={colors} numeric /></View>
        <View style={styles.row}><Field label="Max route hours" value={maxHours} onChangeText={setMaxHours} colors={colors} numeric /><Field label="Cost per mile" value={costPerMile} onChangeText={setCostPerMile} colors={colors} numeric /></View>
        <Text style={[styles.label, { color: colors.foreground }]}>Business goal</Text><TextInput accessibilityLabel="Business goal" multiline value={goal} onChangeText={setGoal} style={[styles.textarea, { color: colors.foreground, backgroundColor: colors.surface, borderColor: colors.border }]} />
        <Pressable accessibilityRole="button" accessibilityLabel="Compare optimization approaches" onPress={run} style={({ pressed }) => [styles.button, { backgroundColor: colors.primary }, pressed && styles.pressed]}><Text style={[styles.buttonText, { color: colors.background }]}>Compare approaches</Text></Pressable>
        <Text style={[styles.footnote, { color: colors.muted }]}>Next: review the interpreted model before execution.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  </ScreenContainer>;
}

function Field({ label, value, onChangeText, colors, numeric = false }: { label: string; value: string; onChangeText: (value: string) => void; colors: ReturnType<typeof useColors>; numeric?: boolean }) { return <View style={styles.field}><Text style={[styles.label, { color: colors.foreground }]}>{label}</Text><TextInput accessibilityLabel={label} value={value} onChangeText={onChangeText} keyboardType={numeric ? "decimal-pad" : "default"} returnKeyType="done" style={[styles.input, { color: colors.foreground, backgroundColor: colors.surface, borderColor: colors.border }]} /></View>; }

const styles = StyleSheet.create({ flex: { flex: 1 }, content: { paddingBottom: 32, gap: 13 }, eyebrow: { fontSize: 11, letterSpacing: 1.4, fontWeight: "800", marginTop: 4 }, title: { fontSize: 29, lineHeight: 34, fontWeight: "800", marginTop: 2 }, copy: { fontSize: 15, lineHeight: 22 }, info: { borderRadius: 15, borderWidth: 1, padding: 13, marginTop: 3 }, infoTitle: { fontSize: 13, fontWeight: "800" }, infoCopy: { fontSize: 12, lineHeight: 18, marginTop: 4 }, row: { flexDirection: "row", gap: 10 }, field: { flex: 1 }, label: { fontSize: 12, fontWeight: "700", marginBottom: 7 }, input: { minHeight: 49, borderRadius: 13, borderWidth: 1, paddingHorizontal: 13, fontSize: 15 }, textarea: { minHeight: 88, borderRadius: 13, borderWidth: 1, paddingHorizontal: 13, paddingTop: 12, fontSize: 15, textAlignVertical: "top" }, button: { minHeight: 54, borderRadius: 15, alignItems: "center", justifyContent: "center", marginTop: 6 }, buttonText: { fontWeight: "800", fontSize: 15 }, footnote: { fontSize: 12, textAlign: "center", marginTop: 1 }, pressed: { opacity: 0.78, transform: [{ scale: 0.99 }] } });
