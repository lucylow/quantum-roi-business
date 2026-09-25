import React from 'react';
import { Button } from './Primitives';

export function PrimaryAction({ title, onPress, busy, disabled }: { title: string; onPress: () => void; busy?: boolean; disabled?: boolean }) {
  return <Button title={busy ? `${title}…` : title} onPress={onPress} disabled={Boolean(disabled || busy)} />;
}
