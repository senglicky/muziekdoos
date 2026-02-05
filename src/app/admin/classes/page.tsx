'use client';

import { useState, useEffect } from 'react';
import AdminHeader from '@/components/AdminHeader';

type ClassWithCounts = {
    id: string;
    name: string;
    _count: {
        teachers: number;
        songs: number;
    };
};

export default function ClassesPage() {
    const [classes, setClasses] = useState<ClassWithCounts[]>([]);
    const [newClassName, setNewClassName] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        const res = await fetch('/api/classes');
        if (res.ok) {
            const data = await res.json();
            setClasses(data);
        }
        setLoading(false);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newClassName.trim()) return;

        const res = await fetch('/api/classes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newClassName }),
        });

        if (res.ok) {
            setNewClassName('');
            fetchClasses();
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Weet je zeker dat je klas "${name}" wilt verwijderen?`)) return;

        const res = await fetch(`/api/classes?id=${id}`, {
            method: 'DELETE',
        });

        if (res.ok) {
            fetchClasses();
        } else {
            const error = await res.text();
            alert(error || "Fout bij verwijderen van klas.");
        }
    };

    return (
        <div className="glass-panel" style={{ padding: '2.5rem' }}>
            <AdminHeader
                title="Klassen Beheer"
                subtitle="Organiseer en beheer de verschillende klasgroepen"
            />

            {/* Create Form */}
            <form onSubmit={handleCreate} style={{ marginBottom: '3.5rem', display: 'flex', gap: '1.25rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '300px' }}>
                    <label className="label">Nieuwe Klas Naam</label>
                    <input
                        type="text"
                        className="input-field"
                        value={newClassName}
                        onChange={(e) => setNewClassName(e.target.value)}
                        placeholder="Bijv. De Vlinders"
                    />
                </div>
                <button type="submit" className="btn btn-primary" style={{ padding: '0.875rem 2rem' }}>
                    Klas Aanmaken
                </button>
            </form>

            {/* List */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {loading ? (
                    <p>Laden...</p>
                ) : classes.length === 0 ? (
                    <p style={{ color: '#64748b' }}>Nog geen klassen aangemaakt.</p>
                ) : (
                    classes.map((cls) => (
                        <div key={cls.id} style={{
                            background: 'white',
                            padding: '1.75rem',
                            borderRadius: '20px',
                            border: '1px solid #e2e8f0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                            transition: 'all 0.2s'
                        }} className="class-card">
                            <div>
                                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '0.5rem' }}>{cls.name}</h3>
                                <div style={{ display: 'flex', gap: '1rem', color: '#64748b', fontSize: '0.9rem', fontWeight: '500' }}>
                                    <span>👥 {cls._count.teachers}</span>
                                    <span>🎵 {cls._count.songs}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(cls.id, cls.name)}
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
                        </div>
                    ))
                )}
            </div>
            <style jsx>{`
                .class-card:hover {
                    transform: translateY(-4px);
                    border-color: var(--accent);
                    box-shadow: 0 12px 20px -5px rgba(0,0,0,0.1);
                }
            `}</style>
        </div>
    );
}
