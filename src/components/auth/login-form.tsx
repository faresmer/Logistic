'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { useState } from 'react';
import { useDataContext } from '@/context/data-context';
import { useTranslations } from 'next-intl';

const formSchema = z.object({
  username: z.string().min(2, {
    message: 'Username must be at least 2 characters.',
  }),
  password: z.string().min(6, {
    message: 'Password must be at least 6 characters.',
  }),
});

export function LoginForm() {
  const t = useTranslations('LoginForm');
  const router = useRouter();
  const { toast } = useToast();
  const { users } = useDataContext();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const user = users.find(u => u.username === values.username && u.password === values.password);

      if (user) {
        localStorage.setItem('userRole', user.role);
        localStorage.setItem('username', user.username);
        
        toast({
          title: t('loginSuccessTitle'),
          description: t('loginSuccessDescription', {username: user.username}),
        });
        router.push('/dashboard');
      } else {
        toast({
          variant: 'destructive',
          title: t('loginFailedTitle'),
          description: t('loginFailedDescription'),
        });
      }
      setLoading(false);
    }, 1000);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('usernameLabel')}</FormLabel>
              <FormControl>
                <Input placeholder={t('usernamePlaceholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('passwordLabel')}</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
                <Checkbox id="remember-me" />
                <Label htmlFor="remember-me" className='text-sm font-medium'>{t('rememberMe')}</Label>
            </div>
            <a href="#" className="text-sm text-primary hover:underline">{t('forgotPassword')}</a>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? t('signingInButton') : t('signInButton')}
        </Button>
      </form>
    </Form>
  );
}
