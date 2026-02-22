import { useColor } from './useColor';

export function useThemeColors() {
  const background = useColor('background');
  const text = useColor('foreground');
  const primary = useColor('primary');
  const card = useColor('secondary');
  const muted = useColor('mutedForeground');
  const border = useColor('border');

  return {
    background,
    text,
    primary,
    card,
    muted,
    border,
  };
}
