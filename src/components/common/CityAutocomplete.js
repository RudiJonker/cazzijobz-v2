import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet
} from 'react-native';
import { colors, spacing, fonts } from '../../styles/theme';

export default function CityAutocomplete({ value, onSelectCity, placeholder = 'Search city...' }) {
  const [suggestions, setSuggestions] = useState([]);
  const debounceTimer = useRef(null);

  const handleSearch = async (text) => {
    onSelectCity(text, null);
    if (text.length < 3) {
      setSuggestions([]);
      return;
    }

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(text)}&countrycodes=za&format=json&addressdetails=1&limit=5`,
          { headers: { 'User-Agent': 'Cazzijobz/1.0 (cazzijobz@gmail.com)' } }
        );
        const rawText = await response.text();
        const data = JSON.parse(rawText);
        const results = data
          .filter(item => item.address?.city || item.address?.town || item.address?.village)
          .map(item => ({
            city: item.address?.city || item.address?.town || item.address?.village,
            province: item.address?.state || '',
            display: `${item.address?.city || item.address?.town || item.address?.village}, ${item.address?.state || ''}`,
          }))
          .filter((item, index, self) =>
            index === self.findIndex(t => t.city === item.city)
          );
        setSuggestions(results);
      } catch (error) {
        console.log('Autocomplete error:', error);
      }
    }, 500);
  };

  const handleSelect = (item) => {
    setSuggestions([]);
    onSelectCity(item.city, item.province);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={handleSearch}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          autoCapitalize="words"
        />
        {suggestions.length > 0 && (
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={() => setSuggestions([])}
          >
            <Text style={styles.clearBtnText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {suggestions.length > 0 && (
        <View style={styles.suggestionsBox}>
          {suggestions.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionRow}
              onPress={() => handleSelect(item)}
            >
              <Text style={styles.suggestionText}>{item.display}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    zIndex: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fonts.body,
    color: colors.text,
    backgroundColor: colors.card,
  },
  clearBtn: {
    position: 'absolute',
    right: spacing.sm,
    padding: spacing.xs,
  },
  clearBtnText: {
    fontSize: fonts.medium,
    color: colors.textMuted,
  },
  suggestionsBox: {
    position: 'absolute',
    top: 44,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    zIndex: 20,
    elevation: 5,
  },
  suggestionRow: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  suggestionText: {
    fontSize: fonts.body,
    color: colors.text,
  },
});