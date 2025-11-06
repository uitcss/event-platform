// src/hooks/useTestSecurity.js
import { useState, useEffect, useCallback } from 'react';

const useTestSecurity = (onForceSubmit) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [warningCount, setWarningCount] = useState(0);
  const MAX_WARNINGS = 3;

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Handle visibility change
  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      const newWarningCount = warningCount + 1;
      setWarningCount(newWarningCount);
      
      if (newWarningCount >= MAX_WARNINGS) {
        // Force submit on 3rd warning
        if (onForceSubmit) {
          onForceSubmit();
        }
      } else {
        // Show warning
        alert(`Warning ${newWarningCount}/${MAX_WARNINGS}: Changing tabs or windows is not allowed. Test will be auto-submitted after ${MAX_WARNINGS} warnings.`);
        
        // Bring back focus to the test window
        window.focus();
      }
    }
  }, [warningCount, onForceSubmit]);

  // Set up event listeners
  useEffect(() => {
    // Fullscreen change event
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    // Request fullscreen when test starts
    toggleFullscreen();

    // Add event listeners
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Clean up
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // Exit fullscreen when component unmounts
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => {
          console.error('Error exiting fullscreen:', err);
        });
      }
    };
  }, [toggleFullscreen, handleVisibilityChange]);

  return { isFullscreen, warningCount, MAX_WARNINGS };
};

export default useTestSecurity;