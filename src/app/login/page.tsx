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
        <div className="login-container">
            {/* Central Card */}
            <div className="login-card">
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
                <div className="login-form-container">

                    <h1 className="login-title">
                        Welkom bij de muziekdoos!
                    </h1>
                    <div className="login-divider"></div>

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="login-input-group">
                            <label htmlFor="username" className="label">Gebruikersnaam</label>
                            <input
                                id="username"
                                type="text"
                                className="login-input"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Jouw gebruikersnaam"
                                required
                            />
                        </div>

                        <div className="login-input-group">
                            <label htmlFor="password" className="label">Wachtwoord</label>
                            <input
                                id="password"
                                type="password"
                                className="login-input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        {error && (
                            <div className="login-error">
                                <span>⚠️</span> {error}
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary login-button">
                            Inloggen
                        </button>
                    </form>

                    <p className="login-footer">
                        Korneel en clementine's muziekdoos V0.2b - ontwikkeld door <a href="mailto:steven.englicky@corneliusschool.be" className="login-footer-link">meester Steven</a>
                    </p>
                </div>

                {/* Right Side - Image Panel */}
                <div className="login-image-panel">
                    <div className="login-logo-bg" />
                </div>
            </div>
        </div>
    );
}
