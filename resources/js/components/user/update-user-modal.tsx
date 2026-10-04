import { useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { Role, User } from '@/types';
import { Lock, Mail, Pencil, Phone, Shield, UserCog } from 'lucide-react';

interface UpdateUserModalProps {
    user: User;
}

export default function UpdateUserModal({ user }: UpdateUserModalProps) {
    const { t } = useTranslation();
    const nameInput = useRef<HTMLInputElement>(null);
    const [open, setOpen] = useState(false);
    const [roles, setRoles] = useState<Role[]>([]);

    const { data, setData, put, processing, reset, errors, clearErrors } = useForm({
        name: user.name || '',
        role: user.roles?.[0]?.name ?? '',
        phone: user.phone || '',
        email: user.email || '',
        password: '',
        create_test_limit: user.create_test_limit || 0,
    });

    useEffect(() => {
        if (open) {
            setData({
                name: user.name || '',
                phone: user.phone || '',
                email: user.email || '',
                password: '',
                role: user.roles?.[0]?.name ?? '',
                create_test_limit: user.create_test_limit || 0,
            });

            const fetchRoles = async () => {
                try {
                    const response = await fetch(route('role.all.json'));
                    const result = await response.json();
                    const list: Role[] = Array.isArray(result) ? result : result.data || [];
                    setRoles(list);
                } catch (error) {
                    setRoles([]);
                }
            };
            fetchRoles();
        }
    }, [open, user]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('user.update', user.id), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
                setOpen(false);
                toast.success(t('success.updated'));
            },
            onError: (err) => {
                nameInput.current?.focus();
                toast.error(err?.error || t('error.update_failed'));
            },
        });
    };

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                type="button"
                title={t('common.edit')}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground shadow-xs transition-colors hover:border-border-strong hover:bg-accent hover:text-foreground active:scale-95"
            >
                <Pencil className="h-4 w-4" />
            </button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="flex max-h-[95vh] !w-[600px] !max-w-[95vw] flex-col gap-0 overflow-hidden rounded-2xl border border-border bg-card p-0 shadow-2xl">
                    {/* Header */}
                    <div className="flex-none border-b border-border bg-surface-2 px-8 py-6">
                        <div className="flex items-center gap-4">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                                <UserCog className="h-5 w-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                                    {t('user_management.edit_user_title')}
                                </DialogTitle>
                                <DialogDescription className="font-medium text-sm text-muted-foreground mt-0.5">
                                    {t('user_management.modifying_account_for')}{' '}
                                    <span className="font-semibold text-primary">{user.name}</span>
                                </DialogDescription>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={submit} className="flex flex-1 flex-col overflow-hidden">
                        <div className="flex-1 space-y-5 overflow-y-auto p-8">
                            {/* Name Input */}
                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="name"
                                    className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                                >
                                    {t('common.full_name')}
                                </Label>
                                <Input
                                    id="name"
                                    ref={nameInput}
                                    className="h-11 rounded-xl border-border bg-secondary px-4 font-medium text-foreground focus:ring-2 focus:ring-primary/20"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                {/* Phone Input */}
                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="phone"
                                        className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                                    >
                                        <Phone className="h-3 w-3" /> {t('user_management.phone')}
                                    </Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        className="h-11 rounded-xl border-border bg-secondary px-4 font-medium text-foreground focus:ring-2 focus:ring-primary/20"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                    />
                                    <InputError message={errors.phone} />
                                </div>

                                {/* Role Select */}
                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="role"
                                        className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                                    >
                                        <Shield className="h-3 w-3" /> {t('common.role')}
                                    </Label>
                                    <select
                                        id="role"
                                        value={data.role}
                                        onChange={(e) => setData('role', e.target.value)}
                                        className="h-11 w-full rounded-xl border border-border bg-secondary px-4 text-sm font-medium text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    >
                                        <option value="">{t('user_management.select_role')}</option>
                                        {roles.map((role) => (
                                             <option key={role.id} value={role.name}>
                                                 {role.name}
                                             </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.role} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                {/* Email Input */}
                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="email"
                                        className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                                    >
                                        <Mail className="h-3 w-3" /> {t('common.email')}
                                    </Label>
                                    <Input
                                        id="email"
                                        className="h-11 rounded-xl border-border bg-secondary px-4 font-medium text-foreground focus:ring-2 focus:ring-primary/20"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                {/* Limit Input */}
                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor="create_test_limit"
                                        className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                                    >
                                        {t('user_management.create_test_limit', 'Test Limit')}
                                    </Label>
                                    <Input
                                        id="create_test_limit"
                                        type="number"
                                        min="0"
                                        className="h-11 rounded-xl border-border bg-secondary px-4 font-medium text-foreground focus:ring-2 focus:ring-primary/20"
                                        value={data.create_test_limit}
                                        onChange={(e) => setData('create_test_limit', Number(e.target.value))}
                                    />
                                    <InputError message={errors.create_test_limit} />
                                </div>
                            </div>

                            {/* Password Input (Optional) */}
                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="password"
                                    className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                                >
                                    <Lock className="h-3 w-3" /> {t('user_management.reset_password')}
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder={t('user_management.leave_blank_to_keep')}
                                    className="h-11 rounded-xl border-border bg-secondary px-4 font-medium text-foreground focus:ring-2 focus:ring-primary/20"
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                                <InputError message={errors.password} />
                            </div>
                        </div>

                        {/* Footer Action */}
                        <DialogFooter className="flex-none border-t border-border bg-surface-2 px-8 py-5">
                            <div className="flex w-full items-center justify-end gap-3">
                                <DialogClose asChild>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="h-11 rounded-xl px-6 font-semibold text-muted-foreground hover:bg-secondary"
                                        onClick={() => {
                                            reset();
                                            clearErrors();
                                            setOpen(false);
                                        }}
                                    >
                                        {t('common.cancel')}
                                    </Button>
                                </DialogClose>

                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="h-11 min-w-[130px] rounded-xl bg-primary px-6 font-semibold text-primary-foreground shadow-sm active:scale-95 disabled:opacity-50"
                                >
                                    {processing ? t('common.saving') : t('common.save_changes')}
                                </Button>
                            </div>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
