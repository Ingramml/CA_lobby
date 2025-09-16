# California Lobbying Transparency Web Application

This is a full-stack web application for exploring California lobbying data with advanced search, reporting, and visualization capabilities.

## Demo Features

- **Dashboard**: Real-time statistics and activity feed
- **Advanced Search**: Multi-tab search interface (Entity, Financial, Filing)
- **Reports**: Pre-built reports and custom report builder
- **Export**: Multiple format support (CSV, PDF, Excel)
- **Mock Data**: Fully functional demo without database connection

## Architecture

- **Frontend**: React 18 + TypeScript + Material-UI
- **Backend**: Python Flask API
- **Data**: Mock data for demonstration (BigQuery integration available)

## Deployment on Vercel

This application is configured for deployment on Vercel with the following structure:

```
webapp/
├── frontend/     # React application
├── backend/      # Python Flask API
├── vercel.json   # Vercel configuration
└── build.sh      # Build script
```

### Environment Variables for Production

Set these in your Vercel dashboard:

- `FLASK_ENV=production`
- `JWT_SECRET_KEY=your-secure-key`
- `USE_MOCK_DATA=true`

## Local Development

```bash
# Frontend
cd frontend
npm install
npm start

# Backend
cd backend
pip install -r requirements.txt
python app.py
```

## Live Demo

Visit the deployed application to explore California lobbying transparency data with an intuitive interface designed for researchers, journalists, and the public.