/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

export {};

declare global {
  interface Window {
    va: function;
    vaq: function;
  }
}