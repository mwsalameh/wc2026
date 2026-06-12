import { Tabs } from 'expo-router';
import { AppTabBar } from '@/components/ui/AppTabBar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <AppTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="groups" />
      <Tabs.Screen name="bracket" />
      <Tabs.Screen name="teams" />
      <Tabs.Screen name="statistics" />
    </Tabs>
  );
}
