import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { admin_reports, dashboard, admin_articles, admin_report_log, messages } from '@/routes';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Newspaper, ClipboardList, History, Inbox} from 'lucide-react';
import AppLogo from '../app-logo';

const mainNavItems: NavItem[] = [
    // {
    //     title: 'Dashboard',
    //     href: dashboard(),
    //     icon: LayoutGrid,
    // },

    {
        title: 'Submitted Articles',
        href: admin_articles(),
        icon: Newspaper,
    },

    {
        title: 'Submitted Reports',
        href: admin_reports(),
        icon: ClipboardList,
    },

    {
        title: 'Report Log',
        href: admin_report_log(),
        icon: History,
    },

    {
        title: 'Messages',
        href: messages(),
        icon: Inbox,
    },
];


const footerNavItems: NavItem[] = [
    // {
    //     title: 'Repository',
    //     href: 'https://github.com/laravel/react-starter-kit',
    //     icon: Folder,
    // },
    // {
    //     title: 'Documentation',
    //     href: 'https://laravel.com/docs/starter-kits#react',
    //     icon: BookOpen,
    // },
];

export function AppSidebarAdmin() {
    // ✅ Define a light type for your page props
    const page = usePage<{ auth?: { user?: { username?: string } } }>();
    const user = page.props.auth?.user;

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={admin_articles()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
