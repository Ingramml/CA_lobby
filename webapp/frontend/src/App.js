import React from 'react';
import './App.css';
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser
} from '@clerk/clerk-react';

function App() {
  const { user } = useUser();

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <h1>Welcome to TPC's CA lobby search</h1>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="sign-in-btn">Sign In</button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </header>

      <main className="App-main">
        <SignedOut>
          <div className="welcome-section">
            <h2>Welcome to TPC's CA lobby search</h2>
            <p>Please sign in to access the search dashboard.</p>
          </div>
        </SignedOut>

        <SignedIn>
          <div className="dashboard-section">
            <h2>Welcome back, {user?.firstName || 'User'}!</h2>

            <div className="dashboard-grid">
              <div className="dashboard-card">
                <h3>API Health Check</h3>
                <APIHealthCheck />
              </div>

              <div className="dashboard-card">
                <h3>System Status</h3>
                <SystemStatus />
              </div>

              <div className="dashboard-card">
                <h3>Data Access</h3>
                <DataAccessTest />
              </div>
            </div>
          </div>
        </SignedIn>
      </main>
    </div>
  );
}

// API Components
function APIHealthCheck() {
  const [health, setHealth] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        setHealth(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Health check failed:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="api-result">
      {health ? (
        <div className="success">
          <p>Status: {health.status}</p>
          <p>Message: {health.message}</p>
          <p>Version: {health.version}</p>
          {health.source && <p>Source: {health.source}</p>}
        </div>
      ) : (
        <div className="error">Failed to load health status</div>
      )}
    </div>
  );
}

function SystemStatus() {
  const [status, setStatus] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch('/api/status')
      .then(res => res.json())
      .then(data => {
        setStatus(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Status check failed:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="api-result">
      {status ? (
        <div className="success">
          <p>Environment: {status.environment}</p>
          <p>Mock Data: {status.mock_data}</p>
          <p>Debug: {status.debug}</p>
        </div>
      ) : (
        <div className="error">Failed to load system status</div>
      )}
    </div>
  );
}

function DataAccessTest() {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch('/api/test-data-access')
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Data access test failed:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="api-result">
      {data ? (
        <div className="success">
          <p>Status: {data.status}</p>
          <p>Message: {data.message}</p>
          {data.available_modules && (
            <div>
              <p>Available Modules:</p>
              <ul>
                {data.available_modules.map((module, idx) => (
                  <li key={idx}>{module}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="error">Failed to load data access status</div>
      )}
    </div>
  );
}

export default App;