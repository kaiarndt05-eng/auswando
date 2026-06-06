import { Tabs } from 'expo-router';
import { Platform, ColorValue } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { C } from '@/constants/theme';
import { useClientOnlyValue } from '@/hooks/useClientOnlyValue';

type IconProps = { color: ColorValue };

function TabIcon({ ios, android, color }: { ios: string; android: string; color: ColorValue }) {
  return (
    <SymbolView
      name={ios as any}
      tintColor={color as string}
      size={24}
      fallback={<SymbolView name={android as any} tintColor={color as string} size={24} />}
    />
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: useClientOnlyValue(false, true),
        headerStyle: { backgroundColor: C.surface },
        headerTitleStyle: { color: C.text, fontWeight: '700' },
        headerTintColor: C.primary,
        tabBarStyle: {
          backgroundColor: C.tabBg,
          borderTopColor: C.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 84 : 60,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
        },
        tabBarActiveTintColor: C.primary,
        tabBarInactiveTintColor: C.textMuted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Start',
          tabBarIcon: ({ color }: IconProps) => <TabIcon ios="house.fill" android="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="test"
        options={{
          title: 'Land-Test',
          tabBarIcon: ({ color }: IconProps) => <TabIcon ios="checkmark.circle.fill" android="quiz" color={color} />,
        }}
      />
      <Tabs.Screen
        name="roadmap"
        options={{
          title: 'Roadmap',
          tabBarIcon: ({ color }: IconProps) => <TabIcon ios="list.bullet.rectangle.fill" android="view_list" color={color} />,
        }}
      />
      <Tabs.Screen
        name="karte"
        options={{
          title: 'Karte',
          tabBarIcon: ({ color }: IconProps) => <TabIcon ios="map.fill" android="map" color={color} />,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarIcon: ({ color }: IconProps) => <TabIcon ios="person.3.fill" android="group" color={color} />,
        }}
      />
    </Tabs>
  );
}
