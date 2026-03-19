import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ScrollView, Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, fonts } from '../../styles/theme';
import { jobService } from '../../utils/jobService';
import { JOB_CATEGORIES, DURATION_OPTIONS } from '../../constants/jobs';
import LocationField from '../../components/common/LocationField';

export default function EditJobScreen({ navigation, route }) {
  const { job } = route.params;
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickedDate, setPickedDate] = useState(
    job.scheduled_date ? new Date(job.scheduled_date) : new Date()
  );

  const [form, setForm] = useState({
    category: job.category || '',
    description: job.description || '',
    suburb: job.suburb || '',
    city: job.city || '',
    province: job.province || '',
    scheduled_date: job.scheduled_date || '',
    duration_hours: job.duration_hours ? String(job.duration_hours) : '',
    budget: job.budget ? String(job.budget) : '',
    contact_phone: job.contact_phone || '',
  });

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    if (!form.category) {
      Alert.alert('Required', 'Please select a job category.');
      return false;
    }
    if (!form.city.trim()) {
      Alert.alert('Required', 'Please enter the city.');
      return false;
    }
    if (!form.province.trim()) {
      Alert.alert('Required', 'Please enter the province.');
      return false;
    }
    if (!form.scheduled_date.trim()) {
      Alert.alert('Required', 'Please select a date.');
      return false;
    }
    if (!form.budget) {
      Alert.alert('Required', 'Please enter your budget.');
      return false;
    }
    if (!form.contact_phone.trim()) {
      Alert.alert('Required', 'Please enter a contact phone number.');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const updates = {
        category: form.category,
        description: form.description.trim(),
        suburb: form.suburb.trim(),
        city: form.city.trim(),
        province: form.province.trim(),
        scheduled_date: form.scheduled_date,
        duration_hours: form.duration_hours ? Number(form.duration_hours) : null,
        budget: Number(form.budget),
        contact_phone: form.contact_phone.trim(),
        contact_pref: 'whatsapp',
      };

      const { error } = await jobService.updateJob(job.id, updates);
      if (error) throw error;

      Alert.alert('Success! 🎉', 'Job updated successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Edit job error:', error);
      Alert.alert('Error', 'Could not update job. Please try again.');
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
        <Text style={styles.headerTitle}>Edit Job</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Category */}
        <Text style={styles.sectionTitle}>Job Category *</Text>
        <View style={styles.categoryGrid}>
          {JOB_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.value}
              style={[
                styles.categoryChip,
                form.category === cat.value && styles.categoryChipSelected,
              ]}
              onPress={() => updateField('category', cat.value)}
            >
              <Text style={styles.categoryEmoji}>{cat.icon}</Text>
              <Text style={[
                styles.categoryLabel,
                form.category === cat.value && styles.categoryLabelSelected,
              ]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.divider} />

        {/* Location */}
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
          helpText="Where is the job located?"
        />

        <View style={styles.divider} />

        {/* Date picker */}
        <Text style={styles.sectionTitle}>Scheduled Date *</Text>
        <TouchableOpacity
          style={styles.datePickerBtn}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.datePickerBtnText}>
            📅 {form.scheduled_date || 'Tap to select a date'}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={pickedDate}
            mode="date"
            display="default"
            minimumDate={new Date()}
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setPickedDate(selectedDate);
                const formatted = selectedDate.toISOString().split('T')[0];
                updateField('scheduled_date', formatted);
              }
            }}
          />
        )}

        <View style={styles.divider} />

        {/* Approximate Duration */}
        <Text style={styles.sectionTitle}>Approximate Duration</Text>
        <View style={styles.chipRow}>
          {DURATION_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.chip,
                form.duration_hours === String(opt.value) && styles.chipSelected,
              ]}
              onPress={() => updateField('duration_hours', String(opt.value))}
            >
              <Text style={[
                styles.chipText,
                form.duration_hours === String(opt.value) && styles.chipTextSelected,
              ]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.divider} />

        {/* Budget */}
        <Text style={styles.sectionTitle}>Budget (ZAR) *</Text>
        <TextInput
          style={styles.input}
          value={form.budget}
          onChangeText={(v) => updateField('budget', v)}
          placeholder="e.g. 350"
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
        />

        <View style={styles.divider} />

        {/* Description */}
        <Text style={styles.sectionTitle}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={form.description}
          onChangeText={(v) => updateField('description', v)}
          placeholder="Describe the job in detail."
          placeholderTextColor={colors.textMuted}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          maxLength={500}
        />
        <Text style={styles.charCount}>{form.description.length}/500</Text>

        <View style={styles.divider} />

        {/* Contact */}
        <Text style={styles.sectionTitle}>Contact Number *</Text>
        <TextInput
          style={styles.input}
          value={form.contact_phone}
          onChangeText={(v) => updateField('contact_phone', v)}
          placeholder="e.g. 082 123 4567"
          placeholderTextColor={colors.textMuted}
          keyboardType="phone-pad"
        />

        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.submitBtnText}>
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
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.lg },
  sectionTitle: {
    fontSize: fonts.medium,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.card,
  },
  categoryChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  categoryEmoji: { fontSize: 16 },
  categoryLabel: { fontSize: fonts.small, color: colors.textMuted, fontWeight: '500' },
  categoryLabelSelected: { color: colors.dark, fontWeight: '700' },
  datePickerBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    backgroundColor: colors.card,
    marginBottom: spacing.sm,
  },
  datePickerBtnText: {
    fontSize: fonts.body,
    color: colors.text,
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
  textArea: { height: 120, textAlignVertical: 'top' },
  charCount: {
    fontSize: fonts.small,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: -spacing.md,
    marginBottom: spacing.lg,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.card,
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: fonts.small, color: colors.textMuted },
  chipTextSelected: { color: colors.dark, fontWeight: '700' },
  submitBtn: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  submitBtnDisabled: { backgroundColor: colors.border },
  submitBtnText: { color: colors.dark, fontSize: fonts.medium, fontWeight: 'bold' },
});