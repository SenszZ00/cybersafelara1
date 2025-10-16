import { login } from '@/routes';
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useEffect } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AuthLayout from '@/layouts/auth-layout';

interface RegisterProps {
  collegeDepartments: Array<{
    id: number;
    code: string;
    name: string;
  }>;
}

export default function Register({ collegeDepartments }: RegisterProps) {
  useEffect(() => {
    console.log('Register component mounted');
    console.log('College departments:', collegeDepartments);
  }, [collegeDepartments]);

  if (!collegeDepartments) {
    console.error('No college departments provided');
    return <div>Loading...</div>;
  }

  return (
    <AuthLayout
      title="Create a CyberSafe account"
      description="Enter your details below to create your account"
    >
      <Head title="Register" />

      <Form
        method="post"
        action="/register"
        className="flex flex-col gap-6"
        onError={(errors) => {
          console.error('Form errors:', errors);
        }}
      >
        {({ processing, errors }) => (
          <>
            <div className="grid gap-6">

              {/* Full Name */}
              <div className="grid gap-2">
                <Label htmlFor="name" className="flex items-center gap-1">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  required
                  tabIndex={1}
                  autoComplete="name"
                  name="name"
                  placeholder="Enter your full name"
                />
                <InputError message={errors.name} className="mt-2" />
              </div>

              {/* Username */}
              <div className="grid gap-2">
                <Label htmlFor="username" className="flex items-center gap-1">
                  Username <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="username"
                  type="text"
                  required
                  tabIndex={2}
                  autoComplete="username"
                  name="username"
                  placeholder="Enter username"
                />
                <InputError message={errors.username} className="mt-2" />
              </div>

              {/* Email */}
              <div className="grid gap-2">
                <Label htmlFor="email" className="flex items-center gap-1">
                  Email address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  tabIndex={3}
                  autoComplete="email"
                  name="email"
                  placeholder="email@usep.edu.ph"
                />
                <InputError message={errors.email} />
              </div>

              {/* College/Department */}
              <div className="grid gap-2">
                <Label
                  htmlFor="college_department_id"
                  className="flex items-center gap-1"
                >
                  College/Department <span className="text-red-500">*</span>
                </Label>
                <Select name="college_department_id" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your department" />
                  </SelectTrigger>
                  <SelectContent>
                    {collegeDepartments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        {dept.code} - {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <InputError message={errors.college_department_id} />
              </div>

              {/* Password */}
              <div className="grid gap-2">
                <Label htmlFor="password" className="flex items-center gap-1">
                  Password <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  tabIndex={4}
                  autoComplete="new-password"
                  name="password"
                  placeholder="Password"
                />
                <InputError message={errors.password} />
              </div>

              {/* Confirm Password */}
              <div className="grid gap-2">
                <Label
                  htmlFor="password_confirmation"
                  className="flex items-center gap-1"
                >
                  Confirm password <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password_confirmation"
                  type="password"
                  required
                  tabIndex={5}
                  autoComplete="new-password"
                  name="password_confirmation"
                  placeholder="Confirm password"
                />
                <InputError message={errors.password_confirmation} />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="mt-2 w-full"
                tabIndex={6}
                disabled={processing}
              >
                {processing && (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                )}
                Create account
              </Button>
            </div>

            {/* Login Link */}
            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <TextLink href={login()} tabIndex={7}>
                Log in
              </TextLink>
            </div>
          </>
        )}
      </Form>
    </AuthLayout>
  );
}
