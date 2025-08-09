

'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PageHeader } from '@/components/shared/page-header';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ThemeToggle } from '../theme-toggle';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { EmployeeManager } from './employee-manager';
import { useDataContext } from '@/context/data-context';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import AES from 'crypto-js/aes';
import Utf8 from 'crypto-js/enc-utf8';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { User } from '@/lib/types';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';


const profileFormSchema = z.object({
    currentPassword: z.string().min(1, { message: 'Current password is required.' }),
    newPassword: z.string().min(6, { message: 'New password must be at least 6 characters.' }),
});

const storeFormSchema = z.object({
    name: z.string().min(3, { message: 'Store name must be at least 3 characters.' }),
    address: z.string().min(5, { message: 'Address must be at least 5 characters.' }),
    logo: z.string().optional(),
});

export function SettingsClient() {
  const t = useTranslations('SettingsPage');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const { users, changeUserPassword, storeInfo, updateStoreInfo, updateUserAvatar } = useDataContext();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [logoPreview, setLogoPreview] = React.useState<string | undefined>(storeInfo.logo);
  const [avatarPreview, setAvatarPreview] = React.useState<string | undefined>();
  const avatarInputRef = React.useRef<HTMLInputElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [backupPassword, setBackupPassword] = React.useState('');
  const [restorePassword, setRestorePassword] = React.useState('');
  const [showBackupDialog, setShowBackupDialog] = React.useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = React.useState(false);
  const [fileToRestore, setFileToRestore] = React.useState<File | null>(null);


  React.useEffect(() => {
    const role = localStorage.getItem('userRole');
    const name = localStorage.getItem('username');
    if (role && name) {
        const user = users.find(u => u.username === name);
        if (user) {
            setCurrentUser(user);
            setAvatarPreview(user.avatar);
        }
    }
  }, [users]);

  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
    },
  });

  const storeForm = useForm<z.infer<typeof storeFormSchema>>({
    resolver: zodResolver(storeFormSchema),
    values: {
        name: storeInfo.name,
        address: storeInfo.address,
        logo: storeInfo.logo,
    },
  });

  React.useEffect(() => {
    storeForm.reset(storeInfo);
    setLogoPreview(storeInfo.logo);
  }, [storeInfo, storeForm]);


  const onProfileSubmit = (values: z.infer<typeof profileFormSchema>) => {
    if (!currentUser?.id) return;

    const success = changeUserPassword(currentUser.id, values.currentPassword, values.newPassword);

    if (success) {
        toast({
            title: t('passwordUpdateSuccess'),
            description: t('passwordUpdateSuccessDescription'),
        });
        profileForm.reset();
    } else {
        toast({
            variant: 'destructive',
            title: t('passwordUpdateError'),
            description: t('passwordUpdateErrorDescription'),
        });
    }
  };

  const onStoreSubmit = (values: z.infer<typeof storeFormSchema>) => {
    updateStoreInfo(values);
    toast({
        title: t('storeUpdateSuccess'),
        description: t('storeUpdateSuccessDescription'),
    });
  }

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            setLogoPreview(base64String);
            storeForm.setValue('logo', base64String);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            setAvatarPreview(base64String);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleSaveAvatar = () => {
    if (currentUser?.id && avatarPreview) {
        updateUserAvatar(currentUser.id, avatarPreview);
        toast({
            title: t('avatarUpdateSuccess'),
            description: t('avatarUpdateSuccessDescription')
        });
    }
  };

  const handleBackup = () => {
    if (!backupPassword) {
      toast({ variant: 'destructive', title: 'Error', description: t('backupPasswordRequired') });
      return;
    }
    const dataToBackup: { [key: string]: any } = {};
    const keysToBackup = ['products', 'customers', 'users', 'receipts', 'storeInfo', 'activityLogs'];
    
    keysToBackup.forEach(key => {
        const item = localStorage.getItem(key);
        if (item) {
            dataToBackup[key] = JSON.parse(item);
        }
    });

    const jsonString = JSON.stringify(dataToBackup, null, 2);
    const encryptedData = AES.encrypt(jsonString, backupPassword).toString();
    const blob = new Blob([encryptedData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const date = new Date().toISOString().slice(0, 10);
    link.download = `ama-logistic-backup-encrypted-${date}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({
        title: t('backupSuccess'),
        description: t('backupSuccessDescription'),
    });
    setShowBackupDialog(false);
    setBackupPassword('');
  };

  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        setFileToRestore(file);
        setShowRestoreDialog(true);
    }
    if(event.target) event.target.value = '';
  };

  const handleRestore = () => {
    if (!fileToRestore) {
        toast({ variant: 'destructive', title: t('errorTitle'), description: t('restoreFileRequired') });
        return;
    }
    if (!restorePassword) {
        toast({ variant: 'destructive', title: t('errorTitle'), description: t('restorePasswordRequired') });
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const encryptedData = e.target?.result as string;
            const decryptedBytes = AES.decrypt(encryptedData, restorePassword);
            const decryptedData = decryptedBytes.toString(Utf8);
            
            if (!decryptedData) {
                throw new Error("Decryption failed. Check password or file integrity.");
            }

            const data = JSON.parse(decryptedData);
            const keys = ['products', 'customers', 'users', 'receipts', 'storeInfo', 'activityLogs'];
            
            let valid = true;
            keys.forEach(key => {
                if(!data[key]){
                    valid = false;
                }
            });

            if(!valid){
                throw new Error("Invalid backup file format.");
            }

            keys.forEach(key => {
                localStorage.setItem(key, JSON.stringify(data[key]));
            });
            
            toast({
                title: t('restoreSuccess'),
                description: t('restoreSuccessDescription'),
            });

            setTimeout(() => {
                window.location.reload();
            }, 1500);

        } catch (error) {
            toast({
                variant: 'destructive',
                title: t('restoreFailed'),
                description: t('restoreFailedDescription'),
            });
            console.error("Restore error:", error);
        } finally {
            setShowRestoreDialog(false);
            setRestorePassword('');
            setFileToRestore(null);
        }
    };
    reader.readAsText(fileToRestore);
  };
  
  const handleLanguageChange = (newLocale: string) => {
    router.push(`/${newLocale}`);
  };


  const isSupervisor = currentUser?.role === 'supervisor';

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <PageHeader
        title={t('title')}
        description={t('description')}
      />
      
      <Tabs defaultValue="profile">
        <TabsList className={`grid w-full ${isSupervisor ? 'grid-cols-4' : 'grid-cols-3'}`}>
            <TabsTrigger value="profile">{t('tabs.profile')}</TabsTrigger>
            <TabsTrigger value="store">{t('tabs.store')}</TabsTrigger>
            <TabsTrigger value="app">{t('tabs.app')}</TabsTrigger>
            {isSupervisor && <TabsTrigger value="employees">{t('tabs.employees')}</TabsTrigger>}
        </TabsList>
        <TabsContent value="profile">
            <Card>
                <CardHeader>
                    <CardTitle>{t('profileTitle')}</CardTitle>
                    <CardDescription>{t('profileDescription')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label>{t('avatarLabel')}</Label>
                        <div className="flex items-center gap-4">
                            <Avatar className="h-20 w-20">
                                <AvatarImage src={avatarPreview} data-ai-hint="anonymous person" />
                                <AvatarFallback>{currentUser?.username.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <input
                                type="file"
                                ref={avatarInputRef}
                                onChange={handleAvatarChange}
                                className="hidden"
                                accept="image/*"
                            />
                            <Button variant="outline" onClick={() => avatarInputRef.current?.click()}>{t('changeAvatar')}</Button>
                        </div>
                    </div>

                    <Form {...profileForm}>
                        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className='space-y-4'>
                            <div className="space-y-1">
                                <Label htmlFor="username">{t('usernameLabel')}</Label>
                                <Input id="username" defaultValue={currentUser?.username || ''} readOnly />
                            </div>
                            <FormField
                                control={profileForm.control}
                                name="currentPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('currentPasswordLabel')}</FormLabel>
                                        <FormControl>
                                            <Input type="password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={profileForm.control}
                                name="newPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('newPasswordLabel')}</FormLabel>
                                        <FormControl>
                                            <Input type="password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <Button type="submit">{t('updatePasswordButton')}</Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSaveAvatar}>{t('saveAvatar')}</Button>
                </CardFooter>
            </Card>
        </TabsContent>
        <TabsContent value="store">
            <Form {...storeForm}>
                <form onSubmit={storeForm.handleSubmit(onStoreSubmit)}>
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('storeTitle')}</CardTitle>
                            <CardDescription>{t('storeDescription')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <FormField
                                control={storeForm.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('storeNameLabel')}</FormLabel>
                                        <FormControl>
                                            <Input {...field} disabled={!isSupervisor} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="space-y-2">
                                <Label htmlFor="logo">{t('logoLabel')}</Label>
                                {logoPreview && (
                                    <div className="mt-2">
                                        <Image src={logoPreview} alt="Logo Preview" width={80} height={80} className="rounded-md" />
                                    </div>
                                )}
                                <Input id="logo" type="file" onChange={handleLogoChange} disabled={!isSupervisor} accept="image/*" />
                            </div>
                            <FormField
                                control={storeForm.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('addressLabel')}</FormLabel>
                                        <FormControl>
                                            <Input {...field} disabled={!isSupervisor} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" disabled={!isSupervisor}>{t('saveChanges')}</Button>
                        </CardFooter>
                    </Card>
                </form>
            </Form>
        </TabsContent>
         <TabsContent value="app">
             <Card>
                <CardHeader>
                    <CardTitle>{t('appTitle')}</CardTitle>
                    <CardDescription>{t('appDescription')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>{t('themeLabel')}</Label>
                        <div className='flex items-center gap-4'>
                            <p className='text-sm text-muted-foreground'>{t('themeDescription')}</p>
                            <ThemeToggle />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>{t('languageLabel')}</Label>
                        <p className='text-sm text-muted-foreground'>{t('languageDescription')}</p>
                        <Select onValueChange={handleLanguageChange} defaultValue={locale}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="en">{t('english')}</SelectItem>
                                <SelectItem value="fr">{t('french')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>{t('currencyLabel')}</Label>
                         <Select defaultValue="dzd">
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="dzd">DZD (DA)</SelectItem>
                                <SelectItem value="usd">USD ($)</SelectItem>
                                <SelectItem value="eur">EUR (€)</SelectItem>
                                <SelectItem value="gbp">GBP (£)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
                <CardFooter className='flex-col items-start gap-4'>
                    <h3 className="font-semibold">{t('dataManagement')}</h3>
                    <div className='flex gap-2'>
                        <Button variant="outline" onClick={() => setShowBackupDialog(true)}>{t('backupData')}</Button>
                        <Button variant="destructive" onClick={handleRestoreClick}>{t('restoreData')}</Button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          className="hidden"
                          accept=".txt"
                        />
                    </div>
                </CardFooter>
            </Card>
        </TabsContent>
         {isSupervisor && (
            <TabsContent value="employees">
                <EmployeeManager />
            </TabsContent>
         )}
      </Tabs>

      <AlertDialog open={showBackupDialog} onOpenChange={setShowBackupDialog}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>{t('encryptBackupTitle')}</AlertDialogTitle>
                <AlertDialogDescription>{t('encryptBackupDescription')}</AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-2">
                <Label htmlFor="backup-password">{t('backupPasswordLabel')}</Label>
                <Input id="backup-password" type="password" value={backupPassword} onChange={(e) => setBackupPassword(e.target.value)} />
            </div>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setBackupPassword('')}>{t('cancel')}</AlertDialogCancel>
                <AlertDialogAction onClick={handleBackup}>{t('encryptAndDownload')}</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AlertDialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>{t('decryptAndRestoreTitle')}</AlertDialogTitle>
                <AlertDialogDescription>{t('decryptAndRestoreDescription', {fileName: fileToRestore?.name})}</AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-2">
                <Label htmlFor="restore-password">{t('restorePasswordLabel')}</Label>
                <Input id="restore-password" type="password" value={restorePassword} onChange={(e) => setRestorePassword(e.target.value)} />
            </div>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => {
                    setRestorePassword('');
                    setShowRestoreDialog(false);
                    setFileToRestore(null);
                }}>{t('cancel')}</AlertDialogCancel>
                <AlertDialogAction onClick={handleRestore}>{t('decryptAndRestore')}</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
