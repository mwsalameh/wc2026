import { usePathname } from 'expo-router';
import { router } from 'expo-router';

export function useTeamNavigation() {
  const pathname = usePathname();
  return (teamId: number) => {
    if (pathname === `/team/${teamId}`) return;
    router.push(`/team/${teamId}`);
  };
}
