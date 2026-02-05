'use client';

import { signIn, getSession } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const res = await signIn('credentials', {
            username,
            password,
            redirect: false,
        });

        if (res?.error) {
            setError('Ongeldige gebruikersnaam of wachtwoord');
        } else {
            const session = await getSession();
            if (session?.user.role === 'ADMIN') {
                router.push('/admin');
            } else if (session?.user.role === 'TEACHER') {
                router.push('/teacher');
            } else {
                router.push('/');
            }
            router.refresh();
        }
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 'calc(100vh - 120px)',
            padding: '1rem',
            position: 'relative'
        }}>
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.4)), url(/login-bg.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                zIndex: -1
            }} />
            <div className="glass-panel" style={{
                width: '100%',
                maxWidth: '420px',
                padding: '3rem',
                textAlign: 'center'
            }}>
                <div style={{
                    width: '120px',
                    height: '120px',
                    background: 'white',
                    borderRadius: '30px',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 2rem',
                    boxShadow: '0 12px 24px rgba(0, 103, 56, 0.15)',
                    border: '4px solid var(--accent)'
                }}>
                    <img src="/logo.jpg" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>

                <h1 style={{
                    fontSize: '2rem',
                    fontWeight: '800',
                    marginBottom: '0.5rem',
                    color: 'var(--primary)',
                    letterSpacing: '-0.025em'
                }}>
                    Welkom bij de muziekdoos!
                </h1>
                <p style={{ color: '#64748b', marginBottom: '2.5rem', fontSize: '1.1rem', fontWeight: '500' }}>
                    Korneel en Clementine vieren feest met jou 🎉
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
                    <div>
                        <label htmlFor="username" className="label">Gebruikersnaam</label>
                        <input
                            id="username"
                            type="text"
                            className="input-field"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Jouw gebruikersnaam"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="label">Wachtwoord</label>
                        <input
                            id="password"
                            type="password"
                            className="input-field"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && (
                        <div style={{
                            padding: '1rem',
                            background: '#fef2f2',
                            border: '1px solid #fee2e2',
                            borderRadius: '12px',
                            color: '#b91c1c',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                        }}>
                            {error}
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }}>
                        Inloggen
                    </button>
                </form>
            </div>
        </div>
    );

}
