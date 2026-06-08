import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { C, FONT } from '@/constants/theme';
import { WANDO_FLAG_IMAGES, WANDO_IMAGES } from '@/constants/images';
import { useWando } from '@/context/WandoContext';
import Button from '@/components/Button';

const { height: SCREEN_H } = Dimensions.get('window');
const SHEET_HEIGHT = Math.min(SCREEN_H * 0.36, 340);
const CHAR_SIZE = 158;

export default function WandoGuide() {
  const { current, dismiss } = useWando();

  const sheetY = useRef(new Animated.Value(SHEET_HEIGHT + 40)).current;
  const charX = useRef(new Animated.Value(-CHAR_SIZE)).current;
  const backdrop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!current) return;
    sheetY.setValue(SHEET_HEIGHT + 40);
    charX.setValue(-CHAR_SIZE);
    backdrop.setValue(0);
    Animated.parallel([
      Animated.timing(backdrop, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.spring(sheetY, { toValue: 0, tension: 60, friction: 11, useNativeDriver: true }),
    ]).start();
    Animated.spring(charX, { toValue: 0, tension: 50, friction: 8, delay: 90, useNativeDriver: true }).start();
  }, [current?.id]);

  const close = () => {
    Animated.parallel([
      Animated.timing(backdrop, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(sheetY, { toValue: SHEET_HEIGHT + 40, duration: 220, useNativeDriver: true }),
      Animated.timing(charX, { toValue: -CHAR_SIZE, duration: 200, useNativeDriver: true }),
    ]).start(() => dismiss());
  };

  if (!current) return null;

  const image = current.flag ? WANDO_FLAG_IMAGES[current.flag] : WANDO_IMAGES[current.emotion ?? 'neutral'];

  return (
    <Modal transparent visible animationType="none" statusBarTranslucent onRequestClose={close}>
      <Animated.View
        style={[s.backdrop, { opacity: backdrop.interpolate({ inputRange: [0, 1], outputRange: [0, 0.42] }) }]}
      >
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={close} />
      </Animated.View>

      <View style={s.wrap} pointerEvents="box-none">
        <Animated.Image
          source={image}
          resizeMode="contain"
          style={[s.character, { transform: [{ translateX: charX }] }]}
        />

        <Animated.View style={[s.sheet, { height: SHEET_HEIGHT, transform: [{ translateY: sheetY }] }]}>
          <View style={s.handle} />
          <View style={s.bubble}>
            <Text style={s.name}>Wando</Text>
            <Text style={s.text}>{current.text}</Text>
          </View>
          <Button label={current.buttonLabel ?? 'Verstanden'} onPress={close} fullWidth style={s.btn} />
        </Animated.View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: '#000' },
  wrap: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end' },
  character: {
    position: 'absolute',
    left: 14,
    bottom: SHEET_HEIGHT - 26,
    width: CHAR_SIZE,
    height: CHAR_SIZE,
    zIndex: 2,
  },
  sheet: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 28,
    shadowColor: '#1A2A5E',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
    zIndex: 3,
  },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: C.border, marginBottom: 14 },
  bubble: { flex: 1, paddingLeft: 48, paddingTop: 8 },
  name: { color: C.primary, fontFamily: FONT.extrabold, fontSize: 14, marginBottom: 6, letterSpacing: 0.3 },
  text: { color: C.text, fontSize: 16, lineHeight: 23, fontFamily: FONT.semibold },
  btn: { marginTop: 18 },
});
