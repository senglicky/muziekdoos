'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Song = {
    id: string;
    title: string;
    theme: { name: string };
    class: { name: string };
    createdAt: string;
};

export default function TeacherDashboard() {
    const [songs, setSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/songs?myUploads=true')
            .then(res => res.json())
            .then(data => {
                setSongs(data);
                setLoading(false);
            });
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Weet je zeker dat je dit liedje wilt verwijderen?")) return;

        const res = await fetch(`/api/songs?id=${id}`, { method: 'DELETE' });
        if (res.ok) {
            setSongs(songs.filter(s => s.id !== id));
        } else {
            alert("Kon liedje niet verwijderen.");
        }
    };

    return (
        <div className="glass-panel" style={{ padding: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h1 className="mobile-title" style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--primary)', margin: 0 }}>Mijn Liedjes</h1>
                <Link href="/teacher/upload" className="btn btn-accent" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: '800' }}>
                    <span style={{ fontSize: '1.5rem' }}>+</span> Nieuw Liedje
                </Link>
            </div>

            {loading ? (
                <p>Laden...</p>
            ) : songs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#f8fafc', borderRadius: '24px', border: '2px dashed #e2e8f0' }}>
                    <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '1.5rem' }}>Je hebt nog geen liedjes geüpload.</p>
                    <Link href="/teacher/upload" className="btn btn-primary">Start je eerste upload</Link>
                </div>
            ) : (
                <div className="admin-grid">
                    {songs.map(song => (
                        <div key={song.id} style={{
                            background: 'white',
                            padding: '1.75rem',
                            borderRadius: '24px',
                            border: '1px solid #e2e8f0',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1.25rem',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                            transition: 'all 0.2s'
                        }} className="song-card">
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '0.75rem' }}>{song.title}</h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    <span style={{ padding: '0.35rem 0.75rem', background: 'rgba(0, 103, 56, 0.05)', color: 'var(--primary)', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>
                                        📚 {song.theme.name}
                                    </span>
                                    <span style={{ padding: '0.35rem 0.75rem', background: 'rgba(34, 139, 109, 0.05)', color: 'var(--secondary)', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>
                                        🏫 {song.class.name}
                                    </span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                                <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '500' }}>
                                    📅 {new Date(song.createdAt).toLocaleDateString()}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleDelete(song.id)}
                                    className="btn"
                                    style={{
                                        background: '#fef2f2',
                                        color: '#ef4444',
                                        padding: '0.4rem 0.8rem',
                                        fontSize: '0.85rem'
                                    }}
                                >
                                    Verwijderen
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <style jsx>{`
                .song-card:hover {
                    transform: translateY(-4px);
                    border-color: var(--accent);
                    box-shadow: 0 12px 20px -5px rgba(0,0,0,0.1);
                }
                @media (max-width: 640px) {
                    .mobile-title {
                        font-size: 1.5rem !important;
                    }
                }
            `}</style>
        </div>
    );
}
