import { useLocalSearchParams } from 'expo-router';
import { JournalEntryScreen } from '../../../src/features/journal/JournalEntryScreen';

export default function JournalEntryRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <JournalEntryScreen id={id} />;
}
