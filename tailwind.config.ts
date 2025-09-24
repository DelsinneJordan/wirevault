import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#17C66B',
          dark: '#11A85A',
          light: '#E9FFF3'
        },
        accent: {
          DEFAULT: '#1F7AEA',
          dark: '#1559A8',
          light: '#E8F1FF'
        },
        ink: '#0B1220',
        bg: '#FFFFFF'
      },
      boxShadow: {
        soft: '0 4px 30px rgba(0,0,0,0.06)'
      },
      borderRadius: {
        '2xl': '1rem'
      }
    }
  },
  plugins: []
}
export default config
