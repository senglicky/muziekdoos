'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import * as mm from 'music-metadata-browser';

type SelectItem = { id: string; name: string };

export default function UploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState('');
    const [themeId, setThemeId] = useState('');
    const [classIds, setClassIds] = useState<string[]>([]);

    const [themes, setThemes] = useState<SelectItem[]>([]);
    const [classes, setClasses] = useState<SelectItem[]>([]);

    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');

    const router = useRouter();

    useEffect(() => {
        Promise.all([
            fetch('/api/themes').then(res => res.json()),
            fetch('/api/classes').then(res => res.json())
        ]).then(([themesData, classesData]) => {
            setThemes(themesData);
            setClasses(classesData);
        });
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !title || !themeId || classIds.length === 0) {
            setMessage("Vul alle velden in, kies minimaal één klas en een bestand.");
            return;
        }

        setUploading(true);
        setMessage("Bezig met uploaden...");

        try {
            // 0. Extract Album Art (Metadata)
            let coverUrl = null;
            try {
                const metadata = await mm.parseBlob(file);
                const picture = metadata.common.picture?.[0];
                if (picture) {
                    const blob = new Blob([picture.data as any], { type: picture.format });
                    const coverExt = picture.format.split('/').pop() || 'jpg';
                    const coverName = `cover-${Date.now()}.${coverExt}`;

                    const { error: coverError } = await supabase.storage
                        .from('songs')
                        .upload(coverName, blob);

                    if (!coverError) {
                        const { data: { publicUrl: extractedCoverUrl } } = supabase.storage
                            .from('songs')
                            .getPublicUrl(coverName);
                        coverUrl = extractedCoverUrl;
                    }
                }
            } catch (err) {
                console.warn("Could not extract album art:", err);
            }

            // 1. Upload to Supabase Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `${fileName}`;

            const { data: storageData, error: storageError } = await supabase.storage
                .from('songs')
                .upload(filePath, file);

            if (storageError) throw storageError;

            // 2. Get Public URL
            const { data: { publicUrl: songUrl } } = supabase.storage
                .from('songs')
                .getPublicUrl(filePath);

            // 3. Save to Database
            const res = await fetch('/api/songs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    url: songUrl,
                    coverUrl,
                    themeId,
                    classIds
                }),
            });

            if (!res.ok) throw new Error("Fout bij opslaan in database");

            setMessage("Upload geslaagd!");
            setTimeout(() => router.push('/teacher'), 1500);

        } catch (error: any) {
            console.error(error);
            setMessage(`Fout: ${error.message || "Er ging iets mis."}`);
            setUploading(false);
        }
    };

    return (
        <div className="glass-panel" style={{ padding: '2.5rem', maxWidth: '580px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '2.5rem', textAlign: 'center' }}>Nieuw Liedje Uploaden</h1>

            <form onSubmit={handleUpload} style={{ display: 'grid', gap: '1.5rem' }}>

                {/* Title */}
                <div>
                    <label className="label">Titel van het liedje</label>
                    <input
                        type="text"
                        className="input-field"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Bijv. In de maneschijn"
                        required
                    />
                </div>

                {/* File */}
                <div>
                    <label className="label">MP3 Bestand</label>
                    <input
                        type="file"
                        accept="audio/mp3,audio/*"
                        className="input-field"
                        onChange={handleFileChange}
                        required
                    />
                </div>

                {/* Selects Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label className="label">Thema</label>
                        <select
                            className="input-field"
                            value={themeId}
                            onChange={(e) => setThemeId(e.target.value)}
                            required
                            style={{ appearance: 'auto' }}
                        >
                            <option value="">Kies thema...</option>
                            {themes.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="label">Klassen</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '150px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0.75rem' }}>
                            {classes.map(c => (
                                <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        value={c.id}
                                        checked={classIds.includes(c.id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setClassIds([...classIds, c.id]);
                                            } else {
                                                setClassIds(classIds.filter(id => id !== c.id));
                                            }
                                        }}
                                        style={{ accentColor: 'var(--primary)', width: '18px', height: '18px' }}
                                    />
                                    {c.name}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Helper Message */}
                {message && (
                    <div style={{
                        padding: '1.25rem',
                        borderRadius: '16px',
                        background: message.includes('Fout') ? '#fef2f2' : 'rgba(0, 103, 56, 0.05)',
                        color: message.includes('Fout') ? '#ef4444' : 'var(--primary)',
                        textAlign: 'center',
                        fontSize: '0.95rem',
                        fontWeight: '600',
                        border: message.includes('Fout') ? '1px solid #fee2e2' : '1px solid rgba(0, 103, 56, 0.1)'
                    }}>
                        {message}
                    </div>
                )}

                {/* Submit */}
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={uploading}
                    style={{ opacity: uploading ? 0.7 : 1 }}
                >
                    {uploading ? 'Bezig met uploaden...' : 'Uploaden'}
                </button>

            </form>
        </div>
    );
}
