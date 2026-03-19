import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, fonts } from '../../styles/theme';
import { authService } from '../../utils/authService';
import { storageService } from '../../utils/storageService';
import { useAuth } from '../../contexts/AuthContext';
import { AVAILABILITY_OPTIONS } from '../../constants/jobs';
import LocationField from '../../components/common/LocationField';

export default function CompleteProfileScreen({ route }) {
  const { refreshProfile } = useAuth();
  const { userId, email, role } = route.params;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    city: '',
    province: '',
    suburb: '',
    bio: '',
    availability: '',
  });

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleComplete = async () => {
    if (!formData.full_name.trim()) {
      Alert.alert('Required', 'Please enter your full name.');
      return;
    }

    if (formData.phone.trim()) {
      const cleaned = formData.phone.replace(/\s/g, '');
      const saMobile = /^0[678][0-9]{8}$/;
      if (!saMobile.test(cleaned)) {
        Alert.alert('Invalid Number', 'Please enter a valid South African mobile number (e.g. 082 123 4567).');
        return;
      }
    }

    if (!formData.city.trim()) {
      Alert.alert('Required', 'Please enter your city.');
      return;
    }

    if (!formData.province.trim()) {
      Alert.alert('Required', 'Please select your province.');
      return;
    }

    if (role === 'worker' && !formData.bio.trim()) {
      Alert.alert('Required', 'Please add a short bio so employers can learn about you.');
      return;
    }

    if (role === 'worker' && !formData.availability) {
      Alert.alert('Required', 'Please select your availability.');
      return;
    }

    setLoading(true);
    try {
      const updates = {
        full_name: formData.full_name.trim(),
        phone: formData.phone.trim(),
        suburb: formData.suburb.trim(),
        city: formData.city.trim(),
        province: formData.province.trim(),
        is_profile_complete: true,
        updated_at: new Date().toISOString(),
      };

      if (role === 'worker') {
        updates.bio = formData.bio.trim();
        updates.availability = formData.availability;
      }

      const { error } = await authService.updateProfile(userId, updates);
      if (error) throw error;

      await storageService.setUserProfile({
        id: userId,
        email,
        role,
        ...updates,
      });

      await refreshProfile();

    } catch (error) {
      console.error('Complete profile error:', error);
      Alert.alert('Error', 'Could not save your profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const roleLabel = role === 'employer' ? 'Employer 📋' : 'Worker 💼';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Complete Your Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>{roleLabel}</Text>
        </View>

        <Text style={styles.intro}>
          Just a few details to get you started on Cazzijobz.
        </Text>

        <Text style={styles.label}>Full Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Your full name"
          placeholderTextColor={colors.textMuted}
          value={formData.full_name}
          onChangeText={(v) => updateField('full_name', v)}
          autoCapitalize="words"
        />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 082 123 4567"
          placeholderTextColor={colors.textMuted}
          value={formData.phone}
          onChangeText={(v) => updateField('phone', v)}
          keyboardType="phone-pad"
        />

        <LocationField
          city={formData.city}
          province={formData.province}
          suburb={formData.suburb}
          onCityChange={(v) => updateField('city', v)}
          onProvinceChange={(v) => updateField('province', v)}
          onSuburbChange={(v) => updateField('suburb', v)}
          onBothChange={(city, province, suburb) => {
            setFormData(prev => ({ ...prev, city, province, suburb: suburb || prev.suburb }));
          }}
        />

        {role === 'worker' && (
          <>
            <Text style={styles.label}>Bio *</Text>
            <Text style={styles.fieldHint}>
              Describe yourself and your skills. This is sent to employers via WhatsApp when you contact them.
            </Text>
            <TextInput
              style={[styles.input, styles.bioInput]}
              placeholder="e.g. I am an experienced cleaner with 3 years of domestic and office cleaning. I am reliable, hardworking and have my own transport."
              placeholderTextColor={colors.textMuted}
              value={formData.bio}
              onChangeText={(v) => updateField('bio', v)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <Text style={styles.label}>Availability *</Text>
            <View style={styles.availabilityGrid}>
              {AVAILABILITY_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.availabilityChip,
                    formData.availability === option.value && styles.availabilityChipSelected,
                  ]}
                  onPress={() => updateField('availability', option.value)}
                >
                  <Text style={[
                    styles.availabilityChipText,
                    formData.availability === option.value && styles.availabilityChipTextSelected,
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleComplete}
          disabled={loading}
        >
          <Text style={styles.submitBtnText}>
            {loading ? 'Saving...' : "Let's Go →"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: fonts.large,
    fontWeight: 'bold',
    color: colors.text,
  },
  scroll: { padding: spacing.lg, paddingTop: spacing.xl },
  roleBadge: {
    backgroundColor: colors.card,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  roleBadgeText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: fonts.body,
  },
  intro: {
    fontSize: fonts.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: fonts.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  fieldHint: {
    fontSize: fonts.small,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginBottom: spacing.sm,
    lineHeight: 18,
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
  bioInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  availabilityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  availabilityChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.card,
  },
  availabilityChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  availabilityChipText: {
    fontSize: fonts.body,
    color: colors.textMuted,
  },
  availabilityChipTextSelected: {
    color: colors.dark,
    fontWeight: '700',
  },
  submitBtn: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  submitBtnDisabled: { backgroundColor: colors.border },
  submitBtnText: {
    color: colors.dark,
    fontSize: fonts.medium,
    fontWeight: 'bold',
  },
});