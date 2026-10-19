/// <reference types="vite/client" />

declare const __VERCEL_RUNTIME__: boolean;

declare module "*.jpg" {
  const src: string;
  export default src;
}

declare module "*.png" {
  const src: string;
  export default src;
}

declare module "*.svg" {
  const src: string;
  export default src;
}
