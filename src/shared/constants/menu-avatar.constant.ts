import { LogOutOutline as LogoutIcon, PersonCircleOutline as UserIcon, ChatbubbleEllipsesOutline as SupportIcon, ReceiptOutline as ReceiptIcon } from '@vicons/ionicons5';

const menuAvatarOptions = [
    {
        label: 'Profile',
        key: 'profile',
        icon: UserIcon,
    },
    {
        label: 'Lịch sử mua hàng',
        key: 'order-history',
        icon: ReceiptIcon,
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