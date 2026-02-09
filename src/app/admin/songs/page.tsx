'use client';

import { useState, useEffect } from 'react';
import AdminHeader from '@/components/AdminHeader';

type Theme = { id: string; name: string };
type Class = { id: string; name: string };
type Song = {
    id: string;
    title: string;
    theme: Theme;
    classes: Class[];
    url: string;
};

export default function AdminSongsPage() {
    const [songs, setSongs] = useState<Song[]>([]);
    const [themes, setThemes] = useState<Theme[]>([]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState(true);

    const [editingSong, setEditingSong] = useState<{ id: string, title: string, themeId: string, classIds: string[] } | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [songsRes, themesRes, classesRes] = await Promise.all([
                fetch('/api/songs'),
                fetch('/api/themes'),
                fetch('/api/classes')
            ]);

            if (songsRes.ok) setSongs(await songsRes.json());
            if (themesRes.ok) setThemes(await themesRes.json());
            if (classesRes.ok) setClasses(await classesRes.json());
        } catch (error) {
            console.error("Failed to load data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Weet je zeker dat je "${title}" wilt verwijderen?`)) return;

        const res = await fetch(`/api/songs?id=${id}`, { method: 'DELETE' });
        if (res.ok) {
            setSongs(songs.filter(s => s.id !== id));
        } else {
            alert("Kon liedje niet verwijderen.");
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingSong) return;

        const res = await fetch('/api/songs', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: editingSong.id,
                title: editingSong.title,
                themeId: editingSong.themeId,
                classIds: editingSong.classIds
            }),
        });

        if (res.ok) {
            setEditingSong(null);
            loadData();
        } else {
            alert("Fout bij bijwerken van liedje.");
        }
    };

    return (
        <div className="glass-panel" style={{ padding: '2.5rem' }}>
            <AdminHeader
                title="Liedjes Beheer"
                subtitle="Bekijk en bewerk alle geüploade liedjes"
                rightElement={
                    <div style={{ fontSize: '0.95rem', color: '#64748b', fontWeight: '600', background: '#f8fafc', padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        Totaal: {songs.length} liedjes
                    </div>
                }
            />

            {loading ? (
                <p>Laden...</p>
            ) : (
                <div style={{ overflowX: 'auto', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', background: 'white' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                <th style={{ padding: '1.25rem', fontWeight: '700', color: '#475569' }}>Titel</th>
                                <th style={{ padding: '1.25rem', fontWeight: '700', color: '#475569' }}>Thema</th>
                                <th style={{ padding: '1.25rem', fontWeight: '700', color: '#475569' }}>Klassen</th>
                                <th style={{ padding: '1.25rem', fontWeight: '700', color: '#475569' }}>Acties</th>
                            </tr>
                        </thead>
                        <tbody>
                            {songs.map(song => (
                                <tr key={song.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} className="table-row">
                                    <td style={{ padding: '1.25rem', fontWeight: '600' }}>{song.title}</td>
                                    <td style={{ padding: '1.25rem' }}>
                                        <span style={{ padding: '0.4rem 0.8rem', background: 'rgba(0, 103, 56, 0.05)', color: 'var(--primary)', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600' }}>
                                            {song.theme.name}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.25rem' }}>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                            {song.classes && song.classes.map(c => (
                                                <span key={c.id} style={{ padding: '0.4rem 0.8rem', background: 'rgba(34, 139, 109, 0.05)', color: 'var(--secondary)', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600' }}>
                                                    {c.name}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem', display: 'flex', gap: '0.75rem' }}>
                                        <button
                                            onClick={() => setEditingSong({
                                                id: song.id,
                                                title: song.title,
                                                themeId: song.theme.id,
                                                classIds: song.classes.map(c => c.id)
                                            })}
                                            className="btn"
                                            style={{
                                                background: 'white',
                                                color: 'var(--primary)',
                                                border: '1px solid var(--primary)',
                                                padding: '0.5rem 1rem',
                                                fontSize: '0.85rem'
                                            }}
                                        >
                                            Bewerken
                                        </button>
                                        <button
                                            onClick={() => handleDelete(song.id, song.title)}
                                            className="btn"
                                            style={{
                                                background: '#fef2f2',
                                                color: '#ef4444',
                                                padding: '0.5rem 1rem',
                                                fontSize: '0.85rem'
                                            }}
                                        >
                                            Verwijderen
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Edit Modal / Form */}
            {editingSong && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000, padding: '1rem'
                }}>
                    <form onSubmit={handleUpdate} className="glass-panel" style={{ padding: '2.5rem', width: '100%', maxWidth: '480px' }}>
                        <h2 style={{ marginBottom: '1.75rem', fontWeight: '800', color: 'var(--primary)' }}>Liedje Bewerken</h2>

                        <div style={{ marginBottom: '1.25rem' }}>
                            <label className="label">Titel</label>
                            <input
                                type="text"
                                className="input-field"
                                value={editingSong.title}
                                onChange={e => setEditingSong({ ...editingSong, title: e.target.value })}
                            />
                        </div>

                        <div style={{ marginBottom: '1.25rem' }}>
                            <label className="label">Thema</label>
                            <select
                                className="input-field"
                                value={editingSong.themeId}
                                onChange={e => setEditingSong({ ...editingSong, themeId: e.target.value })}
                                style={{ appearance: 'auto' }}
                            >
                                {themes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>

                        <div style={{ marginBottom: '1.25rem' }}>
                            <label className="label">Klassen</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '150px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0.75rem' }}>
                                {classes.map(c => (
                                    <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            value={c.id}
                                            checked={editingSong.classIds.includes(c.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setEditingSong({ ...editingSong, classIds: [...editingSong.classIds, c.id] });
                                                } else {
                                                    setEditingSong({ ...editingSong, classIds: editingSong.classIds.filter(id => id !== c.id) });
                                                }
                                            }}
                                            style={{ accentColor: 'var(--primary)', width: '18px', height: '18px' }}
                                        />
                                        {c.name}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
                            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Opslaan</button>
                            <button
                                type="button"
                                onClick={() => setEditingSong(null)}
                                className="btn"
                                style={{ flex: 1, background: '#f1f5f9', color: '#475569' }}
                            >
                                Annuleren
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <style jsx global>{`
                .table-row:hover {
                    background: #f8fafc !important;
                }
            `}</style>
        </div>
    );

}
