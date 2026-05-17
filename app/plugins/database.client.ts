import { invoke } from "@tauri-apps/api/core";
import Database from "@tauri-apps/plugin-sql";
import { drizzle } from "drizzle-orm/sqlite-proxy";
import * as schema from "~/db/schema";

const CREATE_CATEGORIES_SQL = `
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom TEXT NOT NULL DEFAULT '',
  pourcentage REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT ''
)`;

const CREATE_FACTURES_SQL = `
CREATE TABLE IF NOT EXISTS factures (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  numero_page TEXT,
  nom TEXT NOT NULL DEFAULT '',
  prenom TEXT NOT NULL DEFAULT '',
  matricule TEXT,
  date_facture TEXT NOT NULL DEFAULT '',
  pays TEXT,
  numero_facture TEXT,
  montant REAL NOT NULL DEFAULT 0,
  montant_rembourse REAL NOT NULL DEFAULT 0,
  categorie_id INTEGER,
  montant_max_remboursable REAL NOT NULL DEFAULT 0,
  montant_total_rembourse_pays REAL NOT NULL DEFAULT 0,
  montant_total_euro REAL NOT NULL DEFAULT 0,
  montant_jsis REAL NOT NULL DEFAULT 0,
  montant_commission REAL NOT NULL DEFAULT 0,
  soumis INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT ''
)`;

const CREATE_PARAMETRES_SQL = `
CREATE TABLE IF NOT EXISTS parametres (
  id INTEGER PRIMARY KEY DEFAULT 1,
  salaire_net REAL NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT ''
)`;

const CREATE_PERSONNES_SQL = `
CREATE TABLE IF NOT EXISTS personnes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom TEXT NOT NULL DEFAULT '',
  prenom TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT ''
)`;

/** Ajoute une colonne si elle n'existe pas encore */
async function addColumnIfMissing(sqlite: Awaited<ReturnType<typeof Database.load>>, table: string, column: string, definition: string) {
	try {
		await sqlite.select(`SELECT ${column} FROM ${table} LIMIT 1`, []);
	} catch {
		await sqlite.execute(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`, []);
	}
}

export default defineNuxtPlugin(async () => {
	let db: ReturnType<typeof drizzle> | null = null;

	try {
		const exeDir = await invoke<string>("get_exe_dir");
		const dbPath = exeDir ? `sqlite:${exeDir}/eu_factures.db` : "sqlite:eu_factures.db";
		const sqlite = await Database.load(dbPath);

		// Migration : si ancienne colonne salaire_net sur factures → recréer
		try {
			await sqlite.select("SELECT salaire_net FROM factures LIMIT 1", []);
			await sqlite.execute("DROP TABLE IF EXISTS factures", []);
		} catch { /* structure correcte */ }

		// Créer les tables
		await sqlite.execute(CREATE_CATEGORIES_SQL, []);
		await sqlite.execute(CREATE_FACTURES_SQL, []);
		await sqlite.execute(CREATE_PARAMETRES_SQL, []);
		await sqlite.execute(CREATE_PERSONNES_SQL, []);

		// ── Migrations pour les anciennes colonnes ──────────────────────
		await addColumnIfMissing(sqlite, "factures", "categorie_id", "INTEGER");
		await addColumnIfMissing(sqlite, "factures", "soumis", "INTEGER NOT NULL DEFAULT 0");
		await addColumnIfMissing(sqlite, "factures", "soumission_id", "TEXT");
		await addColumnIfMissing(sqlite, "factures", "soumis_at", "TEXT");
		await addColumnIfMissing(sqlite, "factures", "montant_rembourse", "REAL NOT NULL DEFAULT 0");

		// ── Migrations pour les nouveaux champs RCAM / Article 72§3 ────
		await addColumnIfMissing(sqlite, "factures", "numero_page", "TEXT");
		await addColumnIfMissing(sqlite, "factures", "matricule", "TEXT");
		await addColumnIfMissing(sqlite, "factures", "pays", "TEXT");
		await addColumnIfMissing(sqlite, "factures", "montant_max_remboursable", "REAL NOT NULL DEFAULT 0");
		await addColumnIfMissing(sqlite, "factures", "montant_total_rembourse_pays", "REAL NOT NULL DEFAULT 0");
		await addColumnIfMissing(sqlite, "factures", "montant_total_euro", "REAL NOT NULL DEFAULT 0");
		await addColumnIfMissing(sqlite, "factures", "montant_jsis", "REAL NOT NULL DEFAULT 0");
		await addColumnIfMissing(sqlite, "factures", "montant_commission", "REAL NOT NULL DEFAULT 0");

		// ── Migrations personnes (matricule + pays + relation) ──────────
		await addColumnIfMissing(sqlite, "personnes", "matricule", "TEXT NOT NULL DEFAULT ''");
		await addColumnIfMissing(sqlite, "personnes", "pays", "TEXT NOT NULL DEFAULT ''");
		await addColumnIfMissing(sqlite, "personnes", "relation", "TEXT NOT NULL DEFAULT ''");

		// ── Migration personne à charge ─────────────────────────────────
		await addColumnIfMissing(sqlite, "parametres", "personne_a_charge", "INTEGER");

		// ── Migrations profil affilié ───────────────────────────────────
		await addColumnIfMissing(sqlite, "parametres", "nom_affilie", "TEXT NOT NULL DEFAULT ''");
		await addColumnIfMissing(sqlite, "parametres", "prenom_affilie", "TEXT NOT NULL DEFAULT ''");
		await addColumnIfMissing(sqlite, "parametres", "matricule_affilie", "TEXT NOT NULL DEFAULT ''");
		await addColumnIfMissing(sqlite, "parametres", "institution_affilie", "TEXT NOT NULL DEFAULT ''");
		await addColumnIfMissing(sqlite, "parametres", "adresse_bureau", "TEXT NOT NULL DEFAULT ''");
		await addColumnIfMissing(sqlite, "parametres", "telephone_bureau", "TEXT NOT NULL DEFAULT ''");
		await addColumnIfMissing(sqlite, "parametres", "adresse_privee", "TEXT NOT NULL DEFAULT ''");
		await addColumnIfMissing(sqlite, "parametres", "date_cessation", "TEXT NOT NULL DEFAULT ''");

		// ── Migration conjoint ──────────────────────────────────────────────
		await addColumnIfMissing(sqlite, "parametres", "nom_conjoint", "TEXT NOT NULL DEFAULT ''");
		await addColumnIfMissing(sqlite, "parametres", "prenom_conjoint", "TEXT NOT NULL DEFAULT ''");
		await addColumnIfMissing(sqlite, "parametres", "matricule_conjoint", "TEXT NOT NULL DEFAULT ''");

		// ── Migration signature ─────────────────────────────────────────────
		await addColumnIfMissing(sqlite, "parametres", "signature_png", "TEXT");
		await addColumnIfMissing(sqlite, "parametres", "conjoint_signature_png", "TEXT");

		// Insérer la ligne de paramètres si absente
		const existing = await sqlite.select<{ id: number }[]>("SELECT id FROM parametres LIMIT 1", []);
		if (existing.length === 0) {
			await sqlite.execute(
				"INSERT INTO parametres (id, salaire_net, updated_at) VALUES (1, 0, ?)",
				[new Date().toISOString()]
			);
		}

		db = drizzle(
			async (sql, params, method) => {
				if (method === "run") {
					await sqlite.execute(sql, params as unknown[]);
					return { rows: [] };
				}
				const rows = await sqlite.select<Record<string, unknown>[]>(sql, params as unknown[]);
				if (method === "get") {
					const first = rows[0];
					return { rows: first ? Object.values(first) : [] };
				}
				return { rows: rows.map((row) => Object.values(row)) };
			},
			{ schema }
		);
	} catch (e) {
		console.error("Erreur initialisation base de données:", e);
	}

	return { provide: { db } };
});
