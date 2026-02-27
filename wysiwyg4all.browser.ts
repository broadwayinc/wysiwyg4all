import { Wysiwyg4All } from "./wysiwyg4all";

declare global {
  interface Window {
    Wysiwyg4All: typeof Wysiwyg4All;
  }
}

if (typeof window !== "undefined") {
  window.Wysiwyg4All = Wysiwyg4All;
}

export { Wysiwyg4All };
