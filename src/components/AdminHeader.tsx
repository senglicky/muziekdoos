'use client';

import React from 'react';

interface AdminHeaderProps {
    title: string;
    subtitle?: string;
    rightElement?: React.ReactNode;
}

export default function AdminHeader({ title, subtitle, rightElement }: AdminHeaderProps) {
    return (
        <div className="admin-header-container" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: '2.5rem',
            gap: '1rem',
            flexWrap: 'wrap'
        }}>
            <div>
                <h1 style={{
                    fontSize: 'var(--header-font-size, 1.75rem)',
                    fontWeight: '800',
                    color: 'var(--primary)',
                    margin: 0
                }}>
                    {title}
                </h1>
                {subtitle && (
                    <p style={{
                        color: '#64748b',
                        fontSize: '1.1rem',
                        fontWeight: '500'
                    }}>
                        {subtitle}
                    </p>
                )}
            </div>
            {rightElement && (
                <div style={{ marginLeft: 'auto' }}>
                    {rightElement}
                </div>
            )}
            <style jsx>{`
                @media (max-width: 640px) {
                    .admin-header-container {
                        margin-bottom: 1.5rem !important;
                    }
                    h1 {
                        font-size: 1.5rem !important;
                    }
                }
            `}</style>
        </div>
    );
}
