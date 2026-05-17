import type { Facture } from "~/db/schema";

export interface FactureEnrichie extends Facture {
	/** Reste à charge CE = montantTotalEuro - montantJSIS (ou montant si ancien enregistrement) */
	reste: number
}

export interface FenetreAnalyse {
	startDate: string
	endDate: string
	factures: FactureEnrichie[]
	totalReste: number
	seuil: number
	/** Montant dépassant le seuil (= totalReste - seuil, si positif) */
	depassement: number
	/** 90 % du dépassement = ce que la Commission rembourse */
	remboursementCommission: number
	/** Ancien alias conservé pour compatibilité template */
	remboursementSupplementaire: number
	estMeilleure: boolean
}

/**
 * Calcule le "reste à charge CE" pour une facture.
 * - Si les nouveaux champs RCAM sont renseignés (montantTotalEuro > 0), on utilise :
 *     reste = montantTotalEuro - montantJSIS
 * - Sinon on retombe sur l'ancien champ :
 *     reste = montant - montantRembourse
 */
function resteFacture(f: Facture): number {
	if ((f.montantTotalEuro ?? 0) > 0) {
		return Math.max(0, (f.montantTotalEuro ?? 0) - (f.montantJSIS ?? 0));
	}
	return Math.max(0, f.montant - (f.montantRembourse ?? 0));
}

export const useAnalysis = () => {
	/**
	 * @param toutesFactures   TOUTES les factures (soumises ou non)
	 * @param salaireNetMensuel Salaire net mensuel (seuil = salaire / 2)
	 */
	const computeFenetres = (
		toutesFactures: Facture[],
		salaireNetMensuel: number,
		personneACharge: boolean | null = null
	): FenetreAnalyse[] => {
		if (toutesFactures.length === 0) return [];

		const seuil = salaireNetMensuel / 2;

		// ── Date limite des 2 ans ──────────────────────────────────────
		const deuxAns = new Date();
		deuxAns.setFullYear(deuxAns.getFullYear() - 3);
		const deuxAnsStr = deuxAns.toISOString().split("T")[0]!;

		// ── Cutoff : max date des factures soumises ───────────────────
		// Toute facture avec dateFacture <= cutoff est exclue de l'analyse
		// (même si elle n'est pas marquée "soumis"), pour respecter la règle :
		// une fois la période soumise, les nouvelles factures dans cette période
		// ne comptent plus.
		const facturesSoumises = toutesFactures.filter((f) => f.soumis);
		const cutoffDate: string | null = facturesSoumises.length > 0
			? facturesSoumises.reduce((max, f) => f.dateFacture > max ? f.dateFacture : max, "")
			: null;

		// ── Factures éligibles ────────────────────────────────────────
		const valides: FactureEnrichie[] = toutesFactures
			.filter((f) =>
				!f.soumis
				&& f.dateFacture >= deuxAnsStr
				&& (!cutoffDate || f.dateFacture > cutoffDate)
			)
			.sort((a, b) => a.dateFacture.localeCompare(b.dateFacture))
			.map((f) => ({ ...f, reste: resteFacture(f) }));

		if (valides.length === 0) return [];

		// ── Fenêtres de 12 mois (une par date de début unique) ───────
		const datesDemarrage = [...new Set(valides.map((f) => f.dateFacture))];

		const fenetres: FenetreAnalyse[] = datesDemarrage.map((startDate) => {
			const debut = new Date(startDate);
			const fin = new Date(debut);
			fin.setFullYear(fin.getFullYear() + 1);
			const endDate = fin.toISOString().split("T")[0]!;

			const facturesFenetre = valides.filter(
				(f) => f.dateFacture >= startDate && f.dateFacture < endDate
			);

			const totalReste = facturesFenetre.reduce((s, f) => s + f.reste, 0);
			const depassement = Math.max(0, totalReste - seuil);
			const taux = personneACharge === true ? 1.0 : 0.9;
			const remboursementCommission = depassement * taux;

			return {
				startDate,
				endDate,
				factures: facturesFenetre,
				totalReste,
				seuil,
				depassement,
				remboursementCommission,
				remboursementSupplementaire: remboursementCommission, // alias
				estMeilleure: false
			};
		});

		// ── Marquer la meilleure fenêtre ─────────────────────────────
		const maxTotalReste = Math.max(...fenetres.map((f) => f.totalReste));
		if (maxTotalReste > 0) {
			fenetres.forEach((f) => {
				f.estMeilleure = f.totalReste === maxTotalReste;
			});
		}

		return fenetres;
	};

	return { computeFenetres };
};
