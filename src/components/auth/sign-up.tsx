'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Github } from 'lucide-react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { isAxiosError } from 'axios';
import { signIn } from 'next-auth/react';
import {
  SignUpValues,
  SignUpSchema,
} from '../../resolvers/forms/sign-up-form.resolver';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import ErrorMessage from './error-message';
import SuccessMessage from './success-message';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/lib/actions/register.actions';
import { getErrorMessage } from '@/lib/utils';

export default function SignUpForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const form = useForm<SignUpValues>({
    mode: 'onTouched',
    defaultValues: {
      email: '',
      password: '',
      username: '',
    },
    resolver: zodResolver(SignUpSchema),
  });
  const { isSubmitting } = form.formState;
  const router = useRouter();

  const handleSubmit: SubmitHandler<SignUpValues> = async (formData) => {
    setError(null);
    setSuccess(null);
    const { email, password, username } = formData;
    try {
      const user = await registerUser({
        email,
        password,
        username,
      });

      if (user && 'error' in user) {
        return setError(user.error);
      }

      const result = await signIn('credentials', {
        email,
        password,
        rememberMe,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result?.error);
      }

      setSuccess('Success created user');
      router.push('/');
    } catch (err) {
      console.log(err);
      const message = getErrorMessage(error);
      setError(message);
    }
  };

  return (
    <Card className="w-full max-w-sm sm:max-w-md md:max-w-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Sign up
        </CardTitle>
        <CardDescription className="text-center">
          Choose your preferred sign up method
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel htmlFor="email" className="text-sm font-medium">
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      id="email"
                      placeholder="email..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel htmlFor="username" className="text-sm font-medium">
                    Username
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      id="username"
                      placeholder="username..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel htmlFor="password" className="text-sm font-medium">
                    Password
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      id="password"
                      placeholder="password..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <Label htmlFor="remember" className="text-sm">
                Remember me
              </Label>
            </div>
            <SuccessMessage message={success} />
            <ErrorMessage message={error} />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              Sign up
            </Button>
          </form>
        </Form>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => signIn('github')}
            className="w-full"
          >
            <Github className="mr-2 h-4 w-4" /> GitHub
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?
          <Link href="/signin" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
