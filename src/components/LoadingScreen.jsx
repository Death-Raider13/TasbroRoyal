import React, { useState, useEffect } from 'react';

const LoadingScreen = ({ isVisible = true, message = "Loading NaijaEdu...", subMessage = "Preparing your learning experience" }) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  
  const loadingMessages = [
    { main: "Loading NaijaEdu...", sub: "Preparing your learning experience" },
    { main: "Setting up your dashboard...", sub: "Configuring personalized content" },
    { main: "Connecting to servers...", sub: "Establishing secure connection" },
    { main: "Almost ready...", sub: "Finalizing your experience" }
  ];

  useEffect(() => {
    if (!isVisible) return;
    
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 1200);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  const currentMessage = loadingMessages[currentMessageIndex];

  return (
    <div className={`loading-screen ${!isVisible ? 'hidden' : ''}`}>
      {/* Logo/Icon */}
      <div className="loading-logo">
        <svg 
          viewBox="0 0 100 100" 
          className="w-full h-full text-white"
          fill="currentColor"
        >
          {/* Engineering/Education Icon */}
          <path d="M50 10L90 30v40L50 90L10 70V30L50 10z" opacity="0.3"/>
          <path d="M50 20L80 35v30L50 80L20 65V35L50 20z" opacity="0.6"/>
          <path d="M50 30L70 40v20L50 70L30 60V40L50 30z"/>
          
          {/* Book/Learning Symbol */}
          <rect x="35" y="35" width="30" height="2" fill="white" opacity="0.9"/>
          <rect x="35" y="40" width="25" height="2" fill="white" opacity="0.7"/>
          <rect x="35" y="45" width="28" height="2" fill="white" opacity="0.9"/>
          <rect x="35" y="50" width="22" height="2" fill="white" opacity="0.7"/>
          <rect x="35" y="55" width="26" height="2" fill="white" opacity="0.9"/>
        </svg>
      </div>

      {/* Spinner */}
      <div className="loading-spinner"></div>

      {/* Text */}
      <div className="loading-text">{message || currentMessage.main}</div>
      <div className="loading-subtext">{subMessage || currentMessage.sub}</div>

      {/* Progress Dots */}
      <div className="flex space-x-2 mt-4">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></div>
        <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></div>
      </div>
    </div>
  );
};

export default LoadingScreen;
