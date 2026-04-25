import { useState } from "react";

type DialogState = {
  open: boolean;
  title: string;
  message: string;
  variant?: "danger" | "primary";
  onConfirm: () => void;
};

const CLOSED: DialogState = { open: false, title: "", message: "", onConfirm: () => {} };

export function useConfirmDialog() {
  const [dialog, setDialog] = useState<DialogState>(CLOSED);
  const closeDialog = () => setDialog((d) => ({ ...d, open: false }));
  const openDialog = (opts: Omit<DialogState, "open">) =>
    setDialog({ ...opts, open: true });
  return { dialog, closeDialog, openDialog };
}
