export interface BraketDeviceProfile {
  provider: string;
  name: string;
  arn: string;
  paradigm: 'gate-based' | 'AHS' | 'simulator';
  maxLogicalQubits: number;
  region: string;
  notes: string[];
}

export const currentDeviceProfiles: BraketDeviceProfile[] = [
  { provider: 'Amazon', name: 'SV1 simulator', arn: 'arn:aws:braket:::device/quantum-simulator/amazon/sv1', paradigm: 'simulator', maxLogicalQubits: 34, region: 'multi-region', notes: ['On-demand simulator.', 'Use for controlled algorithm experiments.'] },
  { provider: 'Amazon', name: 'DM1 simulator', arn: 'arn:aws:braket:::device/quantum-simulator/amazon/dm1', paradigm: 'simulator', maxLogicalQubits: 34, region: 'multi-region', notes: ['On-demand density-matrix simulator.'] },
  { provider: 'QuEra', name: 'Aquila', arn: 'arn:aws:braket:us-east-1::device/qpu/quera/Aquila', paradigm: 'AHS', maxLogicalQubits: 256, region: 'us-east-1', notes: ['Analog Hamiltonian Simulation.', 'Problem encoding differs from gate-based circuits.'] },
  { provider: 'IonQ', name: 'Forte-1', arn: 'arn:aws:braket:us-east-1::device/qpu/ionq/Forte-1', paradigm: 'gate-based', maxLogicalQubits: 36, region: 'us-east-1', notes: ['Gate-based QPU.', 'Check current availability and device properties before submission.'] },
  { provider: 'Rigetti', name: 'Ankaa-3', arn: 'arn:aws:braket:us-west-1::device/qpu/rigetti/Ankaa-3', paradigm: 'gate-based', maxLogicalQubits: 82, region: 'us-west-1', notes: ['Gate-based QPU.', 'Sparse connectivity makes embedding relevant.'] }
];

export function chooseDevice(requiredLogicalQubits: number, preferSimulator = true): BraketDeviceProfile | null {
  const candidates = currentDeviceProfiles.filter((d) => d.maxLogicalQubits >= requiredLogicalQubits);
  const simulator = candidates.find((d) => d.paradigm === 'simulator');
  if (preferSimulator && simulator) return simulator;
  return candidates.find((d) => d.paradigm !== 'simulator') ?? simulator ?? null;
}
