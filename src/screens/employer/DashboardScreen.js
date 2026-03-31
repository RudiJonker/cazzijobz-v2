import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  FlatList, Alert, ActivityIndicator,
  RefreshControl, Image, Share, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, fonts } from '../../styles/theme';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../utils/authService';
import { storageService } from '../../utils/storageService';
import { jobService } from '../../utils/jobService';
import { JOB_CATEGORIES } from '../../constants/jobs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function DashboardScreen({ navigation }) {
  const { user, profile } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadJobs();
    }, [])
  );

  const loadJobs = async () => {
    setLoading(true);
    try {
      const { data, error } = await jobService.getEmployerJobs(user.id);
      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Load jobs error:', error);
      Alert.alert('Error', 'Could not load your jobs.');
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
        `💼 Looking for casual workers in South Africa?\n\n` +
        `Download Cazzijobz and post a job today — it's free!\n\n` +
        `👉 https://drive.google.com/file/d/1LN-GyGEkd6pZwNZf9-SOga4o74V9xqz4/view?usp=drive_link`,
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

  const handleToggleStatus = async (job) => {
    try {
      if (job.status === 'active') {
        const { error } = await jobService.pauseJob(job.id);
        if (error) throw error;
        setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'paused' } : j));
      } else {
        const { error } = await jobService.activateJob(job.id);
        if (error) throw error;
        setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'active' } : j));
      }
    } catch (error) {
      Alert.alert('Error', 'Could not update job status.');
    }
  };

  const handleDelete = (job) => {
    Alert.alert(
      'Delete Job',
      'Are you sure you want to delete this job? It will be removed after 30 days.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await jobService.deleteJob(job.id);
              if (error) throw error;
              setJobs(prev => prev.filter(j => j.id !== job.id));
            } catch (error) {
              Alert.alert('Error', 'Could not delete job.');
            }
          }
        }
      ]
    );
  };

  const getCategoryLabel = (value) => {
    const found = JOB_CATEGORIES.find(c => c.value === value);
    return found ? `${found.icon} ${found.label}` : value;
  };

  const renderJob = ({ item }) => {
    const isActive = item.status === 'active';
    return (
      <View style={styles.jobCard}>
        <View style={styles.cardHeader}>
          <View style={[styles.statusBadge, isActive ? styles.statusActive : styles.statusPaused]}>
            <Text style={styles.statusText}>{isActive ? '● Active' : '● Paused'}</Text>
          </View>
          <Text style={styles.cardViews}>👁 {item.views_count || 0} views</Text>
        </View>

        <Text style={styles.cardCategory}>{getCategoryLabel(item.category)}</Text>
        <Text style={styles.cardLocation}>
          📍 {[item.suburb, item.city, item.province].filter(Boolean).join(', ')}
        </Text>
        <Text style={styles.cardDate}>
          📅 {item.scheduled_date} · ⏱ {item.duration_hours}h · 💰 R{item.budget}
        </Text>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnEdit]}
            onPress={() => navigation.navigate('EditJob', { job: item })}
          >
            <Text style={styles.actionBtnText}>✏️ Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnToggle]}
            onPress={() => handleToggleStatus(item)}
          >
            <Text style={styles.actionBtnText}>
              {isActive ? '⏸ Pause' : '▶️ Activate'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnDelete]}
            onPress={() => handleDelete(item)}
          >
            <Text style={[styles.actionBtnText, { color: colors.white }]}>🗑 Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const activeCount = jobs.filter(j => j.status === 'active').length;
  const pausedCount = jobs.filter(j => j.status === 'paused').length;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerGreeting}>
            Hi, {profile?.full_name?.split(' ')[0] || 'Employer'} 👋
          </Text>
          <Text style={styles.headerSub}>Manage your jobs</Text>
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
  <MaterialCommunityIcons 
    name="share-variant" 
    size={24} 
    color={colors.white} 
  />
</TouchableOpacity>
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutBtn}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{jobs.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: colors.success }]}>{activeCount}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: colors.warning }]}>{pausedCount}</Text>
          <Text style={styles.statLabel}>Paused</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => navigation.navigate('PostJob')}
      >
        <Text style={styles.addBtnText}>+ Post a New Job</Text>
      </TouchableOpacity>

      {loading
        ? <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.xl }} />
        : jobs.length === 0
          ? <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📋</Text>
              <Text style={styles.emptyTitle}>No jobs posted yet</Text>
              <Text style={styles.emptySubtitle}>Tap the button above to post your first job.</Text>
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
  headerGreeting: { fontSize: fonts.large, fontWeight: 'bold', color: colors.text },
  headerSub: { fontSize: fonts.small, color: colors.textMuted, marginTop: 2 },
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
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statCard: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: fonts.xlarge, fontWeight: 'bold', color: colors.primary },
  statLabel: { fontSize: fonts.small, color: colors.textMuted, marginTop: 2 },
  addBtn: {
    backgroundColor: colors.primary,
    margin: spacing.md,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  addBtnText: { color: colors.dark, fontWeight: '700', fontSize: fonts.medium },
  listContent: { padding: spacing.md, paddingTop: 0 },
  jobCard: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statusBadge: { paddingVertical: 2, paddingHorizontal: spacing.sm, borderRadius: 999 },
  statusActive: { backgroundColor: '#1A3A2A' },
  statusPaused: { backgroundColor: '#3A2A00' },
  statusText: { fontSize: fonts.small, fontWeight: '600', color: colors.text },
  cardViews: { fontSize: fonts.small, color: colors.textMuted },
  cardCategory: { fontSize: fonts.medium, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
  cardLocation: { fontSize: fonts.body, color: colors.textMuted, marginBottom: spacing.xs },
  cardDate: { fontSize: fonts.small, color: colors.textMuted, marginBottom: spacing.md },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  actionBtn: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center', borderRadius: 6 },
  actionBtnEdit: { backgroundColor: colors.card },
  actionBtnToggle: { backgroundColor: colors.card },
  actionBtnDelete: { backgroundColor: colors.error },
  actionBtnText: { fontSize: fonts.small, fontWeight: '600', color: colors.text },
  emptyState: {
    flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl,
  },
  emptyEmoji: { fontSize: 56, marginBottom: spacing.md },
  emptyTitle: { fontSize: fonts.large, fontWeight: 'bold', color: colors.text, marginBottom: spacing.sm },
  emptySubtitle: { fontSize: fonts.body, color: colors.textMuted, textAlign: 'center' },
});