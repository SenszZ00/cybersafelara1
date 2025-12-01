import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/sidebars/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren, type ReactNode } from 'react';
import FeedbackWidget from '@/components/feedback-widget';
import { usePage } from '@inertiajs/react'; // Add this import

interface AppSidebarLayoutProps extends PropsWithChildren {
    breadcrumbs?: BreadcrumbItem[];
    sidebar?: ReactNode;
}

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
    sidebar,
}: AppSidebarLayoutProps) {
    // Get the current user's role from page props
    const page = usePage<{ auth?: { user?: { role?: string } } }>();
    const role = page.props.auth?.user?.role;
    
    // Only show feedback widget for users with 'user' role
    const showFeedbackWidget = role === 'user';

    return (
        <>
            <AppShell variant="sidebar">
                {/* Use provided sidebar or fallback to default */}
                {sidebar ?? <AppSidebar />}
                <AppContent variant="sidebar" className="overflow-x-hidden">
                    <AppSidebarHeader breadcrumbs={breadcrumbs} />
                    {children}
                </AppContent>
            </AppShell>
            
            {/* Conditionally render Feedback Widget only for 'user' role */}
            {showFeedbackWidget && <FeedbackWidget />}
        </>
    );
}