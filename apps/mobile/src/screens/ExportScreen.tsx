import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';

type ExportFormat = 'csv' | 'pdf';
type ExportType = 'expenses' | 'income' | 'all' | 'budgets';

const FORMATS: { value: ExportFormat; label: string; desc: string }[] = [
  { value: 'csv', label: 'CSV', desc: 'Spreadsheet compatible, works with Excel & Google Sheets' },
  { value: 'pdf', label: 'PDF', desc: 'Formatted report, great for printing or sharing' },
];

const EXPORT_TYPES: { value: ExportType; label: string; icon: string }[] = [
  { value: 'all', label: 'All Transactions', icon: '📊' },
  { value: 'expenses', label: 'Expenses Only', icon: '💸' },
  { value: 'income', label: 'Income Only', icon: '💰' },
  { value: 'budgets', label: 'Budget Report', icon: '🎯' },
];

const QUICK_RANGES = [
  { label: 'This Month', from: 'Mar 1, 2026', to: 'Mar 31, 2026' },
  { label: 'Last Month', from: 'Feb 1, 2026', to: 'Feb 28, 2026' },
  { label: 'Last 3 Months', from: 'Jan 1, 2026', to: 'Mar 31, 2026' },
  { label: 'This Year', from: 'Jan 1, 2026', to: 'Dec 31, 2026' },
  { label: 'Last Year', from: 'Jan 1, 2025', to: 'Dec 31, 2025' },
];

type Props = {
  navigation?: any;
};

const ExportScreen: React.FC<Props> = () => {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv');
  const [selectedType, setSelectedType] = useState<ExportType>('all');
  const [includeCategories, setIncludeCategories] = useState(true);
  const [includeNotes, setIncludeNotes] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastExport, setLastExport] = useState<string | null>(null);

  const applyQuickRange = (from: string, to: string) => {
    setDateFrom(from);
    setDateTo(to);
  };

  const isFormValid = dateFrom.trim() && dateTo.trim();

  const handleExport = () => {
    if (!isFormValid) return;
    setLoading(true);

    // Simulate export delay
    setTimeout(() => {
      setLoading(false);
      const timestamp = new Date().toLocaleTimeString();
      setLastExport(timestamp);
      const typeLabel = EXPORT_TYPES.find((t) => t.value === selectedType)?.label ?? selectedType;
      Alert.alert(
        'Export Ready',
        `${typeLabel} exported as ${selectedFormat.toUpperCase()}.\nRange: ${dateFrom} – ${dateTo}`,
        [{ text: 'OK' }]
      );
    }, 1800);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Export Data</Text>
      <Text style={styles.subheading}>Download your financial data as CSV or PDF</Text>

      {/* Last Export */}
      {lastExport && (
        <View style={styles.lastExportBanner}>
          <Text style={styles.lastExportText}>Last export at {lastExport}</Text>
        </View>
      )}

      {/* Export Type */}
      <Text style={styles.sectionTitle}>What to export</Text>
      <View style={styles.typeGrid}>
        {EXPORT_TYPES.map((t) => (
          <TouchableOpacity
            key={t.value}
            style={[styles.typeCard, selectedType === t.value && styles.typeCardActive]}
            onPress={() => setSelectedType(t.value)}>
            <Text style={styles.typeIcon}>{t.icon}</Text>
            <Text style={[styles.typeLabel, selectedType === t.value && styles.typeLabelActive]}>
              {t.label}
            </Text>
            {selectedType === t.value && (
              <View style={styles.typeCheckmark}>
                <Text style={styles.typeCheckmarkText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Date Range */}
      <Text style={styles.sectionTitle}>Date Range</Text>

      {/* Quick Select */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickRangeScroll}>
        {QUICK_RANGES.map((r) => (
          <TouchableOpacity
            key={r.label}
            style={[
              styles.quickRangeChip,
              dateFrom === r.from && dateTo === r.to && styles.quickRangeChipActive,
            ]}
            onPress={() => applyQuickRange(r.from, r.to)}>
            <Text
              style={[
                styles.quickRangeText,
                dateFrom === r.from && dateTo === r.to && styles.quickRangeTextActive,
              ]}>
              {r.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.dateRow}>
        <View style={styles.dateField}>
          <Text style={styles.fieldLabel}>From *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Jan 1, 2026"
            placeholderTextColor="#bbb"
            value={dateFrom}
            onChangeText={setDateFrom}
          />
        </View>
        <View style={styles.dateSeparator}>
          <Text style={styles.dateSeparatorText}>→</Text>
        </View>
        <View style={styles.dateField}>
          <Text style={styles.fieldLabel}>To *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Jan 31, 2026"
            placeholderTextColor="#bbb"
            value={dateTo}
            onChangeText={setDateTo}
          />
        </View>
      </View>

      {/* Format */}
      <Text style={styles.sectionTitle}>File Format</Text>
      <View style={styles.formatRow}>
        {FORMATS.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[styles.formatCard, selectedFormat === f.value && styles.formatCardActive]}
            onPress={() => setSelectedFormat(f.value)}>
            <View style={styles.formatTop}>
              <Text style={[styles.formatLabel, selectedFormat === f.value && styles.formatLabelActive]}>
                {f.label}
              </Text>
              {selectedFormat === f.value && (
                <View style={styles.formatCheck}>
                  <Text style={styles.formatCheckText}>✓</Text>
                </View>
              )}
            </View>
            <Text style={styles.formatDesc}>{f.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Options */}
      <Text style={styles.sectionTitle}>Options</Text>
      <View style={styles.optionsCard}>
        <TouchableOpacity
          style={styles.optionRow}
          onPress={() => setIncludeCategories((v) => !v)}>
          <View>
            <Text style={styles.optionLabel}>Include Categories</Text>
            <Text style={styles.optionDesc}>Add category column to the export</Text>
          </View>
          <View style={[styles.toggle, includeCategories && styles.toggleOn]}>
            <View style={[styles.toggleThumb, includeCategories && styles.toggleThumbOn]} />
          </View>
        </TouchableOpacity>

        <View style={styles.optionDivider} />

        <TouchableOpacity
          style={styles.optionRow}
          onPress={() => setIncludeNotes((v) => !v)}>
          <View>
            <Text style={styles.optionLabel}>Include Notes</Text>
            <Text style={styles.optionDesc}>Add notes/description column</Text>
          </View>
          <View style={[styles.toggle, includeNotes && styles.toggleOn]}>
            <View style={[styles.toggleThumb, includeNotes && styles.toggleThumbOn]} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Export Summary */}
      {isFormValid && (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Export Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryKey}>Type</Text>
            <Text style={styles.summaryVal}>
              {EXPORT_TYPES.find((t) => t.value === selectedType)?.label}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryKey}>Range</Text>
            <Text style={styles.summaryVal}>{dateFrom} – {dateTo}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryKey}>Format</Text>
            <Text style={styles.summaryVal}>{selectedFormat.toUpperCase()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryKey}>Categories</Text>
            <Text style={styles.summaryVal}>{includeCategories ? 'Yes' : 'No'}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryKey}>Notes</Text>
            <Text style={styles.summaryVal}>{includeNotes ? 'Yes' : 'No'}</Text>
          </View>
        </View>
      )}

      {/* Download Button */}
      <TouchableOpacity
        style={[styles.downloadBtn, (!isFormValid || loading) && styles.downloadBtnDisabled]}
        onPress={handleExport}
        disabled={!isFormValid || loading}>
        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color="#fff" size="small" />
            <Text style={styles.downloadBtnText}>Generating...</Text>
          </View>
        ) : (
          <Text style={styles.downloadBtnText}>
            Download {selectedFormat.toUpperCase()}
          </Text>
        )}
      </TouchableOpacity>

      {!isFormValid && (
        <Text style={styles.validationHint}>Please set a date range to continue</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  content: {
    padding: 20,
    paddingBottom: 48,
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  subheading: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
    marginBottom: 20,
  },
  lastExportBanner: {
    backgroundColor: '#ecfdf5',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#10b981',
  },
  lastExportText: {
    fontSize: 13,
    color: '#065f46',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a2e',
    marginTop: 4,
    marginBottom: 12,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  typeCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  typeCardActive: {
    borderColor: '#4f46e5',
    backgroundColor: '#f5f3ff',
  },
  typeIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  typeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  typeLabelActive: {
    color: '#4f46e5',
  },
  typeCheckmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeCheckmarkText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  quickRangeScroll: {
    marginBottom: 14,
  },
  quickRangeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
  },
  quickRangeChipActive: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },
  quickRangeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
  },
  quickRangeTextActive: {
    color: '#fff',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 20,
  },
  dateField: {
    flex: 1,
  },
  dateSeparator: {
    paddingBottom: 14,
  },
  dateSeparatorText: {
    fontSize: 16,
    color: '#aaa',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
    color: '#1a1a2e',
    backgroundColor: '#fafafa',
  },
  formatRow: {
    gap: 10,
    marginBottom: 20,
  },
  formatCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  formatCardActive: {
    borderColor: '#4f46e5',
    backgroundColor: '#f5f3ff',
  },
  formatTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  formatLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  formatLabelActive: {
    color: '#4f46e5',
  },
  formatCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formatCheckText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  formatDesc: {
    fontSize: 12,
    color: '#888',
    lineHeight: 17,
  },
  optionsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  optionDivider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginHorizontal: 16,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 2,
  },
  optionDesc: {
    fontSize: 12,
    color: '#888',
  },
  toggle: {
    width: 46,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleOn: {
    backgroundColor: '#4f46e5',
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    alignSelf: 'flex-start',
  },
  toggleThumbOn: {
    alignSelf: 'flex-end',
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#4f46e5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4f46e5',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  summaryKey: {
    fontSize: 13,
    color: '#888',
  },
  summaryVal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  downloadBtn: {
    backgroundColor: '#4f46e5',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  downloadBtnDisabled: {
    opacity: 0.4,
    shadowOpacity: 0,
    elevation: 0,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  downloadBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  validationHint: {
    textAlign: 'center',
    fontSize: 13,
    color: '#aaa',
    marginTop: 10,
  },
});

export default ExportScreen;
