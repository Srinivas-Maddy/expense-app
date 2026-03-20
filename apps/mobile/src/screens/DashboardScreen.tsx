import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

type SummaryCardProps = {
  title: string;
  amount: string;
  color: string;
  textColor: string;
};

const SummaryCard: React.FC<SummaryCardProps> = ({ title, amount, color, textColor }) => (
  <View style={[styles.card, { backgroundColor: color }]}>
    <Text style={[styles.cardTitle, { color: textColor }]}>{title}</Text>
    <Text style={[styles.cardAmount, { color: textColor }]}>{amount}</Text>
  </View>
);

type Props = {
  navigation?: any;
};

const DashboardScreen: React.FC<Props> = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Dashboard</Text>
      <Text style={styles.period}>March 2026</Text>

      <View style={styles.cardsRow}>
        <SummaryCard title="Balance" amount="$2,450.00" color="#4f46e5" textColor="#fff" />
      </View>

      <View style={styles.cardsRow}>
        <SummaryCard title="Income" amount="$5,200.00" color="#ecfdf5" textColor="#065f46" />
        <SummaryCard title="Expenses" amount="$2,750.00" color="#fef2f2" textColor="#991b1b" />
      </View>

      <Text style={styles.sectionTitle}>Recent Transactions</Text>

      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>No recent transactions</Text>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>+</Text>
            <Text style={styles.actionLabel}>Add Expense</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.actionButtonGreen]}>
            <Text style={styles.actionIcon}>+</Text>
            <Text style={styles.actionLabel}>Add Income</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    paddingBottom: 40,
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  period: {
    fontSize: 14,
    color: '#888',
    marginBottom: 20,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  card: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
    opacity: 0.8,
  },
  cardAmount: {
    fontSize: 22,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1a1a2e',
    marginTop: 24,
    marginBottom: 12,
  },
  placeholder: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 32,
    alignItems: 'center',
  },
  placeholderText: {
    color: '#bbb',
    fontSize: 14,
  },
  quickActions: {
    marginTop: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#4f46e5',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  actionButtonGreen: {
    backgroundColor: '#10b981',
  },
  actionIcon: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 24,
  },
  actionLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
});

export default DashboardScreen;
