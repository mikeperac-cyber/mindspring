import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppStore } from '../state/AppProvider';
import { useNativeTheme } from '../theme/ThemeProvider';

export function StorageNotice() {
  const { notice, dismissNotice } = useAppStore();
  const { tokens } = useNativeTheme();
  if (!notice) return null;

  return (
    <View
      style={[styles.notice, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }]}
      accessibilityRole="alert"
    >
      <Text style={[styles.copy, { color: tokens.text }]}>{notice}</Text>
      <Pressable
        onPress={dismissNotice}
        accessibilityRole="button"
        accessibilityLabel="Dismiss storage notice"
        hitSlop={10}
        style={styles.dismiss}
      >
        <Text style={[styles.dismissText, { color: tokens.primary }]}>Dismiss</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  notice: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    padding: 12,
    borderWidth: 1,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  copy: { flex: 1, fontSize: 14, lineHeight: 20 },
  dismiss: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 2 },
  dismissText: { fontSize: 14, fontWeight: '700' },
});
