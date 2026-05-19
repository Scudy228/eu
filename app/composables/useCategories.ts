import type { Categorie, NewCategorie } from "~/db/schema";
import { eq } from "drizzle-orm";
import { categories } from "~/db/schema";

export const useCategories = () => {
	const { $db } = useNuxtApp() as { $db: any };

	const getAllCategories = async (): Promise<Categorie[]> => {
		if (!$db) return [];
		return await $db.select().from(categories).orderBy(categories.nom);
	};

	const createCategorie = async (data: Omit<NewCategorie, "id" | "createdAt" | "updatedAt">): Promise<void> => {
		if (!$db) throw new Error("Base de données non disponible");
		const now = new Date().toISOString();
		await $db.insert(categories).values({ ...data, createdAt: now, updatedAt: now });
	};

	const updateCategorie = async (id: number, data: Partial<Omit<NewCategorie, "id" | "createdAt">>): Promise<void> => {
		if (!$db) throw new Error("Base de données non disponible");
		await $db.update(categories).set({ ...data, updatedAt: new Date().toISOString() }).where(eq(categories.id, id));
	};

	const deleteCategorie = async (id: number): Promise<void> => {
		if (!$db) throw new Error("Base de données non disponible");
		await $db.delete(categories).where(eq(categories.id, id));
	};

	return { getAllCategories, createCategorie, updateCategorie, deleteCategorie };
};
