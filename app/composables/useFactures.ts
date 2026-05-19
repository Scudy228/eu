import type { Facture, NewFacture } from "~/db/schema";
import { desc, eq, inArray } from "drizzle-orm";
import { factures } from "~/db/schema";

export const useFactures = () => {
	const { $db } = useNuxtApp() as { $db: any };

	const getAllFactures = async (): Promise<Facture[]> => {
		if (!$db) return [];
		return await $db.select().from(factures).orderBy(desc(factures.dateFacture));
	};

	const createFacture = async (data: Omit<NewFacture, "id" | "createdAt" | "updatedAt">): Promise<void> => {
		if (!$db) throw new Error("Base de données non disponible");
		const now = new Date().toISOString();
		await $db.insert(factures).values({ ...data, createdAt: now, updatedAt: now });
	};

	const updateFacture = async (id: number, data: Partial<Omit<NewFacture, "id" | "createdAt">>): Promise<void> => {
		if (!$db) throw new Error("Base de données non disponible");
		await $db.update(factures).set({ ...data, updatedAt: new Date().toISOString() }).where(eq(factures.id, id));
	};

	const deleteFacture = async (id: number): Promise<void> => {
		if (!$db) throw new Error("Base de données non disponible");
		await $db.delete(factures).where(eq(factures.id, id));
	};

	const deleteAllFactures = async (): Promise<void> => {
		if (!$db) throw new Error("Base de données non disponible");
		await $db.delete(factures);
	};

	const marquerSoumis = async (ids: number[], soumis: boolean, soumissionId?: string): Promise<void> => {
		if (!$db || ids.length === 0) return;
		const now = new Date().toISOString();
		await $db
			.update(factures)
			.set({
				soumis: soumis ? 1 : 0,
				soumissionId: soumis ? (soumissionId ?? now) : null,
				soumisAt: soumis ? now : null,
				updatedAt: now
			})
			.where(inArray(factures.id, ids));
	};

	const annulerGroupe = async (ids: number[]): Promise<void> => {
		if (!$db || ids.length === 0) return;
		await $db
			.update(factures)
			.set({ soumis: 0, soumissionId: null, soumisAt: null, updatedAt: new Date().toISOString() })
			.where(inArray(factures.id, ids));
	};

	return { getAllFactures, createFacture, updateFacture, deleteFacture, deleteAllFactures, marquerSoumis, annulerGroupe };
};
