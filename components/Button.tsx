import { useRef } from 'react';
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { C, FONT, shade } from '@/constants/theme';

const DEPTH = 4;

type Props = {
  label: string;
  onPress: () => void;
  color?: string;
  textColor?: string;
  size?: 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * Duolingo-style chunky button: a flat face sitting on a darker "depth" slab.
 * Pressing slides the face down onto the slab, mimicking a physical press.
 */
export default function Button({
  label,
  onPress,
  color = C.primary,
  textColor = '#FFFFFF',
  size = 'lg',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
}: Props) {
  const press = useRef(new Animated.Value(0)).current;
  const isInactive = disabled || loading;
  const faceColor = isInactive ? C.textMuted : color;
  const depthColor = isInactive ? shade(C.textMuted, 0.22) : shade(color, 0.22);
  const height = size === 'lg' ? 52 : 44;
  const radius = size === 'lg' ? 16 : 14;

  const animateTo = (toValue: number) => {
    Animated.timing(press, { toValue, duration: 80, useNativeDriver: true }).start();
  };

  return (
    <View style={[{ height: height + DEPTH, borderRadius: radius }, fullWidth && s.fullWidth, style]}>
      <View style={[s.depth, { backgroundColor: depthColor, height, borderRadius: radius, top: DEPTH }]} />
      <Animated.View
        style={{
          transform: [{ translateY: press.interpolate({ inputRange: [0, 1], outputRange: [0, DEPTH] }) }],
        }}
      >
        <Pressable
          onPress={isInactive ? undefined : onPress}
          onPressIn={() => !isInactive && animateTo(1)}
          onPressOut={() => !isInactive && animateTo(0)}
          disabled={isInactive}
          style={[s.face, { backgroundColor: faceColor, height, borderRadius: radius }]}
        >
          {loading
            ? <ActivityIndicator color={textColor} />
            : (
              <Text style={[s.label, { color: textColor }]} numberOfLines={1}>
                {label}
              </Text>
            )
          }
        </Pressable>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  fullWidth: { alignSelf: 'stretch' },
  depth: { position: 'absolute', left: 0, right: 0 },
  face: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  label: { fontFamily: FONT.extrabold, fontSize: 15, letterSpacing: 0.6, textTransform: 'uppercase' },
});
