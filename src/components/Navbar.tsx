'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const { data: session } = useSession();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const pathname = usePathname();

    if (!session || pathname === '/login') return null;

    const isAdmin = session.user.role === 'ADMIN';

    const menuItems = isAdmin ? [
        { href: '/teacher/player', label: 'Speler' },
        { href: '/admin/classes', label: 'Klassen' },
        { href: '/admin/teachers', label: 'Leerkrachten' },
        { href: '/admin/themes', label: "Thema's" },
        { href: '/admin/songs', label: 'Liedjes' },
        { href: '/admin/settings', label: 'Instellingen' },
    ] : [
        { href: '/teacher/player', label: 'Speler' },
        { href: '/teacher/upload', label: 'Uploaden' },
        { href: '/teacher', label: 'Beheer' },
    ];

    return (
        <nav style={{
            background: 'var(--header-bg)',
            color: 'white',
            padding: '0.75rem 1.25rem',
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
                <Link href="/teacher/player" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        background: 'white',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                        border: '2px solid var(--accent)',
                        flexShrink: 0
                    }}>
                        <img src="/logo.jpg" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <span className="app-title" style={{
                        fontWeight: '800',
                        letterSpacing: '-0.02em',
                        background: 'linear-gradient(45deg, #ffffff, var(--accent))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                    }}>
                        Korneel & Clementine's Muziekdoos
                    </span>
                </Link>

                {/* Desktop Menu */}
                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }} className="desktop-menu">
                    {menuItems.map((item) => (
                        <Link key={item.href} href={item.href} className="nav-link">{item.label}</Link>
                    ))}
                    <button
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className="btn"
                        style={{
                            background: 'var(--accent)',
                            color: '#1a1a1a',
                            padding: '0.5rem 1rem',
                            fontSize: '0.85rem',
                            fontWeight: '700',
                            borderRadius: '10px'
                        }}
                    >
                        Uitloggen
                    </button>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="mobile-toggle"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle menu"
                >
                    <div className={`hamburger ${isMenuOpen ? 'open' : ''}`}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </button>

                {/* Mobile Menu Overlay */}
                <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
                    <div className="mobile-menu-content">
                        {menuItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="mobile-nav-link"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {item.label}
                            </Link>
                        ))}
                        <button
                            onClick={() => signOut({ callbackUrl: '/login' })}
                            className="btn btn-primary"
                            style={{ marginTop: '1rem', width: '100%' }}
                        >
                            Uitloggen
                        </button>
                    </div>
                </div>

                <style jsx>{`
                    .app-title {
                        font-size: 1.3rem;
                    }
                    .nav-link {
                        color: rgba(255, 255, 255, 0.9);
                        font-weight: 600;
                        transition: all 0.2s;
                        font-size: 0.95rem;
                    }
                    .nav-link:hover {
                        color: var(--accent);
                        transform: translateY(-1px);
                    }
                    .mobile-toggle {
                        display: none;
                        background: none;
                        border: none;
                        padding: 0.5rem;
                        cursor: pointer;
                        z-index: 101;
                    }
                    .hamburger {
                        width: 24px;
                        height: 18px;
                        position: relative;
                        display: flex;
                        flex-direction: column;
                        justify-content: space-between;
                    }
                    .hamburger span {
                        display: block;
                        width: 100%;
                        height: 3px;
                        background: white;
                        border-radius: 3px;
                        transition: all 0.3s ease;
                    }
                    .hamburger.open span:nth-child(1) {
                        transform: translateY(7.5px) rotate(45deg);
                    }
                    .hamburger.open span:nth-child(2) {
                        opacity: 0;
                    }
                    .hamburger.open span:nth-child(3) {
                        transform: translateY(-7.5px) rotate(-45deg);
                    }
                    .mobile-menu {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100vh;
                        background: var(--header-bg);
                        z-index: 100;
                        transform: translateX(100%);
                        transition: transform 0.3s ease-in-out;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .mobile-menu.open {
                        transform: translateX(0);
                    }
                    .mobile-menu-content {
                        display: flex;
                        flex-direction: column;
                        gap: 2rem;
                        text-align: center;
                        width: 80%;
                    }
                    .mobile-nav-link {
                        color: white !important;
                        font-size: 1.5rem;
                        font-weight: 700;
                        text-decoration: none;
                    }
                    @media (max-width: 1000px) {
                        .desktop-menu {
                            display: none !important;
                        }
                        .mobile-toggle {
                            display: block;
                        }
                        .app-title {
                            font-size: 1.1rem;
                        }
                    }
                `}</style>
            </div>
        </nav>
    );
}
