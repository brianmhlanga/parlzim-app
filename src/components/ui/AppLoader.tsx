import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "../../theme/tokens";

export function AppLoader() {
  const pulse = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const dot = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 850,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 850,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    );
    const rotateAnimation = Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: 2800,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    const dotsAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(dot, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(dot, { toValue: 2, duration: 500, useNativeDriver: true }),
        Animated.timing(dot, { toValue: 3, duration: 500, useNativeDriver: true }),
      ]),
    );
    pulseAnimation.start();
    rotateAnimation.start();
    dotsAnimation.start();
    return () => {
      pulseAnimation.stop();
      rotateAnimation.stop();
      dotsAnimation.stop();
    };
  }, [pulse]);

  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0.15] });
  const logoScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] });
  const rotateDeg = rotate.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  const dotOne = dot.interpolate({ inputRange: [0, 1, 2, 3], outputRange: [0.35, 1, 0.35, 0.35] });
  const dotTwo = dot.interpolate({ inputRange: [0, 1, 2, 3], outputRange: [0.35, 0.35, 1, 0.35] });
  const dotThree = dot.interpolate({ inputRange: [0, 1, 2, 3], outputRange: [0.35, 0.35, 0.35, 1] });

  return (
    <LinearGradient colors={["#0f5a2e", "#1a7f42", "#2b8e55"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.container}>
      <Animated.View style={[styles.ring, { transform: [{ scale: ringScale }], opacity: ringOpacity }]} />
      <Animated.View style={[styles.accentRing, { transform: [{ rotate: rotateDeg }] }]} />
      <Animated.View style={[styles.logo, { transform: [{ scale: logoScale }] }]}>
        <Text style={styles.logoText}>PZ</Text>
      </Animated.View>
      <Text style={styles.title}>Parliament Zimbabwe</Text>
      <Text style={styles.tagline}>Digital Parliament Experience</Text>
      <View style={styles.dotRow}>
        <Animated.View style={[styles.dot, { opacity: dotOne }]} />
        <Animated.View style={[styles.dot, { opacity: dotTwo }]} />
        <Animated.View style={[styles.dot, { opacity: dotThree }]} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.brand.primary,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
  },
  ring: {
    position: "absolute",
    width: 108,
    height: 108,
    borderRadius: 54,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.65)",
  },
  accentRing: {
    position: "absolute",
    width: 96,
    height: 96,
    borderRadius: 48,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: theme.colors.brand.accent,
  },
  logo: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: theme.colors.brand.accent,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  logoText: {
    color: theme.colors.text.inverse,
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: 1,
  },
  title: {
    marginTop: theme.spacing.md,
    color: theme.colors.text.inverse,
    fontSize: 20,
    fontWeight: "700",
  },
  tagline: {
    color: "rgba(255,255,255,0.88)",
    fontSize: 13,
    fontWeight: "500",
  },
  dotRow: { flexDirection: "row", gap: 6, marginTop: theme.spacing.xs },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#ffffff",
  },
});
