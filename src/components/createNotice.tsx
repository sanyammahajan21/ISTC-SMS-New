"use client"
import { useState } from 'react';

export default function UploadNotice() {
    const [title, setTitle] = useState<string>('');
    const [file, setFile] = useState<File | null>(null);
    const [message, setMessage] = useState<string>('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!file) {
            setMessage('Please select a file.');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('noticeFile', file);

        const response = await fetch('/api/uploadNotices', {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();
        setMessage(result.message);
    };

    return (
        <div>
            <h1>Upload Notice</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Notice Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
                <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    required
                />
                <button className='' type="submit">Upload Notice</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
}