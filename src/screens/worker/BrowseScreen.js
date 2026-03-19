import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, ScrollView,
  TouchableOpacity, ActivityIndicator,
  Alert, RefreshControl, Image, Modal, Share
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, fonts } from '../../styles/theme';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../utils/authService';
import { storageService } from '../../utils/storageService';
import { jobService } from '../../utils/jobService';
import { JOB_CATEGORIES } from '../../constants/jobs';
import CityAutocomplete from '../../components/common/CityAutocomplete';

export default function BrowseScreen({ navigation }) {
  const { user, profile } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchCity, setSearchCity] = useState(profile?.city || '');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showLocationInfo, setShowLocationInfo] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadJobs();
    }, [searchCity, selectedCategory])
  );

  const loadJobs = async () => {
    setLoading(true);
    try {
      const { data, error } = await jobService.getActiveJobs({
        searchText: searchCity,
        category: selectedCategory,
      });
      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Browse error:', error);
      Alert.alert('Error', 'Could not load jobs.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadJobs();
    setRefreshing(false);
  };

  const handleShareApp = async () => {
    await Share.share({
      message:
        `💼 Looking for casual work in South Africa?\n\n` +
        `Download Cazzijobz and find work near you today — it's free!\n\n` +
        `👉 https://cazzijobz.com`,
    });
  };

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await storageService.clearUserProfile();
          await authService.signOut();
        }
      }
    ]);
  };

  const getCategoryLabel = (value) => {
    const found = JOB_CATEGORIES.find(c => c.value === value);
    return found ? `${found.icon} ${found.label}` : value;
  };

  const renderJob = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('JobDetail', { job: item })}
      activeOpacity={0.85}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardCategory}>{getCategoryLabel(item.category)}</Text>
        <Text style={styles.cardBudget}>R{item.budget}</Text>
      </View>
      <Text style={styles.cardLocation}>
        📍 {[item.suburb, item.city, item.province].filter(Boolean).join(', ')}
      </Text>
      <Text style={styles.cardDate}>
        📅 {item.scheduled_date}
        {item.duration_hours ? ` · ⏱ ${item.duration_hours}h` : ''}
      </Text>
      {item.description ? (
        <Text style={styles.cardDescription} numberOfLines={2}>
          {item.description}
        </Text>
      ) : null}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerGreeting}>
            Hi, {profile?.full_name?.split(' ')[0] || 'there'} 👋
          </Text>
          <Text style={styles.headerSub}>Find casual work near you</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Profile')}
          style={styles.profileBtn}
        >
          {profile?.avatar_url
            ? <Image source={{ uri: profile.avatar_url }} style={styles.profileAvatar} />
            : <Text style={styles.profileBtnText}>👤</Text>
          }
        </TouchableOpacity>
        <TouchableOpacity onPress={handleShareApp} style={styles.shareBtn}>
          <Text style={styles.shareBtnText}>📤</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutBtn}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchInputWrapper}>
          <CityAutocomplete
            value={searchCity}
            placeholder="Search by city or area"
            onSelectCity={(city) => setSearchCity(city)}
          />
        </View>
        <TouchableOpacity
          style={styles.infoBtn}
          onPress={() => setShowLocationInfo(true)}
        >
          <Text>ℹ️</Text>
        </TouchableOpacity>
      </View>

      {/* Category filter — horizontal scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScrollView}
        contentContainerStyle={styles.categoryScrollContent}
      >
        <TouchableOpacity
          style={[styles.categoryChip, !selectedCategory && styles.categoryChipSelected]}
          onPress={() => setSelectedCategory('')}
        >
          <Text style={[
            styles.categoryChipText,
            !selectedCategory && styles.categoryChipTextSelected,
          ]}>
            All
          </Text>
        </TouchableOpacity>
        {JOB_CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.value}
            style={[
              styles.categoryChip,
              selectedCategory === cat.value && styles.categoryChipSelected,
            ]}
            onPress={() => setSelectedCategory(
              cat.value === selectedCategory ? '' : cat.value
            )}
          >
            <Text style={[
              styles.categoryChipText,
              selectedCategory === cat.value && styles.categoryChipTextSelected,
            ]}>
              {cat.icon} {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Location info modal */}
      <Modal
        visible={showLocationInfo}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLocationInfo(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>📍 Location Names</Text>
            <Text style={styles.modalBody}>
              Some location databases use new Municipal names instead of well-known area names.{'\n\n'}
              For example, "East London" may appear as "KuGompo" or "Buffalo City".{'\n\n'}
              If you can't find jobs in your area, try searching by suburb or province instead.
            </Text>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setShowLocationInfo(false)}
            >
              <Text style={styles.modalCloseBtnText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Results count */}
      {!loading && (
        <Text style={styles.resultsCount}>
          {jobs.length === 0
            ? 'No jobs found'
            : `${jobs.length} job${jobs.length === 1 ? '' : 's'} found`}
          {searchCity ? ` in ${searchCity}` : ''}
        </Text>
      )}

      {/* Jobs list */}
      {loading
        ? <ActivityIndicator
            size="large"
            color={colors.primary}
            style={{ marginTop: spacing.xl }}
          />
        : jobs.length === 0
          ? <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyTitle}>No jobs found</Text>
              <Text style={styles.emptySubtitle}>
                Try a different city or clear the search to see all jobs.
              </Text>
              <TouchableOpacity
                style={styles.clearBtn}
                onPress={() => { setSearchCity(''); setSelectedCategory(''); }}
              >
                <Text style={styles.clearBtnText}>Show All Jobs</Text>
              </TouchableOpacity>
            </View>
          : <FlatList
              data={jobs}
              keyExtractor={(item) => item.id}
              renderItem={renderJob}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  colors={[colors.primary]}
                  tintColor={colors.primary}
                />
              }
            />
      }
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.surface,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: { flex: 1 },
  headerGreeting: { color: colors.text, fontSize: fonts.large, fontWeight: 'bold' },
  headerSub: { color: colors.textMuted, fontSize: fonts.small, marginTop: 2 },
  profileBtn: {
    backgroundColor: colors.card,
    borderRadius: 999,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  profileBtnText: { fontSize: 18 },
  profileAvatar: { width: 36, height: 36, borderRadius: 999 },
  shareBtn: { padding: spacing.xs },
  shareBtnText: { fontSize: 22 },
  signOutBtn: { paddingLeft: spacing.xs },
  signOutText: { color: colors.textMuted, fontSize: fonts.small },
  searchRow: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    zIndex: 10,
    alignItems: 'center',
  },
  searchInputWrapper: { flex: 1, zIndex: 10 },
  infoBtn: { padding: spacing.sm },
  categoryScrollView: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    maxHeight: 48,
  },
  categoryScrollContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    alignItems: 'center',
  },
  categoryChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.card,
  },
  categoryChipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  categoryChipText: { fontSize: fonts.small, color: colors.textMuted },
  categoryChipTextSelected: { color: colors.dark, fontWeight: '700' },
  resultsCount: {
    fontSize: fonts.small,
    color: colors.textMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  listContent: { padding: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  cardCategory: { fontSize: fonts.medium, fontWeight: '700', color: colors.text },
  cardBudget: { fontSize: fonts.large, fontWeight: 'bold', color: colors.primary },
  cardLocation: { fontSize: fonts.body, color: colors.textMuted, marginBottom: spacing.xs },
  cardDate: { fontSize: fonts.small, color: colors.textMuted, marginBottom: spacing.xs },
  cardDescription: {
    fontSize: fonts.body,
    color: colors.textMuted,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  emptyState: {
    flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl,
  },
  emptyEmoji: { fontSize: 56, marginBottom: spacing.md },
  emptyTitle: {
    fontSize: fonts.large, fontWeight: 'bold',
    color: colors.text, marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: fonts.body, color: colors.textMuted,
    textAlign: 'center', marginBottom: spacing.lg,
  },
  clearBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: 8,
  },
  clearBtnText: { color: colors.dark, fontWeight: '700', fontSize: fonts.body },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center', justifyContent: 'center', padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.surface, borderRadius: 12,
    padding: spacing.lg, width: '100%',
    borderWidth: 1, borderColor: colors.border,
  },
  modalTitle: { fontSize: fonts.large, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  modalBody: { fontSize: fonts.body, color: colors.text, lineHeight: 24, marginBottom: spacing.lg },
  modalCloseBtn: {
    backgroundColor: colors.primary, padding: spacing.md,
    borderRadius: 8, alignItems: 'center',
  },
  modalCloseBtnText: { color: colors.dark, fontSize: fonts.medium, fontWeight: 'bold' },
});