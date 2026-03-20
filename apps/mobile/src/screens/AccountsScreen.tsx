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

type AccountType = 'checking' | 'savings' | 'credit' | 'investment' | 'cash' | 'other';

type Account = {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  institution: string;
};

const ACCOUNT_TYPES: { value: AccountType; label: string }[] = [
  { value: 'checking', label: 'Checking' },
  { value: 'savings', label: 'Savings' },
  { value: 'credit', label: 'Credit Card' },
  { value: 'investment', label: 'Investment' },
  { value: 'cash', label: 'Cash' },
  { value: 'other', label: 'Other' },
];

const TYPE_STYLES: Record<AccountType, { bg: string; text: string; icon: string }> = {
  checking: { bg: '#dbeafe', text: '#1e40af', icon: '🏦' },
  savings: { bg: '#dcfce7', text: '#166534', icon: '💰' },
  credit: { bg: '#fef2f2', text: '#991b1b', icon: '💳' },
  investment: { bg: '#fef9c3', text: '#854d0e', icon: '📈' },
  cash: { bg: '#ecfdf5', text: '#065f46', icon: '💵' },
  other: { bg: '#f3f4f6', text: '#374151', icon: '🏧' },
};

const PLACEHOLDER_ACCOUNTS: Account[] = [
  { id: '1', name: 'Main Checking', type: 'checking', balance: 3240.5, institution: 'Chase Bank' },
  { id: '2', name: 'Emergency Fund', type: 'savings', balance: 8500.0, institution: 'Ally Bank' },
  { id: '3', name: 'Visa Rewards', type: 'credit', balance: -1250.75, institution: 'Capital One' },
  { id: '4', name: 'Roth IRA', type: 'investment', balance: 24600.0, institution: 'Fidelity' },
  { id: '5', name: 'Wallet Cash', type: 'cash', balance: 120.0, institution: '' },
];

type Props = {
  navigation?: any;
};

const AccountsScreen: React.FC<Props> = () => {
  const [accounts, setAccounts] = useState<Account[]>(PLACEHOLDER_ACCOUNTS);
  const [modalVisible, setModalVisible] = useState(false);
  const [formName, setFormName] = useState('');
  const [formBalance, setFormBalance] = useState('');
  const [formInstitution, setFormInstitution] = useState('');
  const [formType, setFormType] = useState<AccountType>('checking');
  const [typePickerOpen, setTypePickerOpen] = useState(false);

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
  const netWorth = accounts.filter((a) => a.type !== 'credit').reduce((s, a) => s + a.balance, 0);
  const totalDebt = Math.abs(accounts.filter((a) => a.balance < 0).reduce((s, a) => s + a.balance, 0));

  const resetForm = () => {
    setFormName('');
    setFormBalance('');
    setFormInstitution('');
    setFormType('checking');
    setTypePickerOpen(false);
  };

  const handleAdd = () => {
    if (!formName.trim() || !formBalance.trim()) return;
    const newAccount: Account = {
      id: Date.now().toString(),
      name: formName.trim(),
      type: formType,
      balance: parseFloat(formBalance) || 0,
      institution: formInstitution.trim(),
    };
    setAccounts((prev) => [newAccount, ...prev]);
    resetForm();
    setModalVisible(false);
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Remove Account', `Remove "${name}" from your accounts?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => setAccounts((prev) => prev.filter((a) => a.id !== id)) },
    ]);
  };

  const renderAccount = ({ item }: { item: Account }) => {
    const typeStyle = TYPE_STYLES[item.type];
    const typeLabel = ACCOUNT_TYPES.find((t) => t.value === item.type)?.label ?? item.type;
    const isNegative = item.balance < 0;

    return (
      <View style={styles.card}>
        <View style={styles.cardRow}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconEmoji}>{typeStyle.icon}</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>{item.name}</Text>
            {item.institution ? (
              <Text style={styles.cardInstitution}>{item.institution}</Text>
            ) : null}
          </View>
          <View style={styles.cardRight}>
            <Text style={[styles.cardBalance, isNegative && styles.balanceNegative]}>
              {isNegative ? '-' : ''}${Math.abs(item.balance).toFixed(2)}
            </Text>
            <View style={[styles.typeBadge, { backgroundColor: typeStyle.bg }]}>
              <Text style={[styles.typeBadgeText, { color: typeStyle.text }]}>{typeLabel}</Text>
            </View>
          </View>
        </View>
        <View style={styles.cardFooter}>
          <TouchableOpacity
            style={styles.removeBtn}
            onPress={() => handleDelete(item.id, item.name)}>
            <Text style={styles.removeBtnText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Total Balance Header */}
      <View style={styles.totalHeader}>
        <Text style={styles.heading}>Accounts</Text>
        <View style={styles.totalRow}>
          <View style={styles.totalItem}>
            <Text style={styles.totalLabel}>Total Balance</Text>
            <Text style={[styles.totalValue, totalBalance >= 0 ? styles.positiveText : styles.negativeText]}>
              {totalBalance >= 0 ? '' : '-'}${Math.abs(totalBalance).toFixed(2)}
            </Text>
          </View>
          <View style={styles.totalDivider} />
          <View style={styles.totalItem}>
            <Text style={styles.totalLabel}>Net Worth</Text>
            <Text style={[styles.totalValue, { color: '#4f46e5' }]}>${netWorth.toFixed(2)}</Text>
          </View>
          <View style={styles.totalDivider} />
          <View style={styles.totalItem}>
            <Text style={styles.totalLabel}>Total Debt</Text>
            <Text style={[styles.totalValue, { color: '#ef4444' }]}>${totalDebt.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={accounts}
        keyExtractor={(item) => item.id}
        renderItem={renderAccount}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No accounts added yet</Text>
            <Text style={styles.emptySubtext}>Tap + to add your first account</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Add Account Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => { resetForm(); setModalVisible(false); }}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Add Account</Text>

            <Text style={styles.fieldLabel}>Account Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Main Checking"
              placeholderTextColor="#bbb"
              value={formName}
              onChangeText={setFormName}
            />

            <Text style={styles.fieldLabel}>Account Type</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setTypePickerOpen((o) => !o)}>
              <Text style={styles.pickerSelected}>
                {ACCOUNT_TYPES.find((t) => t.value === formType)?.label}
              </Text>
              <Text style={styles.pickerChevron}>{typePickerOpen ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            {typePickerOpen && (
              <ScrollView style={styles.pickerDropdown} nestedScrollEnabled>
                {ACCOUNT_TYPES.map((t) => (
                  <TouchableOpacity
                    key={t.value}
                    style={[styles.pickerOption, formType === t.value && styles.pickerOptionActive]}
                    onPress={() => { setFormType(t.value); setTypePickerOpen(false); }}>
                    <Text style={[styles.pickerOptionText, formType === t.value && styles.pickerOptionTextActive]}>
                      {TYPE_STYLES[t.value].icon}  {t.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <Text style={styles.fieldLabel}>Current Balance *</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00 (use negative for debt)"
              placeholderTextColor="#bbb"
              keyboardType="numbers-and-punctuation"
              value={formBalance}
              onChangeText={setFormBalance}
            />

            <Text style={styles.fieldLabel}>Institution (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Chase Bank"
              placeholderTextColor="#bbb"
              value={formInstitution}
              onChangeText={setFormInstitution}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => { resetForm(); setModalVisible(false); }}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, (!formName.trim() || !formBalance.trim()) && styles.submitButtonDisabled]}
                onPress={handleAdd}>
                <Text style={styles.submitButtonText}>Add Account</Text>
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
  totalHeader: {
    backgroundColor: '#1a1a2e',
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
  totalRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 14,
  },
  totalItem: {
    flex: 1,
    alignItems: 'center',
  },
  totalDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 2,
  },
  totalLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  positiveText: {
    color: '#4ade80',
  },
  negativeText: {
    color: '#f87171',
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
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconEmoji: {
    fontSize: 22,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 2,
  },
  cardInstitution: {
    fontSize: 12,
    color: '#888',
  },
  cardRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  cardBalance: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  balanceNegative: {
    color: '#ef4444',
  },
  typeBadge: {
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 10,
  },
  removeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 7,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  removeBtnText: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '600',
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
    maxHeight: 180,
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
    marginTop: 8,
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

export default AccountsScreen;
