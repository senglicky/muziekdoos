'use client';

import { useState, useEffect } from 'react';

type Song = {
    id: string;
    title: string;
    url: string;
    coverUrl?: string | null;
};

type Theme = {
    id: string;
    name: string;
    songs: Song[];
};

type ClassItem = {
    id: string;
    name: string;
    themes: Theme[]; // We will organize data by Class -> Theme -> Songs
};

export default function PlayerPage() {
    const [classesData, setClassesData] = useState<ClassItem[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
    const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);
    const [currentSong, setCurrentSong] = useState<Song | null>(null);
    const [isRepeating, setIsRepeating] = useState(false);
    const [isAutoplay, setIsAutoplay] = useState(false);
    const [isShuffle, setIsShuffle] = useState(false);
    const [shuffledQueue, setShuffledQueue] = useState<Song[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPlayerCollapsed, setIsPlayerCollapsed] = useState(false);

    const toggleShuffle = () => {
        const newShuffleState = !isShuffle;
        setIsShuffle(newShuffleState);
        if (newShuffleState) {
            if (selectedTheme) {
                const songs = [...selectedTheme.songs];
                // Fisher-Yates shuffle
                for (let i = songs.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [songs[i], songs[j]] = [songs[j], songs[i]];
                }
                setShuffledQueue(songs);
            }
        }
    };

    useEffect(() => {
        // We need a new API endpoint to get the hierarchy for the player
        // For now, let's reuse/adapt the existing APIs or fetch all and organize.
        // Better: Create a dedicated /api/player endpoint. 
        // Let's assume we fetch data... for now let's stub or use what we have.
        // Actually, I'll fetch /api/songs?myUploads=true is NOT enough, we need ALL songs for the teacher's classes.
        // Let's create `fetchData` that calls a new endpoint /api/player/data
        fetch('/api/player/data')
            .then(res => res.json())
            .then(data => {
                setClassesData(data);
                // If only one class, auto-select
                if (data.length === 1) setSelectedClassId(data[0].id);
                setLoading(false);
            });
    }, []);

    const selectedClass = classesData.find(c => c.id === selectedClassId);
    const selectedTheme = selectedClass?.themes.find(t => t.id === selectedThemeId);

    if (loading) return <div style={{ padding: '2rem' }}>Laden...</div>;

    return (
        <div className="glass-panel" style={{ padding: '2rem', minHeight: 'calc(100vh - 8rem)', display: 'flex', flexDirection: 'column' }}>

            {/* Header / Breadcrumbs */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 className="breadcrumb-title" style={{ fontSize: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary)', flexWrap: 'wrap' }}>
                    <span
                        className="breadcrumb-item"
                        style={{ cursor: 'pointer', opacity: selectedClassId ? 0.5 : 1, transition: 'opacity 0.2s' }}
                        onClick={() => { setSelectedClassId(null); setSelectedThemeId(null); setCurrentSong(null); }}
                    >
                        Muziek
                    </span>
                    {selectedClass && (
                        <>
                            <span style={{ opacity: 0.3 }}>/</span>
                            <span
                                className="breadcrumb-item"
                                style={{ cursor: 'pointer', opacity: selectedThemeId ? 0.5 : 1, transition: 'opacity 0.2s' }}
                                onClick={() => { setSelectedThemeId(null); setCurrentSong(null); }}
                            >
                                {selectedClass.name}
                            </span>
                        </>
                    )}
                    {selectedTheme && (
                        <>
                            <span style={{ opacity: 0.3 }}>/</span>
                            <span style={{ fontWeight: '800' }}>{selectedTheme.name}</span>
                        </>
                    )}
                </h1>
            </div>

            {/* Content Area */}
            <div style={{ flex: 1, overflowY: 'auto' }}>

                {/* Step 1: Class Selection */}
                {!selectedClassId && (
                    <div className="admin-grid">
                        {classesData.map(cls => (
                            <div
                                key={cls.id}
                                onClick={() => setSelectedClassId(cls.id)}
                                className="hover-card"
                                style={{
                                    background: 'var(--card-bg)',
                                    padding: '3.5rem 2rem',
                                    borderRadius: '24px',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    fontSize: '1.75rem',
                                    fontWeight: '800',
                                    color: 'var(--primary)',
                                    border: '2px solid var(--card-border)',
                                    boxShadow: 'var(--card-shadow)',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                            >
                                {cls.name}
                            </div>
                        ))}
                    </div>
                )}

                {/* Step 2: Theme Selection */}
                {selectedClassId && !selectedThemeId && (
                    <div className="admin-grid">
                        {selectedClass?.themes.map(theme => (
                            <div
                                key={theme.id}
                                onClick={() => setSelectedThemeId(theme.id)}
                                className="hover-card"
                                style={{
                                    background: 'var(--card-bg)',
                                    padding: '3.5rem 2rem',
                                    borderRadius: '24px',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    fontSize: '1.75rem',
                                    fontWeight: '800',
                                    color: 'var(--primary)',
                                    border: '2px solid var(--card-border)',
                                    boxShadow: 'var(--card-shadow)',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                            >
                                {theme.name}
                                <div style={{ fontSize: '1rem', marginTop: '0.75rem', color: 'var(--secondary)', fontWeight: '500' }}>
                                    {theme.songs.length} liedjes
                                </div>
                            </div>
                        ))}
                        {selectedClass?.themes.length === 0 && (
                            <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Geen thema's met liedjes gevonden voor deze klas.</p>
                        )}
                    </div>
                )}

                {/* Step 3: Song Selection & Player */}
                {selectedThemeId && (
                    <div className="player-layout">

                        {/* Song List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {selectedTheme?.songs.map(song => (
                                <div
                                    key={song.id}
                                    onClick={() => setCurrentSong(song)}
                                    style={{
                                        padding: '1.25rem 1.5rem',
                                        borderRadius: '16px',
                                        background: currentSong?.id === song.id ? 'rgba(0, 103, 56, 0.08)' : 'white',
                                        border: currentSong?.id === song.id ? '2px solid var(--primary)' : '2px solid #e2e8f0',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1.25rem',
                                        transition: 'all 0.2s',
                                        minHeight: '70px'
                                    }}
                                >
                                    <div style={{
                                        width: '44px', height: '44px', borderRadius: '12px',
                                        background: currentSong?.id === song.id ? 'var(--primary)' : '#f1f5f9',
                                        color: currentSong?.id === song.id ? 'white' : 'var(--primary)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '1.2rem'
                                    }}>
                                        {currentSong?.id === song.id ? '▶' : '♫'}
                                    </div>
                                    <span style={{ fontSize: '1.1rem', fontWeight: '600', color: currentSong?.id === song.id ? 'var(--primary)' : 'inherit' }}>
                                        {song.title}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Album Art & Title Area (Static) */}
                        <div style={{
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '32px',
                            padding: '3rem 2rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: 'fit-content',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                        }}>
                            {currentSong ? (
                                <>
                                    <div className="cover-art" style={{
                                        width: '240px', height: '240px', borderRadius: '28px',
                                        background: currentSong.coverUrl ? `url(${currentSong.coverUrl}) center/cover no-repeat` : 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                        marginBottom: '2rem',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '5rem',
                                        boxShadow: '0 20px 40px rgba(0, 103, 56, 0.15)',
                                        border: '6px solid white',
                                        transition: 'all 0.3s'
                                    }}>
                                        {!currentSong.coverUrl && <span style={{ color: 'white' }}>♫</span>}
                                    </div>
                                    <h2 style={{ marginBottom: '0.25rem', fontSize: '1.75rem', fontWeight: '800', color: 'var(--primary)' }}>{currentSong.title}</h2>
                                    <p style={{ color: '#64748b', marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '500' }}>{selectedTheme?.name}</p>
                                </>
                            ) : (
                                <p style={{ color: '#64748b', fontSize: '1.1rem', fontWeight: '500' }}>Selecteer een liedje om af te spelen</p>
                            )}
                        </div>

                    </div>
                )}
            </div>

            {/* Floating Player Controls */}
            {currentSong && (
                <div className={`floating-player-bar ${isPlayerCollapsed ? 'collapsed' : ''}`}>
                    <div className="player-bar-container">
                        <button
                            className="collapse-toggle"
                            onClick={() => setIsPlayerCollapsed(!isPlayerCollapsed)}
                            aria-label={isPlayerCollapsed ? "Toon speler" : "Verberg speler"}
                        >
                            {isPlayerCollapsed ? '▲' : '▼'}
                        </button>

                        {/* Audio Player (Always Rendered for Persistence) */}
                        <div style={{ display: isPlayerCollapsed ? 'none' : 'block', width: '100%', maxWidth: '100%', marginBottom: isPlayerCollapsed ? 0 : '1rem' }}>
                            <audio
                                controls
                                autoPlay
                                loop={isRepeating && !isAutoplay && !isShuffle}
                                src={currentSong.url}
                                className="custom-audio-player"
                                onEnded={() => {
                                    if (isRepeating && !isAutoplay && !isShuffle) return;

                                    if (isShuffle && shuffledQueue.length > 0) {
                                        const currentIndex = shuffledQueue.findIndex(s => s.id === currentSong.id);
                                        if (currentIndex !== -1) {
                                            if (currentIndex < shuffledQueue.length - 1) {
                                                setCurrentSong(shuffledQueue[currentIndex + 1]);
                                            } else if (isAutoplay) {
                                                setCurrentSong(shuffledQueue[0]);
                                            }
                                        }
                                    } else if (isAutoplay && selectedTheme) {
                                        const currentIndex = selectedTheme.songs.findIndex(s => s.id === currentSong.id);
                                        if (currentIndex !== -1) {
                                            if (currentIndex < selectedTheme.songs.length - 1) {
                                                setCurrentSong(selectedTheme.songs[currentIndex + 1]);
                                            } else if (isRepeating) {
                                                setCurrentSong(selectedTheme.songs[0]);
                                            }
                                        }
                                    }
                                }}
                            />
                        </div>

                        {!isPlayerCollapsed && (
                            <div className="player-controls-content">
                                <div className="mini-info">
                                    <span className="mini-title">{currentSong.title}</span>
                                    <span className="mini-theme">{selectedTheme?.name}</span>
                                </div>
                                <div style={{ height: '40px', width: '100%' }}></div>

                                <div className="control-buttons">
                                    <button
                                        onClick={() => setIsRepeating(!isRepeating)}
                                        className={`mini-btn ${isRepeating ? 'active' : ''}`}
                                        title="Herhalen"
                                    >
                                        <span>{isRepeating ? '🔁' : '🔄'}</span>
                                    </button>

                                    <button
                                        onClick={() => setIsAutoplay(!isAutoplay)}
                                        className={`mini-btn ${isAutoplay ? 'active' : ''}`}
                                        title="Autoplay"
                                    >
                                        <span>⏭️</span>
                                    </button>

                                    <button
                                        onClick={toggleShuffle}
                                        className={`mini-btn ${isShuffle ? 'active' : ''}`}
                                        title="Shuffle"
                                    >
                                        <span>🔀</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {isPlayerCollapsed && (
                            <div className="collapsed-content" onClick={() => setIsPlayerCollapsed(false)}>
                                <span className="playing-indicator">🎵</span>
                                <span className="now-playing-text">Aan het spelen: <strong>{currentSong.title}</strong></span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style jsx global>{`
        .hover-card:hover {
          transform: translateY(-8px);
          border-color: var(--accent) !important;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
        }
        .player-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 6rem; /* Space for the floating bar */
        }
        .floating-player-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-top: 1px solid rgba(0, 103, 56, 0.15);
          box-shadow: 0 -10px 40px rgba(0, 103, 56, 0.12);
          z-index: 1000;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          padding: 1rem 2rem;
          height: auto;
        }
        .floating-player-bar.collapsed {
          transform: translateY(calc(100% - 40px));
          background: rgba(255, 255, 255, 0.95);
          padding: 0 2rem;
        }
        .player-bar-container {
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          display: flex;
          flex-direction: column;
        }
        .collapse-toggle {
          position: absolute;
          top: -30px;
          right: 20px;
          background: var(--primary);
          color: white;
          border: none;
          width: 40px;
          height: 30px;
          border-radius: 12px 12px 0 0;
          cursor: pointer;
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.1);
        }
        .player-controls-content {
          display: grid;
          grid-template-columns: 200px 1fr 200px;
          align-items: center;
          gap: 2rem;
        }
        @media (min-width: 901px) {
            .player-controls-content {
                 display: flex;
                 justify-content: space-between;
                 width: 100%;
            }
        }
        .mini-info {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }
        .mini-title {
          font-weight: 800;
          color: var(--primary);
          font-size: 0.95rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .mini-theme {
          font-size: 0.8rem;
          color: #64748b;
          font-weight: 600;
        }
        .custom-audio-player {
          width: 100%;
          height: 40px;
          outline: none;
        }
        .control-buttons {
          display: flex;
          gap: 0.75rem;
          justify-content: flex-end;
        }
        .mini-btn {
          background: white;
          border: 1.5px solid var(--primary);
          color: var(--primary);
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 1.1rem;
        }
        .mini-btn.active {
          background: var(--primary);
          color: white;
          box-shadow: 0 4px 12px rgba(0, 103, 56, 0.2);
        }
        .mini-btn:hover {
          transform: translateY(-2px);
          background: rgba(0, 103, 56, 0.05);
        }
        .mini-btn.active:hover {
          background: var(--primary);
          opacity: 0.9;
        }
        .collapsed-content {
          height: 40px;
          display: flex;
          align-items: center;
          gap: 1rem;
          cursor: pointer;
        }
        .playing-indicator {
          animation: pulse 2s infinite;
        }
        .now-playing-text {
          font-size: 0.85rem;
          color: var(--primary);
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
        @media (max-width: 900px) {
          .player-controls-content {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          .mini-info, .control-buttons {
            display: none;
          }
          .floating-player-bar {
            padding: 1rem;
          }
        }
        @media (max-width: 900px) {
          .player-layout {
            grid-template-columns: 1fr;
          }
          .breadcrumb-title {
            font-size: 1.4rem !important;
          }
          .cover-art {
            width: 180px !important;
            height: 180px !important;
            font-size: 3rem !important;
          }
        }
        @media (max-width: 480px) {
          .breadcrumb-title {
            font-size: 1.1rem !important;
          }
          .breadcrumb-item {
            max-width: 100px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
      `}</style>
        </div>
    );
}
