import { DataProvider } from '@/context/data-context';
import { LoginForm } from '@/components/auth/login-form';
import { Boxes } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function LoginPage() {
  const t = useTranslations('LoginPage');
  return (
    <DataProvider>
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
              <Boxes className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-primary">{t('title')}</h1>
            <p className="text-muted-foreground">{t('welcome')}</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </DataProvider>
  );
}
