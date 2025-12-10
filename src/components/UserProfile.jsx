import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { LogOut, Settings, User, ChevronDown } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';

/**
 * User Profile Component
 * Displays user avatar, name/email and dropdown with settings and logout
 */
const UserProfile = ({ collapsed = false }) => {
    const navigate = useNavigate();
    const { user, logout } = useStore();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleSettings = () => {
        navigate('/settings');
    };

    // Get initials from name or email
    const getInitials = () => {
        if (user?.name) {
            const parts = user.name.split(' ');
            return parts.length > 1
                ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
                : user.name.slice(0, 2).toUpperCase();
        }
        return user?.email?.slice(0, 2).toUpperCase() || 'U';
    };

    if (!user) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className={`w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors text-left ${collapsed ? 'justify-center' : ''}`}
                    data-testid="user-profile-trigger"
                >
                    {/* Avatar */}
                    {user.avatar ? (
                        <img
                            src={user.avatar}
                            alt={user.name || user.email}
                            className="w-8 h-8 rounded-full flex-shrink-0 object-cover"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-medium text-primary">
                                {getInitials()}
                            </span>
                        </div>
                    )}

                    {/* User Info (hidden when collapsed) */}
                    {!collapsed && (
                        <>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                    {user.name || user.email?.split('@')[0]}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                    {user.email}
                                </p>
                            </div>
                            <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        </>
                    )}
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="w-56"
            >
                {/* User header in dropdown */}
                <div className="px-2 py-2">
                    <div className="flex items-center gap-3">
                        {user.avatar ? (
                            <img
                                src={user.avatar}
                                alt={user.name || user.email}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="w-5 h-5 text-primary" />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                                {user.name || 'User'}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                                {user.email}
                            </p>
                        </div>
                    </div>
                </div>

                <DropdownMenuSeparator />

                {/* Settings */}
                <DropdownMenuItem
                    onClick={handleSettings}
                    className="cursor-pointer"
                    data-testid="settings-menu-item"
                >
                    <Settings className="w-4 h-4 mr-2" />
                    <span>Settings</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Logout */}
                <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                    data-testid="logout-menu-item"
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default UserProfile;
