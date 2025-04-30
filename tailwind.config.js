/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx}", // 여기서는 .jsx와 .tsx 확장자를 추가하는 걸 잊지 말아요
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5',  // 예시: 원하는 색 추가
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],  // 예시: 폰트 설정
      },
    },
  },
  plugins: [],
}
