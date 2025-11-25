import CustomAuthLayout from '@/layouts/auth/custom-auth-layout';

export default function AuthLayout({
    children,
    title,
    description,
    ...props
}: {
    children: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <CustomAuthLayout title={title} description={description} {...props}>
            {children}
        </CustomAuthLayout>
    );
}
