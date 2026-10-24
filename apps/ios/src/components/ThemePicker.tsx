import { Pressable, StyleSheet, Text, View } from 'react-native';
import { getThemeTokens, themes, type ThemeId } from '@mindspring/core';
import { useNativeTheme } from '../theme/ThemeProvider';

export function ThemePicker({ onSelect }: { onSelect: (theme: ThemeId) => void }) {
  const { theme, tokens } = useNativeTheme();
  return (
    <View style={styles.list}>
      {themes.map((item) => {
        const palette = getThemeTokens(item.id, 'light');
        const selected = theme === item.id;
        return (
          <Pressable key={item.id} onPress={() => onSelect(item.id)} accessibilityRole="radio" accessibilityState={{ selected }} accessibilityLabel={'Theme: ' + item.name} style={[styles.option, { backgroundColor: tokens.surface, borderColor: selected ? tokens.primary : tokens.border }]}>
            <View style={[styles.swatch, { backgroundColor: palette.primary }]}><View style={[styles.swatchDot, { backgroundColor: palette.habits }]} /></View>
            <View style={styles.copy}><Text style={[styles.name, { color: tokens.text }]}>{item.name}{selected ? ' · Selected' : ''}</Text><Text style={[styles.description, { color: tokens.mutedText }]}>{item.description}</Text></View>
            <Text style={[styles.radio, { color: selected ? tokens.primary : tokens.mutedText }]}>{selected ? '●' : '○'}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 9 }, option: { minHeight: 68, borderWidth: 1, borderRadius: 16, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }, swatch: { width: 35, height: 35, borderRadius: 12, alignItems: 'flex-end', justifyContent: 'flex-end', padding: 3 }, swatchDot: { width: 13, height: 13, borderRadius: 7, borderWidth: 2, borderColor: '#FFFFFF' }, copy: { flex: 1, gap: 4 }, name: { fontSize: 14, fontWeight: '700' }, description: { fontSize: 12 }, radio: { fontSize: 18, fontWeight: '700' },
});
