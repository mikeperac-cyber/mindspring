import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppStore } from '../src/state/AppProvider';
import { useNativeTheme } from '../src/theme/ThemeProvider';

export default function WelcomeScreen() {
  const router = useRouter();
  const { completeOnboarding } = useAppStore();
  const { tokens } = useNativeTheme();
  const [displayName, setDisplayName] = useState('');
  const [intention, setIntention] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleContinue = async () => {
    if (!displayName.trim() || !intention.trim()) {
      setError('Add your name and one intention to continue.');
      return;
    }
    setError('');
    setSaving(true);
    const complete = await completeOnboarding({ displayName, intention });
    setSaving(false);
    if (complete) router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: tokens.background }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.intro}>
            <Text style={[styles.brand, { color: tokens.primary }]}>MINDSPRING</Text>
            <Text style={[styles.title, { color: tokens.text }]}>A softer start.</Text>
            <Text style={[styles.subtitle, { color: tokens.mutedText }]}>
              Build a little space for the things that help you feel like yourself.
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={[styles.label, { color: tokens.text }]}>What should we call you?</Text>
            <TextInput
              value={displayName}
              onChangeText={setDisplayName}
              accessibilityLabel="Your name"
              placeholder="First name"
              placeholderTextColor={tokens.mutedText}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="next"
              style={[styles.input, { backgroundColor: tokens.surface, borderColor: tokens.border, color: tokens.text }]}
            />

            <Text style={[styles.label, { color: tokens.text }]}>What would you like to make room for?</Text>
            <TextInput
              value={intention}
              onChangeText={setIntention}
              accessibilityLabel="Your intention"
              placeholder="For example, a calmer morning"
              placeholderTextColor={tokens.mutedText}
              autoCapitalize="sentences"
              multiline
              textAlignVertical="top"
              style={[styles.input, styles.intention, { backgroundColor: tokens.surface, borderColor: tokens.border, color: tokens.text }]}
            />

            {error ? <Text style={[styles.error, { color: tokens.danger }]} accessibilityRole="alert">{error}</Text> : null}

            <Pressable
              onPress={handleContinue}
              disabled={saving}
              accessibilityRole="button"
              accessibilityLabel="Continue to your space"
              style={[styles.button, { backgroundColor: tokens.primary }, saving && styles.buttonDisabled]}
            >
              <Text style={[styles.buttonText, { color: tokens.primaryText }]}>
                {saving ? 'Saving your space…' : 'Continue'}
              </Text>
            </Pressable>

            <Text style={[styles.privacy, { color: tokens.mutedText }]}>
              Your profile and reflections stay in this app on your iPhone.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 32 },
  intro: { marginBottom: 34 },
  brand: { fontSize: 13, fontWeight: '800', letterSpacing: 1.5, marginBottom: 18 },
  title: { fontSize: 36, fontWeight: '700', lineHeight: 44, marginBottom: 10 },
  subtitle: { fontSize: 17, lineHeight: 25, maxWidth: 460 },
  form: { gap: 12 },
  label: { fontSize: 16, fontWeight: '600', marginTop: 8 },
  input: { minHeight: 52, borderWidth: 1, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13, fontSize: 16 },
  intention: { minHeight: 108 },
  error: { fontSize: 15, lineHeight: 22 },
  button: { minHeight: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 16, marginTop: 10, paddingHorizontal: 18 },
  buttonDisabled: { opacity: 0.65 },
  buttonText: { fontSize: 16, fontWeight: '700' },
  privacy: { fontSize: 13, lineHeight: 19, marginTop: 8 },
});
