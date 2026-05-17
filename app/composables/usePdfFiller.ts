import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export interface PdfFillData {
	prenomAffilie: string
	nomAffilie: string
	matriculeAffilie: string
	institutionAffilie: string
	adresseBureau: string
	telephoneBureau: string
	adressePrivee: string
	dateCessation: string
	startDate: string // YYYY-MM-DD
	endDate: string // YYYY-MM-DD
	nomConjoint?: string
	prenomConjoint?: string
	matriculeConjoint?: string
	/** data URL PNG base64 de la signature manuscrite de l'affilié(e) */
	signaturePng?: string | null
	/** data URL PNG base64 de la signature manuscrite du conjoint */
	conjointSignaturePng?: string | null
}

const AVAILABLE_LANGS = ["da", "de", "el", "en", "es", "fi", "fr", "it", "nl", "pt", "sv"];

interface Coords {
	// Header form lines — y = pymupdf y_bottom, x = x0 of first fill character
	l1_y: number; name_x: number; mat_x: number
	l2_y: number; inst_x: number; bur_x: number; tel_x: number
	l3_y: number; priv_x: number
	l4_y: number; cess_x: number
	// Period dates
	period_y: number; period_start_x: number; period_end_x: number
	// Checkboxes: [x0, y_top, x1, y_bottom] in pymupdf coords
	cb_period?: [number, number, number, number]
	cb_note?: [number, number, number, number]
	cb_info?: [number, number, number, number]
	cb_affilie: [number, number, number, number]
	cb_autre?: [number, number, number, number]
	// Signature date
	sig_date_x: number; sig_date_y: number
	// Signature name (italic, after "Signature de…" label)
	sig_name_x: number; sig_name_y: number
	// Section conjoint/partenaire reconnu (bas du formulaire)
	conj_name_x: number; conj_name_y: number   // "Nom, Prénom (conjoint/...)"
	conj_mat_x: number;  conj_mat_y: number    // "N° Personnel/Pension"
	conj_date_x: number; conj_date_y: number   // "Date" (signature conjoint)
	conj_sig_x: number;  conj_sig_y: number    // "Signature du conjoint/..."
}

/**
 * Per-language PDF coordinates.
 * Extracted with PyMuPDF get_text("rawdict") at CHARACTER level from demande-rembspecial-{lang}.pdf.
 * All x = x0 of the FIRST fill character (…/.) in that field.
 * All y = y_bottom of the text bounding box (PyMuPDF coord, y=0 at TOP).
 * Conversion to pdf-lib: pdflib_y = pageHeight - pymupdf_y_bottom + 1.5
 */
const COORDS: Record<string, Coords> = {
	da: {
		l1_y: 136.6,  name_x: 198.1, mat_x: 439.0,
		l2_y: 149.3,  inst_x: 154.3, bur_x: 385.4,  tel_x: 471.3,
		l3_y: 162.0,  priv_x: 164.6,
		l4_y: 174.7,  cess_x: 296.2,
		period_y: 217.8, period_start_x: 139.4, period_end_x: 240.5,
		cb_period:  [41.28, 208.91, 48.44, 217.79],
		cb_affilie: [305.93, 589.34, 313.95, 599.27],
		sig_date_x: 78.5,  sig_date_y: 599.3,
		sig_name_x: 161.9, sig_name_y: 627.2,
		conj_name_x: 285.58, conj_name_y: 709.96,
		conj_mat_x:  174.26, conj_mat_y:  720.88,
		conj_date_x:  78.46, conj_date_y: 731.80,
		conj_sig_x:  285.65, conj_sig_y:  753.64,
	},
	de: {
		l1_y: 148.7,  name_x: 254.2, mat_x: 468.2,
		l2_y: 161.4,  inst_x: 222.5, bur_x: 436.4,  tel_x: 512.8,
		l3_y: 174.1,  priv_x: 219.0,
		l4_y: 186.8,  cess_x: 303.6,
		period_y: 229.9, period_start_x: 159.1, period_end_x: 266.4,
		cb_period:  [41.28, 221.03, 48.44, 229.91],
		cb_note:    [41.28, 408.00, 49.30, 417.93],
		cb_info:    [41.28, 439.56, 49.30, 449.49],
		cb_affilie: [269.93, 502.77, 277.52, 512.18],
		sig_date_x: 88.7,  sig_date_y: 512.2,
		sig_name_x: 208.0, sig_name_y: 532.8,
		conj_name_x: 275.33, conj_name_y: 611.31,
		conj_mat_x:  222.51, conj_mat_y:  621.63,
		conj_date_x:  88.67, conj_date_y: 631.95,
		conj_sig_x:  271.97, conj_sig_y:  642.85,
	},
	el: {
		l1_y: 141.4,  name_x: 235.8, mat_x: 486.3,
		l2_y: 154.1,  inst_x: 191.5, bur_x: 407.0,  tel_x: 492.0,
		l3_y: 166.8,  priv_x: 227.9,
		l4_y: 179.5,  cess_x: 306.5,
		period_y: 222.6, period_start_x: 129.0, period_end_x: 219.5,
		cb_period:  [41.28, 213.71, 48.44, 222.59],
		cb_affilie: [305.93, 620.06, 313.95, 629.99],
		sig_date_x: 114.1, sig_date_y: 630.0,
		sig_name_x: 187.0, sig_name_y: 646.9,
		conj_name_x: 313.11, conj_name_y: 729.64,
		conj_mat_x:  225.09, conj_mat_y:  740.56,
		conj_date_x: 114.11, conj_date_y: 751.60,
		conj_sig_x:  302.68, conj_sig_y:  773.44,
	},
	en: {
		l1_y: 139.2,  name_x: 173.9, mat_x: 443.4,
		l2_y: 151.9,  inst_x: 194.2, bur_x: 375.5,  tel_x: 436.9,
		l3_y: 164.6,  priv_x: 284.2,
		l4_y: 177.4,  cess_x: 291.0,
		period_y: 230.2, period_start_x: 106.5, period_end_x: 190.5,
		cb_period:  [41.40, 221.27, 48.56, 230.15],
		cb_note:    [44.64, 395.78, 51.80, 404.66],
		cb_info:    [45.12, 426.50, 52.28, 435.38],
		cb_affilie: [270.05, 475.12, 277.21, 484.00],
		sig_date_x: 79.5,  sig_date_y: 484.0,
		sig_name_x: 155.0, sig_name_y: 506.4,
		conj_name_x: 258.44, conj_name_y: 580.61,
		conj_mat_x:  149.81, conj_mat_y:  590.33,
		conj_date_x:  79.42, conj_date_y: 600.05,
		conj_sig_x:  220.07, conj_sig_y:  619.49,
	},
	es: {
		l1_y: 136.4,  name_x: 177.0, mat_x: 452.3,
		l2_y: 149.2,  inst_x: 162.7, bur_x: 404.2,  tel_x: 478.0,
		l3_y: 161.9,  priv_x: 201.8,
		l4_y: 174.7,  cess_x: 274.3,
		period_y: 224.4, period_start_x: 104.4, period_end_x: 184.5,
		cb_period:  [41.28, 215.51, 48.44, 224.39],
		cb_affilie: [269.93, 621.16, 277.09, 630.04],
		sig_date_x: 77.4,  sig_date_y: 630.0,
		sig_name_x: 155.0, sig_name_y: 649.5,
		conj_name_x: 275.25, conj_name_y: 723.68,
		conj_mat_x:  173.41, conj_mat_y:  733.40,
		conj_date_x:  77.39, conj_date_y: 743.12,
		conj_sig_x:  216.34, conj_sig_y:  762.56,
	},
	fi: {
		l1_y: 146.5,  name_x: 146.2, mat_x: 415.6,
		l2_y: 159.2,  inst_x: 140.8, bur_x: 357.3,  tel_x: 459.5,
		l3_y: 172.0,  priv_x: 131.6,
		l4_y: 184.7,  cess_x: 225.5,
		period_y: 227.8, period_start_x: 89.5, period_end_x: 167.8,
		cb_period:  [41.40, 218.87, 48.56, 227.75],
		cb_affilie: [270.05, 616.24, 277.21, 625.12],
		sig_date_x: 90.0,  sig_date_y: 625.1,
		sig_name_x: 158.0, sig_name_y: 644.6,
		conj_name_x: 307.52, conj_name_y: 718.76,
		conj_mat_x:  141.00, conj_mat_y:  728.48,
		conj_date_x:  87.11, conj_date_y: 738.32,
		conj_sig_x:  297.60, conj_sig_y:  757.76,
	},
	fr: {
		l1_y: 144.1,  name_x: 164.3, mat_x: 424.1,
		l2_y: 156.8,  inst_x: 168.9, bur_x: 394.7,  tel_x: 468.2,
		l3_y: 169.6,  priv_x: 202.3,
		l4_y: 182.3,  cess_x: 261.8,
		period_y: 225.4, period_start_x: 102.5, period_end_x: 188.3,
		cb_period:  [41.40, 216.47, 48.56, 225.35],
		cb_note:    [48.36, 382.58, 55.52, 391.46],
		cb_info:    [47.88, 429.50, 55.04, 438.38],
		cb_affilie: [306.05, 458.66, 313.21, 467.54],
		sig_date_x: 78.6,  sig_date_y: 467.6,
		sig_name_x: 162.0, sig_name_y: 487.0,
		conj_name_x: 235.07, conj_name_y: 580.61,
		conj_mat_x:  144.46, conj_mat_y:  590.33,
		conj_date_x:  75.71, conj_date_y: 600.05,
		conj_sig_x:  227.35, conj_sig_y:  619.49,
	},
	it: {
		l1_y: 139.0,  name_x: 192.3, mat_x: 465.7,
		l2_y: 151.7,  inst_x: 176.8, bur_x: 388.9,  tel_x: 464.5,
		l3_y: 174.1,  priv_x: 41.3,
		l4_y: 186.8,  cess_x: 326.5,
		period_y: 232.7, period_start_x: 113.9, period_end_x: 214.2,
		cb_note:    [39.72, 384.86, 46.88, 393.74],
		cb_info:    [39.72, 423.74, 46.88, 432.62],
		cb_affilie: [269.93, 462.74, 277.09, 471.62],
		sig_date_x: 75.7,  sig_date_y: 471.6,
		sig_name_x: 179.0, sig_name_y: 491.1,
		conj_name_x: 256.37, conj_name_y: 565.25,
		conj_mat_x:  180.69, conj_mat_y:  574.97,
		conj_date_x:  75.70, conj_date_y: 584.69,
		conj_sig_x:  216.01, conj_sig_y:  604.13,
	},
	nl: {
		l1_y: 146.2,  name_x: 183.1, mat_x: 505.1,
		l2_y: 158.9,  inst_x: 183.3, bur_x: 410.0,  tel_x: 486.5,
		l3_y: 171.7,  priv_x: 168.4,
		l4_y: 184.4,  cess_x: 240.4,
		period_y: 226.2, period_start_x: 101.3, period_end_x: 173.4,
		cb_period:  [41.28, 217.31, 48.44, 226.19],
		cb_affilie: [269.93, 632.92, 277.09, 641.80],
		sig_date_x: 87.4,  sig_date_y: 641.8,
		sig_name_x: 195.0, sig_name_y: 661.2,
		conj_name_x: 262.97, conj_name_y: 735.56,
		conj_mat_x:  123.02, conj_mat_y:  745.28,
		conj_date_x:  87.38, conj_date_y: 755.00,
		conj_sig_x:  262.24, conj_sig_y:  774.44,
	},
	pt: {
		l1_y: 139.2,  name_x: 186.2, mat_x: 433.6,
		l2_y: 151.9,  inst_x: 169.5, bur_x: 404.3,  tel_x: 480.9,
		l3_y: 164.6,  priv_x: 212.3,
		l4_y: 177.4,  cess_x: 305.5,
		period_y: 229.2, period_start_x: 102.4, period_end_x: 183.1,
		cb_period:  [41.40, 220.31, 48.56, 229.19],
		cb_affilie: [270.05, 626.20, 277.21, 635.08],
		sig_date_x: 78.6,  sig_date_y: 635.1,
		sig_name_x: 167.0, sig_name_y: 654.5,
		conj_name_x: 280.61, conj_name_y: 728.72,
		conj_mat_x:  135.62, conj_mat_y:  738.44,
		conj_date_x:  75.86, conj_date_y: 748.16,
		conj_sig_x:  237.40, conj_sig_y:  757.88,
	},
	sv: {
		l1_y: 146.2,  name_x: 224.4, mat_x: 483.3,
		l2_y: 158.9,  inst_x: 168.3, bur_x: 331.6,  tel_x: 467.1,
		l3_y: 171.6,  priv_x: 163.0,
		l4_y: 184.3,  cess_x: 250.0,
		period_y: 227.4, period_start_x: 139.0, period_end_x: 241.1,
		cb_period:  [41.28, 218.51, 48.44, 227.39],
		cb_affilie: [269.93, 617.20, 277.09, 626.08],
		sig_date_x: 83.7,  sig_date_y: 626.1,
		sig_name_x: 174.0, sig_name_y: 645.5,
		conj_name_x: 264.89, conj_name_y: 719.72,
		conj_mat_x:  211.66, conj_mat_y:  729.44,
		conj_date_x:  83.74, conj_date_y: 739.16,
		conj_sig_x:  219.53, conj_sig_y:  758.60,
	},
};

const fmtDate = (d: string) => {
	if (!d) return "";
	const date = new Date(d);
	return isNaN(date.getTime()) ? d : date.toLocaleDateString("fr-BE");
};

/**
 * Fills the official RCAM PDF form with profile and period data.
 *
 * Coordinates extracted with PyMuPDF rawdict (character-level) from each PDF.
 * pdf-lib: y=0 at BOTTOM. PyMuPDF: y=0 at TOP.
 * Conversion: pdflib_y = pageHeight - pymupdf_y_bottom + 1.5
 *
 * The +1.5 offset aligns pdf-lib baseline with the fill-char baseline
 * (descender space ≈ font_size × 0.2 ≈ 1.5 for the 7-8pt form font).
 */
export async function fillFormRemb(data: PdfFillData, lang = "en"): Promise<Uint8Array> {
	const pdfLang = AVAILABLE_LANGS.includes(lang) ? lang : "en";
	const response = await fetch(`/demande-rembspecial-${pdfLang}.pdf`);
	const pdfBytes = await response.arrayBuffer();

	const pdfDoc = await PDFDocument.load(pdfBytes);
	const page = pdfDoc.getPages()[0]!;
	const { height } = page.getSize();

	const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
	const italic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
	const SIZE = 9;
	const BLACK = rgb(0, 0, 0);

	const c = COORDS[pdfLang]!;

	// Convert PyMuPDF y_bottom → pdf-lib baseline y
	const toY = (pymupdfBottom: number) => height - pymupdfBottom + 1.5;

	/** Truncate text to fit maxWidth (measured in the actual font). */
	const truncate = (text: string, maxWidth: number, f: typeof font, size: number): string => {
		if (f.widthOfTextAtSize(text, size) <= maxWidth) return text;
		let s = text;
		while (s.length > 1 && f.widthOfTextAtSize(`${s}…`, size) > maxWidth) s = s.slice(0, -1);
		return `${s}…`;
	};

	const draw = (text: string, x: number, pymupdfBottom: number, maxWidth?: number, useItalic = false, size = SIZE) => {
		if (!text.trim()) return;
		const f = useItalic ? italic : font;
		const str = maxWidth ? truncate(text, maxWidth, f, size) : text;
		page.drawText(str, { x, y: toY(pymupdfBottom), size, font: f, color: BLACK });
	};

	// Draw an X mark over a checkbox (PyMuPDF coords: x0, y_top, x1, y_bottom)
	const drawX = (x0: number, y0_top: number, x1: number, y0_bottom: number) => {
		const pad = 1.0;
		const left  = x0 + pad;
		const right = x1 - pad;
		const top    = height - y0_top    - pad;
		const bottom = height - y0_bottom + pad;
		page.drawLine({ start: { x: left,  y: top    }, end: { x: right, y: bottom }, thickness: 1, color: BLACK });
		page.drawLine({ start: { x: left,  y: bottom }, end: { x: right, y: top    }, thickness: 1, color: BLACK });
	};

	// Compute fill-area widths from neighbouring anchor points
	const nameW = Math.max(10, c.mat_x - c.name_x - 8);
	const matW  = Math.max(10, 548 - c.mat_x);
	const instW = Math.max(10, c.bur_x - c.inst_x - 8);
	const burW  = Math.max(10, c.tel_x - c.bur_x - 8);
	const telW  = Math.max(10, 548 - c.tel_x);
	const privW = Math.max(10, 548 - c.priv_x);
	const cessW = 115;

	const nomComplet = `${data.prenomAffilie} ${data.nomAffilie}`.trim();

	// ── L1 : Nom/prénom  +  N° pers./pension ─────────────────────────────────
	draw(nomComplet,           c.name_x, c.l1_y, nameW);
	draw(data.matriculeAffilie, c.mat_x, c.l1_y, matW);

	// ── L2 : Institution  +  Adresse bureau  +  Tél ──────────────────────────
	draw(data.institutionAffilie, c.inst_x, c.l2_y, instW, false, 8);
	draw(data.adresseBureau,      c.bur_x,  c.l2_y, burW,  false, 8);
	draw(data.telephoneBureau,    c.tel_x,  c.l2_y, telW,  false, 8);

	// ── L3 : Adresse privée ───────────────────────────────────────────────────
	draw(data.adressePrivee, c.priv_x, c.l3_y, privW);

	// ── L4 : Date de cessation ────────────────────────────────────────────────
	draw(fmtDate(data.dateCessation), c.cess_x, c.l4_y, cessW);

	// ── ☑ Période connue ──────────────────────────────────────────────────────
	if (c.cb_period) drawX(...c.cb_period);

	// ── Dates de la période ───────────────────────────────────────────────────
	draw(fmtDate(data.startDate), c.period_start_x, c.period_y, 72);
	draw(fmtDate(data.endDate),   c.period_end_x,   c.period_y, 88);

	// ── ☑ "J'ai bien pris note…" (certaines langues seulement) ───────────────
	if (c.cb_note) drawX(...c.cb_note);

	// ── ☑ "J'ai pris connaissance…" ──────────────────────────────────────────
	if (c.cb_info) drawX(...c.cb_info);

	// ── ☑ Affilié(e) ─────────────────────────────────────────────────────────
	drawX(...c.cb_affilie);

	// ── Date de signature ─────────────────────────────────────────────────────
	draw(new Date().toLocaleDateString("fr-BE"), c.sig_date_x, c.sig_date_y, 80);

	// ── Nom italique (toujours affiché) ──────────────────────────────────────
	const sigNameW = c.cb_affilie[0] - c.sig_name_x - 5;
	draw(nomComplet || "…", c.sig_name_x, c.sig_name_y, Math.max(40, sigNameW), true);

	// ── Signature manuscrite (par-dessus le nom, si disponible) ──────────────
	if (data.signaturePng) {
		try {
			const base64 = data.signaturePng.replace(/^data:image\/png;base64,/, "");
			const pngBytes = Uint8Array.from(atob(base64), (ch) => ch.charCodeAt(0));
			const pngImage = await pdfDoc.embedPng(pngBytes);
			const maxW = Math.max(40, sigNameW);
			const maxH = 20;
			const ratio = pngImage.width / pngImage.height;
			let imgW = maxW;
			let imgH = imgW / ratio;
			if (imgH > maxH) { imgH = maxH; imgW = imgH * ratio; }
			// Positionnée juste au-dessus du nom (décalage de imgH + 2pt)
			page.drawImage(pngImage, {
				x: c.sig_name_x,
				y: toY(c.sig_name_y) + 2,
				width: imgW,
				height: imgH,
			});
		} catch { /* image invalide — le nom italique suffit */ }
	}

	// ── Section conjoint/partenaire reconnu (bas du formulaire) ──────────────
	const hasConjoint = !!(data.prenomConjoint?.trim() || data.nomConjoint?.trim());
	if (hasConjoint) {
		const nomConjointComplet = `${data.prenomConjoint ?? ""} ${data.nomConjoint ?? ""}`.trim();

		// Nom, Prénom (conjoint/partenaire reconnu)
		const conjNameW = Math.max(40, 548 - c.conj_name_x);
		draw(nomConjointComplet, c.conj_name_x, c.conj_name_y, conjNameW);

		// N° Personnel/Pension
		if (data.matriculeConjoint?.trim()) {
			const conjMatW = Math.max(40, 548 - c.conj_mat_x);
			draw(data.matriculeConjoint.trim(), c.conj_mat_x, c.conj_mat_y, conjMatW);
		}

		// Date (signature conjoint)
		draw(new Date().toLocaleDateString("fr-BE"), c.conj_date_x, c.conj_date_y, 80);

		// Signature du conjoint — nom en italique + image si disponible
		const conjSigW = Math.max(40, 548 - c.conj_sig_x);
		draw(nomConjointComplet, c.conj_sig_x, c.conj_sig_y, conjSigW, true);

		if (data.conjointSignaturePng) {
			try {
				const base64 = data.conjointSignaturePng.replace(/^data:image\/png;base64,/, "");
				const pngBytes = Uint8Array.from(atob(base64), (ch) => ch.charCodeAt(0));
				const pngImage = await pdfDoc.embedPng(pngBytes);
				const maxW = conjSigW;
				const maxH = 20;
				const ratio = pngImage.width / pngImage.height;
				let imgW = maxW;
				let imgH = imgW / ratio;
				if (imgH > maxH) { imgH = maxH; imgW = imgH * ratio; }
				page.drawImage(pngImage, {
					x: c.conj_sig_x,
					y: toY(c.conj_sig_y) + 2,
					width: imgW,
					height: imgH,
				});
			} catch { /* image invalide — le nom italique suffit */ }
		}
	}

	return pdfDoc.save();
}
