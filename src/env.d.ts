/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

export {};
declare global {
  interface Window {
    toast: (options: {
      title?: string;
      message: string;
      type?: string;
      location?: string;
      icon?: boolean;
      theme?: string;
      customIcon?: string;
      dismissable?: boolean;
    }) => void;
  }
}
