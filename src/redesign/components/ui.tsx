import React from 'react';
import { Platform, Pressable, ScrollView, StyleProp, StyleSheet, Text, View, ViewStyle, type DimensionValue } from 'react-native';
import { ui, toneColor, Tone } from '../theme';

export function Surface({ children, style, tone = 'default' }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; tone?: 'default' | 'hero' | 'raised' | 'success' | 'warning' }) {
  const bg = tone === 'hero' ? '#0A2234' : tone === 'raised' ? ui.colors.surfaceRaised : tone === 'success' ? '#0A2824' : tone === 'warning' ? '#292215' : ui.colors.surface;
  const border = tone === 'hero' ? '#2C6B89' : tone === 'success' ? '#1D6D61' : tone === 'warning' ? '#6B5530' : ui.colors.line;
  return <View style={[styles.surface, { backgroundColor: bg, borderColor: border }, style]}>{children}</View>;
}

export function Eyebrow({ children, tone = 'blue' }: { children: React.ReactNode; tone?: Tone }) { return <Text style={[styles.eyebrow, { color: toneColor(tone) }]}>{String(children).toUpperCase()}</Text>; }
export function Title({ children, size = 'title' }: { children: React.ReactNode; size?: 'title'|'display'|'section' }) { return <Text style={[size === 'display' ? ui.type.display : size === 'section' ? ui.type.h2 : ui.type.title, { color:ui.colors.text }]}>{children}</Text>; }
export function Body({ children, strong=false, style }: { children: React.ReactNode; strong?: boolean; style?: StyleProp<any> }) { return <Text style={[strong ? ui.type.bodyStrong : ui.type.body, { color:ui.colors.text2 }, style]}>{children}</Text>; }

export function Pill({ label, tone='blue', dot=true }: { label: string; tone?: Tone; dot?: boolean }) {
  const color = toneColor(tone);
  return <View style={[styles.pill, { borderColor:`${color}55`, backgroundColor:`${color}12` }]}>{dot && <View style={[styles.dot,{backgroundColor:color}]} />}<Text style={[styles.pillText,{color}]}>{label}</Text></View>;
}

export function IconButton({ label, onPress, glyph }: { label:string; onPress?:()=>void; glyph:string }) { return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({pressed})=>[styles.iconButton,pressed&&styles.pressed]}><Text style={styles.iconGlyph}>{glyph}</Text></Pressable>; }

export function Button({ title, onPress, kind = 'primary', disabled = false, full = false }: { title:string; onPress:()=>void; kind?:'primary'|'secondary'|'ghost'; disabled?:boolean; full?:boolean }) {
  return <Pressable accessibilityRole="button" accessibilityState={{disabled}} disabled={disabled} onPress={onPress} style={({pressed})=>[
    styles.button, full && styles.full, kind==='primary'&&styles.primary, kind==='secondary'&&styles.secondary, kind==='ghost'&&styles.ghost, pressed&&styles.pressed, disabled&&styles.disabled,
  ]}><Text style={[styles.buttonText, kind==='primary'?{color:ui.colors.canvas}:{color:ui.colors.text}]}>{title}</Text></Pressable>;
}

export function Section({ title, subtitle, action }: { title:string; subtitle?:string; action?:React.ReactNode }) { return <View style={styles.sectionHeader}><View style={{flex:1}}><Text style={styles.sectionTitle}>{title}</Text>{subtitle&&<Text style={styles.sectionSubtitle}>{subtitle}</Text>}</View>{action}</View>; }

export function MetricCard({ label, value, delta, tone='blue', footnote }: { label:string; value:string; delta?:string; tone?:Tone; footnote?:string }) { return <Surface style={styles.metricCard}><Eyebrow tone="neutral">{label}</Eyebrow><Text style={styles.metricValue}>{value}</Text>{delta&&<Text style={[styles.metricDelta,{color:toneColor(tone)}]}>{delta}</Text>}{footnote&&<Text style={styles.metricFoot}>{footnote}</Text>}</Surface>; }

export function Progress({ value, label, right, tone='blue' }: { value:number; label?:string; right?:string; tone?:Tone }) { const clamped=Math.max(0,Math.min(1,value)); const color=toneColor(tone); return <View style={{gap:6}}>{(label||right)&&<View style={styles.progressHeader}><Text style={styles.progressLabel}>{label}</Text><Text style={styles.progressRight}>{right??`${Math.round(clamped*100)}%`}</Text></View>}<View style={styles.track}><View style={[styles.fill,{width:`${clamped*100}%`,backgroundColor:color}]} /></View></View>; }

export function Segmented({ items, selected, onChange }: { items:string[]; selected:string; onChange:(value:string)=>void }) { return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.segmentScroll}>{items.map(item=>{const active=item===selected;return <Pressable key={item} onPress={()=>onChange(item)} style={[styles.segment,active&&styles.segmentActive]}><Text style={[styles.segmentText,active&&styles.segmentTextActive]}>{item}</Text></Pressable>})}</ScrollView>; }

export function TinyBarChart({ values, labels, tone='blue' }: { values:number[]; labels?:string[]; tone?:Tone }) { const max=Math.max(...values,1); const color=toneColor(tone); return <View style={styles.chartRow}>{values.map((v,i)=><View key={`${v}-${i}`} style={styles.chartCol}><View style={styles.chartTrack}><View style={[styles.chartBar,{height:`${Math.max(8,(v/max)*100)}%`,backgroundColor:color}]} /></View>{labels&&<Text style={styles.chartLabel}>{labels[i]}</Text>}</View>)}</View>; }

export function Sparkline({ values, tone='cyan' }: { values:number[]; tone?:Tone }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  return (
    <View style={styles.sparkline}>
      {values.map((v, i) => {
        const y = max === min ? 0.5 : (v - min) / (max - min);
        return (
          <View key={`${v}-${i}`} style={styles.sparkCol}>
            {i > 0 && <View style={[styles.sparkConnector, { bottom: `${8 + y * 72}%`, backgroundColor: toneColor(tone) }]} />}
            <View style={[styles.sparkDot, { bottom: `${8 + y * 72}%`, backgroundColor: toneColor(tone) }]} />
          </View>
        );
      })}
    </View>
  );
}

export function DataRow({ label, value, tone='neutral', note }: { label:string; value:string; tone?:Tone; note?:string }) { return <View style={styles.dataRow}><View style={{flex:1}}><Text style={styles.rowLabel}>{label}</Text>{note&&<Text style={styles.rowNote}>{note}</Text>}</View><Text style={[styles.rowValue,{color:toneColor(tone)}]}>{value}</Text></View>; }

export function EmptyState({ title, detail, action }: { title:string; detail:string; action?:React.ReactNode }) { return <Surface style={styles.empty}><Text style={styles.emptyIcon}>◌</Text><Text style={styles.emptyTitle}>{title}</Text><Text style={styles.emptyDetail}>{detail}</Text>{action}</Surface>; }

export function ErrorState({ title, detail, action }: { title:string; detail:string; action?:React.ReactNode }) { return <Surface tone="warning" style={styles.empty}><Text style={[styles.emptyIcon,{color:ui.colors.red}]}>!</Text><Text style={styles.emptyTitle}>{title}</Text><Text style={styles.emptyDetail}>{detail}</Text>{action}</Surface>; }

export function Skeleton({ width='100%', height=12 }: { width?:DimensionValue; height?:number }) { return <View style={{width,height,backgroundColor:'#163047',borderRadius:7,opacity:.75}} />; }

export function AppPage({ children, onRefresh }: { children:React.ReactNode; onRefresh?:()=>void }) { return <ScrollView style={{flex:1,backgroundColor:ui.colors.canvas}} contentContainerStyle={styles.page} showsVerticalScrollIndicator={false} refreshControl={undefined}><View style={styles.pageInner}>{children}</View><View style={{height:110}} /></ScrollView>; }

const styles=StyleSheet.create({
  surface:{borderWidth:1,borderRadius:ui.radius.lg,padding:ui.spacing[16],gap:12,...ui.shadow},
  eyebrow:{...ui.type.label}, iconButton:{width:36,height:36,borderRadius:12,borderWidth:1,borderColor:ui.colors.line,alignItems:'center',justifyContent:'center',backgroundColor:ui.colors.surface},iconGlyph:{color:ui.colors.text,fontSize:16,fontWeight:'800'},
  pill:{alignSelf:'flex-start',flexDirection:'row',alignItems:'center',gap:6,borderWidth:1,paddingHorizontal:9,paddingVertical:6,borderRadius:ui.radius.pill},dot:{width:6,height:6,borderRadius:6},pillText:{fontSize:9,fontWeight:'900',letterSpacing:.4},
  button:{minHeight:46,paddingHorizontal:15,borderRadius:13,alignItems:'center',justifyContent:'center',borderWidth:1},full:{width:'100%'},primary:{backgroundColor:ui.colors.cyan,borderColor:ui.colors.cyan},secondary:{backgroundColor:ui.colors.surfaceRaised,borderColor:ui.colors.line},ghost:{backgroundColor:'transparent',borderColor:'transparent',paddingHorizontal:6},buttonText:{fontSize:12,fontWeight:'900',letterSpacing:.1},pressed:{opacity:.78,transform:[{scale:.985}]},disabled:{opacity:.45},
  sectionHeader:{flexDirection:'row',alignItems:'flex-end',gap:10,marginTop:4,marginBottom:2},sectionTitle:{...ui.type.h2,color:ui.colors.text},sectionSubtitle:{...ui.type.body,color:ui.colors.text3,marginTop:2},
  metricCard:{flex:1,minWidth:150,padding:14},metricValue:{color:ui.colors.text,fontSize:25,fontWeight:'900',letterSpacing:-.4,marginTop:4},metricDelta:{fontSize:10,fontWeight:'800',marginTop:3},metricFoot:{color:ui.colors.text3,fontSize:9,marginTop:2},
  progressHeader:{flexDirection:'row',justifyContent:'space-between'},progressLabel:{color:ui.colors.text2,fontSize:10,fontWeight:'800'},progressRight:{color:ui.colors.text3,fontSize:10,fontWeight:'800'},track:{height:7,borderRadius:99,backgroundColor:'#10273A',overflow:'hidden'},fill:{height:'100%',borderRadius:99},
  segmentScroll:{gap:7,paddingVertical:4},segment:{paddingHorizontal:12,paddingVertical:8,borderRadius:11,borderWidth:1,borderColor:ui.colors.line,backgroundColor:ui.colors.surface},segmentActive:{backgroundColor:ui.colors.text,borderColor:ui.colors.text},segmentText:{color:ui.colors.text3,fontSize:10,fontWeight:'800'},segmentTextActive:{color:ui.colors.canvas},
  chartRow:{height:145,flexDirection:'row',alignItems:'flex-end',gap:7},chartCol:{flex:1,height:'100%',justifyContent:'flex-end',alignItems:'center',gap:6},chartTrack:{width:'78%',height:'88%',justifyContent:'flex-end',backgroundColor:'#0B1E2E',borderRadius:7,overflow:'hidden'},chartBar:{width:'100%',borderRadius:7,minHeight:4},chartLabel:{color:ui.colors.text3,fontSize:8,fontWeight:'800'},
  sparkline:{height:82,flexDirection:'row',alignItems:'flex-end'},sparkCol:{height:'100%',flex:1,position:'relative',alignItems:'center'},sparkDot:{position:'absolute',width:6,height:6,borderRadius:6,zIndex:2},sparkConnector:{position:'absolute',left:0,right:0},
  dataRow:{flexDirection:'row',alignItems:'center',gap:12,paddingVertical:11,borderBottomWidth:1,borderBottomColor:ui.colors.lineSoft},rowLabel:{color:ui.colors.text2,fontSize:11,fontWeight:'700'},rowNote:{color:ui.colors.text3,fontSize:9,marginTop:2},rowValue:{fontSize:12,fontWeight:'900'},
  empty:{alignItems:'center',justifyContent:'center',paddingVertical:32},emptyIcon:{fontSize:26,color:ui.colors.blue,fontWeight:'900'},emptyTitle:{color:ui.colors.text,fontSize:15,fontWeight:'900',marginTop:2,textAlign:'center'},emptyDetail:{color:ui.colors.text3,fontSize:11,lineHeight:17,textAlign:'center',maxWidth:280},
  page:{paddingHorizontal:16,paddingTop:12,backgroundColor:ui.colors.canvas,minHeight:'100%'},pageInner:{width:'100%',maxWidth:1180,alignSelf:'center',gap:14},
});
