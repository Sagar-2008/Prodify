import { useEffect, useRef, useState } from "react";
import { MusicContext } from "./MusicContext";

const musicFiles = import.meta.glob("../assets/music/**/*.mp3", {
  eager: true,
  query: "?url",
  import: "default",
});

const trackUrl = (category, filename) =>
  musicFiles[`../assets/music/${category}/${filename}`];

const PRESETS = {
  deep: {
    name: "Deep Focus",
    icon: "🎯",
    color: "from-purple-500 to-indigo-600",
    tracks: [
      {
        title: "Deep Calm",
        url: trackUrl("Deep Focus", "Deep Calm.mp3"),
      },
      {
        title: "Soft Focus",
        url: trackUrl("Deep Focus", "Soft Focus.mp3"),
      },
      {
        title: "Electrical Grid",
        url: trackUrl("Deep Focus", "Electrical Grid.mp3"),
      },
      {
        title: "Hypnotic Synth",
        url: trackUrl("Deep Focus", "Hypnotic Synth.mp3"),
      },
      {
        title: "Rose",
        url: trackUrl("Deep Focus", "Rose.mp3"),
      },
    ],
  },
  lofi: {
    name: "Lo-fi Beats",
    icon: "🎧",
    color: "from-pink-500 to-rose-600",
    tracks: [
      {
        title: "Calm Lofi",
        url: trackUrl("Lo-fi Beats", "Calm Lofi.mp3"),
      },
      {
        title: "Chill Vibes",
        url: trackUrl("Lo-fi Beats", "Chill Vibes.mp3"),
      },
      {
        title: "Good Night",
        url: trackUrl("Lo-fi Beats", "Good Night.mp3"),
      },
      {
        title: "Relax Summer",
        url: trackUrl("Lo-fi Beats", "Relax Summer.mp3"),
      },
      {
        title: "Tactical Pause",
        url: trackUrl("Lo-fi Beats", "Tactical Pause.mp3"),
      },
    ],
  },
  ambient: {
    name: "Ambient Space",
    icon: "🌌",
    color: "from-blue-500 to-cyan-600",
    tracks: [
      {
        title: "Space Ambient",
        url: trackUrl("Ambient Space", "Space Ambient.mp3"),
      },
      {
        title: "Celestial Drift",
        url: trackUrl("Ambient Space", "Celestial Drift.mp3"),
      },
      {
        title: "Nebula Ambient",
        url: trackUrl("Ambient Space", "Nebula Ambient.mp3"),
      },
      {
        title: "Silent Universe",
        url: trackUrl("Ambient Space", "Silent Universe.mp3"),
      },
      {
        title: "Ambient Guitar",
        url: trackUrl("Ambient Space", "Ambient Guitar.mp3"),
      },
    ],
  },
  cafe: {
    name: "Café Ambience",
    icon: "☕",
    color: "from-amber-500 to-orange-600",
    tracks: [
      {
        title: "Jazz Cafe",
        url: trackUrl("Cafe Ambience", "Jazz Cafe.mp3"),
      },
      {
        title: "Soothing Cafe",
        url: trackUrl("Cafe Ambience", "Soothing Cafe.mp3"),
      },
      {
        title: "Cafe Tokyo",
        url: trackUrl("Cafe Ambience", "Cafe Tokyo.mp3"),
      },
      {
        title: "Chill Cafe Vol. 2",
        url: trackUrl("Cafe Ambience", "Chill Cafe Vol. 2.mp3"),
      },
      {
        title: "Traditional Cafe Jazz",
        url: trackUrl("Cafe Ambience", "Traditional Cafe Jazz.mp3"),
      },
    ],
  },
  rain: {
    name: "Rain",
    icon: "🌧️",
    color: "from-slate-500 to-gray-600",
    tracks: [
      {
        title: "Gentle Rain",
        url: trackUrl("Rain", "Gentle Rain.mp3"),
      },
      {
        title: "Calm Rain Ambience",
        url: trackUrl("Rain", "Calm Rain Ambience.mp3"),
      },
      {
        title: "Calming Rain",
        url: trackUrl("Rain", "Calming Rain.mp3"),
      },
      {
        title: "Chilling In Rain",
        url: trackUrl("Rain", "Chilling In Rain.mp3"),
      },
      {
        title: "Soft Rain On Window Glass",
        url: trackUrl("Rain", "Soft Rain On Window Glass.mp3"),
      },
    ],
  },
  fireplace: {
    name: "Fireplace",
    icon: "🔥",
    color: "from-red-500 to-orange-700",
    tracks: [
      {
        title: "By the fireplace",
        url: trackUrl("Fireplace", "By the fireplace.mp3"),
      },
      {
        title: "Evening Bonfire",
        url: trackUrl("Fireplace", "Evening Bonfire.mp3"),
      },
      {
        title: "Bonfire Ambient",
        url: trackUrl("Fireplace", "Bonfire Ambient.mp3"),
      },
      {
        title: "Cracking Fireplace With Piano",
        url: trackUrl("Fireplace", "Cracking Fireplace With Piano.mp3"),
      },
      {
        title: "Relaxing Piano + Fireplace",
        url: trackUrl("Fireplace", "Relaxing Piano + Fireplace.mp3"),
      },
    ],
  },
  nature: {
    name: "Forest",
    icon: "🌲",
    color: "from-green-500 to-emerald-600",
    tracks: [
      {
        title: "Forest Ambience",
        url: trackUrl("Forest", "Forest Ambience.mp3"),
      },
      {
        title: "Cricket in Forest",
        url: trackUrl("Forest", "Cricket in Forest.mp3"),
      },
      {
        title: "Ambient Spring Forest",
        url: trackUrl("Forest", "Ambient Spring Forest.mp3"),
      },
      {
        title: "Forest Daytime",
        url: trackUrl("Forest", "Forest Daytime.mp3"),
      },
      {
        title: "Forest Wind With Crickets",
        url: trackUrl("Forest", "Forest Wind With Crickets.mp3"),
      },
    ],
  },
  ocean: {
    name: "Ocean Waves",
    icon: "🌊",
    color: "from-teal-500 to-blue-600",
    tracks: [
      {
        title: "Relaxing Ocean Waves",
        url: trackUrl("Waves", "Relaxing Ocean Waves.mp3"),
      },
      {
        title: "Soothing Ocean Waves",
        url: trackUrl("Waves", "Soothing Ocean Waves.mp3"),
      },
      {
        title: "Beach Ocean Waves",
        url: trackUrl("Waves", "Beach Ocean Waves.mp3"),
      },
      {
        title: "Water Ocean Waves",
        url: trackUrl("Waves", "Water Ocean Waves.mp3"),
      },
      {
        title: "Gentle Water Stream",
        url: trackUrl("Waves", "Gentle Water Stream.mp3"),
      },
    ],
  },
};

const MusicProvider = ({ children }) => {
  const audioRef = useRef(null);
  const wasPlayingRef = useRef(false);

  // Initialize audio once
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
  }, []);

  const [presetKey, setPresetKey] = useState("deep");
  const [trackIndex, setTrackIndex] = useState(0);
  const [volume, setVolume] = useState(0.6);
  const [muted, setMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const preset = PRESETS[presetKey];
  const track = preset.tracks[trackIndex];
  const playing = isPlaying;

  /* Load track only when track or preset changes */
  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;

    audio.src = track.url;
    audio.loop = false;

    const handleCanPlay = () => {
      setIsLoading(false);
      // Auto-play if was playing before track change
      if (wasPlayingRef.current) {
        audio.play().catch((err) => console.error("Play error:", err));
      }
    };
    const handleError = () => {
      setIsLoading(false);
      console.error("Failed to load audio");
    };

    const handleLoadStart = () => setIsLoading(true);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => {
      wasPlayingRef.current = true;
      setTrackIndex((i) => (i + 1) % preset.tracks.length);
    };

    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("error", handleError);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadstart", handleLoadStart);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [trackIndex, presetKey, track.url, preset]);

  /* Update volume without reloading audio */
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : volume;
    }
  }, [volume, muted]);

  /* Handle play/pause */
  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    if (playing) {
      wasPlayingRef.current = true;
      audio.play().catch((err) => console.error("Play error:", err));
    } else {
      wasPlayingRef.current = false;
      audio.pause();
    }
  }, [playing]);

  const play = () => {
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.play().catch((err) => console.error("Play error:", err));
    }
  };

  const pause = () => {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const next = () => {
    setTrackIndex((i) => (i + 1) % preset.tracks.length);
  };

  const changePreset = (key) => {
    setPresetKey(key);
    setTrackIndex(0);
  };

  return (
    <MusicContext.Provider
      value={{
        presets: PRESETS,
        presetKey,
        setPresetKey,
        changePreset,
        track,
        trackIndex,
        setTrackIndex,
        playing,
        play,
        pause,
        next,
        volume,
        setVolume,
        muted,
        setMuted,
        isLoading,
        preset,
        currentTime,
        duration,
        audioRef,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export { MusicProvider };
