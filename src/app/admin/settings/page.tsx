'use client';

import { useState } from 'react';
import AdminHeader from '@/components/AdminHeader';

export default function AdminSettingsPage() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword !== confirmPassword) {
            setError('Nieuwe wachtwoorden komen niet overeen');
            return;
        }

        if (newPassword.length < 6) {
            setError('Het nieuwe wachtwoord moet minimaal 6 tekens lang zijn');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/admin/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Er is een fout opgetreden');
            } else {
                setSuccess('Wachtwoord succesvol gewijzigd!');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            }
        } catch (err) {
            setError('Kan geen verbinding maken met de server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-panel" style={{ padding: '2.5rem' }}>
            <AdminHeader
                title="Admin Instellingen"
                subtitle="Beheer hier je persoonlijke accountgegevens"
            />

            <div style={{ maxWidth: '500px', marginTop: '1rem' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label className="label">Huidig Wachtwoord</label>
                        <input
                            type="password"
                            className="input-field"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="password-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label className="label">Nieuw Wachtwoord</label>
                            <input
                                type="password"
                                className="input-field"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="label">Bevestig Wachtwoord</label>
                            <input
                                type="password"
                                className="input-field"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div style={{
                            padding: '1rem',
                            background: '#fef2f2',
                            border: '1px solid #fee2e2',
                            borderRadius: '12px',
                            color: '#b91c1c',
                            fontSize: '0.875rem'
                        }}>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div style={{
                            padding: '1rem',
                            background: '#f0fdf4',
                            border: '1px solid #dcfce7',
                            borderRadius: '12px',
                            color: '#15803d',
                            fontSize: '0.875rem'
                        }}>
                            {success}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}
                    >
                        {loading ? 'Bijwerken...' : 'Wachtwoord Bijwerken'}
                    </button>
                </form>
            </div>
            <style jsx>{`
                @media (max-width: 640px) {
                    .password-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
}
