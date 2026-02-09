

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
        classIds: [] as string[]
    });

    const [editingTeacher, setEditingTeacher] = useState<{ id: string, name: string, classIds: string[] } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        Promise.all([
            fetch('/api/teachers').then(res => res.json()),
            fetch('/api/classes').then(res => res.json())
        ]).then(([teachersData, classesData]) => {
            setTeachers(teachersData);
            setClasses(classesData);
            setLoading(false);
        });
    };

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
                classIds: formData.classIds
            }),
        });

        if (res.ok) {
            setFormData({ name: '', username: '', password: '', classIds: [] });
            loadData();
        } else {
            alert("Er ging iets mis. Mogelijk bestaat de gebruikersnaam al.");
        }
    };

    const handleResetPassword = async (id: string, name: string) => {
        const newPass = prompt(`Nieuw wachtwoord voor ${name}:`);
        if (!newPass) return;

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

    const handleUpdateClasses = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTeacher) return;

        const res = await fetch('/api/teachers', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: editingTeacher.id, classIds: editingTeacher.classIds })
        });

        if (res.ok) {
            setEditingTeacher(null);
            loadData();
        } else {
            alert("Fout bij bijwerken van klassen.");
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

    const toggleClassSelection = (id: string, currentIds: string[], setter: (ids: string[]) => void) => {
        if (currentIds.includes(id)) {
            setter(currentIds.filter(c => c !== id));
        } else {
            setter([...currentIds, id]);
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
                    <label className="label">Koppelen aan klassen</label>
                    <div style={{
                        display: 'flex', flexDirection: 'column', gap: '0.5rem',
                        maxHeight: '150px', overflowY: 'auto',
                        border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0.75rem', background: 'white'
                    }}>
                        {classes.map(c => (
                            <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={formData.classIds.includes(c.id)}
                                    onChange={() => toggleClassSelection(c.id, formData.classIds, (ids) => setFormData({ ...formData, classIds: ids }))}
                                    style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }}
                                />
                                {c.name}
                            </label>
                        ))}
                    </div>
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
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', flexWrap: 'wrap' }}>
                                <button
                                    type="button"
                                    onClick={() => setEditingTeacher({ id: t.id, name: t.name, classIds: t.classes.map(c => c.id) })}
                                    className="btn"
                                    style={{
                                        flex: 1,
                                        background: 'white',
                                        color: 'var(--primary)',
                                        border: '1px solid var(--primary)',
                                        padding: '0.5rem',
                                        fontSize: '0.8rem'
                                    }}
                                >
                                    Klassen
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleResetPassword(t.id, t.name)}
                                    className="btn"
                                    style={{
                                        flex: 1,
                                        background: 'rgba(56, 189, 248, 0.1)',
                                        color: '#0284c7',
                                        padding: '0.5rem',
                                        fontSize: '0.8rem'
                                    }}
                                >
                                    Wachtwoord
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDelete(t.id)}
                                    className="btn"
                                    style={{
                                        background: '#fef2f2',
                                        color: '#ef4444',
                                        padding: '0.5rem',
                                        fontSize: '0.8rem'
                                    }}
                                >
                                    Verwijderen
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Edit Modal */}
            {editingTeacher && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000, padding: '1rem'
                }}>
                    <form onSubmit={handleUpdateClasses} className="glass-panel" style={{ padding: '2.5rem', width: '100%', maxWidth: '420px', background: 'white' }}>
                        <h2 style={{ marginBottom: '0.5rem', fontWeight: '800', color: 'var(--primary)' }}>Klassen Bewerken</h2>
                        <p style={{ marginBottom: '1.5rem', color: '#64748b' }}>Voor {editingTeacher.name}</p>

                        <div style={{ marginBottom: '2rem' }}>
                            <div style={{
                                display: 'flex', flexDirection: 'column', gap: '0.5rem',
                                maxHeight: '250px', overflowY: 'auto',
                                border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0.75rem'
                            }}>
                                {classes.map(c => (
                                    <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1rem', cursor: 'pointer', padding: '0.25rem' }}>
                                        <input
                                            type="checkbox"
                                            checked={editingTeacher.classIds.includes(c.id)}
                                            onChange={() => toggleClassSelection(c.id, editingTeacher.classIds, (ids) => setEditingTeacher({ ...editingTeacher, classIds: ids }))}
                                            style={{ accentColor: 'var(--primary)', width: '18px', height: '18px' }}
                                        />
                                        {c.name}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Opslaan</button>
                            <button
                                type="button"
                                onClick={() => setEditingTeacher(null)}
                                className="btn"
                                style={{ flex: 1, background: '#f1f5f9', color: '#475569' }}
                            >
                                Annuleren
                            </button>
                        </div>
                    </form>
                </div>
            )}

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
