import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';

type Frequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

type RecurringItem = {
  id: string;
  name: string;
  amount: number;
  category: string;
  frequency: Frequency;
  nextRun: string;
  active: boolean;
};

const CATEGORIES = ['Food & Dining', 'Utilities', 'Entertainment', 'Health', 'Transport', 'Shopping', 'Subscriptions', 'Other'];
const FREQUENCIES: { value: Frequency; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

const PLACEHOLDER_RECURRING: RecurringItem[] = [
  { id: '1', name: 'Netflix', amount: 15.99, category: 'Subscriptions', frequency: 'monthly', nextRun: 'Apr 12, 2026', active: true },
  { id: '2', name: 'Gym Membership', amount: 40.0, category: 'Health', frequency: 'monthly', nextRun: 'Apr 1, 2026', active: true },
  { id: '3', name: 'Internet Bill', amount: 79.99, category: 'Utilities', frequency: 'monthly', nextRun: 'Apr 5, 2026', active: true },
  { id: '4', name: 'Spotify', amount: 9.99, category: 'Subscriptions', frequency: 'monthly', nextRun: 'Apr 18, 2026', active: false },
  { id: '5', name: 'Annual Insurance', amount: 1200.0, category: 'Health', frequency: 'yearly', nextRun: 'Jan 15, 2027', active: true },
];

const FREQ_COLORS: Record<Frequency, { bg: string; text: string }> = {
  daily: { bg: '#fef9c3', text: '#854d0e' },
  weekly: { bg: '#dbeafe', text: '#1e40af' },
  monthly: { bg: '#ede9fe', text: '#5b21b6' },
  yearly: { bg: '#dcfce7', text: '#166534' },
};

type Props = {
  navigation?: any;
};

const RecurringScreen: React.FC<Props> = () => {
  const [items, setItems] = useState<RecurringItem[]>(PLACEHOLDER_RECURRING);
  const [modalVisible, setModalVisible] = useState(false);
  const [formName, setFormName] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formCategory, setFormCategory] = useState<string>('Subscriptions');
  const [formFrequency, setFormFrequency] = useState<Frequency>('monthly');
  const [formNextRun, setFormNextRun] = useState('');
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);
  const [freqPickerOpen, setFreqPickerOpen] = useState(false);

  const activeItems = items.filter((i) => i.active);
  const monthlyTotal = activeItems.reduce((s, i) => {
    if (i.frequency === 'daily') return s + i.amount * 30;
    if (i.frequency === 'weekly') return s + i.amount * 4.33;
    if (i.frequency === 'monthly') return s + i.amount;
    if (i.frequency === 'yearly') return s + i.amount / 12;
    return s;
  }, 0);

  const toggleActive = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, active: !item.active } : item))
    );
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Delete Recurring', `Remove "${name}" from recurring expenses?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setItems((prev) => prev.filter((i) => i.id !== id)) },
    ]);
  };

  const resetForm = () => {
    setFormName('');
    setFormAmount('');
    setFormCategory('Subscriptions');
    setFormFrequency('monthly');
    setFormNextRun('');
    setCategoryPickerOpen(false);
    setFreqPickerOpen(false);
  };

  const handleAdd = () => {
    if (!formName.trim() || !formAmount.trim()) return;
    const newItem: RecurringItem = {
      id: Date.now().toString(),
      name: formName.trim(),
      amount: parseFloat(formAmount) || 0,
      category: formCategory,
      frequency: formFrequency,
      nextRun: formNextRun.trim() || 'Not set',
      active: true,
    };
    setItems((prev) => [newItem, ...prev]);
    resetForm();
    setModalVisible(false);
  };

  const renderItem = ({ item }: { item: RecurringItem }) => {
    const freqStyle = FREQ_COLORS[item.frequency];
    return (
      <View style={[styles.card, !item.active && styles.cardInactive]}>
        <View style={styles.cardTop}>
          <View style={styles.cardLeft}>
            <Text style={[styles.cardName, !item.active && styles.textMuted]}>{item.name}</Text>
            <Text style={styles.cardCategory}>{item.category}</Text>
          </View>
          <View style={styles.cardRight}>
            <Text style={[styles.cardAmount, !item.active && styles.textMuted]}>
              ${item.amount.toFixed(2)}
            </Text>
            <View style={[styles.freqBadge, { backgroundColor: freqStyle.bg }]}>
              <Text style={[styles.freqBadgeText, { color: freqStyle.text }]}>
                {item.frequency}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.cardMeta}>
          <View style={styles.nextRunRow}>
            <Text style={styles.nextRunLabel}>Next run:</Text>
            <Text style={styles.nextRunValue}>{item.nextRun}</Text>
          </View>
          <View style={[styles.statusDot, { backgroundColor: item.active ? '#10b981' : '#d1d5db' }]} />
          <Text style={[styles.statusText, { color: item.active ? '#10b981' : '#9ca3af' }]}>
            {item.active ? 'Active' : 'Paused'}
          </Text>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.actionBtn, item.active ? styles.pauseBtn : styles.resumeBtn]}
            onPress={() => toggleActive(item.id)}>
            <Text style={[styles.actionBtnText, item.active ? styles.pauseBtnText : styles.resumeBtnText]}>
              {item.active ? 'Pause' : 'Resume'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.deleteBtn]}
            onPress={() => handleDelete(item.id, item.name)}>
            <Text style={styles.deleteBtnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Summary */}
      <View style={styles.summaryBanner}>
        <View>
          <Text style={styles.heading}>Recurring</Text>
          <Text style={styles.subheading}>{activeItems.length} active · {items.length - activeItems.length} paused</Text>
        </View>
        <View style={styles.monthlyCostBox}>
          <Text style={styles.monthlyCostLabel}>Est. Monthly</Text>
          <Text style={styles.monthlyCostValue}>${monthlyTotal.toFixed(2)}</Text>
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No recurring expenses</Text>
            <Text style={styles.emptySubtext}>Tap + to add a recurring expense</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Add Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => { resetForm(); setModalVisible(false); }}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>New Recurring Expense</Text>

              <Text style={styles.fieldLabel}>Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Netflix"
                placeholderTextColor="#bbb"
                value={formName}
                onChangeText={setFormName}
              />

              <Text style={styles.fieldLabel}>Amount *</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor="#bbb"
                keyboardType="decimal-pad"
                value={formAmount}
                onChangeText={setFormAmount}
              />

              <Text style={styles.fieldLabel}>Frequency</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => { setFreqPickerOpen((o) => !o); setCategoryPickerOpen(false); }}>
                <Text style={styles.pickerSelected}>
                  {FREQUENCIES.find((f) => f.value === formFrequency)?.label}
                </Text>
                <Text style={styles.pickerChevron}>{freqPickerOpen ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              {freqPickerOpen && (
                <View style={styles.pickerDropdown}>
                  {FREQUENCIES.map((f) => (
                    <TouchableOpacity
                      key={f.value}
                      style={[styles.pickerOption, formFrequency === f.value && styles.pickerOptionActive]}
                      onPress={() => { setFormFrequency(f.value); setFreqPickerOpen(false); }}>
                      <Text style={[styles.pickerOptionText, formFrequency === f.value && styles.pickerOptionTextActive]}>
                        {f.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <Text style={styles.fieldLabel}>Category</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => { setCategoryPickerOpen((o) => !o); setFreqPickerOpen(false); }}>
                <Text style={styles.pickerSelected}>{formCategory}</Text>
                <Text style={styles.pickerChevron}>{categoryPickerOpen ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              {categoryPickerOpen && (
                <ScrollView style={styles.pickerDropdown} nestedScrollEnabled>
                  {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.pickerOption, formCategory === cat && styles.pickerOptionActive]}
                      onPress={() => { setFormCategory(cat); setCategoryPickerOpen(false); }}>
                      <Text style={[styles.pickerOptionText, formCategory === cat && styles.pickerOptionTextActive]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              <Text style={styles.fieldLabel}>Next Run Date (optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Apr 1, 2026"
                placeholderTextColor="#bbb"
                value={formNextRun}
                onChangeText={setFormNextRun}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => { resetForm(); setModalVisible(false); }}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.submitButton, (!formName.trim() || !formAmount.trim()) && styles.submitButtonDisabled]}
                  onPress={handleAdd}>
                  <Text style={styles.submitButtonText}>Add Recurring</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  summaryBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f5',
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  subheading: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  monthlyCostBox: {
    alignItems: 'flex-end',
    backgroundColor: '#fef2f2',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  monthlyCostLabel: {
    fontSize: 10,
    color: '#991b1b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  monthlyCostValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ef4444',
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  separator: {
    height: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  cardInactive: {
    opacity: 0.65,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardLeft: {
    flex: 1,
  },
  cardRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  cardName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 2,
  },
  cardCategory: {
    fontSize: 12,
    color: '#888',
  },
  cardAmount: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ef4444',
  },
  freqBadge: {
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  freqBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  nextRunRow: {
    flexDirection: 'row',
    gap: 4,
    flex: 1,
  },
  nextRunLabel: {
    fontSize: 12,
    color: '#aaa',
  },
  nextRunValue: {
    fontSize: 12,
    color: '#555',
    fontWeight: '500',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  pauseBtn: {
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  pauseBtnText: {
    color: '#555',
  },
  resumeBtn: {
    borderColor: '#10b981',
    backgroundColor: '#ecfdf5',
  },
  resumeBtnText: {
    color: '#065f46',
  },
  deleteBtn: {
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
    flex: 0.6,
  },
  deleteBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ef4444',
  },
  textMuted: {
    color: '#9ca3af',
  },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: {
    color: '#bbb',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  emptySubtext: {
    color: '#ccc',
    fontSize: 13,
  },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: {
    color: '#fff',
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '400',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 36,
    maxHeight: '90%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 20,
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
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1a1a2e',
    backgroundColor: '#fafafa',
    marginBottom: 16,
  },
  pickerButton: {
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#fafafa',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  pickerSelected: {
    fontSize: 15,
    color: '#1a1a2e',
  },
  pickerChevron: {
    fontSize: 11,
    color: '#888',
  },
  pickerDropdown: {
    maxHeight: 160,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  pickerOption: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  pickerOptionActive: {
    backgroundColor: '#ede9fe',
  },
  pickerOptionText: {
    fontSize: 15,
    color: '#1a1a2e',
  },
  pickerOptionTextActive: {
    color: '#5b21b6',
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  submitButton: {
    flex: 2,
    backgroundColor: '#4f46e5',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.4,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});

export default RecurringScreen;
