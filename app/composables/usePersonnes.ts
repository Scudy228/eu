import type { Personne } from "~/db/schema";
import { eq } from "drizzle-orm";
import { personnes } from "~/db/schema";

export const usePersonnes = () => {
	const { $db } = useNuxtApp() as { $db: any };

	const getAllPersonnes = async (): Promise<Personne[]> => {
		if (!$db) return [];
		return await $db.select().from(personnes).orderBy(personnes.nom);
	};

	const createPersonne = async (data: {
		nom: string
		prenom: string
		matricule?: string
		pays?: string
		relation?: string
	}): Promise<void> => {
		if (!$db) return;
		await $db.insert(personnes).values({
			nom: data.nom,
			prenom: data.prenom,
			matricule: data.matricule ?? "",
			pays: data.pays ?? "",
			relation: data.relation ?? "",
			createdAt: new Date().toISOString()
		});
	};

	const updatePersonne = async (id: number, data: {
		nom?: string
		prenom?: string
		matricule?: string
		pays?: string
	}): Promise<void> => {
		if (!$db) return;
		await $db.update(personnes).set(data).where(eq(personnes.id, id));
	};

	const deletePersonne = async (id: number): Promise<void> => {
		if (!$db) return;
		await $db.delete(personnes).where(eq(personnes.id, id));
	};

	const deleteAllPersonnes = async (): Promise<void> => {
		if (!$db) return;
		await $db.delete(personnes);
	};

	return { getAllPersonnes, createPersonne, updatePersonne, deletePersonne, deleteAllPersonnes };
};
