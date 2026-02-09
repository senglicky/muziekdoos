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
        <nav className="navbar">
            <div className="main-content navbar-container">
                <Link href="/teacher/player" className="navbar-logo-link">
                    <div className="navbar-logo-wrapper">
                        <img src="/logo.jpg" alt="Logo" className="navbar-logo-img" />
                    </div>
                    <span className="app-title navbar-title">
                        Korneel & Clementine's Muziekdoos
                    </span>
                </Link>

                {/* Desktop Menu */}
                <div className="navbar-desktop-menu">
                    {menuItems.map((item) => (
                        <Link key={item.href} href={item.href} className="nav-link navbar-link">{item.label}</Link>
                    ))}
                    <button
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className="btn navbar-logout-btn"
                    >
                        Uitloggen
                    </button>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="navbar-mobile-toggle"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle menu"
                >
                    <div className={`navbar-hamburger ${isMenuOpen ? 'open' : ''}`}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </button>

                {/* Mobile Menu Overlay */}
                <div className={`navbar-mobile-menu ${isMenuOpen ? 'open' : ''}`}>
                    <div className="navbar-mobile-content">
                        {menuItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="navbar-mobile-link"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {item.label}
                            </Link>
                        ))}
                        <button
                            onClick={() => signOut({ callbackUrl: '/login' })}
                            className="btn btn-primary navbar-mobile-logout"
                        >
                            Uitloggen
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
