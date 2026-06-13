import React, { createContext, useContext, useState } from 'react';

const ArtifactContext = createContext();

export function ArtifactProvider({ children }) {
  // activeArtifact structure: { type: 'sandpack' | 'quiz' | 'mindmap' | 'flashcards', content: string, title: string, language?: string }
  const [activeArtifact, setActiveArtifact] = useState(null);

  return (
    <ArtifactContext.Provider value={{ activeArtifact, setActiveArtifact }}>
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
