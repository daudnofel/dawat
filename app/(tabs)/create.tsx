import { View } from 'react-native';
import { COLORS } from '../../lib/theme';

// This screen is never shown — the Create tab intercepts the press
// and navigates to /create/step1-theme instead (see _layout.tsx)
export default function CreatePlaceholder() {
  return <View style={{ flex: 1, backgroundColor: COLORS.dark }} />;
}
