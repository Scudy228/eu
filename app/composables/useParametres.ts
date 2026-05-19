import type { Parametres } from "~/db/schema";
import { eq } from "drizzle-orm";
import { parametres } from "~/db/schema";

export const useParametres = () => {
	const { $db } = useNuxtApp() as { $db: any };

	const getParametres = async (): Promise<Parametres | null> => {
		if (!$db) return null;
		const result = await $db.select().from(parametres).limit(1);
		return result[0] ?? null;
	};

	const getSalaireNet = async (): Promise<number> => {
		const p = await getParametres();
		return p?.salaireNet ?? 0;
	};

	const setSalaireNet = async (salaire: number): Promise<void> => {
		if (!$db) return;
		await $db
			.update(parametres)
			.set({ salaireNet: salaire, updatedAt: new Date().toISOString() })
			.where(eq(parametres.id, 1));
	};

	const setProfil = async (data: {
		nomAffilie: string
		prenomAffilie: string
		matriculeAffilie: string
		institutionAffilie: string
		adresseBureau?: string
		telephoneBureau?: string
		adressePrivee?: string
		dateCessation?: string
		personneACharge?: number | null
		nomConjoint?: string
		prenomConjoint?: string
		matriculeConjoint?: string
		signaturePng?: string | null
		conjointSignaturePng?: string | null
	}): Promise<void> => {
		if (!$db) return;
		await $db
			.update(parametres)
			.set({ ...data, updatedAt: new Date().toISOString() })
			.where(eq(parametres.id, 1));
	};

	const resetParametres = async (): Promise<void> => {
		if (!$db) return;
		await $db.update(parametres).set({
			salaireNet: 0,
			personneACharge: null,
			nomAffilie: "",
			prenomAffilie: "",
			matriculeAffilie: "",
			institutionAffilie: "",
			adresseBureau: "",
			telephoneBureau: "",
			adressePrivee: "",
			dateCessation: "",
			nomConjoint: "",
			prenomConjoint: "",
			matriculeConjoint: "",
			signaturePng: null,
			conjointSignaturePng: null,
			updatedAt: new Date().toISOString()
		}).where(eq(parametres.id, 1));
	};

	return { getParametres, getSalaireNet, setSalaireNet, setProfil, resetParametres };
};
