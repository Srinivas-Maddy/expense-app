import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

type MonthData = {
  month: string;
  income: number;
  expenses: number;
};

const TREND_DATA: MonthData[] = [
  { month: 'Oct 2025', income: 4800, expenses: 3200 },
  { month: 'Nov 2025', income: 5100, expenses: 3650 },
  { month: 'Dec 2025', income: 6200, expenses: 4900 },
  { month: 'Jan 2026', income: 5000, expenses: 2800 },
  { month: 'Feb 2026', income: 5200, expenses: 3100 },
  { month: 'Mar 2026', income: 5200, expenses: 2750 },
];

type Props = {
  navigation?: any;
};

type ViewMode = 'chart' | 'list';

const BAR_MAX_HEIGHT = 120;

const TrendsScreen: React.FC<Props> = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('chart');

  const maxValue = Math.max(...TREND_DATA.flatMap((d) => [d.income, d.expenses]));

  const avgIncome = TREND_DATA.reduce((s, d) => s + d.income, 0) / TREND_DATA.length;
  const avgExpenses = TREND_DATA.reduce((s, d) => s + d.expenses, 0) / TREND_DATA.length;
  const avgSavings = avgIncome - avgExpenses;

  const latestMonth = TREND_DATA[TREND_DATA.length - 1];
  const prevMonth = TREND_DATA[TREND_DATA.length - 2];
  const expenseTrend = latestMonth.expenses - prevMonth.expenses;
  const incomeTrend = latestMonth.income - prevMonth.income;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.heading}>Trends</Text>
        <Text style={styles.subheading}>Last 6 months</Text>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { backgroundColor: '#ecfdf5' }]}>
          <Text style={styles.summaryLabel}>Avg Income</Text>
          <Text style={[styles.summaryValue, { color: '#065f46' }]}>${avgIncome.toFixed(0)}</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: '#fef2f2' }]}>
          <Text style={styles.summaryLabel}>Avg Expenses</Text>
          <Text style={[styles.summaryValue, { color: '#991b1b' }]}>${avgExpenses.toFixed(0)}</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: '#eff6ff' }]}>
          <Text style={styles.summaryLabel}>Avg Savings</Text>
          <Text style={[styles.summaryValue, { color: '#1e40af' }]}>${avgSavings.toFixed(0)}</Text>
        </View>
      </View>

      {/* MoM Change */}
      <View style={styles.momRow}>
        <View style={styles.momItem}>
          <Text style={styles.momLabel}>Income vs last month</Text>
          <Text style={[styles.momValue, { color: incomeTrend >= 0 ? '#10b981' : '#ef4444' }]}>
            {incomeTrend >= 0 ? '+' : ''}${incomeTrend.toFixed(0)}
          </Text>
        </View>
        <View style={styles.momDivider} />
        <View style={styles.momItem}>
          <Text style={styles.momLabel}>Expenses vs last month</Text>
          <Text style={[styles.momValue, { color: expenseTrend <= 0 ? '#10b981' : '#ef4444' }]}>
            {expenseTrend >= 0 ? '+' : ''}${expenseTrend.toFixed(0)}
          </Text>
        </View>
      </View>

      {/* Toggle */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'chart' && styles.toggleButtonActive]}
          onPress={() => setViewMode('chart')}>
          <Text style={[styles.toggleText, viewMode === 'chart' && styles.toggleTextActive]}>
            Bar Chart
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'list' && styles.toggleButtonActive]}
          onPress={() => setViewMode('list')}>
          <Text style={[styles.toggleText, viewMode === 'list' && styles.toggleTextActive]}>
            Table
          </Text>
        </TouchableOpacity>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
          <Text style={styles.legendLabel}>Income</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
          <Text style={styles.legendLabel}>Expenses</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#4f46e5' }]} />
          <Text style={styles.legendLabel}>Net</Text>
        </View>
      </View>

      {/* Chart View */}
      {viewMode === 'chart' && (
        <View style={styles.chartContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chartInner}>
              {TREND_DATA.map((d) => {
                const incomeHeight = (d.income / maxValue) * BAR_MAX_HEIGHT;
                const expenseHeight = (d.expenses / maxValue) * BAR_MAX_HEIGHT;
                const net = d.income - d.expenses;
                return (
                  <View key={d.month} style={styles.barGroup}>
                    <View style={styles.barsRow}>
                      {/* Income bar */}
                      <View style={styles.barWrapper}>
                        <Text style={styles.barValueLabel}>${(d.income / 1000).toFixed(1)}k</Text>
                        <View
                          style={[
                            styles.bar,
                            { height: incomeHeight, backgroundColor: '#10b981' },
                          ]}
                        />
                      </View>
                      {/* Expense bar */}
                      <View style={styles.barWrapper}>
                        <Text style={styles.barValueLabel}>${(d.expenses / 1000).toFixed(1)}k</Text>
                        <View
                          style={[
                            styles.bar,
                            { height: expenseHeight, backgroundColor: '#ef4444' },
                          ]}
                        />
                      </View>
                    </View>
                    {/* Net indicator */}
                    <View style={[styles.netChip, { backgroundColor: net >= 0 ? '#ecfdf5' : '#fef2f2' }]}>
                      <Text style={[styles.netChipText, { color: net >= 0 ? '#065f46' : '#991b1b' }]}>
                        {net >= 0 ? '+' : ''}${(net / 1000).toFixed(1)}k
                      </Text>
                    </View>
                    <Text style={styles.barMonth}>{d.month.split(' ')[0]}</Text>
                    <Text style={styles.barYear}>{d.month.split(' ')[1]}</Text>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
      )}

      {/* List/Table View */}
      {viewMode === 'list' && (
        <View style={styles.tableContainer}>
          {/* Table Header */}
          <View style={[styles.tableRow, styles.tableHeaderRow]}>
            <Text style={[styles.tableCell, styles.tableHeaderCell, { flex: 1.4 }]}>Month</Text>
            <Text style={[styles.tableCell, styles.tableHeaderCell]}>Income</Text>
            <Text style={[styles.tableCell, styles.tableHeaderCell]}>Expenses</Text>
            <Text style={[styles.tableCell, styles.tableHeaderCell]}>Net</Text>
          </View>
          {TREND_DATA.slice().reverse().map((d, idx) => {
            const net = d.income - d.expenses;
            const isEven = idx % 2 === 0;
            return (
              <View key={d.month} style={[styles.tableRow, isEven && styles.tableRowEven]}>
                <Text style={[styles.tableCell, styles.tableCellMonth, { flex: 1.4 }]}>{d.month}</Text>
                <Text style={[styles.tableCell, styles.tableCellIncome]}>${d.income.toLocaleString()}</Text>
                <Text style={[styles.tableCell, styles.tableCellExpense]}>${d.expenses.toLocaleString()}</Text>
                <Text style={[styles.tableCell, net >= 0 ? styles.tableCellPositive : styles.tableCellNegative]}>
                  {net >= 0 ? '+' : ''}${net.toLocaleString()}
                </Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Insight Card */}
      <View style={styles.insightCard}>
        <Text style={styles.insightTitle}>Insight</Text>
        <Text style={styles.insightText}>
          Your average savings rate is{' '}
          <Text style={styles.insightHighlight}>
            {Math.round((avgSavings / avgIncome) * 100)}%
          </Text>{' '}
          over the past 6 months. Keep it up!
        </Text>
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
    paddingBottom: 48,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
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
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 10,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  momRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  momItem: {
    flex: 1,
    alignItems: 'center',
  },
  momDivider: {
    width: 1,
    backgroundColor: '#f0f0f5',
  },
  momLabel: {
    fontSize: 11,
    color: '#888',
    marginBottom: 4,
    textAlign: 'center',
  },
  momValue: {
    fontSize: 17,
    fontWeight: '700',
  },
  toggleRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: '#e5e7eb',
    borderRadius: 10,
    padding: 3,
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
  },
  toggleTextActive: {
    color: '#1a1a2e',
  },
  legend: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 16,
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    fontSize: 12,
    color: '#555',
    fontWeight: '500',
  },
  chartContainer: {
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 16,
  },
  chartInner: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    paddingBottom: 4,
  },
  barGroup: {
    alignItems: 'center',
    width: 72,
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    height: BAR_MAX_HEIGHT + 24,
    justifyContent: 'center',
  },
  barWrapper: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: BAR_MAX_HEIGHT + 24,
  },
  barValueLabel: {
    fontSize: 9,
    color: '#888',
    marginBottom: 3,
  },
  bar: {
    width: 22,
    borderRadius: 4,
    minHeight: 4,
  },
  netChip: {
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 6,
    marginBottom: 4,
  },
  netChipText: {
    fontSize: 10,
    fontWeight: '700',
  },
  barMonth: {
    fontSize: 11,
    fontWeight: '600',
    color: '#444',
    marginTop: 2,
  },
  barYear: {
    fontSize: 10,
    color: '#aaa',
  },
  tableContainer: {
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 16,
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  tableHeaderRow: {
    backgroundColor: '#f8f8fc',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableRowEven: {
    backgroundColor: '#fafafa',
  },
  tableCell: {
    flex: 1,
    fontSize: 13,
    color: '#1a1a2e',
    textAlign: 'right',
  },
  tableHeaderCell: {
    fontSize: 11,
    fontWeight: '700',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  tableCellMonth: {
    textAlign: 'left',
    fontWeight: '600',
    color: '#333',
  },
  tableCellIncome: {
    color: '#065f46',
    fontWeight: '600',
  },
  tableCellExpense: {
    color: '#991b1b',
    fontWeight: '600',
  },
  tableCellPositive: {
    color: '#10b981',
    fontWeight: '700',
  },
  tableCellNegative: {
    color: '#ef4444',
    fontWeight: '700',
  },
  insightCard: {
    marginHorizontal: 16,
    backgroundColor: '#ede9fe',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#7c3aed',
  },
  insightTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#5b21b6',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  insightText: {
    fontSize: 14,
    color: '#4c1d95',
    lineHeight: 20,
  },
  insightHighlight: {
    fontWeight: '700',
  },
});

export default TrendsScreen;
