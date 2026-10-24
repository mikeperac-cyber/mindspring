import { NativeTabs } from 'expo-router/native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon sf="house.fill" />
        <NativeTabs.Trigger.Label>Today</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="goals">
        <NativeTabs.Trigger.Icon sf="scope" />
        <NativeTabs.Trigger.Label>Goals</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="journal">
        <NativeTabs.Trigger.Icon sf="book.closed" />
        <NativeTabs.Trigger.Label>Journal</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="insights">
        <NativeTabs.Trigger.Icon sf="chart.bar.fill" />
        <NativeTabs.Trigger.Label>Insights</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Icon sf="person.crop.circle" />
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
