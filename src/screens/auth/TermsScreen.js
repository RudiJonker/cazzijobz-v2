import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, fonts } from '../../styles/theme';

export default function TermsScreen({ navigation, route }) {
  const { role } = route.params;
  const [accepted, setAccepted] = useState(false);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.intro}>
          Welcome to Cazzijobz. Please read and accept our terms before creating your account. Last updated: March 2026.
        </Text>

        {[
          {
            title: '1. About Cazzijobz',
            body: 'Cazzijobz is a platform that connects workers seeking casual or once-off employment with employers who need help. Cazzijobz acts as a connector only — we are not a party to any agreement made between workers and employers.',
          },
          {
            title: '2. Consumer Protection',
            body: 'As required by section 49 of the Consumer Protection Act, 68 of 2008 ("CPA"), your attention is drawn to provisions in these Terms which limit the liability of Cazzijobz, constitute an assumption of risk by you, or impose obligations to indemnify Cazzijobz. If you do not understand any provision, contact Cazzijobz for clarity before accepting.',
          },
          {
            title: '3. Your Responsibilities',
            body: 'By using Cazzijobz you agree to: provide accurate and truthful information; take responsibility for all content you post; treat all users with respect and dignity; not post illegal, obscene, defamatory, or offensive content; not engage in illegal activity through the platform; and not use automated processes to negatively affect platform performance.',
          },
          {
            title: '4. Worker Rules',
            body: 'Workers must accurately represent their skills, availability, and experience. Contact details obtained through the platform may only be used for legitimate job enquiries. Workers are responsible for negotiating terms directly with employers and for complying with all applicable laws.',
          },
          {
            title: '5. Employer Rules',
            body: 'Employers must accurately describe the work required including location, date, duration, and budget. Job listings must represent real, available opportunities. Employers are responsible for complying with all applicable labour laws and must engage with workers in good faith.',
          },
          {
            title: '6. Payments',
            body: 'Cazzijobz does not process or handle any payments between workers and employers. All payment arrangements are made directly between the parties involved. Cazzijobz accepts no liability for any financial disputes, losses, or fraudulent transactions.',
          },
          {
            title: '7. Privacy and Data',
            body: 'Cazzijobz collects only the information necessary to operate the platform. Your personal information will not be sold to third parties. Location data is used only to show relevant jobs in your area.',
          },
          {
            title: '8. Advertising',
            body: 'The Cazzijobz platform displays third-party advertisements served by Google AdMob. These advertisements help keep the platform free. By using the platform you acknowledge and consent to the display of such advertisements.',
          },
          {
            title: '9. Account Termination',
            body: 'Cazzijobz reserves the right to suspend or terminate any account, without prior notice, that violates these Terms, is used in a manner harmful to other users, or engages in fraudulent or illegal activity.',
          },
          {
            title: '10. Limitation of Liability',
            body: 'Cazzijobz provides the platform on an "as is" basis. To the fullest extent permitted by law, Cazzijobz disclaims all liability for any damages arising from your use of the platform, including disputes between workers and employers, financial losses, or any interruption of the platform.',
          },
          {
            title: '11. Safety',
            body: 'Cazzijobz strongly advises all users to exercise caution when sharing personal information or meeting unknown persons. Cazzijobz accepts no liability for any harm arising from interactions between users. Users interact with each other entirely at their own risk.',
          },
        ].map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionBody}>{section.body}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.checkRow}
          onPress={() => setAccepted(!accepted)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, accepted && styles.checkboxChecked]}>
            {accepted && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkLabel}>I have read and accept the Terms & Conditions</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.continueBtn, !accepted && styles.continueBtnDisabled]}
          disabled={!accepted}
          onPress={() => navigation.navigate('SignUp', { role })}
        >
          <Text style={styles.continueBtnText}>Continue →</Text>
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
  headerTitle: { fontSize: fonts.large, fontWeight: 'bold', color: colors.text },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg },
  intro: {
    fontSize: fonts.body,
    color: colors.textMuted,
    lineHeight: 22,
    marginBottom: spacing.lg,
    fontStyle: 'italic',
  },
  section: { marginBottom: spacing.lg },
  sectionTitle: {
    fontSize: fonts.medium,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  sectionBody: {
    fontSize: fonts.body,
    color: colors.text,
    lineHeight: 22,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: colors.primary },
  checkmark: { color: colors.dark, fontSize: 14, fontWeight: 'bold' },
  checkLabel: { flex: 1, fontSize: fonts.body, color: colors.text, lineHeight: 20 },
  continueBtn: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  continueBtnDisabled: { backgroundColor: colors.border },
  continueBtnText: { color: colors.dark, fontSize: fonts.medium, fontWeight: 'bold' },
});