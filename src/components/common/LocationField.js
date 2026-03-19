import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity,
  ActivityIndicator, TextInput, Alert, StyleSheet, Modal
} from 'react-native';
import * as Location from 'expo-location';
import { colors, spacing, fonts } from '../../styles/theme';
import CityAutocomplete from './CityAutocomplete';

export default function LocationField({
  city,
  province,
  suburb,
  onCityChange,
  onProvinceChange,
  onSuburbChange,
  onBothChange,
  helpText = 'This helps show relevant jobs in your area.',
}) {
  const [loading, setLoading] = useState(false);
  const [showLocationInfo, setShowLocationInfo] = useState(false);

  const getCurrentLocation = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Needed', 'Location access helps find jobs near you. You can still enter your city manually.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const geocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (geocode.length > 0) {
        const { city: geoCity, district, region } = geocode[0];
        const detectedCity = geoCity;
        const detectedProvince = region;
        const detectedSuburb = district || '';

        if (onBothChange) {
          onBothChange(detectedCity || '', detectedProvince || '', detectedSuburb || '');
        } else {
          if (detectedCity) onCityChange(detectedCity);
          if (detectedProvince) onProvinceChange(detectedProvince);
          if (detectedSuburb && onSuburbChange) onSuburbChange(detectedSuburb);
        }

        setTimeout(() => {
          if (detectedCity || detectedProvince) {
            Alert.alert('Location Detected', `Suburb: ${detectedSuburb || '—'}\nCity: ${detectedCity || '—'}\nProvince: ${detectedProvince || '—'}`);
          } else {
            Alert.alert('Not Found', 'Could not detect your location. Please enter manually.');
          }
        }, 500);
      }
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Location Error', 'Could not get your location. Please enter manually.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionLabel}>Location</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity onPress={() => setShowLocationInfo(true)}>
            <Text style={{ fontSize: 18 }}>ℹ️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={getCurrentLocation} disabled={loading}>
            {loading
              ? <ActivityIndicator size="small" color={colors.primary} />
              : <Text style={styles.detectLink}>📍 Auto-detect</Text>
            }
          </TouchableOpacity>
        </View>
      </View>

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
              For example, "East London" may be detected as "KuGompo" or "Buffalo City".{'\n\n'}
              If you are not certain about the city name, you can add a separate listing for each name to ensure it shows up in searches.
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

      <Text style={styles.label}>Suburb</Text>
      <TextInput
        style={styles.input}
        value={suburb || ''}
        onChangeText={onSuburbChange}
        placeholder="e.g. Sandton"
        placeholderTextColor={colors.textMuted}
        autoCapitalize="words"
      />

      <Text style={styles.label}>City / Town *</Text>
      <CityAutocomplete
        value={city}
        placeholder="e.g. Cape Town"
        onSelectCity={(selectedCity, selectedProvince) => {
          if (selectedProvince && onBothChange) {
            onBothChange(selectedCity, selectedProvince, suburb || '');
          } else {
            onCityChange(selectedCity);
          }
        }}
      />

      <Text style={styles.label}>Province *</Text>
      <TextInput
        style={styles.input}
        value={province}
        onChangeText={onProvinceChange}
        placeholder="e.g. Western Cape"
        placeholderTextColor={colors.textMuted}
        autoCapitalize="words"
      />

      <Text style={styles.helpText}>{helpText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    zIndex: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    fontSize: fonts.medium,
    fontWeight: '700',
    color: colors.text,
  },
  detectLink: {
    fontSize: fonts.body,
    fontWeight: '500',
    color: colors.primary,
  },
  label: {
    fontSize: fonts.body,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
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
    marginBottom: spacing.sm,
  },
  helpText: {
    fontSize: fonts.small,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: {
    fontSize: fonts.large,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  modalBody: {
    fontSize: fonts.body,
    color: colors.text,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  modalCloseBtn: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseBtnText: {
    color: colors.dark,
    fontSize: fonts.medium,
    fontWeight: 'bold',
  },
});