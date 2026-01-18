import { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/Music.css";

export default function Music() {
  const [musicList, setMusicList] = useState([]);
  const [newYoutubeUrl, setNewYoutubeUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [selectedMusic, setSelectedMusic] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE = "http://localhost:5000/music";

  const getHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  useEffect(() => {
    fetchMusic();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMusic = async () => {
    try {
      const res = await axios.get(API_BASE, { headers: getHeaders() });
      setMusicList(res.data.data || []);
    } catch (err) {
      console.error("Error fetching music:", err);
    } finally {
      setLoading(false);
    }
  };

  // Extract YouTube video ID from URL
  const extractVideoId = (url) => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1] || match[0];
    }

    return null;
  };

  // Get embed URL
  const getEmbedUrl = (youtubeUrl) => {
    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) return null;
    return `https://www.youtube.com/embed/${videoId}`;
  };

  // Auto-extract title from URL (if possible) or use manual input
  const handleUrlChange = (url) => {
    setNewYoutubeUrl(url);
    // Simple title extraction - user can override
    if (url && !newTitle) {
      const videoId = extractVideoId(url);
      if (videoId) {
        setNewTitle(`YouTube Video ${videoId.substring(0, 8)}...`);
      }
    }
  };

  const saveMusic = async (e) => {
    e.preventDefault();
    if (!newYoutubeUrl.trim()) {
      alert("Please enter a YouTube URL");
      return;
    }

    if (!extractVideoId(newYoutubeUrl)) {
      alert("Invalid YouTube URL");
      return;
    }

    if (!newTitle.trim()) {
      setNewTitle("Untitled");
    }

    try {
      await axios.post(
        API_BASE,
        { title: newTitle.trim(), youtubeUrl: newYoutubeUrl.trim() },
        { headers: getHeaders() }
      );
      setNewYoutubeUrl("");
      setNewTitle("");
      await fetchMusic();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save music");
    }
  };

  const deleteMusic = async (id) => {
    if (!confirm("Are you sure you want to delete this music?")) return;

    try {
      await axios.delete(`${API_BASE}/${id}`, { headers: getHeaders() });
      await fetchMusic();
      if (selectedMusic?.id === id) {
        setSelectedMusic(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete music");
    }
  };

  if (loading) {
    return <div className="music-loading">Loading music...</div>;
  }

  return (
    <div className="music-page">
      <div className="music-header">
        <h1>Focus Music</h1>
        <p>Save and play your favorite YouTube music for focus sessions</p>
      </div>

      {/* Add Music Form */}
      <form onSubmit={saveMusic} className="music-form">
        <input
          type="url"
          placeholder="YouTube URL (e.g., https://youtube.com/watch?v=...)"
          value={newYoutubeUrl}
          onChange={(e) => handleUrlChange(e.target.value)}
          className="music-url-input"
        />
        <input
          type="text"
          placeholder="Title (auto-filled, or enter custom)"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="music-title-input"
        />
        <button type="submit" className="btn-primary music-btn">
          Save Music
        </button>
      </form>

      <div className="music-container">
        {/* Left: Music List */}
        <div className="music-sidebar">
          <h3>Saved Music ({musicList.length})</h3>
          {musicList.length === 0 ? (
            <div className="music-empty">No music saved yet. Add some above!</div>
          ) : (
            <div className="music-list">
              {musicList.map((music) => (
                <div
                  key={music.id}
                  className={`music-item ${selectedMusic?.id === music.id ? "active" : ""}`}
                  onClick={() => setSelectedMusic(music)}
                >
                  <div className="music-item-title">{music.title}</div>
                  <button
                    className="music-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMusic(music.id);
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Player */}
        <div className="music-player">
          {selectedMusic ? (
            <>
              <h2>{selectedMusic.title}</h2>
              <div className="player-wrapper">
                {getEmbedUrl(selectedMusic.youtube_url) ? (
                  <iframe
                    src={getEmbedUrl(selectedMusic.youtube_url)}
                    title={selectedMusic.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="youtube-player"
                  />
                ) : (
                  <div className="player-error">Invalid YouTube URL</div>
                )}
              </div>
              <p className="music-note">
                Music will play here. Use this for your focus sessions!
              </p>
            </>
          ) : (
            <div className="music-select-prompt">
              <p>Select a music from the list to start playing</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
