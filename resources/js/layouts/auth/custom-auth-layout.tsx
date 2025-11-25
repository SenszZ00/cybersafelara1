import { Head } from '@inertiajs/react';
import { ReactNode } from 'react';

interface CustomAuthLayoutProps {
    children: ReactNode;
    title: string;
    description: string;
}

export default function CustomAuthLayout({ children, title, description }: CustomAuthLayoutProps) {
    return (
        <>
            <Head>
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>

            <div className="min-h-screen bg-white flex flex-col">
                {/* Header */}
                <header className="border-b border-gray-200 bg-[#992426]">
                    <div className="max-w-6xl mx-auto px-6 py-4">
                        <div className="flex items-center gap-3">
                            <img 
                                src="/usep-logo.png" 
                                alt="USeP Logo" 
                                className="w-8 h-8 object-contain"
                            />
                            <div className="text-xl font-bold text-[white]">
                                CyberSafe USeP
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                    <div className="w-full max-w-md">
                        {/* Card Container */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                            {/* Header */}
                            <div className="text-center mb-8">
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                    {title}
                                </h1>
                                <p className="text-gray-600">
                                    {description}
                                </p>
                            </div>

                            {/* Form Content */}
                            {children}
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="bg-gray-50 border-t border-gray-200 py-6">
                    <div className="max-w-6xl mx-auto px-6 text-center">
                        <p className="text-xs text-gray-500">
                            © 2025 CyberSafe USeP. All rights reserved.
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}