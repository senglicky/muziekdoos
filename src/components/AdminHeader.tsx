'use client';

import React from 'react';

interface AdminHeaderProps {
    title: string;
    subtitle?: string;
    rightElement?: React.ReactNode;
}

export default function AdminHeader({ title, subtitle, rightElement }: AdminHeaderProps) {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: '2.5rem',
            flexWrap: 'wrap',
            gap: '1rem'
        }}>
            <div>
                <h1 style={{
                    fontSize: '2.25rem',
                    fontWeight: '800',
                    color: 'var(--primary)',
                    letterSpacing: '-0.025em',
                    marginBottom: subtitle ? '0.5rem' : '0'
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
        </div>
    );
}
