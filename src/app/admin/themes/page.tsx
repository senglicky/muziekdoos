'use client';

import { useState, useEffect } from 'react';
import AdminHeader from '@/components/AdminHeader';

type ThemeWithCounts = {
    id: string;
    name: string;
    _count: {
        songs: number;
    };
};

export default function ThemesPage() {
    const [themes, setThemes] = useState<ThemeWithCounts[]>([]);
    const [newThemeName, setNewThemeName] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchThemes();
    }, []);

    const fetchThemes = async () => {
        const res = await fetch('/api/themes');
        if (res.ok) {
            const data = await res.json();
            setThemes(data);
        }
        setLoading(false);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newThemeName.trim()) return;

        const res = await fetch('/api/themes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newThemeName }),
        });

        if (res.ok) {
            setNewThemeName('');
            fetchThemes();
        }
    };

    return (
        <div className="glass-panel" style={{ padding: '2.5rem' }}>
            <AdminHeader
                title="Thema's Beheer"
                subtitle="Organiseer liedjes per categorie of thema"
            />

            {/* Create Form */}
            <form onSubmit={handleCreate} style={{
                marginBottom: '3.5rem',
                display: 'flex',
                gap: '1.25rem',
                alignItems: 'flex-end',
                flexWrap: 'wrap'
            }}>
                <div style={{ flex: 1, minWidth: '300px' }}>
                    <label className="label">Nieuw Thema Naam</label>
                    <input
                        type="text"
                        className="input-field"
                        value={newThemeName}
                        onChange={(e) => setNewThemeName(e.target.value)}
                        placeholder="Bijv. Lente of Herfst"
                    />
                </div>
                <button type="submit" className="btn btn-primary" style={{ padding: '0.875rem 2rem' }}>
                    Thema Aanmaken
                </button>
            </form>

            {/* List */}
            <div className="admin-grid">
                {loading ? (
                    <p>Laden...</p>
                ) : themes.length === 0 ? (
                    <p style={{ color: '#64748b' }}>Nog geen thema's aangemaakt.</p>
                ) : (
                    themes.map((theme) => (
                        <div key={theme.id} style={{
                            background: 'white',
                            padding: '1.75rem',
                            borderRadius: '20px',
                            border: '1px solid #e2e8f0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                            transition: 'all 0.2s'
                        }} className="theme-card">
                            <div>
                                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '0.5rem' }}>{theme.name}</h3>
                                <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '600' }}>
                                    🎵 {theme._count.songs} liedjes
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <style jsx>{`
                .theme-card:hover {
                    transform: translateY(-4px);
                    border-color: var(--accent);
                    box-shadow: 0 12px 20px -5px rgba(0,0,0,0.1);
                }
            `}</style>
        </div>
    );
}
