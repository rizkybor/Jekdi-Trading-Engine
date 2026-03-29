export function detectVolumeContext(currentVolume: number, volumeMA: number): string {
  if (volumeMA === 0) return "normal";

  const ratio = currentVolume / volumeMA;
  if (ratio >= 2.0) return "extreme_spike";
  if (ratio >= 1.5) return "spike";
  if (ratio <= 0.5) return "low";
  
  return "normal";
}
