

'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useDataContext } from '@/context/data-context';
import { formatDistanceToNow } from 'date-fns';
import { useTranslations } from 'next-intl';

export function ActivityLog() {
  const t = useTranslations('ActivityLog');
  const { activityLogs, users } = useDataContext();

  const getUserAvatar = (username: string) => {
    const user = users.find(u => u.username === username);
    return user?.avatar || 'https://storage.googleapis.com/project-ava-prod.appspot.com/files_public/3y/3y3L5gT2QceZf5t021qGvA';
  }

  return (
    <div className="space-y-6">
      {activityLogs.slice(0, 5).map((log) => (
        <div key={log.id} className="flex items-start gap-4">
          <Avatar className="h-9 w-9">
            <AvatarImage src={getUserAvatar(log.user)} alt="Avatar" data-ai-hint="anonymous person" />
            <AvatarFallback>{log.user.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="grid gap-1">
            <p className="text-sm font-medium leading-none">{log.user}</p>
            <p className="text-sm text-muted-foreground">{log.action}</p>
            <p className="text-xs text-muted-foreground/80">
                {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
