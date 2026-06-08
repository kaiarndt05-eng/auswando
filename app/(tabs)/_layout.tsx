import { Tabs } from 'expo-router';
import { Platform, ColorValue, View } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { C } from '@/constants/theme';
import { useClientOnlyValue } from '@/hooks/useClientOnlyValue';

type IconProps = { color: ColorValue; focused: boolean };

function TabIcon({ ios, android, color, focused }: { ios: string; android: string; color: ColorValue; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <View style={focused ? {
        backgroundColor: `${C.primary}14`,
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 5,
      } : undefined}>
        <SymbolView
          name={ios as any}
          tintColor={color as string}
          size={21}
          fallback={<SymbolView name={android as any} tintColor={color as string} size={21} />}
        />
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: useClientOnlyValue(false, true),
        headerStyle: {
          backgroundColor: C.surface,
          shadowColor: '#1A2A5E',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.06,
          shadowRadius: 4,
          elevation: 3,
        },
        headerTitleStyle: { color: C.text, fontWeight: '700', fontSize: 17 },
        headerTintColor: C.primary,
        tabBarStyle: {
          backgroundColor: C.tabBg,
          borderTopColor: C.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 6,
          shadowColor: '#1A2A5E',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.07,
          shadowRadius: 10,
          elevation: 10,
        },
        tabBarActiveTintColor: C.primary,
        tabBarInactiveTintColor: C.textMuted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600', letterSpacing: 0.2 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Start',
          tabBarIcon: ({ color, focused }: IconProps) => <TabIcon ios="house.fill" android="home" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="test"
        options={{
          title: 'Land-Test',
          tabBarIcon: ({ color, focused }: IconProps) => <TabIcon ios="checkmark.circle.fill" android="quiz" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="roadmap"
        options={{
          title: 'Roadmap',
          tabBarIcon: ({ color, focused }: IconProps) => <TabIcon ios="list.bullet.rectangle.fill" android="view_list" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="karte"
        options={{
          title: 'Karte',
          tabBarIcon: ({ color, focused }: IconProps) => <TabIcon ios="map.fill" android="map" color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarIcon: ({ color, focused }: IconProps) => <TabIcon ios="person.3.fill" android="group" color={color} focused={focused} />,
        }}
      />
    </Tabs>
  );
}
