import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Linking, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, fonts } from '../../styles/theme';
import { JOB_CATEGORIES } from '../../constants/jobs';
import { jobService } from '../../utils/jobService';
import { useAuth } from '../../contexts/AuthContext';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { AD_UNIT_ID } from '../../config/admob';

export default function JobDetailScreen({ navigation, route }) {
  const { job } = route.params;
  const { profile } = useAuth();

  useEffect(() => {
    jobService.incrementViews(job.id).catch(() => {});
  }, []);

  const getCategoryLabel = (value) => {
    const found = JOB_CATEGORIES.find(c => c.value === value);
    return found ? `${found.icon} ${found.label}` : value;
  };

  const handleWhatsApp = () => {
    const cleaned = job.contact_phone?.replace(/\s/g, '');
    const phone = cleaned?.startsWith('0') ? '27' + cleaned.slice(1) : cleaned;
    const workerBio = profile?.bio || 'No bio provided.';
    const workerAvailability = profile?.availability || 'Flexible';
    const category = getCategoryLabel(job.category);
    const city = job.city || '';

    const message =
      `Hi! I saw your job on Cazzijobz — ${category} in ${city}. ` +
      `I'm interested and available.\n\n` +
      `About me: ${workerBio}\n\n` +
      `Availability: ${workerAvailability}\n\n` +
      `Is the position still available?`;

    const url = `whatsapp://send?phone=${phone}&text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() =>
      Alert.alert('Error', 'Could not open WhatsApp. Please check it is installed.')
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {getCategoryLabel(job.category)}
        </Text>
        <View style={{ width: 60 }} />
      </View>

      {/* AdMob Banner */}
      <View style={styles.adContainer}>
        <BannerAd
          unitId={AD_UNIT_ID}
          size={BannerAdSize.BANNER}
          requestOptions={{ requestNonPersonalizedAdsOnly: true }}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.body}>

          {/* Budget */}
          <View style={styles.budgetRow}>
            <Text style={styles.budget}>R{job.budget}</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{getCategoryLabel(job.category)}</Text>
            </View>
          </View>

          {/* Location */}
          <Text style={styles.location}>
            📍 {[job.suburb, job.city, job.province].filter(Boolean).join(', ')}
          </Text>

          <View style={styles.divider} />

          {/* Details grid */}
          <Text style={styles.sectionTitle}>Job Details</Text>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailIcon}>📅</Text>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue} numberOfLines={1} adjustsFontSizeToFit>
  {job.scheduled_date || '—'}
</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={[styles.detailIcon, { color: colors.primary }]}>⏱</Text>
              <Text style={styles.detailLabel}>Approx. Duration</Text>
              <Text style={styles.detailValue}>
                {job.duration_hours ? `${job.duration_hours}h` : '—'}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailIcon}>💰</Text>
              <Text style={styles.detailLabel}>Budget</Text>
              <Text style={styles.detailValue}>R{job.budget}</Text>
            </View>
          </View>

          {/* Description */}
          {job.description ? (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>About this Job</Text>
              <Text style={styles.description}>{job.description}</Text>
            </>
          ) : null}

          <View style={styles.divider} />

          {/* WhatsApp message preview */}
          <Text style={styles.sectionTitle}>Your WhatsApp Message Preview</Text>
          <View style={styles.previewBox}>
            <Text style={styles.previewText}>
              {`Hi! I saw your job on Cazzijobz — ${getCategoryLabel(job.category)} in ${job.city || ''}. I'm interested and available.\n\nAbout me: ${profile?.bio || '(complete your profile to add your bio)'}\n\nAvailability: ${profile?.availability || '(complete your profile to add availability)'}\n\nIs the position still available?`}
            </Text>
          </View>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Contact bar — WhatsApp only */}
      <View style={styles.contactBar}>
        <TouchableOpacity
          style={[styles.contactBtn, styles.contactBtnWhatsApp]}
          onPress={handleWhatsApp}
        >
          <Text style={styles.contactBtnText}>💬 WhatsApp Employer</Text>
        </TouchableOpacity>
      </View>
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
  headerTitle: {
    fontSize: fonts.large,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
    textAlign: 'center',
  },
  adContainer: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  body: { padding: spacing.lg },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  budget: { fontSize: fonts.xxlarge, fontWeight: 'bold', color: colors.primary },
  categoryBadge: {
    backgroundColor: colors.card,
    borderRadius: 999,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryBadgeText: { fontSize: fonts.small, fontWeight: '700', color: colors.text },
  location: { fontSize: fonts.body, color: colors.textMuted, marginBottom: spacing.sm },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.lg },
  sectionTitle: {
    fontSize: fonts.large,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  detailsGrid: { flexDirection: 'row', gap: spacing.sm },
  detailItem: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  detailIcon: { fontSize: 24, marginBottom: spacing.xs },
  detailLabel: {
    fontSize: fonts.small,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  detailValue: {
    fontSize: fonts.small,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  description: { fontSize: fonts.body, color: colors.textMuted, lineHeight: 22 },
  previewBox: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  previewText: { fontSize: fonts.small, color: colors.textMuted, lineHeight: 20 },
  contactBar: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    paddingBottom: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  contactBtn: {
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  contactBtnWhatsApp: { backgroundColor: '#25D366' },
  contactBtnText: { color: colors.white, fontWeight: '700', fontSize: fonts.medium },
});