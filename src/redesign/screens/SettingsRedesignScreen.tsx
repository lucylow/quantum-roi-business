import React, { useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import type { ScreenName } from '../../domain';
import { AppPage, Body, Button, DataRow, Eyebrow, Pill, Section, Surface, Title } from '../components/ui';
import { TopBar } from '../components/enterprise';
import { ui } from '../theme';

export function SettingsRedesignScreen({ navigate }:{navigate:(s:ScreenName)=>void}) {
  const [offline, setOffline] = useState(true);
  const [synthetic, setSynthetic] = useState(true);
  const [notifications, setNotifications] = useState(true);
  return <AppPage>
    <TopBar title="Settings" subtitle="Control the demonstration environment, review gates, and local experience."/>
    <Surface tone="hero"><View style={styles.profile}><View style={styles.avatar}><Text style={styles.avatarText}>AM</Text></View><View style={{flex:1}}><Title size="section">Alex Morgan</Title><Body>Optimization Strategy · Enterprise Innovation Lab</Body><Pill label="SYNTHETIC DATA MODE" tone="green"/></View></View></Surface>
    <Surface><Section title="Application" subtitle="Presentation and data behavior"/><Setting label="Show synthetic data label" value={synthetic} setValue={setSynthetic}/><Setting label="Enable offline demonstrations" value={offline} setValue={setOffline}/><Setting label="Run notifications" value={notifications} setValue={setNotifications}/></Surface>
    <Surface><Section title="Explore the workspace" subtitle="Open the areas not shown in the five-item mobile navigation."/><View style={styles.shortcuts}><Button title="Scenario lab" kind="secondary" onPress={()=>navigate('insights')}/><Button title="Quantum readiness" kind="secondary" onPress={()=>navigate('compare')}/><Button title="Experiment history" kind="secondary" onPress={()=>navigate('experiment')}/></View></Surface>
    <Surface><Section title="Security & trust"/><DataRow label="Live quantum execution" value="OFF BY DEFAULT" tone="green" note="Requires explicit cloud configuration and review."/><DataRow label="Credentials in mobile bundle" value="PROHIBITED" tone="green"/><DataRow label="Raw server errors" value="SANITIZED" tone="green"/><DataRow label="Build environment" value="STORE-HARDENED" tone="blue"/></Surface>
    <Surface><Section title="About this product"/><Eyebrow tone="cyan">QUANTUM ROI BUSINESS</Eyebrow><Body>A mobile decision-intelligence experience for evaluating optimization opportunities, business impact, and quantum-readiness pathways.</Body><Text style={styles.disclaimer}>This app contains synthetic demonstration data. It is not an official Amazon or AWS product.</Text></Surface>
  </AppPage>;
}

function Setting({label,value,setValue}:{label:string;value:boolean;setValue:(v:boolean)=>void}) { return <View style={styles.setting}><Text style={styles.settingLabel}>{label}</Text><Switch value={value} onValueChange={setValue} trackColor={{false:'#24374A',true:'#2E7F88'}} thumbColor={value?ui.colors.cyan:'#9BB0BF'}/></View>; }

const styles=StyleSheet.create({profile:{flexDirection:'row',alignItems:'center',gap:12},avatar:{width:48,height:48,borderRadius:16,backgroundColor:'#EAF4FF',alignItems:'center',justifyContent:'center'},avatarText:{color:'#1B3448',fontSize:13,fontWeight:'900'},setting:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingVertical:12,borderBottomWidth:1,borderBottomColor:ui.colors.lineSoft},settingLabel:{color:ui.colors.text2,fontSize:11,fontWeight:'800'},shortcuts:{gap:8},disclaimer:{color:ui.colors.text3,fontSize:9,lineHeight:16,marginTop:5}});
