export default defineAppConfig({
	app: {
		name: "RCAM",
		author: "Scudyweb",
		version: "1.0.0"
	},
	ui: {
		colors: {
			primary: "blue",
			neutral: "slate"
		},
		button: {
			slots: { base: "cursor-pointer" }
		},
		formField: {
			slots: { root: "w-full" }
		},
		input: {
			slots: { root: "w-full" }
		},
		textarea: {
			slots: { root: "w-full", base: "resize-none" }
		}
	}
});
