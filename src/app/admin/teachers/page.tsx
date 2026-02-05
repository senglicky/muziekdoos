'use client';

import { useState, useEffect } from 'react';
import AdminHeader from '@/components/AdminHeader';

type ClassItem = { id: string; name: string };
type Teacher = {
    id: string;
    name: string;
    username: string;
    classes: ClassItem[]
};

export default function TeachersPage() {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [classes, setClasses] = useState<ClassItem[]>([]);

    const [formData, setFormData] = useState({
        name: '',
        username: '',
        password: '',
        classId: '' // Simplified for now: one initial class
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch('/api/teachers').then(res => res.json()),
            fetch('/api/classes').then(res => res.json())
        ]).then(([teachersData, classesData]) => {
            setTeachers(teachersData);
            setClasses(classesData);
            setLoading(false);
        });
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.username || !formData.password) return;

        const res = await fetch('/api/teachers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: formData.name,
                username: formData.username,
                password: formData.password,
                classIds: formData.classId ? [formData.classId] : []
            }),
        });

        if (res.ok) {
            setFormData({ name: '', username: '', password: '', classId: '' });
            // Refresh list
            const teachersData = await fetch('/api/teachers').then(d => d.json());
            setTeachers(teachersData);
        } else {
            alert("Er ging iets mis. Mogelijk bestaat de gebruikersnaam al.");
        }
    };

    const handleResetPassword = async (id: string, newPass: string) => {
        const res = await fetch('/api/teachers', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, password: newPass })
        });

        if (res.ok) {
            alert("Wachtwoord is succesvol gewijzigd.");
        } else {
            alert("Fout bij wijzigen van wachtwoord.");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Weet je zeker dat je deze leerkracht wilt verwijderen?")) return;

        const res = await fetch(`/api/teachers?id=${id}`, { method: 'DELETE' });
        if (res.ok) {
            setTeachers(teachers.filter(t => t.id !== id));
        } else {
            alert("Kon leerkracht niet verwijderen.");
        }
    };

    return (
        <div className="glass-panel" style={{ padding: '2.5rem' }}>
            <AdminHeader
                title="Leerkrachten Beheer"
                subtitle="Beheer de accounts van alle leerkrachten"
            />

            {/* Create Form */}
            <form onSubmit={handleCreate} className="responsive-form" style={{
                marginBottom: '3.5rem',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1.5rem',
                background: '#f8fafc',
                padding: '2rem',
                borderRadius: '20px',
                border: '1px solid #e2e8f0'
            }}>
                <div style={{ gridColumn: '1 / -1' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '0.5rem' }}>Nieuwe Leerkracht</h3>
                </div>

                <div>
                    <label className="label">Naam</label>
                    <input
                        type="text"
                        className="input-field"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Juf Els"
                        required
                    />
                </div>

                <div>
                    <label className="label">Koppelen aan klas</label>
                    <select
                        className="input-field"
                        value={formData.classId}
                        onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                        style={{ appearance: 'auto' }}
                    >
                        <option value="">Geen klas</option>
                        {classes.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="label">Gebruikersnaam</label>
                    <input
                        type="text"
                        className="input-field"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        placeholder="els"
                        required
                    />
                </div>

                <div>
                    <label className="label">Wachtwoord</label>
                    <input
                        type="password"
                        className="input-field"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="••••••"
                        required
                    />
                </div>

                <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                    <button type="submit" className="btn btn-primary" style={{ padding: '0.875rem 2rem' }}>
                        Leerkracht Aanmaken
                    </button>
                </div>
            </form>

            {/* List */}
            <div className="admin-grid">
                {loading ? (
                    <p>Laden...</p>
                ) : teachers.length === 0 ? (
                    <p style={{ color: '#64748b' }}>Nog geen leerkrachten aangemaakt.</p>
                ) : (
                    teachers.map((t) => (
                        <div key={t.id} style={{
                            background: 'white',
                            padding: '1.75rem',
                            borderRadius: '20px',
                            border: '1px solid #e2e8f0',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1.5rem',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                            transition: 'all 0.2s'
                        }} className="teacher-card">
                            <div>
                                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                                    {t.name} <span style={{ fontSize: '0.95rem', color: '#64748b', fontWeight: '500' }}>({t.username})</span>
                                </h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {t.classes.length > 0 ? t.classes.map(c => (
                                        <span key={c.id} style={{
                                            background: 'rgba(0, 103, 56, 0.05)',
                                            color: 'var(--primary)',
                                            padding: '0.35rem 0.85rem',
                                            borderRadius: '20px',
                                            fontSize: '0.85rem',
                                            fontWeight: '600'
                                        }}>
                                            {c.name}
                                        </span>
                                    )) : (
                                        <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: '500' }}>Geen klas gekoppeld</span>
                                    )}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newPass = prompt(`Nieuw wachtwoord voor ${t.name}:`);
                                        if (newPass) handleResetPassword(t.id, newPass);
                                    }}
                                    className="btn"
                                    style={{
                                        flex: 1,
                                        background: 'rgba(56, 189, 248, 0.1)',
                                        color: '#0284c7',
                                        padding: '0.5rem 1rem',
                                        fontSize: '0.85rem'
                                    }}
                                >
                                    Reset Wachtwoord
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDelete(t.id)}
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
                        </div>
                    ))
                )}
            </div>
            <style jsx>{`
                .teacher-card:hover {
                    transform: translateY(-4px);
                    border-color: var(--accent);
                    box-shadow: 0 12px 20px -5px rgba(0,0,0,0.1);
                }
                @media (max-width: 640px) {
                    .responsive-form {
                        grid-template-columns: 1fr !important;
                        padding: 1.25rem !important;
                    }
                }
            `}</style>
        </div>
    );
}
