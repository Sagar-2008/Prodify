import { createContext, useEffect, useRef, useState } from "react";
import { usePomodoro } from "./PomodoroContext";

export const MusicContext = createContext();

const PRESETS = {
  deep: {
    name: "Deep Focus",
    icon: "🎯",
    color: "from-purple-500 to-indigo-600",
    tracks: [
      {
        title: "Deep Focus Flow",
        url: "",
      },
      {
        title: "Concentration",
        url: "https://cdn.pixabay.com/audio/2022/03/10/audio_d1718ab41b.mp3",
      },
    ],
  },
  lofi: {
    name: "Lo-fi Beats",
    icon: "🎧",
    color: "from-pink-500 to-rose-600",
    tracks: [
      {
        title: "Lo-fi Chill",
        url: "https://cdn.pixabay.com/audio/2022/03/15/audio_4b6d0e2a1a.mp3",
      },
      {
        title: "Chill Vibes",
        url: "/src/assets/music/Chill Vibes.mp3",
      },
    ],
  },
  ambient: {
    name: "Ambient Space",
    icon: "🌌",
    color: "from-blue-500 to-cyan-600",
    tracks: [
      {
        title: "Cosmic Journey",
        url: "https://cdn.pixabay.com/audio/2021/11/25/audio_91b3c3c2f3.mp3",
      },
      {
        title: "Ethereal Dreams",
        url: "https://cdn.pixabay.com/audio/2022/05/13/audio_477548bf2a.mp3",
      },
    ],
  },
  cafe: {
    name: "Café Ambience",
    icon: "☕",
    color: "from-amber-500 to-orange-600",
    tracks: [
      {
        title: "Coffee Shop",
        url: "https://cdn.pixabay.com/audio/2022/03/24/audio_c8a87b3f8c.mp3",
      },
    ],
  },
  rain: {
    name: "Light Rain",
    icon: "🌧️",
    color: "from-slate-500 to-gray-600",
    tracks: [
      {
        title: "Gentle Rain",
        url: "https://cdn.pixabay.com/audio/2022/03/12/audio_b11c036db7.mp3",
      },
    ],
  },
  storm: {
    name: "Thunderstorm",
    icon: "⛈️",
    color: "from-zinc-600 to-slate-700",
    tracks: [
      {
        title: "Heavy Rain & Thunder",
        url: "https://cdn.pixabay.com/audio/2021/08/04/audio_c91acf9fc5.mp3",
      },
    ],
  },
  fireplace: {
    name: "Fireplace",
    icon: "🔥",
    color: "from-red-500 to-orange-700",
    tracks: [
      {
        title: "Crackling Fire",
        url: "https://cdn.pixabay.com/audio/2022/03/10/audio_69f57a4b47.mp3",
      },
    ],
  },
  nature: {
    name: "Forest",
    icon: "🌲",
    color: "from-green-500 to-emerald-600",
    tracks: [
      {
        title: "Forest Sounds",
        url: "https://cdn.pixabay.com/audio/2022/03/09/audio_4838e90f61.mp3",
      },
    ],
  },
  ocean: {
    name: "Ocean Waves",
    icon: "🌊",
    color: "from-teal-500 to-blue-600",
    tracks: [
      {
        title: "Calm Waves",
        url: "https://cdn.pixabay.com/audio/2022/06/07/audio_9614468b90.mp3",
      },
    ],
  },
};

export const MusicProvider = ({ children }) => {
  const audioRef = useRef(new Audio());
  const { running, isSession } = usePomodoro();

  const [presetKey, setPresetKey] = useState("deep");
  const [trackIndex, setTrackIndex] = useState(0);
  const [volume, setVolume] = useState(0.6);
  const [muted, setMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isManuallyPlaying, setIsManuallyPlaying] = useState(false);

  const preset = PRESETS[presetKey];
  const track = preset.tracks[trackIndex];
  const pomodoroPlaying = running && isSession;
  const playing = isManuallyPlaying || pomodoroPlaying;

  /* Load track */
  useEffect(() => {
    const audio = audioRef.current;

    audio.src = track.url;
    audio.loop = true;
    audio.volume = muted ? 0 : volume;

    const handleCanPlay = () => setIsLoading(false);
    const handleError = () => {
      setIsLoading(false);
      console.error("Failed to load audio");
    };

    const handleLoadStart = () => setIsLoading(true);

    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("error", handleError);

    if (playing) {
      audio.play().catch((err) => console.error("Play error:", err));
    }

    return () => {
      audio.removeEventListener("loadstart", handleLoadStart);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("error", handleError);
    };
  }, [trackIndex, presetKey, playing, muted, volume, track.url]);

  /* Volume / mute */
  useEffect(() => {
    audioRef.current.volume = muted ? 0 : volume;
  }, [volume, muted]);

  /* Pomodoro auto sync */
  useEffect(() => {
    const audio = audioRef.current;
    if (running && isSession && isManuallyPlaying) {
      audio.play().catch((err) => console.error("Play error:", err));
    } else if (!running || !isSession) {
      if (!isManuallyPlaying) {
        audio.pause();
      }
    }
  }, [running, isSession, isManuallyPlaying]);

  const play = () => {
    setIsManuallyPlaying(true);
    audioRef.current.play().catch((err) => console.error("Play error:", err));
  };

  const pause = () => {
    setIsManuallyPlaying(false);
    audioRef.current.pause();
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
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};
