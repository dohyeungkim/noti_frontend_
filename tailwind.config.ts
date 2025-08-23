/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./pages/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			fontFamily: {
				inter: ["Inter", "sans-serif"],
			},
			colors: {
				mygreen: "#589960",
				mypublic: "#789481",
				mydarkgreen: "#173A23",
				mygray: "#868C88",
				myred: "#C24343",
				mydelete: "#F06769",

				myblue: "#CBD9E1",
				mydarkblue: "#6AACD3",
				mybluegray: "#EBF1F4",
				mycheck: "#69889A",
			},
		},
	},
	plugins: [],
}
