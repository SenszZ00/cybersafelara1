// import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
// import { type BreadcrumbItem } from '@/types';
// import { type ReactNode } from 'react';
// import { AppSidebarAdmin } from '@/components/sidebars/app-sidebar-admin';
// import { AppSidebarIT } from '@/components/sidebars/app-sidebar-it';
// import { AppSidebarUser } from '@/components/sidebars/app-sidebar-user';

// interface AppLayoutProps {
//     children: ReactNode;
//     breadcrumbs?: BreadcrumbItem[];
// }

// export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => (
//     <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
//         {children}
//     </AppLayoutTemplate>
// );

import { usePage } from '@inertiajs/react';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';
import { AppSidebarAdmin } from '@/components/sidebars/app-sidebar-admin';
import { AppSidebarIT } from '@/components/sidebars/app-sidebar-it';
import { AppSidebarUser } from '@/components/sidebars/app-sidebar-user';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => {
    // ✅ Get the current user's role from Inertia page props
    const page = usePage<{ auth?: { user?: { role?: string } } }>();
    const role = page.props.auth?.user?.role;

    // ✅ Choose sidebar based on role
    let SidebarComponent = AppSidebarUser; // default
    if (role === 'admin') SidebarComponent = AppSidebarAdmin;
    else if (role === 'it') SidebarComponent = AppSidebarIT;

    return (
        <AppLayoutTemplate
            breadcrumbs={breadcrumbs}
            sidebar={<SidebarComponent />} // pass chosen sidebar here
            {...props}
        >
            {children}
        </AppLayoutTemplate>
    );
};

