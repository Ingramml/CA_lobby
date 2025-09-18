# Mock Data for CA Lobby Proof of Concept

This directory contains realistic fake data for demonstrating the CA Lobby Next.js application functionality.

## Data Structure

The mock data simulates California lobbying disclosure data with the following tables:

### Core Tables
- `lobbying_payments.json` - Payment records from lobbying entities to lobbyists
- `lobby_associations.json` - Registered lobbying associations and organizations
- `lobbyists.json` - Individual registered lobbyists
- `clients.json` - Clients who hire lobbying services
- `payment_categories.json` - Categories and subcategories for payments

### Analytical Tables
- `quarterly_trends.json` - Aggregated quarterly lobbying activity
- `top_spenders.json` - Highest spending entities by period
- `activity_summary.json` - Monthly activity summaries

## Data Characteristics

**Volume**: ~10,000 records across all tables
**Time Range**: 2020-2024 (5 years of historical data)
**Categories**: Healthcare, Technology, Energy, Finance, Real Estate, etc.
**Geographic**: California-focused with realistic entity names

## Usage

This data is designed to:
1. Demonstrate dashboard functionality with realistic trends
2. Test data visualization components with meaningful patterns
3. Validate search and filtering capabilities
4. Show role-based access control with different user types
5. Test data export and analysis features

## Data Generation

All data is algorithmically generated to:
- Follow realistic California lobbying patterns
- Include seasonal trends and growth patterns
- Maintain referential integrity between tables
- Provide diverse payment amounts and categories
- Include realistic entity names and addresses

**Note**: This is entirely fictional data created for demonstration purposes only.