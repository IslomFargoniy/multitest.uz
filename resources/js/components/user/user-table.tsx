import DeleteItemModal from '@/components/delete-item-modal';
import UpdateUserModal from '@/components/user/update-user-modal';
import TablePagination from '@/components/ui/table-pagination';
import { type UserPaginate, SearchData } from '@/types';
import { Link, useForm, router } from '@inertiajs/react';
import { Calendar, ChevronLeft, ChevronRight, Mail, Phone, ShieldCheck, UserCircle, Zap } from 'lucide-react';
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
        if (name === 'admin') return 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-900/30';
        if (name === 'teacher')
            return 'bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:text-primary dark:border-primary/30';
        return 'bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
    };

    const isMobile = useIsMobile();
    
    const UserCard = ({ item, globalIndex }: { item: any; globalIndex: number }) => (
        <div
            className="tma-card group relative cursor-pointer"
            onClick={() => item.id && router.get(route('user.show', item.id))}
        >
            <div className="mb-4 flex items-center justify-between">
                <span className="font-black text-slate-300 dark:text-slate-700">
                    #{globalIndex.toString().padStart(2, '0')}
                </span>
                <div className="flex flex-wrap justify-end gap-1">
                    {item.roles?.map((role: any) => (
                        <span
                            key={role.id}
                            className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[9px] font-black tracking-tight uppercase ${getRoleStyles(role.name)}`}
                        >
                            <ShieldCheck className="h-2.5 w-2.5" />
                            {role.name}
                        </span>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                    <UserCircle className="h-7 w-7" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate font-black text-slate-900 dark:text-white">
                        {item.name}
                    </span>
                    <span className="truncate text-xs font-medium text-slate-400 lowercase">
                        @{item.username}
                    </span>
                </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4 border-y border-slate-50 py-4 dark:border-slate-800/50">
                <div className="space-y-1">
                    <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase">{t('user_management.joined')}</span>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400">
                        <Calendar className="h-3 w-3 text-slate-300" />
                        {new Date(item.created_at).toLocaleDateString()}
                    </div>
                </div>
                <div className="space-y-1">
                    <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase">{t('user_management.activity')}</span>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400">
                        <Zap className="h-3 w-3 text-amber-500" />
                        {item.attempts_count || 0} Attempts
                    </div>
                </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
                <div className="flex flex-col gap-1 overflow-hidden">
                    <div className="flex items-center gap-2 truncate text-xs font-bold text-slate-600 dark:text-slate-400">
                        <Phone className="h-3 w-3 shrink-0 text-slate-300" />
                        <span className="truncate">{item.phone || '—'}</span>
                    </div>
                </div>
                <div 
                    className="flex items-center gap-1 rounded-2xl bg-slate-50 p-1.5 transition-colors group-hover:bg-slate-100 dark:bg-slate-800/50 dark:group-hover:bg-slate-800"
                    onClick={(e) => e.stopPropagation()}
                >
                    <UpdateUserModal user={item} />
                    <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700" />
                    <DeleteItemModal item={item} onDelete={handleDelete} />
                </div>
            </div>
        </div>
    );

    return (
        <div className="w-full">
            {/* Table Content */}
            {isMobile ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {user.data.length > 0 ? (
                        user.data.map((item, index) => {
                            return (
                                <div key={item.id} className="p-4 flex flex-col gap-3 bg-white dark:bg-slate-900">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {item.avatar ? (
                                                <img src={item.avatar} alt={item.name} className="h-11 w-11 rounded-full object-cover border border-slate-200" />
                                            ) : (
                                                <UserCircle className="h-11 w-11 text-slate-400" />
                                            )}
                                            <div>
                                                <div className="font-bold text-base text-slate-900 dark:text-white">{item.name}</div>
                                                <div className="text-xs text-slate-500">{item.email || `@${item.username}` || '—'}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <UpdateUserModal user={item} />
                                            <DeleteItemModal item={item} onDelete={handleDelete} />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center gap-1.5">
                                            {item.roles?.map((r) => (
                                                <span key={r.id} className="px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
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
                        <div className="p-8 text-center text-sm text-slate-400">
                            {t('user_management.no_users_found') || 'Foydalanuvchilar topilmadi'}
                        </div>
                    )}
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800/80 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                            <tr>
                                <th className="px-4 py-3.5">#</th>
                                <th className="px-4 py-3.5">{t('user') || 'Foydalanuvchi'}</th>
                                <th className="px-4 py-3.5">{t('role') || 'Rollar'}</th>
                                <th className="px-4 py-3.5">{t('created_at') || "Qo'shilgan"}</th>
                                <th className="px-4 py-3.5">{t('stats') || 'Statistika'}</th>
                                <th className="px-4 py-3.5">{t('contact') || 'Aloqa'}</th>
                                <th className="px-4 py-3.5 text-right">{t('actions') || 'Amallar'}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                            {user.data.length > 0 ? (
                                user.data.map((item, idx) => (
                                    <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                                        <td className="px-4 py-4 font-mono text-slate-400 font-bold text-xs">
                                            {(user.current_page - 1) * user.per_page + idx + 1}
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                {item.avatar ? (
                                                    <img src={item.avatar} alt={item.name} className="h-10 w-10 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                                        <UserCircle className="h-6 w-6" />
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-bold text-sm text-slate-900 dark:text-slate-100">{item.name}</div>
                                                    <div className="text-xs text-slate-400">ID: #{item.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {item.roles?.map((r) => (
                                                    <span key={r.id} className="px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-bold text-xs border border-indigo-100 dark:border-indigo-900/40">
                                                        {r.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-slate-600 dark:text-slate-400 text-xs font-medium">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                                {new Date(item.created_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                                                <Zap className="h-4 w-4 text-amber-500" />
                                                <span>{item.attempts_count || 0} {t('attempts') || 'urinish'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-slate-600 dark:text-slate-400">
                                            <div className="space-y-1 text-xs">
                                                {item.phone && (
                                                    <div className="flex items-center gap-1.5">
                                                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                                                        <span>{item.phone}</span>
                                                    </div>
                                                )}
                                                {item.email && (
                                                    <div className="flex items-center gap-1.5">
                                                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                                                        <span>{item.email}</span>
                                                    </div>
                                                )}
                                                {item.username && (
                                                    <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
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
                                    <td colSpan={7} className="py-12 text-center text-sm text-slate-400">
                                        {t('user_management.no_users_found') || 'Foydalanuvchilar topilmadi'}
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
