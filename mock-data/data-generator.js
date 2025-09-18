/**
 * Mock Data Generator for CA Lobby Proof of Concept
 *
 * This script generates realistic fake data for demonstrating
 * the CA Lobby Next.js application functionality.
 */

// Configuration
const DATA_CONFIG = {
  startYear: 2020,
  endYear: 2024,
  basePaymentAmount: 25000,
  maxPaymentAmount: 500000,
  seasonalityFactor: 0.3,
  growthRate: 0.12,
  categories: [
    { name: 'Technology & Innovation', weight: 0.15, avgAmount: 75000 },
    { name: 'Healthcare', weight: 0.18, avgAmount: 85000 },
    { name: 'Energy & Environment', weight: 0.14, avgAmount: 95000 },
    { name: 'Real Estate & Housing', weight: 0.16, avgAmount: 120000 },
    { name: 'Financial Services', weight: 0.12, avgAmount: 65000 },
    { name: 'Transportation', weight: 0.10, avgAmount: 80000 },
    { name: 'Agriculture', weight: 0.08, avgAmount: 70000 },
    { name: 'Education', weight: 0.07, avgAmount: 45000 }
  ]
};

// Sample data pools
const SAMPLE_DATA = {
  lobbyistNames: [
    'Sarah Chen', 'Michael Rodriguez', 'Jennifer Walsh', 'David Kim',
    'Amanda Foster', 'Robert Thompson', 'Lisa Patel', 'Carlos Mendoza',
    'Rachel Green', 'Thomas Wilson', 'Maria Gonzalez', 'James Park',
    'Nicole Brown', 'Steven Lee', 'Jessica Davis', 'Daniel Martinez'
  ],

  clientNames: [
    'TechForward Inc.', 'Golden State Healthcare Network', 'Pacific Energy Solutions',
    'Bay Area Financial Group', 'California Housing Developers', 'Central Valley Agriculture Corp',
    'Education Excellence Foundation', 'Transportation Innovation Group',
    'Environmental Defense Alliance', 'California Manufacturing Alliance',
    'Silicon Valley Innovation Group', 'Universal Healthcare Network',
    'Green Energy Coalition', 'Financial Technology Association'
  ],

  counties: [
    'Los Angeles', 'San Francisco', 'Orange', 'Santa Clara', 'Sacramento',
    'Alameda', 'San Diego', 'Riverside', 'Fresno', 'Marin', 'Contra Costa'
  ],

  legislativeTopics: [
    'SB 1001', 'AB 2891', 'SB 770', 'AB 1400', 'SB 100', 'AB 1139',
    'AB 5472', 'SB 298', 'SB 9', 'AB 2011', 'AB 1668', 'SB 606',
    'AB 1840', 'SB 1', 'AB 2847', 'AB 32', 'SB 350', 'AB 617', 'SB 54'
  ]
};

/**
 * Generate random payment amount based on category and seasonal factors
 */
function generatePaymentAmount(category, quarter, year) {
  const categoryData = DATA_CONFIG.categories.find(c => c.name === category);
  const baseAmount = categoryData ? categoryData.avgAmount : DATA_CONFIG.basePaymentAmount;

  // Apply seasonal variation (Q2 and Q4 typically higher)
  const seasonalMultiplier = quarter === 'Q2' || quarter === 'Q4' ? 1.2 : 0.9;

  // Apply year-over-year growth
  const yearsSinceBase = year - DATA_CONFIG.startYear;
  const growthMultiplier = Math.pow(1 + DATA_CONFIG.growthRate, yearsSinceBase);

  // Add random variation (±30%)
  const randomVariation = 0.7 + Math.random() * 0.6;

  return Math.round(baseAmount * seasonalMultiplier * growthMultiplier * randomVariation);
}

/**
 * Generate random date within a quarter
 */
function generateQuarterDate(quarter, year) {
  const quarterMonths = {
    'Q1': [0, 1, 2], // Jan, Feb, Mar
    'Q2': [3, 4, 5], // Apr, May, Jun
    'Q3': [6, 7, 8], // Jul, Aug, Sep
    'Q4': [9, 10, 11] // Oct, Nov, Dec
  };

  const months = quarterMonths[quarter];
  const month = months[Math.floor(Math.random() * months.length)];
  const day = Math.floor(Math.random() * 28) + 1; // Avoid month-end issues

  return new Date(year, month, day).toISOString().split('T')[0];
}

/**
 * Select random items from an array
 */
function selectRandom(array, count = 1) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return count === 1 ? shuffled[0] : shuffled.slice(0, count);
}

/**
 * Generate comprehensive lobbying payment data
 */
function generateLobbyingPayments(count = 1000) {
  const payments = [];

  for (let i = 1; i <= count; i++) {
    const year = DATA_CONFIG.startYear + Math.floor(Math.random() * (DATA_CONFIG.endYear - DATA_CONFIG.startYear + 1));
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    const quarter = selectRandom(quarters);
    const category = selectRandom(DATA_CONFIG.categories.map(c => c.name));

    const payment = {
      id: `LP${String(i).padStart(3, '0')}`,
      payment_date: generateQuarterDate(quarter, year),
      quarter: `${quarter} ${year}`,
      year: year,
      lobbyist_id: `LOB${String(Math.floor(Math.random() * 50) + 1).padStart(3, '0')}`,
      lobbyist_name: selectRandom(SAMPLE_DATA.lobbyistNames),
      client_id: `CLI${String(Math.floor(Math.random() * 100) + 1).padStart(3, '0')}`,
      client_name: selectRandom(SAMPLE_DATA.clientNames),
      association_id: `ASS${String(Math.floor(Math.random() * 30) + 1).padStart(3, '0')}`,
      association_name: `${category} Association`,
      payment_amount: generatePaymentAmount(category, quarter, year),
      payment_category: category,
      subcategory: `${category} Subcategory`,
      description: `Advocacy for ${category.toLowerCase()} policy initiatives`,
      legislative_topics: selectRandom(SAMPLE_DATA.legislativeTopics, 3),
      county: selectRandom(SAMPLE_DATA.counties),
      city: selectRandom(SAMPLE_DATA.counties), // Simplified
      status: Math.random() > 0.05 ? 'Active' : 'Under Review'
    };

    payments.push(payment);
  }

  return payments.sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date));
}

/**
 * Generate quarterly trend data
 */
function generateQuarterlyTrends() {
  const trends = [];
  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];

  for (let year = DATA_CONFIG.startYear; year <= DATA_CONFIG.endYear; year++) {
    for (let q = 0; q < quarters.length; q++) {
      if (year === DATA_CONFIG.endYear && q > 2) break; // Only Q1-Q3 for 2024

      const quarter = quarters[q];
      const baseAmount = 1000000;
      const yearGrowth = Math.pow(1.15, year - DATA_CONFIG.startYear);
      const seasonalFactor = quarter === 'Q2' || quarter === 'Q4' ? 1.2 : 0.9;
      const randomFactor = 0.9 + Math.random() * 0.2;

      const totalPayments = Math.round(baseAmount * yearGrowth * seasonalFactor * randomFactor);

      trends.push({
        quarter: `${quarter} ${year}`,
        year: year,
        total_payments: totalPayments,
        total_lobbyists: Math.floor(25 + (year - DATA_CONFIG.startYear) * 4 + Math.random() * 10),
        total_clients: Math.floor(100 + (year - DATA_CONFIG.startYear) * 15 + Math.random() * 30),
        total_associations: Math.floor(15 + (year - DATA_CONFIG.startYear) * 2 + Math.random() * 5),
        avg_payment: Math.round(totalPayments / (Math.floor(Math.random() * 20) + 30)),
        growth_rate: year > DATA_CONFIG.startYear ?
          ((totalPayments - 800000) / 800000 * 100).toFixed(1) : 0,
        legislative_focus: selectRandom([
          'Housing Crisis Response', 'Climate Change Mitigation', 'Healthcare Access',
          'Transportation Infrastructure', 'Technology Regulation', 'Education Funding',
          'Economic Development', 'Environmental Standards'
        ], 5)
      });
    }
  }

  return trends.reverse(); // Most recent first
}

/**
 * Main data generation function
 */
function generateAllData() {
  console.log('🚀 Generating comprehensive CA Lobby mock data...');

  const data = {
    lobbying_payments: generateLobbyingPayments(500),
    quarterly_trends: generateQuarterlyTrends(),
    timestamp: new Date().toISOString(),
    metadata: {
      generator: 'CA Lobby Mock Data Generator v1.0',
      purpose: 'Proof of Concept Demonstration',
      total_records: 500,
      date_range: `${DATA_CONFIG.startYear}-${DATA_CONFIG.endYear}`,
      categories: DATA_CONFIG.categories.length,
      disclaimer: 'This is entirely fictional data for demonstration purposes only.'
    }
  };

  console.log(`✅ Generated ${data.lobbying_payments.length} payment records`);
  console.log(`✅ Generated ${data.quarterly_trends.length} quarterly trend records`);
  console.log(`📊 Data spans ${DATA_CONFIG.endYear - DATA_CONFIG.startYear + 1} years`);
  console.log(`🎯 ${DATA_CONFIG.categories.length} categories represented`);

  return data;
}

// Export for Node.js usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    generateAllData,
    generateLobbyingPayments,
    generateQuarterlyTrends,
    DATA_CONFIG,
    SAMPLE_DATA
  };
}

// Browser usage
if (typeof window !== 'undefined') {
  window.CALobbyDataGenerator = {
    generateAllData,
    generateLobbyingPayments,
    generateQuarterlyTrends
  };
}