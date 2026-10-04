import DeleteItemModal from '@/components/delete-item-modal';
import UpdateUserModal from '@/components/user/update-user-modal';
import TablePagination from '@/components/ui/table-pagination';
import { type UserPaginate, SearchData } from '@/types';
import { useForm, router } from '@inertiajs/react';
import { Calendar, Mail, Phone, ShieldCheck, UserCircle, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { BsTelegram } from 'react-icons/bs';
import { useIsMobile } from '@/hooks/use-mobile';

interface UserTableProps extends UserPaginate {
    searchData: SearchData;
}

const UserTable = ({ searchData, ...user }: UserTableProps) => {
    const { t } = useTranslation();
    const { delete: deleteUser, reset, clearErrors } = useForm();

    const handleDelete = (id: number) => {
        deleteUser(route('user.destroy', id), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
                toast.success(t('success.deleted'));
            },
            onError: (err) => {
                toast.error(err?.error || t('error.delete_failed'));
            },
        });
    };

    const getRoleStyles = (roleName: string) => {
        const name = roleName.toLowerCase();
        if (name === 'admin') return 'bg-destructive-bg text-destructive-text border-destructive/20';
        if (name === 'teacher')
            return 'bg-primary/10 text-primary border-primary/20';
        return 'bg-secondary text-secondary-foreground border-border';
    };

    const isMobile = useIsMobile();
    
    return (
        <div className="w-full">
            {/* Table Content */}
            {isMobile ? (
                <div className="divide-y divide-border">
                    {user.data.length > 0 ? (
                        user.data.map((item, index) => {
                            return (
                                <div key={item.id} className="p-4 flex flex-col gap-3 bg-card">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {item.avatar ? (
                                                <img src={item.avatar} alt={item.name} className="h-11 w-11 rounded-full object-cover border border-border" />
                                            ) : (
                                                <UserCircle className="h-11 w-11 text-muted-foreground" />
                                            )}
                                            <div>
                                                <div className="font-bold text-base text-foreground">{item.name}</div>
                                                <div className="text-xs text-muted-foreground">{item.email || `@${item.username}` || '—'}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <UpdateUserModal user={item} />
                                            <DeleteItemModal item={item} onDelete={handleDelete} />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                                        <div className="flex items-center gap-1.5">
                                            {item.roles?.map((r) => (
                                                <span key={r.id} className={`px-2.5 py-0.5 rounded-lg font-bold text-xs border ${getRoleStyles(r.name)}`}>
                                                    {r.name}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="font-medium">{new Date(item.created_at).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="p-8 text-center text-sm text-muted-foreground">
                            {t('user_management.no_users_found', 'Foydalanuvchilar topilmadi')}
                        </div>
                    )}
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-surface-2 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
                            <tr>
                                <th className="px-4 py-3.5">#</th>
                                <th className="px-4 py-3.5">{t('user', 'Foydalanuvchi')}</th>
                                <th className="px-4 py-3.5">{t('role', 'Rollar')}</th>
                                <th className="px-4 py-3.5">{t('created_at', "Qo'shilgan")}</th>
                                <th className="px-4 py-3.5">{t('user_management.activity', 'Faollik')}</th>
                                <th className="px-4 py-3.5">{t('contact', 'Aloqa')}</th>
                                <th className="px-4 py-3.5 text-right">{t('actions', 'Amallar')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border bg-card">
                            {user.data.length > 0 ? (
                                user.data.map((item, idx) => (
                                    <tr key={item.id} className="hover:bg-accent/40 transition-colors">
                                        <td className="px-4 py-4 font-mono text-muted-foreground font-bold text-xs">
                                            {(user.current_page - 1) * user.per_page + idx + 1}
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                {item.avatar ? (
                                                    <img src={item.avatar} alt={item.name} className="h-10 w-10 rounded-full object-cover border border-border" />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
                                                        <UserCircle className="h-6 w-6" />
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-bold text-sm text-foreground">{item.name}</div>
                                                    <div className="text-xs text-muted-foreground">ID: #{item.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {item.roles?.map((r) => (
                                                    <span key={r.id} className={`px-2.5 py-0.5 rounded-lg font-bold text-xs border ${getRoleStyles(r.name)}`}>
                                                        {r.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-muted-foreground text-xs font-medium">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                                {new Date(item.created_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                                                <Zap className="h-4 w-4 text-primary" />
                                                <span>{item.attempts_count || 0} {t('attempts', 'urinish')}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-muted-foreground">
                                            <div className="space-y-1 text-xs">
                                                {item.phone && (
                                                    <div className="flex items-center gap-1.5">
                                                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                                        <span>{item.phone}</span>
                                                    </div>
                                                )}
                                                {item.email && (
                                                    <div className="flex items-center gap-1.5">
                                                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                                        <span>{item.email}</span>
                                                    </div>
                                                )}
                                                {item.username && (
                                                    <div className="flex items-center gap-1.5 text-primary">
                                                        <BsTelegram className="h-3.5 w-3.5" />
                                                        <span>@{item.username}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <UpdateUserModal user={item} />
                                                <DeleteItemModal item={item} onDelete={handleDelete} />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                                        {t('user_management.no_users_found', 'Foydalanuvchilar topilmadi')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Standard Table Pagination */}
            <TablePagination
                from={user.from}
                to={user.to}
                total={user.total}
                per_page={user.per_page}
                links={user.links}
                searchParams={searchData}
            />
        </div>
    );
};

export default UserTable;
