import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, fonts } from '../../styles/theme';
import { supabase } from '../../config/supabase';

export default function VerifyResetCodeScreen({ navigation, route }) {
  const { email } = route.params;
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputs = useRef([]);

  const handleCodeChange = (text, index) => {
    const newCode = [...code];
    newCode[index] = text.replace(/[^0-9]/g, '');
    setCode(newCode);
    if (text && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      Alert.alert('Required', 'Please enter the full 6-digit code.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: fullCode,
        type: 'recovery',
      });
      if (error) throw error;
      navigation.navigate('ResetPassword', { email });
    } catch (error) {
      console.error('Verify code error:', error);
      Alert.alert('Invalid Code', 'The code is incorrect or has expired. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Enter Code</Text>
          <View style={{ width: 60 }} />
        </View>

        <View style={styles.body}>
          <Text style={styles.emoji}>📬</Text>
          <Text style={styles.title}>Check your email</Text>
          <Text style={styles.subtitle}>We sent a 6-digit code to:</Text>
          <Text style={styles.emailText}>{email}</Text>
          <Text style={styles.subtitleSmall}>
            Enter the code below. It expires in 10 minutes.
          </Text>

          <View style={styles.codeRow}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputs.current[index] = ref)}
                style={[styles.codeInput, digit && styles.codeInputFilled]}
                value={digit}
                onChangeText={(text) => handleCodeChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="numeric"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleVerify}
            disabled={loading}
          >
            <Text style={styles.submitBtnText}>
              {loading ? 'Verifying...' : 'Verify Code'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resendBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.resendBtnText}>Resend code</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { width: 60 },
  backText: { color: colors.primary, fontSize: fonts.body },
  headerTitle: { fontSize: fonts.large, fontWeight: 'bold', color: colors.text },
  body: {
    flex: 1,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 64, marginBottom: spacing.lg },
  title: {
    fontSize: fonts.xlarge,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fonts.body,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  emailText: {
    fontSize: fonts.medium,
    fontWeight: '700',
    color: colors.primary,
    marginVertical: spacing.sm,
  },
  subtitleSmall: {
    fontSize: fonts.small,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  codeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  codeInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 8,
    fontSize: fonts.xlarge,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    backgroundColor: colors.card,
  },
  codeInputFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.card,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.md,
  },
  submitBtnDisabled: { backgroundColor: colors.border },
  submitBtnText: { color: colors.dark, fontSize: fonts.medium, fontWeight: 'bold' },
  resendBtn: { padding: spacing.sm },
  resendBtnText: { color: colors.primary, fontSize: fonts.body, fontWeight: '600' },
});