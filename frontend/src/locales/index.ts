export { en } from './en.ts';
export { hi } from './hi.ts';
export { mr } from './mr.ts';

export type TranslationKey = keyof typeof import('./en.ts').en;
