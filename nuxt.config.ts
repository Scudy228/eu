import process from "node:process";

const host = process.env.TAURI_DEV_HOST;

export default defineNuxtConfig({
	modules: [
		"@vueuse/nuxt",
		"@nuxt/ui",
		"reka-ui/nuxt"
	],
	app: {
		head: {
			title: "RCAM / Article 72§3",
			charset: "utf-8",
			meta: [
				{ name: "format-detection", content: "no" },
				{ name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1" }
			]
		},
		pageTransition: false,
		layoutTransition: false
	},
	css: [
		"@/assets/css/main.css",
		"flag-icons/css/flag-icons.min.css"
	],
	ssr: false,
	imports: {
		presets: [
			{
				from: "zod",
				imports: [
					"z",
					{
						name: "infer",
						as: "zInfer",
						type: true
					}
				]
			}
		]
	},
	vite: {
		clearScreen: false,
		envPrefix: ["VITE_", "TAURI_"],
		server: {
			strictPort: true,
			hmr: host
				? {
					protocol: "ws",
					host,
					port: 3001
				}
				: undefined,
			watch: {
				ignored: ["**/src-tauri/**"]
			}
		}
	},
	devServer: {
		host: host || "0"
	},
	router: {
		options: {
			scrollBehaviorType: "smooth"
		}
	},
	devtools: {
		enabled: false
	},
	experimental: {
		typedPages: true
	},
	compatibilityDate: "2026-01-01"
});
