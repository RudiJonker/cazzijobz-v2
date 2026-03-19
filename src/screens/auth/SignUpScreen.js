import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, fonts } from '../../styles/theme';
import { authService } from '../../utils/authService';
import { useAuth } from '../../contexts/AuthContext';

export default function SignUpScreen({ navigation, route }) {
  const { refreshProfile } = useAuth();
  const { role } = route.params;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignUp = async () => {
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Password Mismatch', 'Your passwords do not match.');
      return;
    }
    if (formData.password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const { data: authData, error: authError } = await authService.signUp(
        formData.email,
        formData.password
      );
      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await authService.createProfile({
          id: authData.user.id,
          email: formData.email,
          role: role,
          is_profile_complete: false,
          created_at: new Date().toISOString(),
        });
        if (profileError) throw profileError;

        await new Promise(resolve => setTimeout(resolve, 800));
        await refreshProfile(authData.user.id);
      }
    } catch (error) {
      console.error('Sign up error:', error);
      if (error.message?.includes('already registered')) {
        Alert.alert('Already Registered', 'This email is already in use. Please log in instead.');
      } else {
        Alert.alert('Sign Up Failed', 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const roleLabel = role === 'employer' ? 'Employer 📋' : 'Worker 💼';

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Account</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>Signing up as: {roleLabel}</Text>
          </View>

          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="your@email.com"
            placeholderTextColor={colors.textMuted}
            value={formData.email}
            onChangeText={(v) => updateField('email', v)}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Minimum 6 characters"
            placeholderTextColor={colors.textMuted}
            value={formData.password}
            onChangeText={(v) => updateField('password', v)}
            secureTextEntry
          />

          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Repeat your password"
            placeholderTextColor={colors.textMuted}
            value={formData.confirmPassword}
            onChangeText={(v) => updateField('confirmPassword', v)}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleSignUp}
            disabled={loading}
          >
            <Text style={styles.submitBtnText}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginLinkText}>Already have an account? Log In</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
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
  scroll: { padding: spacing.lg, paddingTop: spacing.xl },
  roleBadge: {
    backgroundColor: colors.card,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    alignSelf: 'center',
    marginBottom: spacing.xl,
  },
  roleBadgeText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: fonts.body,
  },
  label: {
    fontSize: fonts.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: fonts.body,
    color: colors.text,
    backgroundColor: colors.card,
    marginBottom: spacing.lg,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  submitBtnDisabled: { backgroundColor: colors.border },
  submitBtnText: { color: colors.dark, fontSize: fonts.medium, fontWeight: 'bold' },
  loginLink: { alignItems: 'center' },
  loginLinkText: { color: colors.primary, fontSize: fonts.body, fontWeight: '600' },
});