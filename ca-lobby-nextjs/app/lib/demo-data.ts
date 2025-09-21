/**
 * Demo data for local development
 * This file provides sample California lobbying data when BigQuery is not available
 * Now using comprehensive mock data from the mock-data folder
 */

import lobbyingPayments from '../../../../mock-data/lobbying_payments.json'
import lobbyAssociations from '../../../../mock-data/lobby_associations.json'
import quarterlyTrends from '../../../../mock-data/quarterly_trends.json'
import dashboardSummary from '../../../../mock-data/dashboard_summary.json'
import testUsers from '../../../../mock-data/test_users.json'

export const mockData = {
  lobbyingPayments,
  lobbyAssociations,
  quarterlyTrends,
  dashboardSummary,
  testUsers
}

export const DEMO_LOBBYING_DATA = mockData.lobbyingPayments;
export const DEMO_PAYMENT_DATA = mockData.lobbyingPayments.map(payment => ({
  payment_id: payment.id,
  lobbyist_name: payment.lobbyist_name,
  amount: payment.payment_amount,
  payment_date: payment.payment_date,
  payment_type: 'Monthly Retainer',
  client_name: payment.client_name
}));
export const DEMO_ASSOCIATION_DATA = mockData.lobbyAssociations;

/**
 * Simulate a BigQuery response with demo data
 */
export function getDemoData(queryType: string = 'lobbying'): any[] {
  switch (queryType.toLowerCase()) {
    case 'payment':
    case 'payments':
      return DEMO_PAYMENT_DATA;
    case 'association':
    case 'associations':
      return DEMO_ASSOCIATION_DATA;
    case 'trends':
    case 'quarterly':
      return mockData.quarterlyTrends;
    case 'dashboard':
    case 'summary':
      return [mockData.dashboardSummary];
    case 'users':
    case 'testusers':
      return mockData.testUsers;
    case 'lobbying':
    case 'lobbyist':
    default:
      return DEMO_LOBBYING_DATA;
  }
}

/**
 * Parse query to determine what type of demo data to return
 */
export function parseQueryForDemoData(query: string): any[] {
  const queryLower = query.toLowerCase();

  if (queryLower.includes('payment')) {
    return getDemoData('payment');
  } else if (queryLower.includes('association')) {
    return getDemoData('association');
  } else if (queryLower.includes('trend') || queryLower.includes('quarterly')) {
    return getDemoData('trends');
  } else if (queryLower.includes('dashboard') || queryLower.includes('summary')) {
    return getDemoData('dashboard');
  } else {
    return getDemoData('lobbying');
  }
}

/**
 * Filter demo data based on common query parameters
 */
export function filterDemoData(data: any[], filters: {
  category?: string;
  startDate?: string;
  endDate?: string;
  county?: string;
  minAmount?: number;
  maxAmount?: number;
} = {}): any[] {
  let filtered = [...data];

  if (filters.category) {
    filtered = filtered.filter(item =>
      item.payment_category?.toLowerCase() === filters.category!.toLowerCase() ||
      item.category?.toLowerCase() === filters.category!.toLowerCase()
    );
  }

  if (filters.startDate && filters.endDate) {
    filtered = filtered.filter(item => {
      const itemDate = item.payment_date || item.date_reported;
      return itemDate >= filters.startDate! && itemDate <= filters.endDate!;
    });
  }

  if (filters.county) {
    filtered = filtered.filter(item =>
      item.county?.toLowerCase() === filters.county!.toLowerCase()
    );
  }

  if (filters.minAmount) {
    filtered = filtered.filter(item =>
      (item.payment_amount || item.amount || 0) >= filters.minAmount!
    );
  }

  if (filters.maxAmount) {
    filtered = filtered.filter(item =>
      (item.payment_amount || item.amount || 0) <= filters.maxAmount!
    );
  }

  return filtered;
}

/**
 * Check if we should use demo data
 */
export function shouldUseDemoData(): boolean {
  return !process.env.GOOGLE_CLOUD_PROJECT_ID ||
         process.env.USE_DEMO_DATA === 'true' ||
         process.env.NODE_ENV === 'development';
}