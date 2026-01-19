import { useMusic } from "../../hooks/useMusic";
import { Play, Pause, SkipForward, Volume2, VolumeX } from "lucide-react";
import "../../styles/Music.css";

// Preset Card Component
function PresetCard({ preset, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`music-preset ${isActive ? "active" : ""}`}
    >
      <div className="music-preset-content">
        <span className="preset-icon">{preset.icon}</span>
        <span className="preset-name">{preset.name}</span>
      </div>
    </button>
  );
}

// Player Controls Component
function PlayerControls({ isPlaying, onPlay, onPause, onNext }) {
  return (
    <div className="music-playback-controls">
      <button
        onClick={isPlaying ? onPause : onPlay}
        className="music-btn music-btn-play"
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          <Pause className="music-btn-icon" fill="white" />
        ) : (
          <Play className="music-btn-icon" fill="white" />
        )}
      </button>
      <button
        onClick={onNext}
        className="music-btn music-btn-next"
        aria-label="Next track"
      >
        <SkipForward className="music-btn-icon" />
      </button>
    </div>
  );
}

// Volume Control Component
function VolumeControl({ volume, muted, onVolumeChange, onMuteToggle }) {
  const displayVolume = muted ? 0 : volume;

  return (
    <div className="music-volume">
      <button
        onClick={onMuteToggle}
        className="music-volume-btn"
        aria-label={muted ? "Unmute" : "Mute"}
      >
        {muted ? (
          <VolumeX className="music-volume-icon" />
        ) : (
          <Volume2 className="music-volume-icon" />
        )}
      </button>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={displayVolume}
        onChange={(e) => onVolumeChange(Number(e.target.value))}
        className="music-volume-slider"
        aria-label="Volume"
      />
      <span className="music-volume-value">
        {Math.round(displayVolume * 100)}%
      </span>
    </div>
  );
}

// Main Music Component
export default function Music() {
  const {
    presets,
    presetKey,
    setPresetKey,
    track,
    trackIndex,
    setTrackIndex,
    play,
    pause,
    next,
    volume,
    setVolume,
    muted,
    setMuted,
    isLoading,
    preset,
    playing,
    currentTime,
    duration,
    audioRef,
  } = useMusic();

  const handleSeek = (e) => {
    if (audioRef && audioRef.current) {
      audioRef.current.currentTime = Number(e.target.value);
    }
  };

  return (
    <div className="music-container-compact">
      {/* Now Playing Card - Compact */}
      <div className="music-player-compact">
        <div className="music-player-compact-content">
          <div className="music-track-compact">
            <div className="music-track-icon-compact">{preset?.icon}</div>
            <div className="music-track-info-compact">
              <p className="music-label-compact">Now Playing</p>
              <h3 className="music-title-compact">{track?.title}</h3>
              <p className="music-subtitle-compact">{preset?.name}</p>
            </div>
            <div className="music-player-right">
              <PlayerControls
                isPlaying={playing}
                onPlay={play}
                onPause={pause}
                onNext={next}
              />
              <VolumeControl
                volume={volume}
                muted={muted}
                onVolumeChange={setVolume}
                onMuteToggle={() => setMuted(!muted)}
              />
            </div>
          </div>

          {/* Progress Slider */}
          <div className="music-progress-container">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime || 0}
              onChange={handleSeek}
              className="music-progress-slider"
              aria-label="Song progress"
            />
            <div className="music-time-display">
              <span className="music-current-time">
                {Math.floor(currentTime)}s
              </span>
              <span className="music-duration">{Math.floor(duration)}s</span>
            </div>
          </div>

          {/* Loading Indicator */}
          {isLoading && (
            <div className="music-loading-compact">
              <div className="music-progress-bar">
                <div className="music-progress-fill" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Presets Grid */}
      <div className="music-section">
        <h3 className="music-section-title">Ambient Sounds</h3>
        <div className="music-presets-grid">
          {Object.entries(presets).map(([key, p]) => (
            <PresetCard
              key={key}
              preset={p}
              isActive={presetKey === key}
              onClick={() => {
                pause();
                setPresetKey(key);
                setTrackIndex(0);
              }}
            />
          ))}
        </div>
      </div>

      {/* Track List */}
      <div className="music-track-list">
        <h3 className="music-track-list-title">Tracks</h3>
        <ul className="music-track-items">
          {preset?.tracks.map((t, idx) => (
            <li
              key={idx}
              className={`music-track-item ${idx === trackIndex ? "active" : ""}`}
              onClick={() => {
                setTrackIndex(idx);
                play();
              }}
            >
              <span className="track-number">{idx + 1}</span>
              <span className="track-title">{t.title}</span>
              {idx === trackIndex && <span className="track-indicator">▶</span>}
            </li>
          ))}
        </ul>
      </div>

      {/* Track Info */}
      <div className="music-footer-compact">
        <p>
          Track {trackIndex + 1} of {preset?.tracks.length || 0}
        </p>
      </div>
    </div>
  );
}
