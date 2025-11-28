/**
 * Manual Adapter
 * 
 * In-memory tracking for manual/CSV-based pricing experiments.
 * Useful for demos, testing, and small-scale deployments.
 */

import {
  SignalData,
  ConversionData,
  DateRange,
  UsageMetrics,
  TenantMode,
} from '../core/types';
import { BaseBillingAdapter } from './adapter';

interface ManualRecord {
  type: 'signal' | 'conversion';
  data: SignalData | ConversionData;
  timestamp: Date;
}

/**
 * Manual/In-memory billing adapter implementation
 */
export class ManualAdapter extends BaseBillingAdapter {
  private records: ManualRecord[] = [];

  constructor(tenantId: string, mode: TenantMode = 'managed') {
    super(tenantId, mode);
  }

  /**
   * Emit a signal - stored in memory
   */
  async emitSignal(data: SignalData): Promise<void> {
    this.validateSignalData(data);

    this.records.push({
      type: 'signal',
      data: { ...data },
      timestamp: new Date(),
    });
  }

  /**
   * Track a conversion - stored in memory
   */
  async trackConversion(data: ConversionData): Promise<void> {
    this.validateConversionData(data);

    this.records.push({
      type: 'conversion',
      data: { ...data },
      timestamp: new Date(),
    });
  }

  /**
   * Get usage metrics from in-memory records
   */
  async getUsageMetrics(dateRange: DateRange): Promise<UsageMetrics> {
    const filteredRecords = this.records.filter(
      r => r.timestamp >= dateRange.start && r.timestamp <= dateRange.end
    );

    const signals = filteredRecords.filter(r => r.type === 'signal');
    const conversions = filteredRecords.filter(r => r.type === 'conversion');

    let totalRevenue = 0;
    const byExperiment: Record<string, { signals: number; conversions: number; revenue: number }> = {};

    for (const record of filteredRecords) {
      const experimentId = 'experimentId' in record.data 
        ? (record.data as SignalData | ConversionData).experimentId 
        : 'unknown';

      if (!byExperiment[experimentId]) {
        byExperiment[experimentId] = { signals: 0, conversions: 0, revenue: 0 };
      }

      if (record.type === 'signal') {
        byExperiment[experimentId].signals++;
      } else if (record.type === 'conversion') {
        const conversionData = record.data as ConversionData;
        byExperiment[experimentId].conversions++;
        byExperiment[experimentId].revenue += conversionData.revenue;
        totalRevenue += conversionData.revenue;
      }
    }

    return {
      totalSignals: signals.length,
      totalConversions: conversions.length,
      totalRevenue,
      byExperiment,
    };
  }

  /**
   * Get all records (for export/debugging)
   */
  getAllRecords(): ManualRecord[] {
    return [...this.records];
  }

  /**
   * Clear all records
   */
  clearRecords(): void {
    this.records = [];
  }

  /**
   * Export records as CSV
   */
  exportToCSV(): string {
    const headers = [
      'type',
      'timestamp',
      'orderId',
      'experimentId',
      'variantId',
      'eventType',
      'revenue',
      'currency',
    ];

    const rows = this.records.map(record => {
      const data = record.data;
      return [
        record.type,
        record.timestamp.toISOString(),
        data.orderId,
        data.experimentId,
        data.variantId,
        'eventType' in data ? (data as SignalData).eventType : 'conversion',
        'revenue' in data ? (data as ConversionData).revenue.toString() : '',
        'currency' in data ? ((data as ConversionData).currency || 'USD') : '',
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }

  /**
   * Import records from CSV data
   */
  importFromCSV(csvData: string): number {
    const lines = csvData.trim().split('\n');
    if (lines.length < 2) return 0;

    // Skip header row
    let imported = 0;
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',');
      if (parts.length < 6) continue;

      const [type, timestamp, orderId, experimentId, variantId, eventType, revenue, currency] = parts;

      if (type === 'signal') {
        this.records.push({
          type: 'signal',
          data: {
            orderId,
            experimentId,
            variantId,
            eventType: eventType as 'view' | 'conversion' | 'custom',
            timestamp: new Date(timestamp),
          },
          timestamp: new Date(timestamp),
        });
        imported++;
      } else if (type === 'conversion') {
        this.records.push({
          type: 'conversion',
          data: {
            orderId,
            experimentId,
            variantId,
            revenue: parseFloat(revenue) || 0,
            currency: currency || 'USD',
            timestamp: new Date(timestamp),
          },
          timestamp: new Date(timestamp),
        });
        imported++;
      }
    }

    return imported;
  }
}

/**
 * Factory function for creating manual adapters
 */
export function createManualAdapter(
  tenantId: string,
  mode: TenantMode = 'managed'
): ManualAdapter {
  return new ManualAdapter(tenantId, mode);
}
