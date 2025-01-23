/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1e40af',
          dark: '#1e3a8a',
        },
        accent: '#3b82f6',
      },
      backgroundImage: {
        'metal-texture': "url('https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3')",
        'stage-lights': "url('https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f')",
        'guitar': "url('https://images.unsplash.com/photo-1511735111819-9a3f7709049c')",
      },
    },
  },
  plugins: [],
};
