// import { AppContent } from '@/components/app-content';
// import { AppShell } from '@/components/app-shell';
// import { AppSidebar } from '@/components/sidebars/app-sidebar';
// import { AppSidebarHeader } from '@/components/app-sidebar-header';
// import { type BreadcrumbItem } from '@/types';
// import { type PropsWithChildren } from 'react';

// export default function AppSidebarLayout({
//     children,
//     breadcrumbs = [],
// }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
//     return (
//         <AppShell variant="sidebar">
//             <AppSidebar />
//             <AppContent variant="sidebar" className="overflow-x-hidden">
//                 <AppSidebarHeader breadcrumbs={breadcrumbs} />
//                 {children}
//             </AppContent>
//         </AppShell>
//     );
// }
import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/sidebars/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren, type ReactNode } from 'react';

interface AppSidebarLayoutProps extends PropsWithChildren {
    breadcrumbs?: BreadcrumbItem[];
    sidebar?: ReactNode; // 👈 add this prop
}

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
    sidebar, // 👈 use sidebar prop if provided
}: AppSidebarLayoutProps) {
    return (
        <AppShell variant="sidebar">
            {/* 👇 if no sidebar prop is passed, fallback to default AppSidebar */}
            {sidebar ?? <AppSidebar />}
            <AppContent variant="sidebar" className="overflow-x-hidden">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
        </AppShell>
    );
}
