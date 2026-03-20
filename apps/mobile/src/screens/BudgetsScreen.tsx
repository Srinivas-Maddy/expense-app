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
} from 'react-native';

type Budget = {
  id: string;
  name: string;
  category: string | null;
  amount: number;
  spent: number;
};

const CATEGORIES = ['Food & Dining', 'Utilities', 'Entertainment', 'Health', 'Transport', 'Shopping', 'Other'];

const PLACEHOLDER_BUDGETS: Budget[] = [
  { id: '1', name: 'Monthly Food', category: 'Food & Dining', amount: 600, spent: 420 },
  { id: '2', name: 'Utilities Cap', category: 'Utilities', amount: 200, spent: 185 },
  { id: '3', name: 'Entertainment', category: 'Entertainment', amount: 150, spent: 60 },
  { id: '4', name: 'Overall Spending', category: null, amount: 2500, spent: 1740 },
];

type Props = {
  navigation?: any;
};

const ProgressBar: React.FC<{ percent: number }> = ({ percent }) => {
  const clamped = Math.min(percent, 100);
  const barColor = clamped >= 90 ? '#ef4444' : clamped >= 70 ? '#f97316' : '#4f46e5';
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${clamped}%` as any, backgroundColor: barColor }]} />
    </View>
  );
};

const BudgetCard: React.FC<{ item: Budget }> = ({ item }) => {
  const remaining = item.amount - item.spent;
  const percent = Math.round((item.spent / item.amount) * 100);
  const isOver = remaining < 0;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardName}>{item.name}</Text>
          {item.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{item.category}</Text>
            </View>
          )}
        </View>
        <Text style={styles.cardPercent}>{percent}%</Text>
      </View>

      <ProgressBar percent={percent} />

      <View style={styles.cardFooter}>
        <View>
          <Text style={styles.footerLabel}>Spent</Text>
          <Text style={styles.footerValueRed}>${item.spent.toFixed(2)}</Text>
        </View>
        <View style={styles.footerCenter}>
          <Text style={styles.footerLabel}>Budget</Text>
          <Text style={styles.footerValue}>${item.amount.toFixed(2)}</Text>
        </View>
        <View style={styles.footerRight}>
          <Text style={styles.footerLabel}>{isOver ? 'Over by' : 'Remaining'}</Text>
          <Text style={[styles.footerValue, isOver ? styles.overText : styles.safeText]}>
            ${Math.abs(remaining).toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const BudgetsScreen: React.FC<Props> = () => {
  const [budgets, setBudgets] = useState<Budget[]>(PLACEHOLDER_BUDGETS);
  const [modalVisible, setModalVisible] = useState(false);
  const [formName, setFormName] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formCategory, setFormCategory] = useState<string | null>(null);
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);

  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);

  const resetForm = () => {
    setFormName('');
    setFormAmount('');
    setFormCategory(null);
    setCategoryPickerOpen(false);
  };

  const handleAdd = () => {
    if (!formName.trim() || !formAmount.trim()) return;
    const newBudget: Budget = {
      id: Date.now().toString(),
      name: formName.trim(),
      category: formCategory,
      amount: parseFloat(formAmount) || 0,
      spent: 0,
    };
    setBudgets((prev) => [newBudget, ...prev]);
    resetForm();
    setModalVisible(false);
  };

  const handleCancel = () => {
    resetForm();
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* Summary Header */}
      <View style={styles.summaryHeader}>
        <Text style={styles.heading}>Budgets</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Budget</Text>
            <Text style={styles.summaryValue}>${totalBudget.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Spent</Text>
            <Text style={[styles.summaryValue, { color: '#ef4444' }]}>${totalSpent.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Remaining</Text>
            <Text style={[styles.summaryValue, { color: '#10b981' }]}>
              ${(totalBudget - totalSpent).toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      <FlatList
        data={budgets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <BudgetCard item={item} />}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No budgets set yet</Text>
            <Text style={styles.emptySubtext}>Tap + to create your first budget</Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Add Budget Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={handleCancel}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>New Budget</Text>

            <Text style={styles.fieldLabel}>Budget Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Monthly Groceries"
              placeholderTextColor="#bbb"
              value={formName}
              onChangeText={setFormName}
            />

            <Text style={styles.fieldLabel}>Budget Amount *</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor="#bbb"
              keyboardType="decimal-pad"
              value={formAmount}
              onChangeText={setFormAmount}
            />

            <Text style={styles.fieldLabel}>Category (optional)</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setCategoryPickerOpen((o) => !o)}>
              <Text style={formCategory ? styles.pickerSelected : styles.pickerPlaceholder}>
                {formCategory ?? 'Select category...'}
              </Text>
              <Text style={styles.pickerChevron}>{categoryPickerOpen ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {categoryPickerOpen && (
              <ScrollView style={styles.pickerDropdown} nestedScrollEnabled>
                <TouchableOpacity
                  style={styles.pickerOption}
                  onPress={() => { setFormCategory(null); setCategoryPickerOpen(false); }}>
                  <Text style={styles.pickerOptionText}>None</Text>
                </TouchableOpacity>
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

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, (!formName.trim() || !formAmount.trim()) && styles.submitButtonDisabled]}
                onPress={handleAdd}>
                <Text style={styles.submitButtonText}>Create Budget</Text>
              </TouchableOpacity>
            </View>
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
  summaryHeader: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 14,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginVertical: 2,
  },
  summaryLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
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
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  cardTitleRow: {
    flex: 1,
    marginRight: 8,
  },
  cardName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#ede9fe',
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  categoryBadgeText: {
    fontSize: 11,
    color: '#5b21b6',
    fontWeight: '600',
  },
  cardPercent: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4f46e5',
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#f0f0f5',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerCenter: {
    alignItems: 'center',
  },
  footerRight: {
    alignItems: 'flex-end',
  },
  footerLabel: {
    fontSize: 11,
    color: '#aaa',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  footerValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  footerValueRed: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
  },
  overText: {
    color: '#ef4444',
  },
  safeText: {
    color: '#10b981',
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
  // Modal
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
  pickerPlaceholder: {
    fontSize: 15,
    color: '#bbb',
  },
  pickerChevron: {
    fontSize: 11,
    color: '#888',
  },
  pickerDropdown: {
    maxHeight: 180,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  pickerOption: {
    paddingHorizontal: 14,
    paddingVertical: 12,
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

export default BudgetsScreen;
