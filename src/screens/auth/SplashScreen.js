import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { colors, fonts, spacing } from '../../styles/theme';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Welcome');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.tagline}>Casual jobs. Simple.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 220,
    height: 180,
    marginBottom: spacing.md,
  },
  tagline: {
    fontSize: fonts.body,
    color: colors.primaryMid,
    marginTop: spacing.sm,
    letterSpacing: 1,
  },
});