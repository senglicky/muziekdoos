'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';

export default function Navbar() {
    const { data: session } = useSession();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    if (!session) return null;

    const isAdmin = session.user.role === 'ADMIN';

    return (
        <nav style={{
            background: 'var(--header-bg)',
            color: 'white',
            padding: '1rem 1.5rem',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
            <div className="main-content" style={{
                padding: 0,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        width: '50px',
                        height: '50px',
                        background: 'white',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                        border: '2px solid var(--accent)'
                    }}>
                        <img src="/logo.jpg" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <span style={{
                        fontWeight: '800',
                        fontSize: '1.4rem',
                        letterSpacing: '-0.02em',
                        background: 'linear-gradient(45deg, #ffffff, var(--accent))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                    }}>
                        Korneel en Clementine's muziekdoos
                    </span>
                </Link>

                {/* Desktop Menu */}
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }} className="desktop-menu">
                    {isAdmin ? (
                        <>
                            <Link href="/admin" className="nav-link">Dashboard</Link>
                            <Link href="/admin/classes" className="nav-link">Klassen</Link>
                            <Link href="/admin/teachers" className="nav-link">Leerkrachten</Link>
                            <Link href="/admin/themes" className="nav-link">Thema's</Link>
                            <Link href="/admin/songs" className="nav-link">Liedjes</Link>
                            <Link href="/admin/settings" className="nav-link">Instellingen</Link>
                        </>
                    ) : (
                        <>
                            <Link href="/teacher" className="nav-link">Dashboard</Link>
                            <Link href="/teacher/player" className="nav-link">Speler</Link>
                            <Link href="/teacher/upload" className="nav-link">Uploaden</Link>
                        </>
                    )}
                    <button
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className="btn"
                        style={{
                            background: 'var(--accent)',
                            color: '#1a1a1a',
                            padding: '0.6rem 1.25rem',
                            fontSize: '0.9rem',
                            fontWeight: '700',
                            borderRadius: '12px'
                        }}
                    >
                        Uitloggen
                    </button>
                </div>

                <style jsx>{`
                    .nav-link {
                        color: rgba(255, 255, 255, 0.9);
                        font-weight: 600;
                        transition: all 0.2s;
                    }
                    .nav-link:hover {
                        color: var(--accent);
                        transform: translateY(-1px);
                    }
                    @media (max-width: 900px) {
                        .desktop-menu {
                            display: none !important;
                        }
                    }
                `}</style>
            </div>
        </nav>
    );
}
