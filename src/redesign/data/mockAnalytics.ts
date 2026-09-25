import type { Tone } from '../theme';

export interface TrendPoint { label:string; value:number; secondary?:number; }
export interface CostLine { label:string; value:number; tone:Tone; }
export interface KPIHealth { label:string; value:string; health:'healthy'|'watch'|'risk'; detail:string; tone:Tone; }
export interface ConstraintStatus { id:string; label:string; type:'hard'|'soft'; utilization:number; status:'pass'|'watch'|'fail'; detail:string; }
export interface EvidenceItem { id:string; title:string; status:'complete'|'reviewed'|'pending'; source:string; updated:string; hash:string; }

export const annualValueTrend:TrendPoint[] = [
  {label:'Q4 2025',value:9.4,secondary:7.8},{label:'Q1 2026',value:14.2,secondary:11.7},{label:'Q2 2026',value:26.1,secondary:19.4},{label:'Q3 2026',value:42.8,secondary:31.4},
];
export const runVolumeTrend:TrendPoint[] = [
  {label:'Apr',value:31,secondary:8},{label:'May',value:38,secondary:10},{label:'Jun',value:42,secondary:12},{label:'Jul',value:49,secondary:14},{label:'Aug',value:61,secondary:17},{label:'Sep',value:63,secondary:18},
];
export const optimizationQualityTrend:TrendPoint[] = [
  {label:'Apr',value:86,secondary:76},{label:'May',value:89,secondary:79},{label:'Jun',value:91,secondary:82},{label:'Jul',value:93,secondary:84},{label:'Aug',value:94,secondary:87},{label:'Sep',value:96,secondary:89},
];

export const valueDrivers:CostLine[] = [
  {label:'Route efficiency',value:41,tone:'cyan'},
  {label:'Capacity utilization',value:28,tone:'blue'},
  {label:'Next-day coverage',value:19,tone:'green'},
  {label:'Labor efficiency',value:12,tone:'violet'},
];
export const costDrivers:CostLine[] = [
  {label:'Engineering',value:32,tone:'amber'},
  {label:'Data preparation',value:21,tone:'blue'},
  {label:'Cloud infrastructure',value:18,tone:'violet'},
  {label:'Integration',value:17,tone:'cyan'},
  {label:'Operations',value:12,tone:'green'},
];

export const kpiHealth:KPIHealth[] = [
  {label:'Data readiness',value:'82%',health:'healthy',detail:'Validated synthetic inputs',tone:'green'},
  {label:'Constraint coverage',value:'98%',health:'healthy',detail:'37 / 37 hard constraints modeled',tone:'green'},
  {label:'Classical benchmark',value:'48s',health:'healthy',detail:'RKO reference completed',tone:'cyan'},
  {label:'Quantum readiness',value:'72 / 100',health:'watch',detail:'Reduced kernel recommended',tone:'violet'},
  {label:'Model uncertainty',value:'Medium',health:'watch',detail:'Validate adoption assumptions',tone:'amber'},
  {label:'Live cloud execution',value:'OFF',health:'healthy',detail:'Explicit review gate enabled',tone:'green'},
];

export const deliveryConstraints:ConstraintStatus[] = [
  {id:'C1',label:'Vehicle capacity',type:'hard',utilization:0.88,status:'pass',detail:'Highest route at 88% capacity'},
  {id:'C2',label:'Service windows',type:'hard',utilization:0.94,status:'pass',detail:'94% weighted compliance'},
  {id:'C3',label:'Vehicle availability',type:'hard',utilization:0.91,status:'pass',detail:'3 / 3 vehicles available'},
  {id:'C4',label:'Regional coverage',type:'hard',utilization:0.98,status:'pass',detail:'All modeled demand served'},
  {id:'C5',label:'Driver overtime',type:'soft',utilization:0.62,status:'watch',detail:'Review high-variance days'},
  {id:'C6',label:'Empty miles',type:'soft',utilization:0.37,status:'pass',detail:'Reduced from baseline'},
  {id:'C7',label:'Changeover friction',type:'soft',utilization:0.44,status:'pass',detail:'Below configured threshold'},
];

export const quantumReadinessFactors = [
  {label:'Binary decision structure',value:0.92,tone:'green' as Tone,detail:'Most major decisions can be represented with binary variables.'},
  {label:'Quadratic structure',value:0.84,tone:'violet' as Tone,detail:'Pairwise relationships are visible in the objective and penalties.'},
  {label:'Kernel reduction',value:0.71,tone:'cyan' as Tone,detail:'Reduced formulation is materially smaller than the business model.'},
  {label:'Connectivity burden',value:0.56,tone:'amber' as Tone,detail:'Sparsification may be required before hardware execution.'},
  {label:'Classical benchmark quality',value:0.96,tone:'green' as Tone,detail:'A strong reference result exists before quantum escalation.'},
];

export const scenarioValues = [
  {name:'Conservative',netValue:9.2,implementationCost:6.1,confidence:0.72},
  {name:'Base',netValue:14.6,implementationCost:3.8,confidence:0.81},
  {name:'Expansion',netValue:23.9,implementationCost:3.1,confidence:0.66},
];

export const quarterlyReports = [
  {id:'REP-2026-Q3',title:'Quarterly Optimization Portfolio',period:'Q3 2026',status:'Ready',cases:12,value:42.8,experiments:23},
  {id:'REP-2026-SEP',title:'September Experiment Digest',period:'Sep 2026',status:'Draft',cases:8,value:21.4,experiments:11},
  {id:'REP-2026-Q2',title:'Q2 Optimization Review',period:'Q2 2026',status:'Archived',cases:7,value:26.1,experiments:14},
];

export const evidenceChain:EvidenceItem[] = [
  {id:'EV-001',title:'Baseline data snapshot',status:'complete',source:'Synthetic network sample',updated:'Sep 25 2026',hash:'sha256:61f7…2e4a'},
  {id:'EV-002',title:'Constraint specification',status:'complete',source:'37 modeled constraints',updated:'Sep 25 2026',hash:'sha256:89a4…81cd'},
  {id:'EV-003',title:'Classical benchmark',status:'complete',source:'RKO reference run QX-1048',updated:'Sep 25 2026',hash:'sha256:0f19…aa81'},
  {id:'EV-004',title:'Reduced QUBO kernel',status:'reviewed',source:'64-variable formulation',updated:'Sep 25 2026',hash:'sha256:71e8…ba4e'},
  {id:'EV-005',title:'Sensitivity analysis',status:'complete',source:'6 assumption drivers',updated:'Sep 25 2026',hash:'sha256:20c1…cf12'},
  {id:'EV-006',title:'Operational data validation',status:'pending',source:'Production data connector',updated:'Not connected',hash:'pending'},
];

export function makeMonthlySeries(seed:number, months=12):TrendPoint[] {
  const labels=['Oct','Nov','Dec','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep'];
  return Array.from({length:months},(_,index)=>{
    const value=Math.round((seed + index * 2.7 + ((index*index)%5))*10)/10;
    const secondary=Math.round((value * (0.68 + (index%3)*0.04))*10)/10;
    return {label:labels[index%labels.length],value,secondary};
  });
}

export function makeCostSeries(seed:number, count=8):CostLine[] {
  const names=['Data','Engineering','Cloud','Integration','Operations','QA','Governance','Training'];
  const tones:Tone[]=['blue','cyan','violet','amber','green','neutral','red','cyan'];
  const raw=Array.from({length:count},(_,i)=>Math.max(2,seed + ((i*7)%13) - i));
  const total=raw.reduce((a,b)=>a+b,0);
  return raw.map((value,i)=>({label:names[i%names.length],value:Math.round(value/total*100),tone:tones[i%tones.length]}));
}

export function makeConstraintStatuses(prefix:string,count:number):ConstraintStatus[] {
  return Array.from({length:count},(_,i)=>({
    id:`${prefix}-${String(i+1).padStart(2,'0')}`,
    label:['Capacity','Service','Labor','Inventory','Risk','Coverage','Throughput'][i%7] + ` policy ${i+1}`,
    type:i%4===0?'soft':'hard',
    utilization:Number((0.42 + ((i*17)%50)/100).toFixed(2)),
    status:i%13===0?'watch':'pass',
    detail:i%13===0?'Monitor variance in the next scenario run.':'Within configured tolerance.',
  }));
}

export function sum(values:number[]):number { return values.reduce((a,b)=>a+b,0); }
export function average(values:number[]):number { return values.length?sum(values)/values.length:0; }
export function clamp01(value:number):number { return Math.max(0,Math.min(1,value)); }
export function normalize(values:number[]):number[] { const total=sum(values); return total?values.map(v=>v/total):values.map(()=>0); }

export function formatUSDmillions(value:number):string { return `$${value.toFixed(1)}M`; }
export function formatPercent(value:number):string { return `${(value*100).toFixed(0)}%`; }
export function statusTone(status:string):Tone { if(/complete|ready|pass|healthy/i.test(status))return 'green'; if(/review|watch|prepared|draft/i.test(status))return 'amber'; if(/fail|risk/i.test(status))return 'red'; if(/quantum|research/i.test(status))return 'violet'; return 'blue'; }
