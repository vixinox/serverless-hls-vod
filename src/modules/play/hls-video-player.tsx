'use client'

import Hls from 'hls.js'
import { ChangeEvent, useEffect, useRef, useState } from 'react'
import { Maximize, Pause, Play, Settings, Volume2, VolumeX } from 'lucide-react'

interface VideoPlayerProps {
  shortCode: string;
  thumbnail: string | null;
  domain: string | undefined;
  size?: 'lg' | 'sm';
}

export function HlsVideoPlayer({ shortCode, thumbnail, domain, size }: VideoPlayerProps) {
  const hasDomain = !!domain && domain.trim() !== '';

  const videoUrl = hasDomain
    ? `https://${domain}/${shortCode}/main.m3u8`
    : '';

  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const [isBuffering, setIsBuffering] = useState(false)
  const [qualities, setQualities] = useState<number[]>([])
  const [currentQuality, setCurrentQuality] = useState(-1)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
      })
      hlsRef.current = hls

      hls.loadSource(videoUrl)
      hls.attachMedia(video)

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        const levels = hls.levels.map((level) => level.height)
        setQualities(levels)
        setCurrentQuality(hls.currentLevel)
      })

      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        setCurrentQuality(data.level)
      })

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          // console.error('HLS fatal error:');
          // console.error(JSON.stringify(data, null, 2));
        }
      })
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoUrl
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
      }
    }
  }, [videoUrl])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateTime = () => setCurrentTime(video.currentTime)
    const updateDuration = () => setDuration(video.duration)
    const handleWaiting = () => setIsBuffering(true)
    const handleCanPlay = () => setIsBuffering(false)

    video.addEventListener('timeupdate', updateTime)
    video.addEventListener('loadedmetadata', updateDuration)
    video.addEventListener('waiting', handleWaiting)
    video.addEventListener('canplay', handleCanPlay)

    return () => {
      video.removeEventListener('timeupdate', updateTime)
      video.removeEventListener('loadedmetadata', updateDuration)
      video.removeEventListener('waiting', handleWaiting)
      video.removeEventListener('canplay', handleCanPlay)
    }
  }, [])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      video.play()
      setIsPlaying(true)
    } else {
      video.pause()
      setIsPlaying(false)
    }
  }

  const handleSeek = (e: ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video) return
    const time = parseFloat(e.target.value)
    video.currentTime = time
    setCurrentTime(time)
  }

  const handleVolumeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video) return
    const vol = parseFloat(e.target.value)
    video.volume = vol
    setVolume(vol)
    setIsMuted(vol === 0)
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setIsMuted(!isMuted)
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  const changeQuality = (index: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = index
      setShowSettings(false)
    }
  }

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600)
    const minutes = Math.floor((time % 3600) / 60)
    const seconds = Math.floor(time % 60)

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  if (!videoUrl) {
    return (
      <div className="w-full aspect-video rounded-xl bg-black flex items-center justify-center text-white">
        loading...
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative aspect-video w-full bg-background overflow-hidden group ${size === 'lg' ? 'rounded-xl' : ''}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        className="w-full h-full"
        poster={thumbnail || undefined}
        onClick={togglePlay}
      />

      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-foreground border-t-transparent rounded-full animate-spin"/>
        </div>
      )}

      {!isPlaying && !isBuffering && (
        <div
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
          onClick={togglePlay}
        >
          <div
            className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition">
            <Play className="w-10 h-10 ml-1" fill="white"/>
          </div>
        </div>
      )}

      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="px-4 pt-2">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-red-600"
            style={{
              background: `linear-gradient(to right, #dc2626 0%, #dc2626 ${(currentTime / duration) * 100}%, #4b5563 ${(currentTime / duration) * 100}%, #4b5563 100%)`
            }}
          />
        </div>

        <div className="flex items-center justify-between px-4 pb-3 pt-1">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={togglePlay}
              className="hover:text-red-600 transition"
            >
              {isPlaying ? <Pause className="w-6 h-6"/> : <Play className="w-6 h-6"/>}
            </button>

            <div className="flex items-center gap-2 group/volume">
              <button
                type="button"
                onClick={toggleMute}
                className="hover:text-red-600 transition"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-6 h-6"/>
                ) : (
                  <Volume2 className="w-6 h-6"/>
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-0 ml-4 group-hover/volume:w-20 transition-all duration-200 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-red-600"
              />
            </div>

            <span className="text-sm font-medium">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {qualities.length > 0 && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowSettings(!showSettings)}
                  className="hover:text-red-600 transition"
                >
                  <Settings className="w-7 h-7 pt-1"/>
                </button>

                {showSettings && (
                  <div className="absolute bottom-full right-0 mb-2 bg-black/95 rounded-lg p-2 min-w-32">
                    {qualities.map((quality, index) => (
                      <button
                        type="button"
                        key={index}
                        onClick={() => changeQuality(index)}
                        className={`w-full text-left px-2 py-1 text-sm rounded hover:bg-foreground/20 transition ${
                          currentQuality === index ? 'text-red-600' : ''
                        }`}
                      >
                        {quality}p
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => changeQuality(-1)}
                      className={`w-full text-left px-2 py-1 text-sm rounded hover:bg-foreground/20 transition ${
                        currentQuality === -1 ? 'text-red-600' : ''
                      }`}
                    >
                      自动
                    </button>
                  </div>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={toggleFullscreen}
              className="hover:text-red-600 transition"
            >
              <Maximize className="w-6 h-6"/>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}