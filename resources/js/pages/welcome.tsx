import { admin_articles, it_reports, articles, login, register, my_articles } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

interface Article {
    article_id: number;
    title: string;
    content: string;
    keyword?: string;
    created_at: string;
    user?: {
        username: string;
    };
    category?: {
        name: string;
    };
}

interface WelcomePageProps {
    articles: Article[];
}

export default function Welcome() {
    const { articles, auth } = usePage<SharedData & WelcomePageProps>().props;
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    let homeLink = login().url;
    if (auth?.user?.role === 'admin') homeLink = admin_articles().url;
    else if (auth?.user?.role === 'it') homeLink = it_reports().url;
    else if (auth?.user?.role === 'user') homeLink = my_articles().url;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getInitials = (name: string) => {
        if (!name) return 'U';
        
        const words = name.split(' ').filter(word => word.length > 0);
        
        if (words.length === 1) {
            return words[0].substring(0, 2).toUpperCase();
        } else {
            return (words[0][0] + words[words.length - 1][0]).toUpperCase();
        }
    };

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>
            
            <div className="min-h-screen bg-white text-gray-800">
                {/* Header - Changes on scroll */}
                <header className={`border-b transition-all duration-300 sticky top-0 z-50 ${
                    isScrolled 
                        ? 'bg-[#992426] border-[#992426] shadow-lg' 
                        : 'bg-white border-gray-200'
                }`}>
                    <div className="max-w-6xl mx-auto px-6 py-4">
                        <nav className="flex items-center justify-between">
                            {/* Logo and Text */}
                            <Link 
                                href="/" 
                                className="flex items-center gap-3 no-underline hover:no-underline"
                            >
                                <img 
                                    src="/usep-logo.png" 
                                    alt="USeP Logo" 
                                    className={`w-8 h-8 object-contain ${
                                        isScrolled ? '' : ''
                                    }`}
                                />
                                <div className={`text-xl font-bold transition-colors duration-300 ${
                                    isScrolled ? 'text-white' : 'text-[#992426]'
                                }`}>
                                    CyberSafe USeP
                                </div>
                            </Link>
                            
                            <div className="flex items-center gap-4">
                                {auth.user ? (
                                    <Link
                                        href={
                                            auth.user.role === 'admin'
                                                ? '/admin_articles'
                                                : auth.user.role === 'it'
                                                ? '/it_reports'
                                                : auth.user.role === 'user'
                                                ? '/articles'
                                                : '/'
                                        }
                                        className={`inline-block rounded border px-4 py-2 text-sm transition-all duration-300 ${
                                            isScrolled
                                                ? 'border-white text-white hover:bg-white hover:text-[#992426]'
                                                : 'border-gray-300 text-gray-700 hover:border-[#992426] hover:text-[#992426]'
                                        }`}
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={login()}
                                            className={`inline-block rounded border px-4 py-2 text-sm transition-all duration-300 ${
                                                isScrolled
                                                    ? 'border-white text-white hover:bg-white hover:text-[#992426]'
                                                    : 'border-transparent text-gray-700 hover:border-gray-300'
                                            }`}
                                        >
                                            Login
                                        </Link>
                                        <Link
                                            href={register()}
                                            className={`inline-block rounded border px-4 py-2 text-sm transition-all duration-300 ${
                                                isScrolled
                                                    ? 'border-white text-white hover:bg-white hover:text-[#992426]'
                                                    : 'border-[#992426] text-white bg-[#992426] hover:bg-[#7a1d1f]'
                                            }`}
                                        >
                                            Register
                                        </Link>
                                    </>
                                )}
                            </div>
                        </nav>
                    </div>
                </header>

               {/* Hero Section */}
                <section className="bg-gradient-to-r from-[#770000] to-[#992426] text-white py-16">
                    <div className="max-w-6xl mx-auto px-6 text-center">
                        <div className="max-w-2xl mx-auto">
                            <h1 className="text-4xl font-bold mb-6">
                                Stay Informed About Cybersecurity
                            </h1>
                            <p className="text-lg text-white/90 leading-relaxed">
                                Stay informed about the latest cybersecurity threats, best practices, 
                                and protection strategies. Knowledge is your first line of defense.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Articles Section - Single Column Layout */}
                <main className="max-w-4xl mx-auto px-6 py-12">
                    {articles && articles.length > 0 ? (
                        <div className="space-y-8">
                            {articles.map((article) => (
                                <article 
                                    key={article.article_id}
                                    className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 p-6"
                                >
                                    {/* Article Header */}
                                    <div className="mb-4">
                                        {article.keyword && (
                                            <span className="inline-block bg-gray-100 text-[#992426] text-xs px-3 py-1 rounded-full mb-3">
                                                {article.keyword}
                                            </span>
                                        )}
                                        <h2 className="text-2xl font-bold text-[#992426] mb-3">
                                            {article.title}
                                        </h2>
                                    </div>

                                    {/* Article Content */}
                                    <div className="prose max-w-none mb-4">
                                        <p className="text-gray-600 leading-relaxed">
                                            {article.content}
                                        </p>
                                    </div>

                                    {/* User Info with Profile Picture */}
                                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
                                        <div className="flex items-center space-x-3">
                                            {/* Profile Picture with Initials */}
                                            <div className="w-10 h-10 bg-[#992426] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                                {article.user ? getInitials(article.user.username) : 'U'}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                <span className="font-medium block">
                                                    {article.user?.username || 'Unknown User'}
                                                </span>
                                            </div>
                                        </div>
                                        <time className="text-sm text-gray-500">
                                            {formatDate(article.created_at)}
                                        </time>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="text-gray-500 text-lg">
                                No approved articles available at the moment. Check back later!
                            </div>
                        </div>
                    )}
                </main>

                <footer className="bg-gray-50 border-t border-gray-200 py-8 mt-12">
                    <div className="max-w-6xl mx-auto px-6">
                        <div className="flex flex-col md:flex-row justify-between items-center">
                            <div className="mb-4 md:mb-0">
                                <div className="text-lg font-bold text-[#992426] mb-2">
                                    CyberSafe USeP
                                </div>
                                <p className="text-sm text-gray-600">
                                    Raising cybersecurity awareness in the USeP community.
                                </p>
                            </div>
                            <div className="flex space-x-6 text-sm text-gray-600">
                                <a href="#" className="hover:text-[#992426] transition-colors">
                                    About
                                </a>
                                <a href="#" className="hover:text-[#992426] transition-colors">
                                    Contact
                                </a>
                                <a href="#" className="hover:text-[#992426] transition-colors">
                                    Privacy
                                </a>
                            </div>
                        </div>
                        <div className="text-center mt-6 pt-6 border-t border-gray-200">
                            <p className="text-xs text-gray-500">
                                © 2025 CyberSafe USeP. All rights reserved.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}