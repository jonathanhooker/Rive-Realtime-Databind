"use client";
import React from 'react';
import { useSyncState } from '@/hooks/use-synced-state';

function RiveStateExample() {
  // Initialize the hook with a specific row ID
  const { data, setData, isLoading, error, isConnected, lastUpdated, connectionCount } = useSyncState(1);

  if (isLoading) {
    return <div>Loading rive state...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!data) {
    return <div>No data available</div>;
  }

  const handleSliderChange = (sliderNumber: number, value: number) => {
    setData({ [`slider_${sliderNumber}`]: value });
  };

  const handleModeChange = (mode: number) => {
    setData({ mode });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Rive State Control Panel</h2>
      
      {/* Connection Status */}
      <div style={{ marginBottom: '20px' }}>
        <span style={{
          color: isConnected ? 'green' : 'red',
          fontWeight: 'bold'
        }}>
          {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </span>
        <span style={{ marginLeft: '20px', fontSize: '14px', color: '#333' }}>
          👥 {connectionCount} {connectionCount === 1 ? 'connection' : 'connections'}
        </span>
        {lastUpdated && (
          <span style={{ marginLeft: '20px', fontSize: '12px', color: '#666' }}>
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Mode Control */}
      <div style={{ marginBottom: '30px' }}>
        <h3>Mode: {data.mode}</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          {[1, 2, 3, 4].map(mode => (
            <button
              key={mode}
              onClick={() => handleModeChange(mode)}
              style={{
                padding: '10px 20px',
                backgroundColor: data.mode === mode ? '#007bff' : '#f8f9fa',
                color: data.mode === mode ? 'white' : 'black',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Mode {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Slider Controls */}
      <div>
        <h3>Sliders</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
          {Array.from({ length: 16 }, (_, i) => i + 1).map(sliderNum => {
            const sliderKey = `slider_${sliderNum}` as keyof typeof data;
            const value = data[sliderKey] as number;
            
            return (
              <div key={sliderNum} style={{ textAlign: 'center' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>
                  Slider {sliderNum}
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={value}
                  onChange={(e) => handleSliderChange(sliderNum, parseInt(e.target.value))}
                  style={{ width: '100%' }}
                />
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {value}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Raw Data Display (for debugging) */}
      <details style={{ marginTop: '30px' }}>
        <summary>Raw Data (Debug)</summary>
        <pre style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '10px', 
          borderRadius: '4px',
          fontSize: '12px',
          overflow: 'auto',
          color: '#000'
        }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      </details>
    </div>
  );
}

export default RiveStateExample;