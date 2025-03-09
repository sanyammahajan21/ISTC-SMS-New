"use client";
import { useEffect, useState } from 'react';

interface Notice {
    id: number;
    title: string;
    fileUrl: string;
    uploadedBy: string;
    timestamp: string;
}

export default function Notices() {
    const [notices, setNotices] = useState<Notice[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch('/api/get-notices')
            .then((res) => res.json())
            .then((data) => {
                setNotices(data);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching notices:', error);
                setIsLoading(false);
            });
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (notices.length === 0) {
        return (
            <div className="h-auto bg-gray-100 flex justify-center items-center">
                <p className="text-gray-600">No notices available.</p>
            </div>
        );
    }

    return (
        <div className="min-auto bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Notices</h1>
                <div className="space-y-4">
                    {notices.map((notice) => (
                        <div key={notice.id} className="bg-white shadow-md rounded-lg p-4">
                            <div className="flex justify-between items-center">
                                {/* Notice Title */}
                                <h3 className="text-lg font-semibold text-gray-800">
                                    {notice.title}
                                </h3>

                                {/* Download Button */}
                                <a
                                    href={notice.fileUrl} // URL of the file
                                    download={`${notice.title}.pdf`} // Force download with a custom filename
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4 mr-2"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    Download
                                </a>
                            </div>

                            {/* Uploaded By and Timestamp */}
                            <p className="text-xs text-gray-500 mt-1">
                                Uploaded by <span className="font-medium">{notice.uploadedBy}</span> on{' '}
                                <span className="font-medium">
                                    {new Date(notice.timestamp).toLocaleString()}
                                </span>
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}