import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Catégories de soins médicaux
export const categories = sqliteTable("categories", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	nom: text("nom").notNull().default(""),
	pourcentage: real("pourcentage").notNull().default(0),
	createdAt: text("created_at").notNull().default(""),
	updatedAt: text("updated_at").notNull().default("")
});

// Factures médicales RCAM / Article 72§3
export const factures = sqliteTable("factures", {
	id: integer("id").primaryKey({ autoIncrement: true }),

	// ── Identification ──────────────────────────────────────────
	numeroPage: text("numero_page"),
	nom: text("nom").notNull().default(""),
	prenom: text("prenom").notNull().default(""),
	matricule: text("matricule"),

	// ── Date et localisation ────────────────────────────────────
	dateFacture: text("date_facture").notNull().default(""),
	pays: text("pays"),

	// ── Champs hérités (rétro-compatibilité) ────────────────────
	numeroFacture: text("numero_facture"),
	/** Ancien champ : montant à charge (= montantTotalEuro pour anciens enregistrements) */
	montant: real("montant").notNull().default(0),
	/** Ancien champ : montant remboursé auto (= montantJSIS pour anciens enregistrements) */
	montantRembourse: real("montant_rembourse").notNull().default(0),
	categorieId: integer("categorie_id"),

	// ── Nouveaux champs RCAM / Article 72§3 ─────────────────────
	/** Montant maximum remboursable selon les barèmes */
	montantMaxRemboursable: real("montant_max_remboursable").notNull().default(0),
	/** Montant total remboursé dans la devise du pays */
	montantTotalRemboursePays: real("montant_total_rembourse_pays").notNull().default(0),
	/** Montant total de la facture en euros */
	montantTotalEuro: real("montant_total_euro").notNull().default(0),
	/** Montant remboursé par le JSIS en euros */
	montantJSIS: real("montant_jsis").notNull().default(0),
	/** Montant remboursé par la Commission en euros */
	montantCommission: real("montant_commission").notNull().default(0),

	// ── Statut ──────────────────────────────────────────────────
	soumis: integer("soumis").notNull().default(0),
	/** Identifiant de lot de soumission (partagé par toutes les factures soumises ensemble) */
	soumissionId: text("soumission_id"),
	/** Date/heure de soumission ISO 8601 */
	soumisAt: text("soumis_at"),
	createdAt: text("created_at").notNull().default(""),
	updatedAt: text("updated_at").notNull().default("")
});

// Paramètres globaux (1 seule ligne)
export const parametres = sqliteTable("parametres", {
	id: integer("id").primaryKey().default(1),
	salaireNet: real("salaire_net").notNull().default(0),
	/** null = non défini, 1 = oui (100%), 0 = non (90%) */
	personneACharge: integer("personne_a_charge"),
	// Profil de l'affilié (pour le formulaire DRS FR 02-2021)
	nomAffilie: text("nom_affilie").notNull().default(""),
	prenomAffilie: text("prenom_affilie").notNull().default(""),
	matriculeAffilie: text("matricule_affilie").notNull().default(""),
	institutionAffilie: text("institution_affilie").notNull().default(""),
	adresseBureau: text("adresse_bureau").notNull().default(""),
	telephoneBureau: text("telephone_bureau").notNull().default(""),
	adressePrivee: text("adresse_privee").notNull().default(""),
	dateCessation: text("date_cessation").notNull().default(""),
	nomConjoint: text("nom_conjoint").notNull().default(""),
	prenomConjoint: text("prenom_conjoint").notNull().default(""),
	matriculeConjoint: text("matricule_conjoint").notNull().default(""),
	/** Signature manuscrite de l'affilié(e) — data URL PNG base64 */
	signaturePng: text("signature_png"),
	/** Signature manuscrite du conjoint/partenaire — data URL PNG base64 */
	conjointSignaturePng: text("conjoint_signature_png"),
	updatedAt: text("updated_at").notNull().default("")
});

// Membres de la famille (avec matricule et pays pour sélection rapide)
export const personnes = sqliteTable("personnes", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	nom: text("nom").notNull().default(""),
	prenom: text("prenom").notNull().default(""),
	matricule: text("matricule").notNull().default(""),
	pays: text("pays").notNull().default(""),
	relation: text("relation").notNull().default(""),
	createdAt: text("created_at").notNull().default("")
});

export type Categorie = typeof categories.$inferSelect;
export type NewCategorie = typeof categories.$inferInsert;
export type Facture = typeof factures.$inferSelect;
export type NewFacture = typeof factures.$inferInsert;
export type Parametres = typeof parametres.$inferSelect;
export type Personne = typeof personnes.$inferSelect;
export type NewPersonne = typeof personnes.$inferInsert;
