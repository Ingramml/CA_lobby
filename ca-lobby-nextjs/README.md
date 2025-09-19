# CA Lobby Dashboard - Next.js 14

A modern, Vercel-optimized Next.js 14 application for California Lobbying Data Analysis with BigQuery integration.

## 🚀 Features

- **Next.js 14** with App Router and Server Components
- **TypeScript** with strict configuration and path mapping
- **Tailwind CSS** for responsive design
- **BigQuery Integration** for data operations
- **Clerk.dev Authentication** with role-based access control
- **ShadCN/ui Components** for consistent UI
- **Vercel Analytics & Speed Insights** integration
- **ESLint & TypeScript** for code quality
- **API Routes** for BigQuery operations (CRUD)

## 📁 Project Structure

```
ca-lobby-nextjs/
├── app/
│   ├── (dashboard)/           # Dashboard pages with route grouping
│   │   ├── page.tsx          # Main dashboard
│   │   ├── lobbying-data/    # Data exploration pages
│   │   └── reports/          # Report generation pages
│   ├── api/                  # API routes
│   │   ├── bigquery/         # BigQuery operations
│   │   │   ├── download/     # Data download endpoints
│   │   │   ├── upload/       # Data upload endpoints
│   │   │   └── query/        # Query execution endpoints
│   │   ├── health/           # Health check endpoint
│   │   └── auth/             # Authentication endpoints
│   ├── components/           # Reusable components
│   │   ├── ui/               # ShadCN UI components
│   │   ├── charts/           # Chart components
│   │   └── data-tables/      # Data table components
│   ├── lib/                  # Utility libraries
│   │   ├── bigquery-client.ts # BigQuery client configuration
│   │   ├── auth.ts           # Authentication utilities
│   │   └── utils.ts          # General utilities
│   ├── globals.css           # Global styles
│   └── layout.tsx            # Root layout
├── middleware.ts             # Authentication middleware
├── next.config.js           # Next.js configuration
└── package.json             # Dependencies and scripts
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18.x or higher
- Google Cloud Project with BigQuery API enabled
- Clerk.dev account for authentication

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ca-lobby-nextjs
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env.local
   ```

   Fill in the following environment variables:

   ```env
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key

   # Google Cloud Configuration
   GOOGLE_CLOUD_PROJECT_ID=your-project-id
   GOOGLE_CLOUD_KEY_FILE=path/to/service-account-key.json
   BIGQUERY_DATASET=ca_lobby_data
   ```

4. **Google Cloud Setup**
   - Create a service account with BigQuery permissions
   - Download the service account key JSON file
   - Set the path in `GOOGLE_CLOUD_KEY_FILE` environment variable

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Configuration

### BigQuery Integration

The application includes a comprehensive BigQuery client (`/app/lib/bigquery-client.ts`) with the following features:

- **Query execution** with parameterized queries
- **Data upload** from CSV/JSON files
- **Data download** with filtering and format options
- **Schema management** and table operations
- **Connection health checks**

### Authentication & Authorization

Role-based access control with three user roles:

- **Admin**: Full access to all features
- **Analyst**: Read/write access to data and reports
- **Viewer**: Read-only access to data and reports

### API Endpoints

- `GET /api/health` - System health check
- `POST /api/bigquery/query` - Execute BigQuery queries
- `POST /api/bigquery/upload` - Upload data to BigQuery
- `GET /api/bigquery/download` - Download data from BigQuery

## 🚀 Deployment

### Vercel Deployment

1. **Connect to Vercel**
   ```bash
   npm i -g vercel
   vercel
   ```

2. **Set environment variables in Vercel dashboard**
   - Add all required environment variables
   - Upload Google Cloud service account key

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Environment Variables for Production

Ensure all environment variables are set in your deployment platform:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `GOOGLE_CLOUD_PROJECT_ID`
- `GOOGLE_CLOUD_KEY_FILE`
- `BIGQUERY_DATASET`

## 🧪 Development

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Code Quality

The project enforces strict TypeScript and ESLint rules:

- Strict TypeScript configuration
- No unused variables or parameters
- Explicit return types where beneficial
- Consistent code formatting

## 📊 BigQuery Operations

### Query Execution

```typescript
import { executeQuery } from '@/lib/bigquery-client'

const result = await executeQuery({
  query: 'SELECT * FROM `project.dataset.table` LIMIT 100',
  parameters: {},
  maxResults: 1000
})
```

### Data Upload

```typescript
import { uploadToBigQuery } from '@/lib/bigquery-client'

const result = await uploadToBigQuery({
  tableName: 'lobbying_activities',
  data: csvData,
  writeDisposition: 'WRITE_APPEND'
})
```

### Data Download

```typescript
import { downloadFromBigQuery } from '@/lib/bigquery-client'

const result = await downloadFromBigQuery(
  'lobbying_activities',
  { year: 2024 },
  1000
)
```

## 🔒 Security Features

- **Authentication middleware** protecting all routes
- **Role-based access control** for different user types
- **SQL injection protection** in query endpoints
- **Environment variable validation**
- **CORS configuration** for API routes

## 📈 Performance Optimizations

- **Server Components** for optimal performance
- **Static optimization** where possible
- **Image optimization** with Next.js Image component
- **Bundle analysis** and code splitting
- **Vercel Analytics** integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the documentation
- Review the API endpoints at `/api/health`

---

Built with ❤️ using Next.js 14, TypeScript, and BigQuery