export type ThemeId = "light" | "dark";

const currentTheme = ref<ThemeId>("light");

const applyTheme = (id: ThemeId) => {
	if (typeof document === "undefined") return;
	const html = document.documentElement;
	if (id === "dark") {
		html.classList.add("dark");
		html.setAttribute("data-theme", "dark");
	} else {
		html.classList.remove("dark");
		html.setAttribute("data-theme", "light");
	}
};

export const useTheme = () => {
	const isDark = computed(() => currentTheme.value === "dark");

	const setTheme = (id: ThemeId) => {
		currentTheme.value = id;
		applyTheme(id);
		if (typeof localStorage !== "undefined") localStorage.setItem("eu-theme", id);
	};

	const toggleDark = () => setTheme(currentTheme.value === "dark" ? "light" : "dark");

	const initTheme = () => {
		if (typeof localStorage === "undefined") return;
		const saved = localStorage.getItem("eu-theme") as ThemeId | null;
		const id: ThemeId = saved === "dark" ? "dark" : "light";
		currentTheme.value = id;
		applyTheme(id);
	};

	return { currentTheme: readonly(currentTheme), isDark, setTheme, toggleDark, initTheme };
};
