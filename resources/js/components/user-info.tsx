import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { type User } from '@/types';

export function UserInfo({
  user,
  showEmail = false,
}: {
  user: User | undefined | null;
  showEmail?: boolean;
}) {
  const getInitials = useInitials();

  // Handle missing user data
  if (!user) {
    return (
      <>
        <Avatar className="h-8 w-8 overflow-hidden rounded-full">
          <AvatarFallback className="rounded-lg bg-white text-[#992426]">
            U
          </AvatarFallback>
        </Avatar>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-medium">Unknown User</span>
        </div>
      </>
    );
  }

  return (
    <>
      <Avatar className="h-8 w-8 overflow-hidden rounded-full">
        <AvatarImage src={user.avatar} alt={user.username || 'User'} />
        <AvatarFallback className="rounded-lg bg-white text-[#992426]">
          {getInitials(user.username)}
        </AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">
          {user.username || 'Unknown User'}
        </span>
        {showEmail && (
          <span className="truncate text-xs text-muted-foreground">
            {user.email || 'No email'}
          </span>
        )}
      </div>
    </>
  );
}