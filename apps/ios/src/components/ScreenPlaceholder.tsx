import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text } from 'react-native';

export function ScreenPlaceholder({ title, detail }: { title: string; detail: string }) {
  return (
    <SafeAreaView style={styles.screen}>
      <Text style={styles.brand}>MINDSPRING</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.detail}>{detail}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 28,
    justifyContent: 'center',
    backgroundColor: '#FBF7F8',
  },
  brand: {
    color: '#79618D',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.4,
    marginBottom: 12,
  },
  title: {
    color: '#2F1C29',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  detail: {
    color: '#755F6C',
    fontSize: 17,
    lineHeight: 25,
  },
});
