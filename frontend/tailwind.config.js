// Tailwind CSS config for CropCare frontend
// Design tokens sourced from architecture/04_UI_UX_Spec.md §2

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1a936f',
        secondary: '#114b5f',
        warning: '#f0a202',
        danger: '#c1121f',
        background: '#f8f9fa',
      },
      borderRadius: {
        card: '12px',
        btn: '8px',
      },
      // Min tap target 44px per architecture/04_UI_UX_Spec.md §2
      minHeight: {
        tap: '44px',
      },
      minWidth: {
        tap: '44px',
      },
    },
  },
  plugins: [],
};
