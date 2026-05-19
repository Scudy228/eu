<template>
	<Teleport to="body">
		<Transition name="modal-centre">
			<div
				v-if="open"
				class="fixed inset-0 z-50 flex items-center justify-center p-4"
				role="dialog"
				aria-modal="true"
			>
				<div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="requestClose" />

				<div class="modal-card relative flex flex-col bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-2xl max-h-[92vh]">
					<!-- En-tête gradient -->
					<div class="relative px-7 py-6 flex items-center justify-between bg-gradient-to-br from-[#003399] to-[#001A88] shrink-0">
						<div class="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
						<div class="absolute right-8 bottom-0 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />

						<div class="flex items-center gap-4 relative">
							<div class="rounded-2xl bg-white/20 p-3 shrink-0">
								<UIcon name="lucide:user-circle" class="size-7 text-white" />
							</div>
							<div>
								<h2 class="text-xl font-black text-white">Mon profil</h2>
								<p class="text-sm text-white/75 mt-0.5">Formulaire DRS {{ currentLocale.toUpperCase() }} 02-2021</p>
							</div>
						</div>
						<button
							class="relative rounded-xl p-2.5 bg-white/15 hover:bg-white/25 transition-colors text-white shrink-0"
							@click="requestClose"
						>
							<UIcon name="lucide:x" class="size-6" />
						</button>
					</div>

					<!-- Corps scrollable -->
					<div class="flex-1 overflow-y-auto overscroll-contain px-7 py-6 space-y-8 min-h-0">

						<!-- ── Salaire net ── -->
						<section class="space-y-4">
							<h3 class="flex items-center gap-3 text-base font-black uppercase tracking-wide text-[#003399]">
								<div class="w-1.5 h-6 rounded-full bg-[#003399]" />
								Salaire net mensuel
							</h3>
							<div class="flex items-center gap-4 flex-wrap">
								<div class="relative">
									<input
										v-model.number="state.salaireNet"
										:type="showSalaire ? 'number' : 'password'"
										step="0.01"
										min="0"
										placeholder="0.00"
										class="h-14 w-52 px-4 pr-12 text-lg font-bold rounded-2xl border-2 border-slate-200 focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/15 outline-none transition-all bg-white text-slate-900"
									>
									<button
										type="button"
										class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
										@click="showSalaire = !showSalaire"
									>
										<UIcon :name="showSalaire ? 'lucide:eye-off' : 'lucide:eye'" class="size-5" />
									</button>
								</div>
								<span class="text-base font-semibold text-slate-500">€ / mois</span>
								<div v-if="state.salaireNet > 0" class="flex items-center gap-2 text-base font-bold text-[#003399]">
									<UIcon name="lucide:shield-check" class="size-5" />
									Seuil CE : {{ fmtEuro(state.salaireNet / 2) }} €
								</div>
							</div>
						</section>

						<!-- ── Identité ── -->
						<section class="space-y-4">
							<h3 class="flex items-center gap-3 text-base font-black uppercase tracking-wide text-[#003399]">
								<div class="w-1.5 h-6 rounded-full bg-[#003399]" />
								Identité de l'affilié(e) <span class="text-red-500 normal-case font-normal">*</span>
							</h3>
							<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div>
									<label class="block text-base font-bold text-slate-700 mb-2">Prénom <span class="text-red-500">*</span></label>
									<input
										v-model="state.prenomAffilie"
										placeholder="Jean"
										class="w-full h-14 px-4 text-base rounded-2xl border-2 border-slate-200 focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/15 outline-none transition-all bg-white text-slate-900"
									>
								</div>
								<div>
									<label class="block text-base font-bold text-slate-700 mb-2">Nom <span class="text-red-500">*</span></label>
									<input
										v-model="state.nomAffilie"
										placeholder="DUPONT"
										class="w-full h-14 px-4 text-base rounded-2xl border-2 border-slate-200 focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/15 outline-none transition-all bg-white text-slate-900"
									>
								</div>
							</div>
							<div>
								<label class="block text-base font-bold text-slate-700 mb-2">N° pers. / pension <span class="text-red-500">*</span></label>
								<input
									v-model="state.matriculeAffilie"
									placeholder="ex : 123456"
									class="w-full sm:w-64 h-14 px-4 text-base rounded-2xl border-2 border-slate-200 focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/15 outline-none transition-all bg-white text-slate-900"
								>
							</div>
							<div>
								<label class="block text-base font-bold text-slate-700 mb-2">Signature</label>
								<SignaturePad v-model="state.signaturePng" />
							</div>
						</section>

						<!-- ── Conjoint ── -->
						<section class="space-y-4">
							<h3 class="flex items-center gap-3 text-base font-black uppercase tracking-wide text-sky-600">
								<div class="w-1.5 h-6 rounded-full bg-sky-400" />
								Conjoint(e) <span class="text-sm normal-case font-normal text-slate-400">(facultatif)</span>
							</h3>
							<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div>
									<label class="block text-base font-bold text-slate-700 mb-2">Prénom du/de la conjoint(e)</label>
									<input
										v-model="state.prenomConjoint"
										placeholder="Marie"
										class="w-full h-14 px-4 text-base rounded-2xl border-2 border-slate-200 focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/15 outline-none transition-all bg-white text-slate-900"
									>
								</div>
								<div>
									<label class="block text-base font-bold text-slate-700 mb-2">Nom du/de la conjoint(e)</label>
									<input
										v-model="state.nomConjoint"
										placeholder="DUPONT"
										class="w-full h-14 px-4 text-base rounded-2xl border-2 border-slate-200 focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/15 outline-none transition-all bg-white text-slate-900"
									>
								</div>
							</div>
							<div>
								<label class="block text-base font-bold text-slate-700 mb-2">N° matricule du/de la conjoint(e)</label>
								<input
									v-model="state.matriculeConjoint"
									placeholder="ex : 123456"
									class="w-full sm:w-64 h-14 px-4 text-base rounded-2xl border-2 border-slate-200 focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/15 outline-none transition-all bg-white text-slate-900"
								>
							</div>
							<div>
								<label class="block text-base font-bold text-slate-700 mb-2">Signature du/de la conjoint(e)</label>
								<SignaturePad v-model="state.conjointSignaturePng" />
							</div>
						</section>

						<!-- ── Affectation ── -->
						<section class="space-y-4">
							<h3 class="flex items-center gap-3 text-base font-black uppercase tracking-wide text-[#003399]">
								<div class="w-1.5 h-6 rounded-full bg-indigo-500" />
								Lieu d'affectation
							</h3>
							<div>
								<label class="block text-base font-bold text-slate-700 mb-2">Institution et lieu d'affectation</label>
								<input
									v-model="state.institutionAffilie"
									placeholder="ex : Commission Européenne — Bruxelles"
									class="w-full h-14 px-4 text-base rounded-2xl border-2 border-slate-200 focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/15 outline-none transition-all bg-white text-slate-900"
								>
							</div>
							<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div>
									<label class="block text-base font-bold text-slate-700 mb-2">Adresse de bureau</label>
									<input
										v-model="state.adresseBureau"
										class="w-full h-14 px-4 text-base rounded-2xl border-2 border-slate-200 focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/15 outline-none transition-all bg-white text-slate-900"
									>
								</div>
								<div>
									<label class="block text-base font-bold text-slate-700 mb-2">Téléphone de bureau</label>
									<input
										v-model="state.telephoneBureau"
										class="w-full h-14 px-4 text-base rounded-2xl border-2 border-slate-200 focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/15 outline-none transition-all bg-white text-slate-900"
									>
								</div>
							</div>
						</section>

						<!-- ── Pensionnés ── -->
						<section class="space-y-4">
							<h3 class="flex items-center gap-3 text-base font-black uppercase tracking-wide text-slate-400">
								<div class="w-1.5 h-6 rounded-full bg-slate-300" />
								Pensionnés / agents temporaires <span class="text-sm normal-case font-normal">(si applicable)</span>
							</h3>
							<div>
								<label class="block text-base font-bold text-slate-700 mb-2">Adresse privée (pensionnés)</label>
								<input
									v-model="state.adressePrivee"
									placeholder="Rue ..., Code postal, Ville"
									class="w-full h-14 px-4 text-base rounded-2xl border-2 border-slate-200 focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/15 outline-none transition-all bg-white text-slate-900"
								>
							</div>
							<div>
								<label class="block text-base font-bold text-slate-700 mb-2">Date de cessation / fin de contrat</label>
								<input
									v-model="state.dateCessation"
									type="date"
									class="h-14 px-4 text-base rounded-2xl border-2 border-slate-200 focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/15 outline-none transition-all bg-white text-slate-900"
								>
							</div>
						</section>

						<!-- ── Personne à charge ── -->
						<section class="space-y-4">
							<h3 class="flex items-center gap-3 text-base font-black uppercase tracking-wide text-orange-600">
								<div class="w-1.5 h-6 rounded-full bg-orange-400" />
								Personne assurée de votre chef <span class="text-red-500">*</span>
							</h3>
							<p class="text-base text-slate-600">
								Avez-vous un(e) conjoint(e), enfant à charge ou ascendant assuré de votre chef ?
								Ce choix détermine le taux de remboursement applicable.
							</p>
							<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<!-- Oui -->
								<button
									type="button"
									class="rounded-2xl border-2 p-5 text-left transition-all"
									:class="state.personneACharge === 1
										? 'border-emerald-500 bg-emerald-50'
										: 'border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50'"
									@click="demanderConfirmation(1)"
								>
									<div class="flex items-center gap-3 mb-2">
										<div
											class="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
											:class="state.personneACharge === 1 ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'"
										>
											<div v-if="state.personneACharge === 1" class="w-2.5 h-2.5 rounded-full bg-white" />
										</div>
										<span class="text-xl font-black text-slate-800">Oui</span>
									</div>
									<p class="text-sm text-slate-500 ml-8">
										Remboursement à <strong class="text-emerald-600 text-base">100 %</strong> du dépassement
									</p>
								</button>
								<!-- Non -->
								<button
									type="button"
									class="rounded-2xl border-2 p-5 text-left transition-all"
									:class="state.personneACharge === 0
										? 'border-[#003399] bg-blue-50'
										: 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'"
									@click="demanderConfirmation(0)"
								>
									<div class="flex items-center gap-3 mb-2">
										<div
											class="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
											:class="state.personneACharge === 0 ? 'border-[#003399] bg-[#003399]' : 'border-slate-300'"
										>
											<div v-if="state.personneACharge === 0" class="w-2.5 h-2.5 rounded-full bg-white" />
										</div>
										<span class="text-xl font-black text-slate-800">Non</span>
									</div>
									<p class="text-sm text-slate-500 ml-8">
										Remboursement à <strong class="text-[#003399] text-base">90 %</strong> du dépassement
									</p>
								</button>
							</div>
							<p v-if="state.personneACharge === null" class="text-sm font-bold text-orange-600 flex items-center gap-2">
								<UIcon name="lucide:alert-triangle" class="size-4" />
								Ce choix est obligatoire pour pouvoir encoder des factures.
							</p>
						</section>

						<!-- ── Réinitialiser ── -->
						<section class="space-y-3">
							<h3 class="flex items-center gap-3 text-base font-black uppercase tracking-wide text-red-500">
								<div class="w-1.5 h-6 rounded-full bg-red-500" />
								Réinitialiser l'application
							</h3>
							<div v-if="!resetConfirmOpen" class="flex items-center justify-between gap-3 rounded-2xl border-2 border-red-200 bg-red-50 p-5">
								<p class="text-sm text-red-700">Supprime toutes les factures, personnes et réinitialise le profil.</p>
								<button
									class="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-red-400 text-red-600 font-bold text-sm hover:bg-red-100 transition-colors shrink-0"
									@click="resetConfirmOpen = true"
								>
									<UIcon name="lucide:refresh-cw" class="size-4" />
									Réinitialiser
								</button>
							</div>
							<div v-else class="rounded-2xl border-2 border-red-400 bg-red-50 p-5 space-y-4">
								<div class="flex items-center gap-2">
									<UIcon name="lucide:triangle-alert" class="size-6 text-red-600 shrink-0" />
									<span class="font-black text-red-700 text-base">Action irréversible — Êtes-vous certain ?</span>
								</div>
								<p class="text-sm text-red-600">Toutes les factures, personnes et données du profil seront effacées définitivement.</p>
								<div class="flex gap-3">
									<button class="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold text-base hover:bg-red-700 transition-colors" :disabled="resetting" @click="doReset">
										{{ resetting ? 'En cours…' : 'Oui, tout effacer' }}
									</button>
									<button class="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-bold text-base hover:bg-slate-50 transition-colors" @click="resetConfirmOpen = false">
										Annuler
									</button>
								</div>
							</div>
						</section>

						<!-- ── Aperçu ── -->
						<section v-if="profilComplete" class="rounded-2xl border-2 border-[#003399]/20 overflow-hidden">
							<div class="bg-blue-50 px-5 py-3 border-b border-[#003399]/15 flex items-center gap-2">
								<UIcon name="lucide:eye" class="size-4 text-[#003399]" />
								<span class="text-xs font-black uppercase tracking-wider text-[#003399]">Aperçu formulaire DRS</span>
							</div>
							<div class="px-5 py-4 bg-white space-y-3 text-sm">
								<div class="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
									<span class="font-black text-slate-800 text-base">{{ state.prenomAffilie }} {{ state.nomAffilie }}</span>
									<span class="text-slate-400">·</span>
									<span class="text-slate-500">N° {{ state.matriculeAffilie }}</span>
								</div>
								<div v-if="state.institutionAffilie" class="text-slate-600">{{ state.institutionAffilie }}</div>
								<div v-if="state.adresseBureau || state.telephoneBureau" class="text-slate-600">
									<span v-if="state.adresseBureau">{{ state.adresseBureau }}</span>
									<span v-if="state.adresseBureau && state.telephoneBureau" class="text-slate-300 mx-1">·</span>
									<span v-if="state.telephoneBureau">{{ state.telephoneBureau }}</span>
								</div>
								<div v-if="state.adressePrivee" class="text-slate-600">
									<span class="text-xs font-bold text-slate-400 uppercase tracking-wide mr-1">Adresse privée :</span>
									{{ state.adressePrivee }}
								</div>
								<div v-if="state.personneACharge !== null" class="flex items-center gap-2">
									<span class="font-bold" :class="state.personneACharge === 1 ? 'text-emerald-600' : 'text-[#003399]'">
										{{ state.personneACharge === 1 ? '100 %' : '90 %' }}
									</span>
									<span class="text-slate-400 text-xs">{{ state.personneACharge === 1 ? '— personne assurée de votre chef' : '— sans personne assurée' }}</span>
								</div>
								<div v-if="state.nomConjoint || state.prenomConjoint" class="pt-2 border-t border-slate-100 space-y-0.5">
									<div class="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Conjoint(e)</div>
									<div class="font-semibold text-slate-700">
										{{ state.prenomConjoint }} {{ state.nomConjoint }}
										<span v-if="state.matriculeConjoint" class="font-normal text-slate-400 ml-1">· N° {{ state.matriculeConjoint }}</span>
									</div>
								</div>
								<div v-if="state.signaturePng" class="pt-2 border-t border-slate-100">
									<div class="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Signature</div>
									<img :src="state.signaturePng" alt="Signature" class="h-10 max-w-48 object-contain rounded" />
								</div>
								<div v-if="state.conjointSignaturePng" class="pt-2 border-t border-slate-100">
									<div class="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Signature conjoint(e)</div>
									<img :src="state.conjointSignaturePng" alt="Signature conjoint" class="h-10 max-w-48 object-contain rounded" />
								</div>
							</div>
						</section>

					</div>

					<!-- ── Popup confirmation personne à charge ── -->
					<Transition name="modal-centre">
						<div
							v-if="confirmOpen"
							class="absolute inset-0 z-10 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm rounded-3xl"
						>
							<div
								class="modal-card bg-white rounded-2xl border-2 shadow-2xl p-6 max-w-sm w-full space-y-4"
								:class="pendingChoix === 1 ? 'border-emerald-400' : 'border-[#003399]'"
							>
								<h3 class="font-black text-slate-900 text-lg">
									{{ pendingChoix === 1 ? '✓ Oui — Personne assurée de votre chef' : '✗ Non — Pas de personne assurée' }}
								</h3>
								<p class="text-base text-slate-600 leading-relaxed">
									<template v-if="pendingChoix === 1">
										Votre dépassement de seuil sera remboursé à <strong class="text-emerald-600">100 %</strong>.
										Cela s'applique lorsque vous avez un(e) conjoint(e), un enfant à charge ou un ascendant assuré de votre chef.
									</template>
									<template v-else>
										Votre dépassement de seuil sera remboursé à <strong class="text-[#003399]">90 %</strong>.
										Ce taux s'applique lorsque vous n'avez pas de personne assurée de votre chef.
									</template>
								</p>
								<div class="flex gap-3">
									<button
										class="flex-1 py-3 rounded-xl font-bold text-base text-white transition-colors"
										:class="pendingChoix === 1 ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-[#003399] hover:bg-[#002277]'"
										@click="confirmerChoix"
									>
										Confirmer ce choix
									</button>
									<button
										class="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-bold text-base hover:bg-slate-50 transition-colors"
										@click="confirmOpen = false"
									>
										Annuler
									</button>
								</div>
							</div>
						</div>
					</Transition>

					<!-- Pied fixe -->
					<div class="border-t-2 border-slate-100 px-7 py-5 flex gap-3 shrink-0 bg-slate-50">
						<button
							class="flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl bg-[#003399] text-white font-black text-base hover:bg-[#002277] disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
							:disabled="saving || !profilComplete"
							@click="sauvegarder"
						>
							<UIcon name="lucide:save" class="size-5" />
							{{ saving ? 'Sauvegarde…' : 'Sauvegarder le profil' }}
						</button>
						<button
							class="px-6 py-4 rounded-2xl border-2 border-slate-200 text-slate-700 font-bold text-base hover:bg-slate-100 transition-colors"
							@click="requestClose"
						>
							Annuler
						</button>
					</div>

				</div>
			</div>
		</Transition>
	</Teleport>
</template>

<script lang="ts" setup>
import { useBodyScrollLock } from "~/composables/useBodyScrollLock";
import { useLang } from "~/composables/useLang";
import { useFactures } from "~/composables/useFactures";
import { useParametres } from "~/composables/useParametres";
import { usePersonnes } from "~/composables/usePersonnes";

const props = defineProps<{
	open: boolean
	mode?: "profil" | "pdf"
}>();

const emit = defineEmits<{
	close: []
	saved: []
	genererPdf: []
	reset: []
}>();

const { t, currentLocale } = useLang();
const { getParametres, setProfil, resetParametres } = useParametres();
const { deleteAllFactures } = useFactures();
const { deleteAllPersonnes } = usePersonnes();
const { lock, unlock } = useBodyScrollLock();
const toast = useToast();

const saving = ref(false);
const showSalaire = ref(false);
const confirmOpen = ref(false);
const pendingChoix = ref<0 | 1>(0);
const resetConfirmOpen = ref(false);
const resetting = ref(false);

const state = reactive({
	salaireNet: 0,
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
	signaturePng: null as string | null,
	conjointSignaturePng: null as string | null,
	personneACharge: null as 0 | 1 | null
});

const profilComplete = computed(() =>
	state.prenomAffilie.trim().length > 0
	&& state.nomAffilie.trim().length > 0
	&& state.matriculeAffilie.trim().length > 0
	&& state.personneACharge !== null
);

const fmtEuro = (n: number) => n.toFixed(2);

const demanderConfirmation = (choix: 0 | 1) => {
	pendingChoix.value = choix;
	confirmOpen.value = true;
};

const confirmerChoix = () => {
	state.personneACharge = pendingChoix.value;
	confirmOpen.value = false;
};

const requestClose = () => {
	confirmOpen.value = false;
	emit('close');
};

const loadState = async () => {
	const params = await getParametres();
	if (params) {
		state.salaireNet = params.salaireNet ?? 0;
		state.nomAffilie = params.nomAffilie ?? "";
		state.prenomAffilie = params.prenomAffilie ?? "";
		state.matriculeAffilie = params.matriculeAffilie ?? "";
		state.institutionAffilie = (params as any).institutionAffilie ?? "";
		state.adresseBureau = (params as any).adresseBureau ?? "";
		state.telephoneBureau = (params as any).telephoneBureau ?? "";
		state.adressePrivee = (params as any).adressePrivee ?? "";
		state.dateCessation = (params as any).dateCessation ?? "";
		state.nomConjoint = (params as any).nomConjoint ?? "";
		state.prenomConjoint = (params as any).prenomConjoint ?? "";
		state.matriculeConjoint = (params as any).matriculeConjoint ?? "";
		state.signaturePng = (params as any).signaturePng ?? null;
		state.conjointSignaturePng = (params as any).conjointSignaturePng ?? null;
		state.personneACharge = (params as any).personneACharge ?? null;
	}
};

watch(() => props.open, async (val) => {
	if (val) {
		lock();
		await loadState();
	} else {
		unlock();
	}
});

const sauvegarder = async () => {
	saving.value = true;
	try {
		await setProfil({
			nomAffilie: state.nomAffilie.trim(),
			prenomAffilie: state.prenomAffilie.trim(),
			matriculeAffilie: state.matriculeAffilie.trim(),
			institutionAffilie: state.institutionAffilie.trim(),
			adresseBureau: state.adresseBureau.trim(),
			telephoneBureau: state.telephoneBureau.trim(),
			adressePrivee: state.adressePrivee.trim(),
			dateCessation: state.dateCessation,
			personneACharge: state.personneACharge,
			nomConjoint: state.nomConjoint.trim(),
			prenomConjoint: state.prenomConjoint.trim(),
			matriculeConjoint: state.matriculeConjoint.trim(),
			signaturePng: state.signaturePng || null,
			conjointSignaturePng: state.conjointSignaturePng || null
		});
		await setProfil({ salaireNet: state.salaireNet } as any);
		toast.add({ title: 'Profil sauvegardé', color: 'success' });
		emit('saved');
		emit('close');
	} catch (e) {
		toast.add({ title: 'Erreur', description: String(e), color: 'error' });
	} finally {
		saving.value = false;
	}
};

const doReset = async () => {
	resetting.value = true;
	try {
		await deleteAllFactures();
		await deleteAllPersonnes();
		await resetParametres();
		toast.add({ title: 'Application réinitialisée', color: 'success' });
		emit('reset');
		emit('close');
	} catch (e) {
		toast.add({ title: 'Erreur', description: String(e), color: 'error' });
	} finally {
		resetting.value = false;
		resetConfirmOpen.value = false;
	}
};
</script>
