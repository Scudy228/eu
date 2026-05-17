/**
 * Bloque le scroll du body quand une modale est ouverte.
 * Cible <html> et <body> sans modifier la position du body,
 * pour éviter de casser les portals (reka-ui / Nuxt UI USelect).
 */
export function useBodyScrollLock() {
	const lock = () => {
		document.documentElement.style.overflow = "hidden";
		document.body.style.overflow = "hidden";
	};

	const unlock = () => {
		document.documentElement.style.overflow = "";
		document.body.style.overflow = "";
	};

	return { lock, unlock };
}
