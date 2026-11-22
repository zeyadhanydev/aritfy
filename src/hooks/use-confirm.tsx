import { useState, type ReactElement } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const useConfirm = (title: string, message: string): [() => ReactElement, () => Promise<boolean>] => {
 const [pending, setPending] = useState<{ resolve: (value: boolean) => void } | null>(null);
 const confirm = () => new Promise<boolean>(resolve => setPending({ resolve }));
 const finish = (answer: boolean) => { pending?.resolve(answer); setPending(null); };
 const ConfirmationDialog = () => (
  <Dialog open={pending !== null} onOpenChange={open => { if (!open) finish(false); }}>
   <DialogContent>
    <DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription>{message}</DialogDescription></DialogHeader>
    <DialogFooter className="pt-2">
     <Button onClick={() => finish(false)} variant="outline">Cancel</Button>
     <Button onClick={() => finish(true)}>Confirm</Button>
    </DialogFooter>
   </DialogContent>
  </Dialog>
 );
 return [ConfirmationDialog, confirm];
};
