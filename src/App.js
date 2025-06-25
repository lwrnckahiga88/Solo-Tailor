import React, { useEffect, useRef, useState, Suspense } from 'react';
import ShoeCustomizer from './components/ShoeCustomizer';
import ControlPanel from './components/ControlPanel';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const [shoeConfig, setShoeConfig] = useState({
    type: 'sneaker',
    primaryColor: '#4f46e5',
    secondaryColor: '#ffffff',
    material: 'leather',
    size: 9
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }

    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleConfigChange = (newConfig) => {
    setShoeConfig(prev => ({ ...prev, ...newConfig }));
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>3D Shoe Customizer</h1>
        <p>Design your perfect custom shoes</p>
      </header>
      <main className="app-main">
        <ControlPanel 
          config={shoeConfig}
          onChange={handleConfigChange}
        />
        <div className="viewer-container">
          <Suspense fallback={<LoadingSpinner />}>
            <ShoeCustomizer config={shoeConfig} />
          </Suspense>
          <div className="viewer-info">
            <p>Rotate: Left click + drag</p>
            <p>Zoom: Mouse wheel or pinch</p>
            <p>Pan: Right click + drag</p>
          </div>
        </div>
      </main>
      <footer className="app-footer">
        <p>&copy; 2024 3D Shoe Customizer. Built with React & Three.js</p>
      </footer>
    </div>
  );
}

export default App;
