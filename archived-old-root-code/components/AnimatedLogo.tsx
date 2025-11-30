'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface AnimatedLogoProps {
  videoSrc: string;
  fallbackImageSrc: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
  loop?: boolean;
  playOnce?: boolean;
}

export default function AnimatedLogo({
  videoSrc,
  fallbackImageSrc,
  alt,
  width = 60,
  height = 24,
  className = '',
  style = {},
  loop = false,
  playOnce = true,
}: AnimatedLogoProps) {
  const [showVideo, setShowVideo] = useState(true);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [videoOpacity, setVideoOpacity] = useState(1);
  const [staticOpacity, setStaticOpacity] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Preload the static image so it's ready immediately when needed
  useEffect(() => {
    const img = new window.Image();
    img.src = fallbackImageSrc;
  }, [fallbackImageSrc]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || hasPlayed) return;

    // Wait for video to be ready before playing
    const handleCanPlay = () => {
      setIsVideoReady(true);
      video.play().catch((error) => {
        console.log('Autoplay prevented:', error);
        setShowVideo(false);
      });
    };

    // Start fading out 0.3s before video ends
    const handleTimeUpdate = () => {
      if (video.duration && video.currentTime >= video.duration - 0.3) {
        const remainingTime = video.duration - video.currentTime;
        const opacity = remainingTime / 0.3; // Fade from 1 to 0 over 0.3s
        setVideoOpacity(Math.max(0, opacity));
        setStaticOpacity(1 - Math.max(0, opacity)); // Fade in static as video fades out
      }
    };

    // If video is already loaded, play immediately
    if (video.readyState >= 3) {
      handleCanPlay();
    } else {
      video.addEventListener('canplay', handleCanPlay);
    }

    video.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [hasPlayed]);

  const handleVideoEnd = () => {
    if (playOnce) {
      setHasPlayed(true);
      // Keep video visible but transparent to show static image underneath
    }
  };

  const handleVideoError = () => {
    // Fallback to static image on error
    setShowVideo(false);
  };

  return (
    <div style={{ position: 'relative', width, height }}>
      {/* Static image layer - always underneath, fades in as video fades out */}
      <Image
        src={fallbackImageSrc}
        alt={alt}
        width={width}
        height={height}
        className={`${className} transition-opacity duration-300`}
        style={{
          ...style,
          position: 'absolute',
          top: 0,
          left: 0,
          opacity: staticOpacity,
        }}
      />
      
      {/* Video layer - fades out on top */}
      {showVideo && (
        <video
          ref={videoRef}
          src={videoSrc}
          width={width}
          height={height}
          className={`${className} transition-opacity duration-300`}
          style={{
            ...style,
            objectFit: 'contain',
            mixBlendMode: 'screen',
            opacity: isVideoReady ? videoOpacity : 0,
            position: 'absolute',
            top: 0,
            left: 0,
          }}
          autoPlay
          muted
          playsInline
          loop={loop}
          preload="auto"
          onEnded={handleVideoEnd}
          onError={handleVideoError}
          aria-label={alt}
        />
      )}
    </div>
  );
}
