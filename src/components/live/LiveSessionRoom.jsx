import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  VideoCameraIcon,
  VideoCameraSlashIcon,
  MicrophoneIcon,
  XMarkIcon,
  PhoneXMarkIcon,
  ComputerDesktopIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  ExclamationTriangleIcon,
  SignalIcon
} from '@heroicons/react/24/outline';
import {
  MicrophoneIcon as MicrophoneIconSolid,
  VideoCameraIcon as VideoCameraIconSolid
} from '@heroicons/react/24/solid';
import useAuthStore from '../../store/authStore';
import { useToast } from '../ui/Toast';
import {
  createAgoraClient,
  joinChannel,
  createLocalTracks,
  createScreenShareTrack,
  publishTracks,
  unpublishTracks,
  leaveChannel,
  muteAudio,
  unmuteAudio,
  muteVideo,
  unmuteVideo,
  generateChannelName,
  generateUserId,
  checkBrowserCompatibility,
  enableConnectionStateMonitoring,
  enableNetworkQualityMonitoring
} from '../../services/agora';
import { getLiveSession, joinLiveSession } from '../../services/scheduling';

export default function LiveSessionRoom() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { userData } = useAuthStore();
  const { success, error } = useToast();
  
  // Agora client and tracks
  const clientRef = useRef(null);
  const localTracksRef = useRef({ audioTrack: null, videoTrack: null, screenTrack: null });
  const remoteUsersRef = useRef(new Map());
  
  // Component state
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [connected, setConnected] = useState(false);
  const [localVideoMuted, setLocalVideoMuted] = useState(false);
  const [localAudioMuted, setLocalAudioMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [networkQuality, setNetworkQuality] = useState({ uplink: 0, downlink: 0 });
  const [connectionState, setConnectionState] = useState('DISCONNECTED');
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [audioOnly, setAudioOnly] = useState(false);
  
  // Video container refs
  const localVideoRef = useRef(null);
  const remoteVideoContainerRef = useRef(null);

  useEffect(() => {
    // Check browser compatibility
    if (!checkBrowserCompatibility()) {
      error('Your browser does not support live sessions. Please use Chrome, Firefox, or Safari.');
      navigate(-1);
      return;
    }

    loadSessionData();
    
    return () => {
      cleanup();
    };
  }, [sessionId]);

  const requestPermissions = async () => {
    try {
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support camera/microphone access. Please use Chrome, Firefox, or Safari.');
      }

      // Request permissions explicitly
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      // Stop the stream immediately - we just needed to get permission
      stream.getTracks().forEach(track => track.stop());
      
      setPermissionGranted(true);
      setShowPermissionModal(false);
      success('Camera and microphone access granted!');
      
      return true;
    } catch (err) {
      console.error('Permission denied:', err);
      
      let errorMessage = 'Camera and microphone access is required for live sessions.';
      
      if (err.name === 'NotAllowedError') {
        errorMessage = `
          Camera/microphone access denied. To fix this:
          
          Chrome: Click the camera icon in the address bar and select "Allow"
          Firefox: Click the shield icon and select "Allow Camera and Microphone"
          Safari: Go to Safari > Settings > Websites > Camera/Microphone and allow access
          
          Then refresh the page and try again.
        `;
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No camera or microphone found. Please connect a camera and microphone and try again.';
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'Camera or microphone is being used by another application. Please close other applications and try again.';
      } else if (window.location.protocol === 'http:' && window.location.hostname !== 'localhost') {
        errorMessage = 'Camera/microphone access requires HTTPS. Please use https:// instead of http://';
      }
      
      error(errorMessage);
      return false;
    }
  };

  const loadSessionData = async () => {
    try {
      setLoading(true);
      const session = await getLiveSession(sessionId);
      
      if (!session) {
        error('Live session not found');
        navigate(-1);
        return;
      }
      
      if (session.status !== 'live') {
        error('This session is not currently live');
        navigate(-1);
        return;
      }
      
      setSessionData(session);
      
      // Show permission modal instead of auto-joining
      if (userData && (userData.uid === session.lecturerId || userData.role === 'student')) {
        setShowPermissionModal(true);
      }
    } catch (err) {
      console.error('Error loading session:', err);
      error('Failed to load session data');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSession = async () => {
    if (!permissionGranted) {
      const granted = await requestPermissions();
      if (!granted) return;
    }
    
    await initializeAndJoin(sessionData);
  };

  const initializeAndJoin = async (session, retryWithAudioOnly = false) => {
    try {
      setJoining(true);
      
      // Create Agora client
      clientRef.current = createAgoraClient();
      
      // Set up event listeners
      setupEventListeners();
      
      let tracks;
      
      if (retryWithAudioOnly || audioOnly) {
        // Audio-only mode
        try {
          const audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
            encoderConfig: 'music_standard'
          });
          tracks = { audioTrack, videoTrack: null };
          setAudioOnly(true);
          success('Joined in audio-only mode');
        } catch (audioError) {
          console.error('Failed to create audio track:', audioError);
          throw new Error('Failed to initialize microphone');
        }
      } else {
        // Try video + audio mode first
        try {
          tracks = await createLocalTracks();
        } catch (videoError) {
          console.warn('Video initialization failed, trying audio-only:', videoError);
          // Retry with audio-only
          return await initializeAndJoin(session, true);
        }
      }
      
      localTracksRef.current.audioTrack = tracks.audioTrack;
      localTracksRef.current.videoTrack = tracks.videoTrack;
      
      // Play local video if available
      if (localVideoRef.current && tracks.videoTrack) {
        tracks.videoTrack.play(localVideoRef.current);
      }
      
      // Generate user ID
      const uid = generateUserId(userData.uid);
      const channelName = session.channelName || generateChannelName(sessionId);
      
      // Join channel
      await joinChannel(clientRef.current, channelName, uid, session.agoraToken);
      
      // Publish tracks
      await publishTracks(clientRef.current, localTracksRef.current);
      
      // Update session participation
      await joinLiveSession(sessionId, userData.uid);
      
      setConnected(true);
      setShowPermissionModal(false);
      
      if (audioOnly) {
        success('Successfully joined live session (audio-only)!');
      } else {
        success('Successfully joined live session!');
      }
      
    } catch (err) {
      console.error('Error joining session:', err);
      
      // If this is not already an audio-only retry, try audio-only
      if (!retryWithAudioOnly && !audioOnly) {
        console.log('Retrying with audio-only mode...');
        return await initializeAndJoin(session, true);
      }
      
      error('Failed to join live session: ' + err.message);
    } finally {
      setJoining(false);
    }
  };

  const setupEventListeners = () => {
    const client = clientRef.current;
    if (!client) return;

    // Connection state monitoring
    enableConnectionStateMonitoring(client, {
      onConnectionStateChange: (curState, revState, reason) => {
        setConnectionState(curState);
        console.log('Connection state changed:', curState, reason);
      },
      
      onUserJoined: (user) => {
        console.log('User joined:', user.uid);
        setRemoteUsers(prev => [...prev.filter(u => u.uid !== user.uid), user]);
      },
      
      onUserLeft: (user, reason) => {
        console.log('User left:', user.uid, reason);
        setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
        
        // Clean up remote user's video container
        const userContainer = document.getElementById(`remote-user-${user.uid}`);
        if (userContainer) {
          userContainer.remove();
        }
      },
      
      onUserPublished: async (user, mediaType) => {
        console.log('User published:', user.uid, mediaType);
        
        // Subscribe to remote user
        await client.subscribe(user, mediaType);
        
        if (mediaType === 'video') {
          // Create video container for remote user
          const remoteContainer = remoteVideoContainerRef.current;
          if (remoteContainer) {
            let userContainer = document.getElementById(`remote-user-${user.uid}`);
            if (!userContainer) {
              userContainer = document.createElement('div');
              userContainer.id = `remote-user-${user.uid}`;
              userContainer.className = 'relative bg-gray-900 rounded-lg overflow-hidden aspect-video';
              remoteContainer.appendChild(userContainer);
            }
            
            // Play remote video
            user.videoTrack.play(userContainer);
          }
        }
        
        if (mediaType === 'audio') {
          // Play remote audio
          user.audioTrack.play();
        }
      },
      
      onUserUnpublished: (user, mediaType) => {
        console.log('User unpublished:', user.uid, mediaType);
        
        if (mediaType === 'video') {
          const userContainer = document.getElementById(`remote-user-${user.uid}`);
          if (userContainer) {
            userContainer.innerHTML = '';
          }
        }
      }
    });

    // Network quality monitoring
    enableNetworkQualityMonitoring(client, (stats) => {
      setNetworkQuality({
        uplink: stats.uplinkNetworkQuality,
        downlink: stats.downlinkNetworkQuality
      });
    });
  };

  const toggleAudio = async () => {
    const audioTrack = localTracksRef.current.audioTrack;
    if (!audioTrack) return;

    try {
      if (localAudioMuted) {
        await unmuteAudio(audioTrack);
        setLocalAudioMuted(false);
      } else {
        await muteAudio(audioTrack);
        setLocalAudioMuted(true);
      }
    } catch (err) {
      console.error('Error toggling audio:', err);
      error('Failed to toggle microphone');
    }
  };

  const toggleVideo = async () => {
    const videoTrack = localTracksRef.current.videoTrack;
    if (!videoTrack) return;

    try {
      if (localVideoMuted) {
        await unmuteVideo(videoTrack);
        setLocalVideoMuted(false);
      } else {
        await muteVideo(videoTrack);
        setLocalVideoMuted(true);
      }
    } catch (err) {
      console.error('Error toggling video:', err);
      error('Failed to toggle camera');
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (isScreenSharing) {
        // Stop screen sharing
        const screenTrack = localTracksRef.current.screenTrack;
        if (screenTrack) {
          await unpublishTracks(clientRef.current, { screenTrack });
          screenTrack.close();
          localTracksRef.current.screenTrack = null;
        }
        
        // Resume camera
        if (localTracksRef.current.videoTrack) {
          await publishTracks(clientRef.current, { videoTrack: localTracksRef.current.videoTrack });
          if (localVideoRef.current) {
            localTracksRef.current.videoTrack.play(localVideoRef.current);
          }
        }
        
        setIsScreenSharing(false);
        success('Screen sharing stopped');
      } else {
        // Start screen sharing
        const screenTrack = await createScreenShareTrack();
        localTracksRef.current.screenTrack = screenTrack;
        
        // Stop camera and publish screen
        if (localTracksRef.current.videoTrack) {
          await unpublishTracks(clientRef.current, { videoTrack: localTracksRef.current.videoTrack });
        }
        
        await publishTracks(clientRef.current, { screenTrack });
        
        // Play screen share locally
        if (localVideoRef.current) {
          screenTrack.play(localVideoRef.current);
        }
        
        setIsScreenSharing(true);
        success('Screen sharing started');
        
        // Listen for screen share end
        screenTrack.on('track-ended', () => {
          toggleScreenShare();
        });
      }
    } catch (err) {
      console.error('Error toggling screen share:', err);
      error('Failed to toggle screen sharing');
    }
  };

  const leaveSession = async () => {
    try {
      await cleanup();
      navigate(-1);
    } catch (err) {
      console.error('Error leaving session:', err);
      navigate(-1);
    }
  };

  const cleanup = async () => {
    try {
      if (clientRef.current && connected) {
        await leaveChannel(clientRef.current, localTracksRef.current);
      }
      
      // Reset refs
      clientRef.current = null;
      localTracksRef.current = { audioTrack: null, videoTrack: null, screenTrack: null };
      remoteUsersRef.current.clear();
      
      setConnected(false);
      setRemoteUsers([]);
    } catch (err) {
      console.error('Error during cleanup:', err);
    }
  };

  const getNetworkQualityIcon = (quality) => {
    if (quality >= 4) return <SignalIcon className="w-4 h-4 text-green-500" />;
    if (quality >= 2) return <SignalIcon className="w-4 h-4 text-yellow-500" />;
    return <SignalIcon className="w-4 h-4 text-red-500" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-white font-medium">Loading live session...</p>
        </div>
      </div>
    );
  }

  if (joining) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-white font-medium">Joining live session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-white font-semibold">{sessionData?.title}</h1>
          <div className="flex items-center space-x-2">
            {getNetworkQualityIcon(Math.min(networkQuality.uplink, networkQuality.downlink))}
            <span className="text-sm text-gray-300">
              {connectionState === 'CONNECTED' ? 'Connected' : connectionState}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-gray-300">
            <UserGroupIcon className="w-4 h-4" />
            <span className="text-sm">{remoteUsers.length + 1}</span>
          </div>
          
          <button
            onClick={() => setShowChat(!showChat)}
            className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChatBubbleLeftRightIcon className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Cog6ToothIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Area */}
        <div className="flex-1 p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
            {/* Local Video */}
            <div className="relative bg-gray-800 rounded-lg overflow-hidden">
              <div
                ref={localVideoRef}
                className="w-full h-full min-h-[300px] bg-gray-900 flex items-center justify-center"
              >
                {(localVideoMuted || audioOnly) && !isScreenSharing && (
                  <div className="text-center">
                    <VideoCameraSlashIcon className="w-16 h-16 text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-400">
                      {audioOnly ? 'Audio-only mode' : 'Camera is off'}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Local Video Overlay */}
              <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                You {isScreenSharing && '(Screen)'}
              </div>
              
              {/* Audio Muted Indicator */}
              {localAudioMuted && (
                <div className="absolute top-4 left-4 bg-red-500 text-white p-1 rounded">
                  <XMarkIcon className="w-4 h-4" />
                </div>
              )}
            </div>

            {/* Remote Videos */}
            <div
              ref={remoteVideoContainerRef}
              className="grid grid-cols-1 gap-2 overflow-y-auto"
            >
              {remoteUsers.length === 0 && (
                <div className="bg-gray-800 rounded-lg flex items-center justify-center min-h-[300px]">
                  <div className="text-center">
                    <UserGroupIcon className="w-16 h-16 text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-400">Waiting for others to join...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <div className="w-80 bg-gray-800 border-l border-gray-700">
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-white font-semibold">Chat</h3>
            </div>
            <div className="flex-1 p-4">
              <p className="text-gray-400 text-sm">Chat feature coming soon...</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-800 px-4 py-4">
        <div className="flex items-center justify-center space-x-4">
          {/* Audio Toggle */}
          <button
            onClick={toggleAudio}
            className={`p-3 rounded-full transition-colors ${
              localAudioMuted
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-gray-600 hover:bg-gray-700 text-white'
            }`}
          >
            {localAudioMuted ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <MicrophoneIconSolid className="w-6 h-6" />
            )}
          </button>

          {/* Video Toggle */}
          <button
            onClick={toggleVideo}
            disabled={audioOnly}
            className={`p-3 rounded-full transition-colors ${
              audioOnly
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : localVideoMuted
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-gray-600 hover:bg-gray-700 text-white'
            }`}
            title={audioOnly ? 'Video not available in audio-only mode' : 'Toggle video'}
          >
            {localVideoMuted || audioOnly ? (
              <VideoCameraSlashIcon className="w-6 h-6" />
            ) : (
              <VideoCameraIconSolid className="w-6 h-6" />
            )}
          </button>

          {/* Screen Share */}
          <button
            onClick={toggleScreenShare}
            className={`p-3 rounded-full transition-colors ${
              isScreenSharing
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-600 hover:bg-gray-700 text-white'
            }`}
          >
            <ComputerDesktopIcon className="w-6 h-6" />
          </button>

          {/* Leave Session */}
          <button
            onClick={leaveSession}
            className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
          >
            <PhoneXMarkIcon className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Permission Modal */}
      {showPermissionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4">
            <div className="text-center">
              <VideoCameraIcon className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Join Live Session
              </h3>
              <p className="text-gray-600 mb-6">
                To join this live session, we need access to your camera and microphone. 
                This allows you to participate in video calls and communicate with other participants.
              </p>
              
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setShowPermissionModal(false);
                    navigate(-1);
                  }}
                  className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleJoinSession}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Allow & Join
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
