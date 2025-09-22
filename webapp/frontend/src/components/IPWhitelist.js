import React, { useState, useEffect } from 'react';

// Whitelisted IP addresses that can bypass authentication
const WHITELISTED_IPS = [
  '185.203.218.172', // Your current IP
  '127.0.0.1',       // Localhost
  '::1'              // IPv6 localhost
];

export function useIPWhitelist() {
  const [isWhitelisted, setIsWhitelisted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [clientIP, setClientIP] = useState(null);

  useEffect(() => {
    const checkIPWhitelist = async () => {
      try {
        // Try to get client IP from multiple sources
        const sources = [
          'https://api.ipify.org?format=json',
          'https://ipinfo.io/json',
          'https://httpbin.org/ip'
        ];

        let detectedIP = null;

        for (const source of sources) {
          try {
            const response = await fetch(source);
            const data = await response.json();

            // Different APIs return IP in different formats
            detectedIP = data.ip || data.origin || data.query;

            if (detectedIP) {
              break;
            }
          } catch (err) {
            console.warn(`Failed to get IP from ${source}:`, err);
            continue;
          }
        }

        setClientIP(detectedIP);

        // Check if the detected IP is in whitelist
        const whitelisted = detectedIP && WHITELISTED_IPS.includes(detectedIP);
        setIsWhitelisted(whitelisted);

        console.log('IP Whitelist Check:', {
          detectedIP,
          whitelisted,
          whitelistedIPs: WHITELISTED_IPS
        });

      } catch (error) {
        console.error('Error checking IP whitelist:', error);
        setIsWhitelisted(false);
      } finally {
        setLoading(false);
      }
    };

    checkIPWhitelist();
  }, []);

  return { isWhitelisted, loading, clientIP };
}

export function IPWhitelistProvider({ children }) {
  const { isWhitelisted, loading, clientIP } = useIPWhitelist();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Checking Access Permissions...</h2>
          <p>Verifying IP whitelist status</p>
        </div>
      </div>
    );
  }

  if (isWhitelisted) {
    console.log(`IP ${clientIP} is whitelisted - bypassing authentication`);
    return (
      <div>
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          background: '#28a745',
          color: 'white',
          padding: '5px 10px',
          fontSize: '12px',
          zIndex: 1000
        }}>
          Whitelisted IP: {clientIP}
        </div>
        {children}
      </div>
    );
  }

  // Return null to let Clerk handle authentication
  return null;
}

export default IPWhitelistProvider;