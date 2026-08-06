export type DialogButtonVariant = "normal" | "progressive" | "destructive";

export type DialogButton = {
  label: string;
  onClick: () => void | Promise<void>;
  variant?: DialogButtonVariant;
};

export type DialogConfig = {
  title: string;
  dialogClass?: string;
  content: JQuery;
  width?: string;
  height?: string;
  buttons?: DialogButton[];
  onClose?: () => void;
};

export type DialogController = {
  setButtons(buttons: DialogButton[]): void;
  reposition(): void;
  close(): void;
};
