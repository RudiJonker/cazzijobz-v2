import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ScrollView, Image, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
import { colors, spacing, fonts } from '../../styles/theme';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../utils/authService';
import { storageService } from '../../utils/storageService';
import { supabase } from '../../config/supabase';
import { AVAILABILITY_OPTIONS } from '../../constants/jobs';
import LocationField from '../../components/common/LocationField';

export default function ProfileScreen({ navigation }) {
  const { user, profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || null);
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    suburb: profile?.suburb || '',
    city: profile?.city || '',
    province: profile?.province || '',
    bio: profile?.bio || '',
    availability: profile?.availability || '',
  });

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handlePickAvatar = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Needed', 'Please allow access to your photo library.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) return;

      setAvatarLoading(true);
      const uri = result.assets[0].uri;

      const manipulated = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 300, height: 300 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      const fileName = `avatars/${user.id}.jpg`;
      const base64 = await FileSystem.readAsStringAsync(manipulated.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const { error: uploadError } = await supabase.storage
        .from('cazzijobz-images')
        .upload(fileName, bytes, { contentType: 'image/jpeg', upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('cazzijobz-images')
        .getPublicUrl(fileName);

      const newAvatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await authService.updateProfile(user.id, {
        avatar_url: newAvatarUrl,
        updated_at: new Date().toISOString(),
      });
      if (updateError) throw updateError;

      await storageService.setUserProfile({ ...profile, avatar_url: newAvatarUrl });
      setAvatarUrl(newAvatarUrl);
      await refreshProfile();
      Alert.alert('Success! 🎉', 'Profile photo updated.');

    } catch (error) {
      console.error('Avatar upload error:', error);
      Alert.alert('Error', 'Could not upload photo. Please try again.');
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.full_name.trim()) {
      Alert.alert('Required', 'Please enter your full name.');
      return;
    }

    if (form.phone.trim()) {
      const cleaned = form.phone.replace(/\s/g, '');
      const saMobile = /^0[678][0-9]{8}$/;
      if (!saMobile.test(cleaned)) {
        Alert.alert('Invalid Number', 'Please enter a valid South African mobile number.');
        return;
      }
    }

    if (!form.city.trim()) {
      Alert.alert('Required', 'Please enter your city.');
      return;
    }

    setLoading(true);
    try {
      const updates = {
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
        suburb: form.suburb.trim(),
        city: form.city.trim(),
        province: form.province.trim(),
        updated_at: new Date().toISOString(),
      };

      if (profile?.role === 'worker') {
        updates.bio = form.bio.trim();
        updates.availability = form.availability;
      }

      const { error } = await authService.updateProfile(user.id, updates);
      if (error) throw error;

      await storageService.setUserProfile({ ...profile, ...updates });
      await refreshProfile();

      Alert.alert('Success! 🎉', 'Profile updated.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);

    } catch (error) {
      console.error('Update profile error:', error);
      Alert.alert('Error', 'Could not update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={handlePickAvatar} disabled={avatarLoading}>
            {avatarLoading
              ? <View style={styles.avatarPlaceholder}>
                  <ActivityIndicator color={colors.primary} />
                </View>
              : avatarUrl
                ? <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                : <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarEmoji}>👤</Text>
                  </View>
            }
            <View style={styles.avatarEditBadge}>
              <Text style={styles.avatarEditText}>📷</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarHint}>Tap to change photo</Text>
        </View>

        {/* Account info */}
        <View style={styles.accountCard}>
          <Text style={styles.accountEmoji}>
            {profile?.role === 'employer' ? '📋' : '💼'}
          </Text>
          <View>
            <Text style={styles.accountRole}>
              {profile?.role === 'employer' ? 'Employer Account' : 'Worker Account'}
            </Text>
            <Text style={styles.accountEmail}>{user?.email}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.label}>Full Name *</Text>
        <TextInput
          style={styles.input}
          value={form.full_name}
          onChangeText={(v) => updateField('full_name', v)}
          placeholder="Your full name"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="words"
        />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={form.phone}
          onChangeText={(v) => updateField('phone', v)}
          placeholder="e.g. 082 123 4567"
          placeholderTextColor={colors.textMuted}
          keyboardType="phone-pad"
        />

        <View style={styles.divider} />

        <LocationField
          city={form.city}
          province={form.province}
          suburb={form.suburb}
          onCityChange={(v) => updateField('city', v)}
          onProvinceChange={(v) => updateField('province', v)}
          onSuburbChange={(v) => updateField('suburb', v)}
          onBothChange={(city, province, suburb) => {
            setForm(prev => ({ ...prev, city, province, suburb: suburb || prev.suburb }));
          }}
        />

        {/* Worker-only fields */}
        {profile?.role === 'worker' && (
          <>
            <View style={styles.divider} />

            <Text style={styles.label}>Bio</Text>
            <Text style={styles.fieldHint}>
              This is sent to employers via WhatsApp when you contact them.
            </Text>
            <TextInput
              style={[styles.input, styles.bioInput]}
              value={form.bio}
              onChangeText={(v) => updateField('bio', v)}
              placeholder="Describe yourself and your skills..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <Text style={styles.label}>Availability</Text>
            <View style={styles.availabilityGrid}>
              {AVAILABILITY_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.availabilityChip,
                    form.availability === option.value && styles.availabilityChipSelected,
                  ]}
                  onPress={() => updateField('availability', option.value)}
                >
                  <Text style={[
                    styles.availabilityChipText,
                    form.availability === option.value && styles.availabilityChipTextSelected,
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <View style={styles.divider} />

        <TouchableOpacity
          style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveBtnText}>
            {loading ? 'Saving...' : '💾 Save Changes'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: spacing.xl }} />
      </ScrollView>
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
  scroll: { padding: spacing.lg },
  avatarSection: { alignItems: 'center', marginBottom: spacing.lg },
  avatar: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 3, borderColor: colors.primary,
  },
  avatarPlaceholder: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: colors.card,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: colors.primary,
  },
  avatarEmoji: { fontSize: 48 },
  avatarEditBadge: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: colors.primary,
    borderRadius: 999, width: 28, height: 28,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarEditText: { fontSize: 14 },
  avatarHint: { fontSize: fonts.small, color: colors.textMuted, marginTop: spacing.sm },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  accountEmoji: { fontSize: 40 },
  accountRole: { fontSize: fonts.medium, fontWeight: '700', color: colors.primary },
  accountEmail: { fontSize: fonts.small, color: colors.textMuted, marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.lg },
  label: { fontSize: fonts.body, fontWeight: '600', color: colors.text, marginBottom: spacing.xs },
  fieldHint: {
    fontSize: fonts.small, color: colors.textMuted,
    fontStyle: 'italic', marginBottom: spacing.sm, lineHeight: 18,
  },
  input: {
    borderWidth: 1, borderColor: colors.border, borderRadius: 8,
    padding: spacing.md, fontSize: fonts.body,
    color: colors.text, backgroundColor: colors.card, marginBottom: spacing.lg,
  },
  bioInput: { height: 120, textAlignVertical: 'top' },
  availabilityGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg,
  },
  availabilityChip: {
    borderWidth: 1, borderColor: colors.border, borderRadius: 999,
    paddingVertical: spacing.xs, paddingHorizontal: spacing.md, backgroundColor: colors.card,
  },
  availabilityChipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  availabilityChipText: { fontSize: fonts.body, color: colors.textMuted },
  availabilityChipTextSelected: { color: colors.dark, fontWeight: '700' },
  saveBtn: {
    backgroundColor: colors.primary, padding: spacing.md,
    borderRadius: 8, alignItems: 'center',
  },
  saveBtnDisabled: { backgroundColor: colors.border },
  saveBtnText: { color: colors.dark, fontSize: fonts.medium, fontWeight: 'bold' },
});