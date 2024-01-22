type DialogArgs =
  | {
      dialogClass: string;
      title: string;
      resizable?: boolean;
      height: string;
      width: string;
      modal: boolean;
      close: () => void;
    }
  | string
  | { buttons: { text: string; click: () => void }[] }
  | { position: { my: string; at: string; of: Window } };

interface JQuery {
  dialog(args: DialogArgs): jQuery;
}
