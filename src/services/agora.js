import AgoraRTC from 'agora-rtc-sdk-ng';

const APP_ID = import.meta.env.VITE_AGORA_APP_ID;
const TEMP_TOKEN = import.meta.env.VITE_AGORA_TEMP_TOKEN;

// Initialize Agora RTC
AgoraRTC.setLogLevel(4); // Set to 0 for production

export const createAgoraClient = () => {
  return AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
};

export const joinChannel = async (client, channelName, uid, token = null) => {
  try {
    // Use provided token or fallback to temp token
    const authToken = token || TEMP_TOKEN;
    
    if (!authToken) {
      throw new Error('No authentication token available');
    }
    
    await client.join(APP_ID, channelName, authToken, uid);
    console.log('Successfully joined channel:', channelName);
    return true;
  } catch (error) {
    console.error('Failed to join channel:', error);
    throw error;
  }
};

export const createLocalTracks = async (audioConfig = {}, videoConfig = {}) => {
  try {
    // Check if permissions are available first
    try {
      const permissions = await navigator.permissions.query({ name: 'camera' });
      if (permissions.state === 'denied') {
        throw new Error('Camera permission denied. Please allow camera access in your browser settings.');
      }
    } catch (permError) {
      // Permissions API might not be supported, continue anyway
      console.warn('Permissions API not supported:', permError);
    }

    // Create tracks with timeout and fallback options
    const trackPromise = AgoraRTC.createMicrophoneAndCameraTracks(
      {
        encoderConfig: 'music_standard',
        ...audioConfig
      },
      {
        encoderConfig: '480p_1', // Lower resolution for better compatibility
        optimizationMode: 'motion', // Better for video calls
        ...videoConfig
      }
    );

    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout: Camera/microphone initialization took too long')), 15000);
    });

    const [audioTrack, videoTrack] = await Promise.race([trackPromise, timeoutPromise]);
    return { audioTrack, videoTrack };
    
  } catch (error) {
    console.error('Failed to create local tracks:', error);
    
    // Try fallback: create audio and video separately
    try {
      console.log('Trying fallback: creating tracks separately...');
      
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
        encoderConfig: 'music_standard',
        ...audioConfig
      });
      
      const videoTrack = await AgoraRTC.createCameraVideoTrack({
        encoderConfig: '480p_1',
        optimizationMode: 'motion',
        ...videoConfig
      });
      
      return { audioTrack, videoTrack };
      
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
      
      // Provide user-friendly error messages
      if (error.code === 'PERMISSION_DENIED' || error.name === 'NotAllowedError') {
        throw new Error('Camera and microphone access denied. Please allow permissions and try again.');
      } else if (error.code === 'NOT_FOUND' || error.name === 'NotFoundError') {
        throw new Error('No camera or microphone found. Please connect a camera and microphone.');
      } else if (error.code === 'NOT_READABLE' || error.name === 'NotReadableError') {
        throw new Error('Camera or microphone is being used by another application. Please close other applications and try again.');
      } else if (error.message.includes('Timeout')) {
        throw new Error('Camera initialization timed out. Please try refreshing the page or restarting your browser.');
      }
      
      throw new Error(`Failed to initialize camera/microphone: ${error.message}`);
    }
  }
};

export const createScreenShareTrack = async () => {
  try {
    const screenTrack = await AgoraRTC.createScreenVideoTrack({
      encoderConfig: '1080p_1',
      optimizationMode: 'detail'
    });
    return screenTrack;
  } catch (error) {
    console.error('Failed to create screen share track:', error);
    throw error;
  }
};

export const publishTracks = async (client, tracks) => {
  try {
    const tracksToPublish = [];
    if (tracks.audioTrack) tracksToPublish.push(tracks.audioTrack);
    if (tracks.videoTrack) tracksToPublish.push(tracks.videoTrack);
    if (tracks.screenTrack) tracksToPublish.push(tracks.screenTrack);
    
    if (tracksToPublish.length > 0) {
      await client.publish(tracksToPublish);
      console.log('Successfully published tracks');
    }
  } catch (error) {
    console.error('Failed to publish tracks:', error);
    throw error;
  }
};

export const unpublishTracks = async (client, tracks) => {
  try {
    const tracksToUnpublish = [];
    if (tracks.audioTrack) tracksToUnpublish.push(tracks.audioTrack);
    if (tracks.videoTrack) tracksToUnpublish.push(tracks.videoTrack);
    if (tracks.screenTrack) tracksToUnpublish.push(tracks.screenTrack);
    
    if (tracksToUnpublish.length > 0) {
      await client.unpublish(tracksToUnpublish);
      console.log('Successfully unpublished tracks');
    }
  } catch (error) {
    console.error('Failed to unpublish tracks:', error);
    throw error;
  }
};

export const leaveChannel = async (client, tracks) => {
  try {
    // Close local tracks
    if (tracks.audioTrack) {
      tracks.audioTrack.close();
    }
    if (tracks.videoTrack) {
      tracks.videoTrack.close();
    }
    if (tracks.screenTrack) {
      tracks.screenTrack.close();
    }
    
    // Leave the channel
    await client.leave();
    console.log('Successfully left channel');
  } catch (error) {
    console.error('Failed to leave channel:', error);
    throw error;
  }
};

export const muteAudio = async (audioTrack) => {
  if (audioTrack) {
    await audioTrack.setMuted(true);
  }
};

export const unmuteAudio = async (audioTrack) => {
  if (audioTrack) {
    await audioTrack.setMuted(false);
  }
};

export const muteVideo = async (videoTrack) => {
  if (videoTrack) {
    await videoTrack.setMuted(true);
  }
};

export const unmuteVideo = async (videoTrack) => {
  if (videoTrack) {
    await videoTrack.setMuted(false);
  }
};

export const switchCamera = async (videoTrack) => {
  if (videoTrack) {
    await videoTrack.switchDevice();
  }
};

export const getDevices = async () => {
  try {
    const devices = await AgoraRTC.getDevices();
    return {
      cameras: devices.filter(device => device.kind === 'videoinput'),
      microphones: devices.filter(device => device.kind === 'audioinput'),
      speakers: devices.filter(device => device.kind === 'audiooutput')
    };
  } catch (error) {
    console.error('Failed to get devices:', error);
    return { cameras: [], microphones: [], speakers: [] };
  }
};

// Generate channel name for live session
export const generateChannelName = (sessionId) => {
  return `live_session_${sessionId}`;
};

// Generate user ID
export const generateUserId = (userId) => {
  return parseInt(userId.slice(-6), 36) || Math.floor(Math.random() * 100000);
};

// Check browser compatibility
export const checkBrowserCompatibility = () => {
  return AgoraRTC.checkSystemRequirements();
};

// Network quality monitoring
export const enableNetworkQualityMonitoring = (client, callback) => {
  client.on('network-quality', (stats) => {
    callback(stats);
  });
};

// Connection state monitoring
export const enableConnectionStateMonitoring = (client, callbacks) => {
  client.on('connection-state-change', (curState, revState, reason) => {
    if (callbacks.onConnectionStateChange) {
      callbacks.onConnectionStateChange(curState, revState, reason);
    }
  });
  
  client.on('user-joined', (user) => {
    if (callbacks.onUserJoined) {
      callbacks.onUserJoined(user);
    }
  });
  
  client.on('user-left', (user, reason) => {
    if (callbacks.onUserLeft) {
      callbacks.onUserLeft(user, reason);
    }
  });
  
  client.on('user-published', (user, mediaType) => {
    if (callbacks.onUserPublished) {
      callbacks.onUserPublished(user, mediaType);
    }
  });
  
  client.on('user-unpublished', (user, mediaType) => {
    if (callbacks.onUserUnpublished) {
      callbacks.onUserUnpublished(user, mediaType);
    }
  });
};
