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
                router.push('/teacher/player');
            } else {
                router.push('/');
            }
            router.refresh();
        }
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            overflowY: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--primary)', // Green background for the whole page
            padding: '1rem',
            zIndex: 50
        }}>
            {/* Central Card */}
            <div style={{
                display: 'flex',
                width: '100%',
                maxWidth: '900px', // Slightly narrower for better proportions
                minHeight: '500px', // Allow auto height but min 500
                background: 'white',
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)' // Deeper shadow
            }}>
                <style jsx>{`
                    @media (max-width: 900px) {
                        .image-panel {
                            display: none !important;
                        }
                        .login-form-container {
                            padding: 2.5rem !important;
                        }
                    }
                    .input-group:focus-within label {
                        color: var(--primary);
                    }
                `}</style>

                {/* Left Side - Login Form */}
                <div className="login-form-container" style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: '3rem 3.5rem',
                    background: 'white'
                }}>

                    <h1 style={{
                        fontSize: '1.85rem',
                        fontWeight: '800',
                        marginBottom: '0.25rem',
                        color: 'var(--primary)',
                        letterSpacing: '-0.025em'
                    }}>
                        Welkom bij de muziekdoos!
                    </h1>
                    <div style={{ height: '2px', width: '40px', background: 'var(--accent)', marginBottom: '2rem', borderRadius: '2px' }}></div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'left' }}>
                        <div className="input-group">
                            <label htmlFor="username" className="label" style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.35rem', transition: 'color 0.2s' }}>Gebruikersnaam</label>
                            <input
                                id="username"
                                type="text"
                                className="input-field"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Jouw gebruikersnaam"
                                required
                                style={{
                                    border: '2px solid #f1f5f9',
                                    background: '#f8fafc',
                                    padding: '0.875rem 1rem',
                                    fontSize: '1rem',
                                    fontWeight: '500'
                                }}
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="password" className="label" style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.35rem', transition: 'color 0.2s' }}>Wachtwoord</label>
                            <input
                                id="password"
                                type="password"
                                className="input-field"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                style={{
                                    border: '2px solid #f1f5f9',
                                    background: '#f8fafc',
                                    padding: '0.875rem 1rem',
                                    fontSize: '1rem',
                                    fontWeight: '500'
                                }}
                            />
                        </div>

                        {error && (
                            <div style={{
                                padding: '0.875rem',
                                background: '#fef2f2',
                                border: '1px solid #fee2e2',
                                borderRadius: '12px',
                                color: '#b91c1c',
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <span>⚠️</span> {error}
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary" style={{
                            marginTop: '1rem',
                            width: '100%',
                            padding: '1rem',
                            fontSize: '1.05rem',
                            fontWeight: '700',
                            letterSpacing: '0.025em',
                            boxShadow: '0 10px 20px -5px rgba(0, 103, 56, 0.4)'
                        }}>
                            Inloggen
                        </button>
                    </form>

                    <p style={{
                        marginTop: 'auto',
                        paddingTop: '2.5rem',
                        color: '#94a3b8',
                        fontSize: '0.85rem',
                        fontWeight: '500',
                        textAlign: 'center'
                    }}>
                        ontwikkeld door <a href="mailto:steven.englicky@corneliusschool.be" style={{ color: 'var(--primary)', textDecoration: 'none', borderBottom: '1px solid var(--primary)', paddingBottom: '1px' }}>meester Steven</a>
                    </p>
                </div>

                {/* Right Side - Image Panel */}
                <div className="image-panel" style={{
                    flex: 1,
                    position: 'relative',
                    background: '#f0fdf4' // Very light green bg for image panel
                }}>
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: 'url(/login-logo.png)',
                        backgroundSize: 'contain',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        margin: '2.5rem' // Increased padding for better centering
                    }} />
                </div>
            </div>
        </div>
    );
}
