import { LogOutOutline as LogoutIcon, PersonCircleOutline as UserIcon, SettingsOutline as SettingsIcon, ChatbubbleEllipsesOutline as SupportIcon } from '@vicons/ionicons5';

const menuAvatarOptions = [
    {
        label: 'Profile',
        key: 'profile',
        icon: UserIcon,
    },
    {
        label: 'Settings',
        key: 'settings',
        icon: SettingsIcon,
    },
    {
        label: 'Support and feedback',
        key: 'support',
        icon: SupportIcon,
    },
    {
        label: 'Logout',
        key: 'logout',
        icon: LogoutIcon,
    },
];

export default menuAvatarOptions;