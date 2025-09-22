import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ClerkProvider } from '@clerk/clerk-react';

// Import your publishable key
const PUBLISHABLE_KEY = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY

console.log('Clerk Key Available:', !!PUBLISHABLE_KEY)
console.log('Clerk Key Length:', PUBLISHABLE_KEY?.length)
console.log('Clerk Key Preview:', PUBLISHABLE_KEY?.substring(0, 20) + '...')

if (!PUBLISHABLE_KEY) {
  console.error("Missing Publishable Key - showing fallback content")
}

const root = ReactDOM.createRoot(document.getElementById('root'));

if (PUBLISHABLE_KEY) {
  root.render(
    <React.StrictMode>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <App />
      </ClerkProvider>
    </React.StrictMode>
  );
} else {
  root.render(
    <React.StrictMode>
      <div style={{padding: '20px', fontFamily: 'Arial'}}>
        <h1>Configuration Error</h1>
        <p>Clerk publishable key is missing or invalid.</p>
        <p>Please check environment variables.</p>
      </div>
    </React.StrictMode>
  );
}