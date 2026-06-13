import React, { createContext, useContext, useState } from 'react';

const ArtifactContext = createContext();

export function ArtifactProvider({ children }) {
  const [activeArtifact, setActiveArtifact] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const setArtifact = (artifact) => {
    setActiveArtifact(artifact);
    if (!artifact) setIsFullScreen(false);
  };

  return (
    <ArtifactContext.Provider value={{ 
      activeArtifact, 
      setActiveArtifact: setArtifact,
      isFullScreen,
      setIsFullScreen
    }}>
      {children}
    </ArtifactContext.Provider>
  );
}

export function useArtifacts() {
  const context = useContext(ArtifactContext);
  if (!context) {
    throw new Error('useArtifacts must be used within an ArtifactProvider');
  }
  return context;
}
