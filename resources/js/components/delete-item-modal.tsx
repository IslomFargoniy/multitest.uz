import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { htmlToPlainText } from '@/utils/html';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface DeleteItemModalProps {
    item: { id: number; name?: string; textarea?: string };
    open?: boolean;
    setOpen?: (open: boolean) => void;
    onDelete: (id: number) => void;
}

export default function DeleteItemModal({ item, open, setOpen, onDelete }: DeleteItemModalProps) {
    const { t } = useTranslation();

    const handleDelete = () => {
        onDelete(item.id);
        if (setOpen) {
            setOpen(false);
        }
    };

    const displayName = item.name || (item.textarea ? htmlToPlainText(item.textarea).slice(0, 40) : null);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="border-border bg-card w-full sm:max-w-md">
                <DialogHeader className="border-border space-y-1 border-b pb-2">
                    <div className="text-destructive flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 shrink-0" />
                        <DialogTitle className="text-foreground text-lg font-bold">{t('modal.delete_title', "O'chirishni tasdiqlang")}</DialogTitle>
                    </div>
                    <DialogDescription className="text-muted-foreground text-xs">
                        {t('modal.delete_confirmation', "Ushbu ma'lumotni o'chirishga ishonchingiz komilmi? Ushbu amalni ortga qaytarib bo'lmaydi.")}
                    </DialogDescription>
                </DialogHeader>

                {displayName && (
                    <div className="bg-destructive/10 border-destructive/20 text-destructive my-1 truncate rounded-lg border p-3 text-xs font-semibold">
                        "{displayName}"
                    </div>
                )}

                <DialogFooter className="border-border mt-2 flex items-center justify-end gap-3 border-t pt-3">
                    <DialogClose asChild>
                        <Button type="button" variant="outline" onClick={() => setOpen && setOpen(false)}>
                            {t('cancel', 'Bekor qilish')}
                        </Button>
                    </DialogClose>

                    <Button type="button" variant="destructive" onClick={handleDelete}>
                        {t('delete', "O'chirish")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
