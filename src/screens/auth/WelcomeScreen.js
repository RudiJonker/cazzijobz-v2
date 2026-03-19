import React from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, Image
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, fonts } from '../../styles/theme';

export default function WelcomeScreen({ navigation }) {
  const handleRoleSelect = (role) => {
    navigation.navigate('Terms', { role });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" backgroundColor={colors.background} />

      <View style={styles.header}>
        <Image
          source={require('../../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.tagline}>Find work. Post jobs. Simple.</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.chooseLabel}>How will you use Cazzijobz?</Text>

        <View style={styles.roleRow}>
          <TouchableOpacity
            style={styles.roleCard}
            onPress={() => handleRoleSelect('worker')}
            activeOpacity={0.85}
          >
            <View style={styles.roleIconCircle}>
              <Text style={styles.roleEmoji}>💼</Text>
            </View>
            <Text style={styles.roleTitle}>Worker</Text>
            <Text style={styles.roleDesc}>I am looking{'\n'}for work</Text>
            <View style={styles.roleButton}>
              <Text style={styles.roleButtonText}>Find Work</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.roleCard}
            onPress={() => handleRoleSelect('employer')}
            activeOpacity={0.85}
          >
            <View style={styles.roleIconCircle}>
              <Text style={styles.roleEmoji}>📋</Text>
            </View>
            <Text style={styles.roleTitle}>Employer</Text>
            <Text style={styles.roleDesc}>I need{'\n'}someone hired</Text>
            <View style={styles.roleButton}>
              <Text style={styles.roleButtonText}>Post a Job</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.background,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  logo: {
    width: '50%',
    height: 60,
    marginBottom: spacing.sm,
  },
  tagline: {
    fontSize: fonts.body,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  body: {
    flex: 1,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  chooseLabel: {
    fontSize: fonts.medium,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  roleRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  roleCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  roleIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 999,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  roleEmoji: {
    fontSize: 28,
  },
  roleTitle: {
    fontSize: fonts.medium,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  roleDesc: {
    fontSize: fonts.small,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  roleButton: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  roleButtonText: {
    color: colors.dark,
    fontSize: fonts.small,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: fonts.body,
    color: colors.textMuted,
  },
  loginLink: {
    fontSize: fonts.body,
    fontWeight: '700',
    color: colors.primary,
  },
});