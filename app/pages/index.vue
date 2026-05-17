<template>
	<div class="py-5 space-y-8">

		<!-- ══════════════════════════════════════════════════════════
		     EN-TÊTE : logo · titre · boutons profil / langue
		══════════════════════════════════════════════════════════════ -->
		<header class="pb-4 border-b-2 border-[#003399]/12">
			<!-- Mobile (< sm) : logo + boutons sur une ligne, titre dessous
			     Desktop (sm+) : grille 3 colonnes [logo | titre | boutons] -->

			<!-- Ligne logo + boutons (toujours visible) -->
			<div class="flex items-center justify-between gap-3 sm:hidden">
				<img
					:src="'/European-Union-Flag-256.png'"
					alt="Commission Européenne"
					class="h-14 object-contain shrink-0"
				>
				<div class="flex items-center gap-2 shrink-0">
					<LangSwitcher />
					<button
						class="flex items-center justify-center size-11 rounded-xl border-2 border-slate-200 hover:bg-slate-50 transition-colors text-slate-500"
						:title="isDark ? 'Mode clair' : 'Mode sombre'"
						@click="toggleDark"
					>
						<UIcon :name="isDark ? 'lucide:sun' : 'lucide:moon'" class="size-5" />
					</button>
					<button
						class="flex items-center justify-center size-11 rounded-xl border-2 hover:bg-slate-50 transition-colors"
						:class="isPremium ? 'border-emerald-200 text-emerald-600' : 'border-amber-200 text-amber-500'"
						:title="isPremium ? 'Licence Premium active' : 'Activer la licence Premium'"
						@click="licenceModalOpen = true"
					>
						<UIcon :name="isPremium ? 'lucide:badge-check' : 'lucide:lock'" class="size-5" />
					</button>
					<button
						class="flex items-center justify-center size-11 rounded-xl border-2 hover:bg-slate-50 transition-colors"
						:class="profilComplet ? 'border-blue-200 text-[#003399]' : 'border-orange-200 text-orange-500'"
						:title="t('header.profile')"
						@click="profilModalOpen = true"
					>
						<UIcon name="lucide:user-circle" class="size-5" />
					</button>
				</div>
			</div>

			<!-- Titre (mobile uniquement, sous la ligne logo+boutons) -->
			<div class="mt-3 text-center sm:hidden">
				<h1 class="text-2xl font-black font-heading tracking-tight text-slate-900 leading-tight">
					RCAM / Article 72§3
				</h1>
			</div>

			<!-- Grille desktop : [logo] [titre] [boutons] -->
			<div class="hidden sm:grid sm:grid-cols-[auto_1fr_auto] sm:items-center sm:gap-4">
				<!-- Logo -->
				<img
					:src="'/European-Union-Flag-256.png'"
					alt="Commission Européenne"
					class="h-20 lg:h-24 object-contain"
				>

				<!-- Titre centré -->
				<div class="text-center px-2">
					<h1 class="text-3xl lg:text-4xl font-black font-heading tracking-tight text-slate-900 leading-tight">
						RCAM / Article 72§3
					</h1>
					<p class="text-base text-slate-500 mt-1">
						{{ t('app.subtitle') }}
					</p>
				</div>

				<!-- Boutons -->
				<div class="flex items-center gap-2 justify-end">
					<LangSwitcher />
					<button
						class="flex items-center justify-center size-11 lg:size-12 rounded-xl border-2 border-slate-200 hover:bg-slate-50 transition-colors text-slate-500"
						:title="isDark ? 'Mode clair' : 'Mode sombre'"
						@click="toggleDark"
					>
						<UIcon :name="isDark ? 'lucide:sun' : 'lucide:moon'" class="size-6" />
					</button>
					<button
						class="flex items-center justify-center size-11 lg:size-12 rounded-xl border-2 hover:bg-slate-50 transition-colors"
						:class="isPremium ? 'border-emerald-200 text-emerald-600' : 'border-amber-200 text-amber-500'"
						:title="isPremium ? 'Licence Premium active' : 'Activer la licence Premium'"
						@click="licenceModalOpen = true"
					>
						<UIcon :name="isPremium ? 'lucide:badge-check' : 'lucide:lock'" class="size-6" />
					</button>
					<button
						class="flex items-center justify-center size-11 lg:size-12 rounded-xl border-2 hover:bg-slate-50 transition-colors"
						:class="profilComplet ? 'border-blue-200 text-[#003399]' : 'border-orange-200 text-orange-500'"
						:title="t('header.profile')"
						@click="profilModalOpen = true"
					>
						<UIcon name="lucide:user-circle" class="size-6" />
					</button>
				</div>
			</div>
		</header>

		<!-- ══════════════════════════════════════════════════════════
		     CHARGEMENT
		══════════════════════════════════════════════════════════════ -->
		<div v-if="loading" class="flex flex-col items-center justify-center py-24 gap-4">
			<div class="w-12 h-12 border-4 border-[#003399]/20 border-t-[#003399] rounded-full animate-spin" />
			<p class="text-base text-slate-500">Chargement en cours…</p>
		</div>

		<template v-else>

			<!-- ══════════════════════════════════════════════════════
			     BANNIÈRE LIMITE GRATUIT
			══════════════════════════════════════════════════════════ -->
			<div v-if="reachedFreeLimit" class="rounded-2xl border-2 border-amber-300 bg-amber-50 p-5 flex items-center gap-4 flex-wrap">
				<UIcon name="lucide:lock" class="size-7 text-amber-500 shrink-0" />
				<div class="flex-1 min-w-0">
					<p class="text-lg font-black text-amber-800">Limite gratuite atteinte ({{ FREE_INVOICE_LIMIT }} décomptes)</p>
					<p class="text-sm text-amber-700/80 mt-1">Activez la licence Premium pour ajouter des décomptes illimités et générer le PDF.</p>
				</div>
				<button
					class="flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500 text-white font-bold text-base hover:bg-amber-600 transition-colors shrink-0"
					@click="licenceModalOpen = true"
				>
					<UIcon name="lucide:badge-check" class="size-5" />
					Passer Premium
				</button>
			</div>

			<!-- ══════════════════════════════════════════════════════
			     BANNIÈRE MEILLEURE PÉRIODE
			══════════════════════════════════════════════════════════ -->
			<div class="text-center">
				<div v-if="meilleureFenetre && meilleureFenetre.depassement > 0" class="inline-block">
					<div class="bg-red-50 border-2 border-red-300 rounded-2xl px-8 py-4 shadow-md">
						<div class="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-red-500 mb-2">
							<UIcon name="heroicons:star-solid" class="size-5" />
							{{ t('banner.best_period') }}
							<UIcon name="heroicons:star-solid" class="size-5" />
						</div>
						<div class="text-2xl lg:text-3xl font-black text-red-600 blink-rouge">
							{{ formatDate(meilleureFenetre.startDate) }} → {{ formatDateFin(meilleureFenetre.endDate) }}
						</div>
					</div>
				</div>

				<div v-else-if="salaireNet === 0" class="inline-block w-full max-w-lg mx-auto">
					<div class="rounded-2xl border-2 border-amber-200 bg-amber-50 p-6">
						<UIcon name="lucide:wallet" class="size-10 text-amber-500 mx-auto mb-3" />
						<p class="text-lg font-bold text-slate-800">{{ t('banner.no_salary_title') }}</p>
						<p class="text-sm text-slate-500 mt-1">{{ t('banner.no_salary_desc') }}</p>
					</div>
				</div>

				<div v-else class="py-6 text-slate-400 text-lg">
					{{ t('banner.no_invoices') }}
				</div>
			</div>

			<!-- ══════════════════════════════════════════════════════
			     SAISIE RAPIDE
			══════════════════════════════════════════════════════════ -->
			<div class="bg-white rounded-2xl border-2 border-slate-200 p-4 shadow-sm">
				<!-- En-tête section -->
				<div class="flex items-center justify-between mb-3">
					<div class="text-xs font-black uppercase tracking-wider text-[#FFCC00] flex items-center gap-1.5">
						<UIcon name="lucide:zap" class="size-3.5 text-[#FFCC00]" />
						{{ t('quick.title') }}
					</div>
					<div v-if="salaireNet > 0" class="flex items-center gap-2">
						<span class="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{{ t('quick.threshold') }}</span>
						<strong v-if="showSeuil" class="text-sm font-black text-sky-600 tabular-nums whitespace-nowrap">{{ fmt(salaireNet / 2) }} €</strong>
						<span v-else class="text-sm text-slate-300 tracking-widest">•••••</span>
						<button
							type="button"
							class="text-slate-400 hover:text-slate-600 transition-colors"
							@click="showSeuil = !showSeuil"
						>
							<UIcon :name="showSeuil ? 'lucide:eye-off' : 'lucide:eye'" class="size-3.5" />
						</button>
					</div>
				</div>

				<div>
					<!-- Blocage profil incomplet -->
					<div v-if="!profilComplet" class="rounded-xl bg-orange-50 border-2 border-orange-200 p-4 flex items-center gap-3">
						<UIcon name="lucide:lock" class="size-6 text-orange-500 shrink-0" />
						<p class="text-base font-semibold text-orange-700">
							{{ t('quick.profile_incomplete') }}
							<button type="button" class="underline ml-1 font-bold" @click="profilModalOpen = true">
								{{ t('quick.open_profile') }}
							</button>
						</p>
					</div>

					<!-- Blocage limite gratuit -->
					<div v-else-if="reachedFreeLimit" class="rounded-xl bg-amber-50 border-2 border-amber-200 p-4 flex items-center gap-3">
						<UIcon name="lucide:lock" class="size-6 text-amber-500 shrink-0" />
						<p class="text-base font-semibold text-amber-700">
							Limite gratuite atteinte.
							<button type="button" class="underline ml-1 font-bold" @click="licenceModalOpen = true">Passer Premium</button>
						</p>
					</div>

					<!-- Champs de saisie -->
					<div v-else class="space-y-3">
						<!-- Personne : toujours pleine largeur -->
						<div>
							<label class="block text-xs font-bold text-slate-500 mb-1">{{ t('quick.person') }}</label>
							<div class="flex items-center gap-2">
								<button
									class="flex items-center justify-center size-12 rounded-xl border-2 border-slate-200 hover:border-[#003399] hover:bg-blue-50 transition-colors text-slate-500 hover:text-[#003399] shrink-0"
									:title="t('quick.add_person_tooltip')"
									@click="ajouterPersonneOpen = true"
								>
									<UIcon name="lucide:user-plus" class="size-5" />
								</button>
								<select
									v-model="selectedPersonneId"
									class="flex-1 h-12 px-3 text-base rounded-xl border-2 border-slate-200 focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/15 outline-none transition-all bg-white text-slate-800 min-w-0"
								>
									<option :value="null">{{ t('quick.select') }}</option>
									<option v-for="p in personnes" :key="p.id" :value="p.id">
										{{ p.prenom }} {{ p.nom }}{{ p.relation ? ` (${p.relation})` : '' }}
									</option>
								</select>
								<button
									class="flex items-center justify-center size-12 rounded-xl border-2 border-slate-200 hover:border-[#003399] hover:bg-blue-50 transition-colors text-slate-500 hover:text-[#003399] shrink-0"
									:title="t('quick.manage_people')"
									@click="gererPersonnesOpen = true"
								>
									<UIcon name="lucide:settings-2" class="size-5" />
								</button>
							</div>
						</div>

						<!-- N° page + Date + Montant :
						     mobile  → 1 colonne (empilé)
						     sm      → 2 colonnes (N°page + Date) puis Montant dessous
						     lg      → 3 colonnes sur une seule ligne -->
						<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
							<!-- N° page -->
							<div>
								<label class="block text-xs font-bold text-slate-500 mb-1">{{ t('quick.page') }}</label>
								<input
									v-model="saisieRapide.numeroPage"
									placeholder="42"
									class="w-full h-12 px-3 text-base rounded-xl border-2 border-slate-200 focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/15 outline-none transition-all bg-white text-slate-800"
								>
							</div>

							<!-- Date -->
							<div>
								<label class="block text-xs font-bold text-slate-500 mb-1">{{ t('quick.date') }}</label>
								<input
									v-model="saisieRapide.date"
									type="date"
									class="w-full h-12 px-3 text-base rounded-xl border-2 border-slate-200 focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/15 outline-none transition-all bg-white text-slate-800"
								>
							</div>

							<!-- Montant -->
							<div class="sm:col-span-2 lg:col-span-1">
								<label class="block text-xs font-bold text-slate-500 mb-1">{{ t('quick.amount') }}</label>
								<div class="flex items-center gap-2">
									<input
										v-model.number="saisieRapide.montant"
										type="number"
										step="0.01"
										min="0"
										placeholder="0.00"
										class="flex-1 h-12 px-3 text-base rounded-xl border-2 border-slate-200 focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/15 outline-none transition-all bg-white text-slate-800 min-w-0"
									>
									<span class="text-lg font-bold text-slate-500 shrink-0">€</span>
								</div>
							</div>
						</div>

						<!-- Total période + Bouton valider -->
						<div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
							<!-- Total période -->
							<div v-if="meilleureFenetre && meilleureFenetre.totalReste > 0" class="flex items-center gap-3 px-4 py-2 rounded-xl bg-blue-50 border border-[#003399]/20 self-start sm:self-auto">
								<span class="text-sm font-bold text-slate-500 uppercase tracking-wider">{{ t('quick.total_period') }}</span>
								<span class="text-2xl font-black text-slate-900 tabular-nums">{{ fmt(meilleureFenetre.totalReste) }} €</span>
							</div>
							<div v-else class="hidden sm:block" />

							<!-- Bouton valider -->
							<button
								class="flex items-center justify-center gap-2 h-12 px-8 rounded-xl bg-[#003399] text-white font-black text-base hover:bg-[#002277] disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors w-full sm:w-auto shrink-0"
								:disabled="saisieRapideLoading || !selectedPersonneId || !saisieRapide.date || !(saisieRapide.montant > 0)"
								@click="validerSaisieRapide"
							>
								<UIcon v-if="saisieRapideLoading" name="lucide:loader-2" class="size-5 animate-spin" />
								<UIcon v-else name="lucide:check-circle-2" class="size-5" />
								{{ t('quick.validate') }}
							</button>
						</div>
					</div>
				</div>
			</div>

			<!-- ══════════════════════════════════════════════════════
			     PÉRIODE + RÉSUMÉ COMMISSION (côte à côte)
			══════════════════════════════════════════════════════════ -->
			<div v-if="meilleureFenetre && meilleureFenetre.depassement > 0" class="flex flex-col lg:flex-row gap-6">

				<!-- GAUCHE : factures de la période -->
				<div class="flex-1 bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-sm">
					<div class="px-5 py-3 bg-slate-50 border-b-2 border-slate-100 flex items-center gap-2">
						<UIcon name="lucide:files" class="size-4 text-[#FFCC00]" />
						<span class="text-sm font-black uppercase tracking-wider text-[#FFCC00]">{{ t('period.title') }}</span>
						<span class="ml-auto inline-flex items-center justify-center min-w-8 h-6 px-2 rounded-md bg-[#FFCC00] font-black text-sm" style="color: #00091A">
							{{ facturesMeillereFiltrees.length }}
						</span>
					</div>

					<!-- Recherche -->
					<div class="px-5 py-3 border-b border-slate-100">
						<div class="relative">
							<UIcon name="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
							<input
								v-model="rechercheperiode"
								:placeholder="t('period.search')"
								class="w-full h-11 pl-9 pr-3 text-sm rounded-xl border-2 border-slate-200 focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/15 outline-none transition-all bg-white text-slate-800"
							>
						</div>
					</div>

					<!-- Liste -->
					<div>
						<div
							v-for="(f, i) in facturesMeillerePaginee"
							:key="f.id"
							class="flex items-center justify-between gap-4 px-5 py-4"
							:class="i % 2 === 0 ? 'invoice-row-a' : 'invoice-row-b'"
						>
							<div class="min-w-0">
								<div class="text-sm font-bold text-[#FFCC00]">
									{{ formatDate(f.dateFacture) }}
								</div>
								<div class="font-bold text-slate-800">{{ f.prenom }} {{ f.nom }}</div>
								<div class="text-sm text-slate-400 flex gap-2 flex-wrap mt-0.5">
									<span v-if="f.numeroPage">({{ f.numeroPage }})</span>
									<span v-if="f.pays">· {{ f.pays }}</span>
								</div>
							</div>
							<div class="text-right shrink-0">
								<div class="text-lg font-black text-slate-900">{{ fmt(f.reste) }} €</div>
							</div>
						</div>
						<div v-if="facturesMeillerePaginee.length === 0" class="px-5 py-10 text-center text-slate-400 text-base">
							{{ rechercheperiode ? t('period.no_results') : t('period.empty') }}
						</div>
					</div>

					<!-- Pagination -->
					<div
						v-if="facturesMeillereFiltrees.length > PAGE_SIZE_MEILLEURE"
						class="flex items-center justify-center gap-4 px-5 py-4 border-t border-slate-100 bg-slate-50"
					>
						<button
							class="size-10 rounded-xl border-2 border-slate-200 flex items-center justify-center text-slate-600 hover:border-[#003399] hover:text-[#003399] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
							:disabled="pageMeilleure <= 1"
							@click="pageMeilleure = Math.max(1, pageMeilleure - 1)"
						>
							<UIcon name="lucide:chevron-left" class="size-5" />
						</button>
						<span class="text-sm text-slate-500 font-medium">{{ pageMeilleure }} / {{ totalPagesMeilleure }}</span>
						<button
							class="size-10 rounded-xl border-2 border-slate-200 flex items-center justify-center text-slate-600 hover:border-[#003399] hover:text-[#003399] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
							:disabled="pageMeilleure >= totalPagesMeilleure"
							@click="pageMeilleure = Math.min(totalPagesMeilleure, pageMeilleure + 1)"
						>
							<UIcon name="lucide:chevron-right" class="size-5" />
						</button>
					</div>
				</div>

				<!-- DROITE : résumé Commission -->
				<div class="shrink-0 lg:w-88 space-y-4">
					<!-- Montant Commission -->
					<div
						class="rounded-2xl border-2 p-7 text-center transition-colors"
						:class="meilleureFenetre.remboursementCommission > 0
							? 'bg-red-50 border-red-300'
							: 'bg-slate-50 border-slate-200'"
					>
						<div class="text-xs font-black uppercase tracking-wide whitespace-nowrap mb-3" :class="meilleureFenetre.remboursementCommission > 0 ? 'text-red-600' : 'text-slate-400'">
							{{ t('ce.title', { taux: personneACharge === 1 ? '100 %' : '90 %' }) }}
						</div>
						<div
							class="font-black leading-none tabular-nums whitespace-nowrap"
							style="font-size: clamp(1.75rem, 4vw, 2.75rem);"
							:class="meilleureFenetre.remboursementCommission > 0
								? 'text-red-600 blink-rouge'
								: 'text-slate-300'"
						>
							{{ fmt(meilleureFenetre.remboursementCommission) }} €
						</div>
						<div v-if="meilleureFenetre.remboursementCommission > 0" class="mt-3 flex items-center justify-center gap-1 text-sm font-bold text-red-600">
							<UIcon name="lucide:check-circle" class="size-5" />
							{{ t('ce.exceeded') }}
						</div>
						<div v-else class="mt-4 text-sm text-slate-400">
							{{ t('ce.missing', { n: fmt(Math.max(0, meilleureFenetre.seuil - meilleureFenetre.totalReste)) }) }}
						</div>
					</div>

					<!-- Bouton soumettre -->
					<button
						v-if="isPremium"
						class="w-full flex items-center justify-center gap-3 py-5 rounded-2xl bg-[#003399] text-white font-black text-lg hover:bg-[#FFCC00] hover:text-[#00091A] disabled:bg-slate-300 disabled:text-white disabled:cursor-not-allowed transition-colors"
						:disabled="!profilComplet"
						@click="ouvrirSoumission"
					>
						<UIcon name="lucide:send" class="size-6" />
						{{ t('submit_btn') }}
					</button>
					<button
						v-else
						class="w-full flex items-center justify-center gap-3 py-5 rounded-2xl bg-amber-100 border-2 border-amber-300 text-amber-800 font-black text-lg hover:bg-amber-200 transition-colors"
						@click="licenceModalOpen = true"
					>
						<UIcon name="lucide:lock" class="size-6" />
						Soumettre (Premium)
					</button>

					<p v-if="isPremium && !profilComplet" class="text-sm text-amber-600 font-bold text-center">
						{{ t('profile_required') }}
					</p>
				</div>
			</div>

			<!-- ══════════════════════════════════════════════════════
			     TOUS LES DÉCOMPTES ACTIFS
			══════════════════════════════════════════════════════════ -->
			<div>
				<div class="flex items-center gap-4 mb-5 flex-wrap">
					<div class="w-1.5 h-7 rounded-full bg-sky-500 shrink-0" />
					<h2 class="text-2xl font-bold font-heading text-slate-900">{{ t('all.title') }}</h2>
					<span class="inline-flex items-center justify-center min-w-8 h-8 px-3 rounded-xl bg-[#FFCC00] font-black text-base" style="color: #00091A">
						{{ listeFacturesFiltered.length }}
					</span>
					<div class="ml-auto flex items-center gap-2 flex-1 min-w-48">
						<div class="relative w-full">
							<UIcon name="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
							<input
								v-model="recherche"
								:placeholder="t('all.search')"
								class="w-full h-11 pl-9 pr-3 text-sm rounded-xl border-2 border-slate-200 focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/15 outline-none transition-all bg-white text-slate-800"
							>
						</div>
					</div>
				</div>

				<div v-if="listeFacturesSorted.length === 0" class="text-center py-16 text-slate-400 text-lg">
					{{ t('all.empty') }}
				</div>
				<div v-else-if="listeFacturesFiltered.length === 0" class="text-center py-16 text-slate-400 text-lg">
					{{ t('all.no_match', { q: recherche }) }}
				</div>

				<div v-else class="space-y-3">
					<div
						v-for="(f, i) in facturesPaginee"
						:key="f.id"
						class="rounded-2xl border-2 px-4 py-4 sm:px-5 sm:py-4 grid gap-x-3 items-center transition-all"
						style="grid-template-columns: 1fr 36px 196px"
						:class="f.soumis
							? (i % 2 === 0 ? 'submitted-row-a opacity-65' : 'submitted-row-b opacity-65')
							: (i % 2 === 0 ? 'invoice-row-a invoice-brd-a' : 'invoice-row-b invoice-brd-b')"
					>
						<!-- Info -->
						<div class="min-w-0">
							<div class="text-base font-black flex items-center gap-2 flex-wrap">
								{{ formatDate(f.dateFacture) }}
								<span v-if="f.pays" class="font-semibold text-slate-600">· {{ f.pays }}</span>
								<span v-if="f.soumis" class="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">Soumis</span>
							</div>
							<div class="flex items-baseline gap-2 flex-wrap mt-0.5">
								<span class="text-base font-semibold" :class="f.soumis ? 'text-slate-400' : 'text-slate-700'">{{ f.prenom }} {{ f.nom }}</span>
								<span v-if="f.matricule" class="text-sm text-slate-400">({{ f.matricule }})</span>
							</div>
							<div class="flex gap-3 mt-1 flex-wrap text-sm">
								<span v-if="f.numeroPage" class="text-sky-600 font-semibold">({{ f.numeroPage }})</span>
								<span v-if="montantTotalEuroEffectif(f) > 0" class="text-slate-500">
									Total <strong class="text-slate-700">{{ fmt(montantTotalEuroEffectif(f)) }} €</strong>
								</span>
								<span v-if="montantJSISEffectif(f) > 0" class="text-slate-500">
									JSIS <strong class="text-slate-700">{{ fmt(montantJSISEffectif(f)) }} €</strong>
								</span>
							</div>
						</div>

						<!-- Étoile meilleure période — colonne fixe 36px -->
						<div class="flex items-center justify-center">
							<div
								v-if="facturesIdsMeilleurePeriode.has(f.id!)"
								class="flex items-center justify-center size-7 rounded-md border-2 border-[#FFCC00] bg-transparent blink-star"
							>
								<UIcon name="heroicons:star-solid" class="size-4 text-[#FFCC00]" />
							</div>
						</div>

						<!-- Montant + actions — colonne fixe 196px -->
						<div class="flex items-center justify-end gap-1">
							<div class="text-lg font-black text-right mr-1 shrink-0" :class="f.soumis ? 'text-slate-400' : 'text-orange-600'">
								{{ fmt(resteFactureAffichage(f)) }} €
							</div>
							<button
								v-if="!f.soumis"
								class="size-9 rounded-xl hover:bg-[#003399]/10 flex items-center justify-center text-slate-500 hover:text-[#003399] transition-colors"
								:title="t('all.edit')"
								@click="openEditModal(f)"
							>
								<UIcon name="lucide:pencil" class="size-4" />
							</button>
							<button
								class="size-9 rounded-xl hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-600 transition-colors"
								:title="t('all.delete')"
								@click="confirmDelete(f)"
							>
								<UIcon name="lucide:trash-2" class="size-4" />
							</button>
						</div>
					</div>
				</div>

				<!-- Pagination -->
				<div v-if="listeFacturesFiltered.length > PAGE_SIZE_TOUTES" class="flex items-center justify-center gap-4 mt-5">
					<button
						class="size-11 rounded-xl border-2 border-slate-200 flex items-center justify-center text-slate-600 hover:border-[#003399] hover:text-[#003399] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
						:disabled="pageToutes <= 1"
						@click="pageToutes = Math.max(1, pageToutes - 1)"
					>
						<UIcon name="lucide:chevron-left" class="size-5" />
					</button>
					<span class="text-base font-bold text-slate-600">{{ pageToutes }} / {{ totalPagesFactures }}</span>
					<button
						class="size-11 rounded-xl border-2 border-slate-200 flex items-center justify-center text-slate-600 hover:border-[#003399] hover:text-[#003399] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
						:disabled="pageToutes >= totalPagesFactures"
						@click="pageToutes = Math.min(totalPagesFactures, pageToutes + 1)"
					>
						<UIcon name="lucide:chevron-right" class="size-5" />
					</button>
				</div>
			</div>

			<!-- ══════════════════════════════════════════════════════
			     DÉCOMPTES SOUMIS
			══════════════════════════════════════════════════════════ -->
			<div v-if="listeFacturesSoumises.length > 0">
				<div class="flex items-center gap-4 mb-5 flex-wrap">
					<div class="w-1.5 h-8 rounded-full bg-slate-400 shrink-0" />
					<h2 class="text-2xl font-bold font-heading text-slate-500">{{ t('all.submitted_section') }}</h2>
					<span class="inline-flex items-center justify-center min-w-8 h-8 px-3 rounded-xl bg-[#FFCC00] font-black text-base" style="color: #00091A">
						{{ listeFacturesSoumises.length }}
					</span>
					<div class="ml-auto flex items-center gap-2 flex-1 min-w-48">
						<div class="relative w-full">
							<UIcon name="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
							<input
								v-model="rechercheSoumises"
								:placeholder="t('all.search')"
								class="w-full h-11 pl-9 pr-3 text-sm rounded-xl border-2 border-slate-200 focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/15 outline-none transition-all bg-white text-slate-800"
							>
						</div>
					</div>
				</div>

				<div v-if="groupesSoumises.length === 0" class="text-center py-10 text-slate-400 text-base">
					{{ t('all.no_match', { q: rechercheSoumises }) }}
				</div>

				<div v-else class="space-y-6">
					<div v-for="groupe in groupesSoumises" :key="groupe.id" class="rounded-2xl border border-slate-200 overflow-hidden">
						<!-- En-tête lot -->
						<div class="flex items-center gap-3 px-5 py-4 bg-slate-100 flex-wrap">
							<UIcon name="lucide:send" class="size-5 text-slate-400 shrink-0" />
							<span class="font-bold text-base text-slate-700">
								{{ t('all.lot_submitted_on', { date: formatDate(groupe.soumisAt.split('T')[0]) }) }}
							</span>
							<span class="text-sm px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-600 font-semibold">
								{{ groupe.factures.length }} {{ groupe.factures.length > 1 ? t('all.statements') : t('all.statement') }}
							</span>
							<span class="text-sm text-slate-500 font-semibold">
								{{ formatDate(groupe.dateMin) }}
								<template v-if="groupe.dateMax !== groupe.dateMin"> → {{ formatDate(groupe.dateMax) }}</template>
							</span>
							<span class="text-base font-bold ml-auto" style="color: #00091A">{{ fmt(groupe.total) }} €</span>
							<button
								class="flex items-center gap-2 px-3 py-2 rounded-xl border-2 border-amber-300 text-amber-700 bg-amber-50 font-semibold text-sm hover:bg-amber-100 transition-colors"
								@click="annulerLot(groupe)"
							>
								<UIcon name="lucide:mail-x" class="size-4" />
								{{ t('all.cancel_lot') }}
							</button>
						</div>

						<!-- Factures du lot -->
						<div>
							<div
								v-for="(f, i) in groupe.facturesFiltrees"
								:key="f.id"
								class="px-5 py-3 flex gap-3 items-center opacity-70"
								:class="i % 2 === 0 ? 'submitted-row-a' : 'submitted-row-b'"
							>
								<div class="flex-1 min-w-0">
									<div class="text-base font-bold text-slate-600">
										{{ formatDate(f.dateFacture) }}<span v-if="f.pays" class="text-slate-400"> · {{ f.pays }}</span>
									</div>
									<div class="text-sm text-slate-500">{{ f.prenom }} {{ f.nom }}<span v-if="f.matricule" class="ml-1">({{ f.matricule }})</span></div>
									<div class="flex gap-3 mt-0.5 text-sm">
										<span v-if="f.numeroPage" class="text-slate-400 font-semibold">({{ f.numeroPage }})</span>
										<span v-if="montantTotalEuroEffectif(f) > 0" class="text-slate-400">
											Total <strong>{{ fmt(montantTotalEuroEffectif(f)) }} €</strong>
										</span>
									</div>
								</div>
								<div class="text-right shrink-0">
									<div class="text-base font-semibold text-slate-400">{{ fmt(resteFactureAffichage(f)) }} €</div>
								</div>
								<button
									class="size-9 rounded-xl hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-600 transition-colors"
									@click="confirmDelete(f)"
								>
									<UIcon name="lucide:trash-2" class="size-4" />
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>

		</template>

		<!-- ══════════════════════════════════════════════════════════
		     MODALS
		══════════════════════════════════════════════════════════════ -->

		<!-- Modal : ajouter une personne -->
		<Teleport to="body">
			<Transition name="modal-centre">
				<div
					v-if="ajouterPersonneOpen"
					class="fixed inset-0 z-50 flex items-center justify-center p-4"
					role="dialog"
					aria-modal="true"
				>
					<div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="ajouterPersonneOpen = false" />
					<div class="modal-card relative bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-md">
						<div class="relative px-6 py-5 flex items-center justify-between bg-gradient-to-br from-[#003399] to-[#001A88]">
							<div class="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
							<div class="flex items-center gap-3 relative">
								<div class="rounded-2xl bg-white/20 p-3 shrink-0">
									<UIcon name="lucide:user-plus" class="size-6 text-white" />
								</div>
								<h2 class="text-xl font-black text-white">{{ t('add_person.title') }}</h2>
							</div>
							<button class="relative rounded-xl p-2 bg-white/15 hover:bg-white/25 transition-colors text-white shrink-0" @click="ajouterPersonneOpen = false">
								<UIcon name="lucide:x" class="size-6" />
							</button>
						</div>
						<div class="px-6 py-6 space-y-4">
							<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div>
									<label class="block text-base font-bold text-slate-700 mb-2">Prénom <span class="text-red-500">*</span></label>
									<input v-model="nouvellePersonne.prenom" placeholder="Jean" class="w-full h-13 px-4 text-base rounded-xl border-2 border-slate-200 focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/15 outline-none transition-all bg-white text-slate-900">
								</div>
								<div>
									<label class="block text-base font-bold text-slate-700 mb-2">Nom <span class="text-red-500">*</span></label>
									<input v-model="nouvellePersonne.nom" placeholder="DUPONT" class="w-full h-13 px-4 text-base rounded-xl border-2 border-slate-200 focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/15 outline-none transition-all bg-white text-slate-900">
								</div>
							</div>
							<div>
								<label class="block text-base font-bold text-slate-700 mb-2">{{ t('add_person.relation') }}</label>
								<select
									v-model="nouvellePersonne.relation"
									class="w-full h-13 px-3 text-base rounded-xl border-2 border-slate-200 focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/15 outline-none transition-all bg-white text-slate-800"
								>
									<option value="" disabled>Sélectionner…</option>
									<option v-for="item in relationsItems" :key="item" :value="item">{{ item }}</option>
								</select>
							</div>
						</div>
						<div class="border-t-2 border-slate-100 px-6 py-5 flex gap-3 bg-slate-50">
							<button
								class="flex-1 py-4 rounded-xl bg-[#003399] text-white font-black text-base hover:bg-[#002277] disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
								:disabled="ajoutPersonneSaving || !nouvellePersonne.prenom.trim() || !nouvellePersonne.nom.trim()"
								@click="sauvegarderPersonne"
							>
								{{ ajoutPersonneSaving ? 'Ajout…' : 'Ajouter' }}
							</button>
							<button
								class="px-6 py-4 rounded-xl border-2 border-slate-200 text-slate-700 font-bold text-base hover:bg-slate-100 transition-colors"
								@click="ajouterPersonneOpen = false"
							>
								Annuler
							</button>
						</div>
					</div>
				</div>
			</Transition>
		</Teleport>

		<!-- Modal : gérer les personnes -->
		<Teleport to="body">
			<Transition name="modal-centre">
				<div v-if="gererPersonnesOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
					<div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="gererPersonnesOpen = false" />
					<div class="modal-card relative bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-xl max-h-[90vh] flex flex-col">
						<div class="relative px-7 py-6 flex items-center justify-between bg-gradient-to-br from-[#003399] to-[#001A88] shrink-0">
							<div class="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
							<div class="flex items-center gap-4 relative">
								<div class="rounded-2xl bg-white/20 p-3 shrink-0">
									<UIcon name="lucide:users" class="size-7 text-white" />
								</div>
								<h2 class="text-xl font-black text-white">{{ t('quick.manage_people') }}</h2>
							</div>
							<button class="relative rounded-xl p-2 bg-white/15 hover:bg-white/25 transition-colors text-white shrink-0" @click="gererPersonnesOpen = false">
								<UIcon name="lucide:x" class="size-6" />
							</button>
						</div>
						<div class="flex-1 overflow-y-auto overscroll-contain px-7 py-6 space-y-3 min-h-0">
							<div v-if="personnes.length === 0" class="text-center py-8 text-slate-400 text-base">Aucune personne enregistrée.</div>
							<div v-for="p in personnes" :key="p.id" class="rounded-2xl border-2 border-slate-100 bg-slate-50 p-4">
								<div v-if="personneEditId !== p.id" class="flex items-center justify-between gap-3">
									<div>
										<span class="font-bold text-base text-slate-800">{{ p.prenom }} {{ p.nom }}</span>
										<span v-if="p.relation" class="ml-2 text-sm text-slate-400">({{ p.relation }})</span>
									</div>
									<div class="flex gap-2 shrink-0">
										<button class="size-10 rounded-xl hover:bg-[#003399]/10 flex items-center justify-center text-slate-500 hover:text-[#003399] transition-colors" @click="ouvrirEditionPersonne(p)">
											<UIcon name="lucide:pencil" class="size-4" />
										</button>
										<button class="size-10 rounded-xl hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-600 transition-colors" @click="personneDeleteConfirmId = p.id">
											<UIcon name="lucide:trash-2" class="size-4" />
										</button>
									</div>
								</div>
								<div v-else class="space-y-3">
									<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
										<input v-model="personneEditState.prenom" placeholder="Prénom" class="h-12 px-3 text-base rounded-xl border-2 border-slate-200 focus:border-[#003399] outline-none transition-all bg-white text-slate-900">
										<input v-model="personneEditState.nom" placeholder="Nom" class="h-12 px-3 text-base rounded-xl border-2 border-slate-200 focus:border-[#003399] outline-none transition-all bg-white text-slate-900">
									</div>
									<select v-model="personneEditState.relation" class="w-full h-12 px-3 text-base rounded-xl border-2 border-slate-200 focus:border-[#003399] outline-none transition-all bg-white text-slate-800">
										<option value="">Aucune relation</option>
										<option v-for="item in relationsItems" :key="item" :value="item">{{ item }}</option>
									</select>
									<div class="flex gap-3">
										<button class="flex-1 py-3 rounded-xl bg-[#003399] text-white font-bold text-base hover:bg-[#002277] disabled:bg-slate-300 transition-colors" :disabled="personneSaving || !personneEditState.prenom.trim() || !personneEditState.nom.trim()" @click="sauvegarderPersonne2(p.id)">
											{{ personneSaving ? '…' : 'Enregistrer' }}
										</button>
										<button class="px-5 py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-bold text-base hover:bg-slate-100 transition-colors" @click="annulerEditionPersonne">Annuler</button>
									</div>
								</div>
								<div v-if="personneDeleteConfirmId === p.id" class="mt-3 rounded-xl bg-red-50 border border-red-200 p-3">
									<p class="text-sm font-bold text-red-700 mb-2">Supprimer <strong>{{ p.prenom }} {{ p.nom }}</strong> ?</p>
									<div class="flex gap-2">
										<button class="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition-colors" @click="supprimerPersonne(p.id)">Supprimer</button>
										<button class="flex-1 py-2.5 rounded-xl border-2 border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-100 transition-colors" @click="personneDeleteConfirmId = null">Annuler</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</Transition>
		</Teleport>

		<!-- Modal : doublon niveau 1 -->
		<Teleport to="body">
			<Transition name="modal-centre">
				<div v-if="doublonModal1Open" class="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
					<div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="doublonModal1Open = false" />
					<div class="modal-card relative bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-lg">
						<div class="relative px-7 py-6 flex items-center justify-between bg-gradient-to-br from-amber-500 to-amber-600">
							<div class="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
							<div class="flex items-center gap-4 relative">
								<div class="rounded-2xl bg-white/20 p-3 shrink-0">
									<UIcon name="lucide:alert-triangle" class="size-7 text-white" />
								</div>
								<h2 class="text-xl font-black text-white">{{ t('doublon.title') }}</h2>
							</div>
							<button class="relative rounded-xl p-2 bg-white/15 hover:bg-white/25 transition-colors text-white shrink-0" @click="doublonModal1Open = false">
								<UIcon name="lucide:x" class="size-6" />
							</button>
						</div>
						<div class="px-7 py-6 space-y-5">
							<div class="rounded-2xl bg-amber-50 border-2 border-amber-200 p-5">
								<p class="font-black text-base text-amber-800 mb-3">{{ t('doublon.warning') }}</p>
								<div class="space-y-1.5">
									<div v-for="d in doublonsDetectes" :key="d.id" class="text-sm text-slate-600 bg-white rounded-xl px-3 py-2 border border-slate-200">
										{{ d.prenom }} {{ d.nom }} — {{ formatDate(d.dateFacture) }} — {{ fmt(montantTotalEuroEffectif(d)) }} €<span v-if="d.numeroPage"> — P.{{ d.numeroPage }}</span>
									</div>
								</div>
							</div>
							<p class="text-lg font-bold text-slate-800">{{ t('doublon.question') }}</p>
							<div class="flex gap-3">
								<button class="flex-1 py-4 rounded-xl bg-amber-500 text-white font-black text-base hover:bg-amber-600 transition-colors" @click="confirmerDoublon">Oui, deux factures distinctes</button>
								<button class="flex-1 py-4 rounded-xl border-2 border-slate-200 text-slate-700 font-bold text-base hover:bg-slate-50 transition-colors" @click="doublonModal1Open = false">Non, annuler</button>
							</div>
						</div>
					</div>
				</div>
			</Transition>
		</Teleport>

		<!-- Modal : doublon niveau 2 -->
		<Teleport to="body">
			<Transition name="modal-centre">
				<div v-if="doublonModal2Open" class="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
					<div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="doublonModal2Open = false" />
					<div class="modal-card relative bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-md">
						<div class="relative px-7 py-6 flex items-center justify-between bg-gradient-to-br from-orange-500 to-amber-600">
							<div class="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
							<div class="flex items-center gap-4 relative">
								<div class="rounded-2xl bg-white/20 p-3 shrink-0">
									<UIcon name="lucide:shield-alert" class="size-7 text-white" />
								</div>
								<h2 class="text-xl font-black text-white">{{ t('doublon.title2') }}</h2>
							</div>
							<button class="relative rounded-xl p-2 bg-white/15 hover:bg-white/25 transition-colors text-white shrink-0" @click="doublonModal2Open = false">
								<UIcon name="lucide:x" class="size-6" />
							</button>
						</div>
						<div class="px-7 py-6 space-y-5">
							<p class="text-base text-slate-600">{{ t('doublon.text2') }}</p>
							<p class="text-lg font-bold text-slate-800">{{ t('doublon.question2') }}</p>
							<div class="flex gap-3">
								<button class="flex-1 py-4 rounded-xl bg-[#003399] text-white font-black text-base hover:bg-[#002277] transition-colors" :disabled="saisieRapideLoading" @click="creerFactureConfirmee">
									{{ saisieRapideLoading ? '…' : 'Valider quand même' }}
								</button>
								<button class="flex-1 py-4 rounded-xl border-2 border-slate-200 text-slate-700 font-bold text-base hover:bg-slate-50 transition-colors" @click="doublonModal2Open = false">Annuler</button>
							</div>
						</div>
					</div>
				</div>
			</Transition>
		</Teleport>

		<!-- Modal : profil -->
		<ModalProfil
			:open="profilModalOpen"
			mode="profil"
			@close="profilModalOpen = false"
			@saved="onProfilSaved"
			@reset="load"
		/>

		<!-- Modal : soumission -->
		<Teleport to="body">
			<Transition name="modal-centre">
				<div v-if="soumissionModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
					<div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="soumissionModalOpen = false" />
					<div class="modal-card relative bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-lg">
						<div class="relative px-7 py-6 flex items-center justify-between bg-gradient-to-br from-[#003399] to-[#001A88]">
							<div class="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
							<div class="flex items-center gap-4 relative">
								<div class="rounded-2xl bg-white/20 p-3 shrink-0">
									<UIcon name="lucide:send" class="size-7 text-white" />
								</div>
								<div>
									<h2 class="text-xl font-black text-white">{{ t('submit_modal.title') }}</h2>
									<p class="text-sm text-white/75 mt-0.5">{{ currentLocale.toUpperCase() }} · {{ fmt(meilleureFenetre?.remboursementCommission ?? 0) }} €</p>
								</div>
							</div>
							<button class="relative rounded-xl p-2 bg-white/15 hover:bg-white/25 transition-colors text-white shrink-0" @click="soumissionModalOpen = false">
								<UIcon name="lucide:x" class="size-6" />
							</button>
						</div>
						<div class="px-7 py-6 space-y-5">
							<p class="text-lg font-bold text-slate-800">{{ t('submit_modal.intro') }}</p>
							<ul class="space-y-3">
								<li class="flex items-center gap-3 text-base text-slate-600">
									<UIcon name="lucide:file-text" class="size-5 text-red-500 shrink-0" />
									{{ t('submit_modal.action_pdf', { lang: currentLocale.toUpperCase() }) }}
								</li>
								<li class="flex items-center gap-3 text-base text-slate-600">
									<UIcon name="lucide:save" class="size-5 text-emerald-500 shrink-0" />
									{{ t('submit_modal.action_save') }}
								</li>
								<li class="flex items-center gap-3 text-base text-slate-600">
									<UIcon name="lucide:file-spreadsheet" class="size-5 text-emerald-600 shrink-0" />
									{{ t('submit_modal.action_csv') }}
								</li>
								<li class="flex items-center gap-3 text-base text-slate-600">
									<UIcon name="lucide:mail" class="size-5 text-[#003399] shrink-0" />
									{{ t('submit_modal.action_mail') }}
								</li>
							</ul>
							<div v-if="(meilleureFenetre?.remboursementCommission ?? 0) > 0" class="rounded-2xl bg-blue-50 border-2 border-[#003399]/20 p-5 text-center">
								<p class="text-sm font-bold text-[#003399] mb-2">Remboursement Commission</p>
								<p class="text-4xl font-black text-[#003399]">{{ fmt(meilleureFenetre?.remboursementCommission ?? 0) }} €</p>
							</div>
							<div class="flex gap-3">
								<button class="flex-1 py-4 rounded-xl bg-[#003399] text-white font-black text-base hover:bg-[#002277] disabled:bg-slate-300 transition-colors" :disabled="soumettant" @click="confirmerSoumissionComplete">
									{{ soumettant ? 'En cours…' : t('submit_modal.confirm') }}
								</button>
								<button class="flex-1 py-4 rounded-xl border-2 border-slate-200 text-slate-700 font-bold text-base hover:bg-slate-50 transition-colors" @click="soumissionModalOpen = false">
									{{ t('submit_modal.cancel') }}
								</button>
							</div>
						</div>
					</div>
				</div>
			</Transition>
		</Teleport>

		<!-- Modal : édition facture -->
		<Teleport to="body">
			<Transition name="modal-centre">
				<div v-if="editModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
					<div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="editModalOpen = false" />
					<div class="modal-card relative bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-md">
						<div class="relative px-7 py-6 flex items-center justify-between bg-gradient-to-br from-[#003399] to-[#001A88]">
							<div class="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
							<div class="absolute right-8 bottom-0 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />
							<div class="flex items-center gap-4 relative">
								<div class="rounded-2xl bg-white/20 p-3 shrink-0">
									<UIcon name="lucide:file-pen-line" class="size-7 text-white" />
								</div>
								<div>
									<h2 class="text-xl font-black text-white">{{ t('edit_modal.title') }}</h2>
									<p v-if="factureEditee" class="text-sm text-white/75 mt-0.5">{{ factureEditee.prenom }} {{ factureEditee.nom }} · {{ formatDate(factureEditee.dateFacture) }}</p>
								</div>
							</div>
							<button class="relative rounded-xl p-2 bg-white/15 hover:bg-white/25 transition-colors text-white shrink-0" @click="editModalOpen = false">
								<UIcon name="lucide:x" class="size-6" />
							</button>
						</div>
						<div v-if="factureEditee" class="px-7 py-6 space-y-5">
							<div>
								<label class="block text-base font-bold text-slate-700 mb-2">Nom *</label>
								<select v-model="editSelectedPersonneId" class="w-full h-13 px-3 text-base rounded-xl border-2 border-slate-200 focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/15 outline-none transition-all bg-white text-slate-800" @change="onEditPersonneSelect">
									<option :value="null">— Choisir dans la liste —</option>
									<option v-for="p in personnes" :key="p.id" :value="p.id">{{ p.prenom }} {{ p.nom }}</option>
								</select>
							</div>
							<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div>
									<label class="block text-base font-bold text-slate-700 mb-2">{{ t('edit_modal.page') }}</label>
									<input v-model="editState.numeroPage" placeholder="ex : 42" class="w-full h-13 px-4 text-base rounded-xl border-2 border-slate-200 focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/15 outline-none transition-all bg-white text-slate-900">
								</div>
								<div>
									<label class="block text-base font-bold text-slate-700 mb-2">Date *</label>
									<input v-model="editState.dateFacture" type="date" class="w-full h-13 px-4 text-base rounded-xl border-2 border-slate-200 focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/15 outline-none transition-all bg-white text-slate-900">
								</div>
							</div>
							<div>
								<label class="block text-base font-bold text-slate-700 mb-2">Montant total (€) *</label>
								<div class="flex items-center gap-3">
									<input v-model.number="editState.montantTotalEuro" type="number" step="0.01" min="0" placeholder="0.00" class="flex-1 h-14 px-4 text-xl font-bold rounded-xl border-2 border-slate-200 focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/15 outline-none transition-all bg-white text-slate-900">
									<span class="text-xl font-bold text-slate-400 shrink-0">€</span>
								</div>
							</div>
							<div class="flex gap-3 pt-2">
								<button class="flex-1 py-4 rounded-xl bg-[#003399] text-white font-black text-base hover:bg-[#002277] disabled:bg-slate-300 transition-colors" :disabled="editSaving" @click="saveEdit">
									<UIcon v-if="editSaving" name="lucide:loader-2" class="size-5 animate-spin inline mr-2" />
									{{ editSaving ? 'Sauvegarde…' : t('edit_modal.save') }}
								</button>
								<button class="px-6 py-4 rounded-xl border-2 border-slate-200 text-slate-700 font-bold text-base hover:bg-slate-50 transition-colors" @click="editModalOpen = false">Annuler</button>
							</div>
						</div>
					</div>
				</div>
			</Transition>
		</Teleport>

		<!-- Modal : suppression -->
		<Teleport to="body">
			<Transition name="modal-centre">
				<div v-if="deleteModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
					<div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="deleteModalOpen = false" />
					<div class="modal-card relative bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-md">
						<div class="relative px-7 py-6 flex items-center justify-between bg-gradient-to-br from-red-600 to-red-700">
							<div class="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
							<div class="flex items-center gap-4 relative">
								<div class="rounded-2xl bg-white/20 p-3 shrink-0">
									<UIcon name="lucide:trash-2" class="size-7 text-white" />
								</div>
								<div>
									<h2 class="text-xl font-black text-white">{{ t('delete_modal.title') }}</h2>
									<p v-if="factureToDelete" class="text-sm text-white/75 mt-0.5">{{ factureToDelete.prenom }} {{ factureToDelete.nom }}</p>
								</div>
							</div>
							<button class="relative rounded-xl p-2 bg-white/15 hover:bg-white/25 transition-colors text-white shrink-0" @click="deleteModalOpen = false">
								<UIcon name="lucide:x" class="size-6" />
							</button>
						</div>
						<div class="px-7 py-6 space-y-5">
							<p class="text-base text-slate-600">
								Cette action est irréversible. Le décompte du
								<strong>{{ formatDate(factureToDelete?.dateFacture ?? '') }}</strong> sera supprimé définitivement.
							</p>
							<div class="flex gap-3">
								<button class="flex-1 py-4 rounded-xl bg-red-600 text-white font-black text-base hover:bg-red-700 disabled:bg-slate-300 transition-colors" :disabled="deleting" @click="doDelete">
									<UIcon v-if="deleting" name="lucide:loader-2" class="size-5 animate-spin inline mr-2" />
									{{ deleting ? 'Suppression…' : t('delete_modal.delete') }}
								</button>
								<button class="flex-1 py-4 rounded-xl border-2 border-slate-200 text-slate-700 font-bold text-base hover:bg-slate-50 transition-colors" @click="deleteModalOpen = false">Annuler</button>
							</div>
						</div>
					</div>
				</div>
			</Transition>
		</Teleport>

	</div>
</template>

<script setup lang="ts">
import type { FactureEnrichie, FenetreAnalyse } from "~/composables/useAnalysis";
import type { Facture } from "~/db/schema";
import { invoke } from "@tauri-apps/api/core";
import { type as osType } from "@tauri-apps/plugin-os";
import { Command, open as shellOpen } from "@tauri-apps/plugin-shell";
import { useAnalysis } from "~/composables/useAnalysis";
import { useFactures } from "~/composables/useFactures";
import { useParametres } from "~/composables/useParametres";
import { fillFormRemb } from "~/composables/usePdfFiller";
import { usePersonnes } from "~/composables/usePersonnes";

definePageMeta({ layout: "home" });

const { t, currentLocale } = useLang();
const { isDark, toggleDark } = useTheme();
const { getAllFactures, createFacture, deleteFacture, updateFacture, marquerSoumis, annulerGroupe, deleteAllFactures } = useFactures();
const { computeFenetres } = useAnalysis();
const { getSalaireNet, getParametres } = useParametres();
const { getAllPersonnes, createPersonne, updatePersonne, deletePersonne } = usePersonnes();
const { isPremium, licenceModalOpen, FREE_INVOICE_LIMIT } = useLicence();
const toast = useToast();

// ── Pagination
const PAGE_SIZE_MEILLEURE = 5;
const PAGE_SIZE_TOUTES = 10;

// ── État principal
const listeFactures = ref<Facture[]>([]);
const personnes = ref<any[]>([]);
const loading = ref(true);
const salaireNet = ref(0);
const recherche = ref("");
const pageMeilleure = ref(1);
const pageToutes = ref(1);
const rechercheperiode = ref("");
const rechercheSoumises = ref("");

// ── Saisie rapide
const selectedPersonneId = ref<number | null>(null);
const todayISO = () => new Date().toISOString().split("T")[0]!;
const saisieRapide = reactive({ numeroPage: "", date: todayISO(), montant: 0 });
const saisieRapideLoading = ref(false);
const showSeuil = ref(false);

// ── Doublons
const doublonsDetectes = ref<Facture[]>([]);
const doublonModal1Open = ref(false);
const doublonModal2Open = ref(false);

// ── Ajouter personne
const ajouterPersonneOpen = ref(false);
const ajoutPersonneSaving = ref(false);
const nouvellePersonne = reactive({ nom: "", prenom: "", relation: "" });

const relationsItems = computed(() => [
	t("add_person.r_myself"),
	t("add_person.r_spouse"),
	t("add_person.r_child"),
	t("add_person.r_ancestor"),
	t("add_person.r_other")
]);

// ── Profil
const profilModalOpen = ref(false);
const personneACharge = ref<number | null>(null);
const profilState = reactive({
	nomAffilie: "", prenomAffilie: "", matriculeAffilie: "",
	institutionAffilie: "", adresseBureau: "", telephoneBureau: "",
	adressePrivee: "", dateCessation: "", nomConjoint: "", prenomConjoint: "",
	matriculeConjoint: "", signaturePng: "", conjointSignaturePng: ""
});
const profilComplet = computed(() =>
	profilState.prenomAffilie.trim().length > 0
	&& profilState.nomAffilie.trim().length > 0
	&& profilState.matriculeAffilie.trim().length > 0
	&& personneACharge.value !== null
);

// ── Soumission
const soumissionModalOpen = ref(false);
const soumettant = ref(false);

// ── Suppression
const deleteModalOpen = ref(false);
const factureToDelete = ref<Facture | null>(null);
const deleting = ref(false);

// ── Édition
const editModalOpen = ref(false);
const factureEditee = ref<Facture | null>(null);
const editSaving = ref(false);
const editSelectedPersonneId = ref<number | null>(null);
const editState = reactive({ numeroPage: "", nom: "", prenom: "", dateFacture: "", montantTotalEuro: 0 });

// ── Gestion personnes
const gererPersonnesOpen = ref(false);
const personneEditId = ref<number | null>(null);
const personneEditState = reactive({ nom: "", prenom: "", relation: "" });
const personneSaving = ref(false);
const personneDeleteConfirmId = ref<number | null>(null);

// ── Computed
const reachedFreeLimit = computed(() => !isPremium.value && listeFacturesActives.value.length >= FREE_INVOICE_LIMIT);
const listeFacturesSorted = computed(() => [...listeFactures.value].sort((a, b) => b.dateFacture.localeCompare(a.dateFacture)));
const listeFacturesActives = computed(() => listeFacturesSorted.value.filter(f => !f.soumis));
const listeFacturesFiltered = computed(() => {
	const q = recherche.value.trim().toLowerCase();
	if (!q) return listeFacturesSorted.value;
	return listeFacturesSorted.value.filter(f =>
		(`${f.nom} ${f.prenom}`).toLowerCase().includes(q)
		|| (`${f.prenom} ${f.nom}`).toLowerCase().includes(q)
		|| (f.numeroPage ?? "").toLowerCase().includes(q)
		|| f.dateFacture.includes(q)
		|| formatDate(f.dateFacture).toLowerCase().includes(q)
		|| (f.matricule ?? "").toLowerCase().includes(q)
	);
});
const listeFacturesSoumises = computed(() => listeFacturesSorted.value.filter(f => f.soumis));

interface GroupeSoumis {
	id: string; soumisAt: string; factures: typeof listeFacturesSoumises.value;
	facturesFiltrees: typeof listeFacturesSoumises.value; total: number; dateMin: string; dateMax: string;
}
const groupesSoumises = computed((): GroupeSoumis[] => {
	const map = new Map<string, { soumisAt: string; factures: typeof listeFacturesSoumises.value }>();
	for (const f of listeFacturesSoumises.value) {
		const key = f.soumissionId ?? `legacy-${f.updatedAt}`;
		if (!map.has(key)) map.set(key, { soumisAt: f.soumisAt ?? f.updatedAt ?? "", factures: [] });
		map.get(key)!.factures.push(f);
	}
	const q = rechercheSoumises.value.toLowerCase().trim();
	return [...map.entries()]
		.sort((a, b) => b[1].soumisAt.localeCompare(a[1].soumisAt))
		.map(([id, data]) => {
			const filtered = q ? data.factures.filter(f =>
				f.nom.toLowerCase().includes(q) || f.prenom.toLowerCase().includes(q)
				|| (f.numeroPage ?? "").toLowerCase().includes(q) || f.dateFacture.includes(q)
			) : data.factures;
			const dates = data.factures.map(f => f.dateFacture).filter(Boolean).sort();
			return {
				id, soumisAt: data.soumisAt, factures: data.factures, facturesFiltrees: filtered,
				total: data.factures.reduce((s, f) => s + (f.montantCommission || f.montant || 0), 0),
				dateMin: dates[0] ?? "", dateMax: dates[dates.length - 1] ?? ""
			};
		})
		.filter(g => g.facturesFiltrees.length > 0);
});

const fenetres = computed(() => computeFenetres(listeFactures.value, salaireNet.value, personneACharge.value === 1));
const meilleureFenetre = computed(() => fenetres.value.find(f => f.estMeilleure) ?? null);
const facturesMeilleureTriees = computed((): FactureEnrichie[] => {
	if (!meilleureFenetre.value) return [];
	return [...meilleureFenetre.value.factures].sort((a, b) => a.dateFacture.localeCompare(b.dateFacture));
});
const facturesMeillereFiltrees = computed((): FactureEnrichie[] => {
	const q = rechercheperiode.value.trim().toLowerCase();
	if (!q) return facturesMeilleureTriees.value;
	return facturesMeilleureTriees.value.filter(f =>
		(`${f.nom} ${f.prenom}`).toLowerCase().includes(q)
		|| (`${f.prenom} ${f.nom}`).toLowerCase().includes(q)
		|| f.dateFacture.includes(q)
		|| formatDate(f.dateFacture).toLowerCase().includes(q)
		|| (f.numeroPage ?? "").toLowerCase().includes(q)
	);
});
const facturesIdsMeilleurePeriode = computed(() => new Set(meilleureFenetre.value?.factures.map(f => f.id) ?? []));
const totalPagesMeilleure = computed(() => Math.max(1, Math.ceil(facturesMeillereFiltrees.value.length / PAGE_SIZE_MEILLEURE)));
const facturesMeillerePaginee = computed(() => {
	const start = (pageMeilleure.value - 1) * PAGE_SIZE_MEILLEURE;
	return facturesMeillereFiltrees.value.slice(start, start + PAGE_SIZE_MEILLEURE);
});
const totalPagesFactures = computed(() => Math.max(1, Math.ceil(listeFacturesFiltered.value.length / PAGE_SIZE_TOUTES)));
const facturesPaginee = computed(() => {
	const start = (pageToutes.value - 1) * PAGE_SIZE_TOUTES;
	return listeFacturesFiltered.value.slice(start, start + PAGE_SIZE_TOUTES);
});

watch(recherche, () => { pageToutes.value = 1; });
watch(() => saisieRapide.numeroPage, (val) => { recherche.value = val; pageToutes.value = 1; });
watch(rechercheperiode, () => { pageMeilleure.value = 1; });
watch(meilleureFenetre, () => { pageMeilleure.value = 1; rechercheperiode.value = ""; });

// ── Helpers
const fmt = (n: number) => n.toFixed(2);
const formatDate = (d?: string) => {
	if (!d) return "";
	try { return new Intl.DateTimeFormat("fr-BE", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(d)); }
	catch { return d; }
};
const formatDateFin = (d?: string) => {
	if (!d) return "";
	try {
		const date = new Date(d);
		date.setDate(date.getDate() - 1);
		return new Intl.DateTimeFormat("fr-BE", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
	} catch { return d; }
};
const montantTotalEuroEffectif = (f: Facture) => (f.montantTotalEuro ?? 0) > 0 ? (f.montantTotalEuro ?? 0) : f.montant;
const montantJSISEffectif = (f: Facture) => (f.montantTotalEuro ?? 0) > 0 ? (f.montantJSIS ?? 0) : (f.montantRembourse ?? 0);
const resteFactureAffichage = (f: Facture) => Math.max(0, montantTotalEuroEffectif(f) - montantJSISEffectif(f));

// ── Chargement
const load = async () => {
	loading.value = true;
	try {
		const [factures, salaire, params, pers] = await Promise.all([
			getAllFactures(), getSalaireNet(), getParametres(), getAllPersonnes()
		]);
		if (params) {
			Object.assign(profilState, {
				nomAffilie: params.nomAffilie ?? "",
				prenomAffilie: params.prenomAffilie ?? "",
				matriculeAffilie: params.matriculeAffilie ?? "",
				institutionAffilie: (params as any).institutionAffilie ?? "",
				adresseBureau: (params as any).adresseBureau ?? "",
				telephoneBureau: (params as any).telephoneBureau ?? "",
				adressePrivee: (params as any).adressePrivee ?? "",
				dateCessation: (params as any).dateCessation ?? "",
				nomConjoint: (params as any).nomConjoint ?? "",
				prenomConjoint: (params as any).prenomConjoint ?? "",
				matriculeConjoint: (params as any).matriculeConjoint ?? "",
				signaturePng: (params as any).signaturePng ?? "",
				conjointSignaturePng: (params as any).conjointSignaturePng ?? ""
			});
			personneACharge.value = (params as any).personneACharge ?? null;
		}
		listeFactures.value = factures;
		salaireNet.value = salaire;
		personnes.value = pers;
	} finally { loading.value = false; }
};

const onProfilSaved = async () => {
	const [params, salaire] = await Promise.all([getParametres(), getSalaireNet()]);
	if (params) {
		Object.assign(profilState, {
			nomAffilie: params.nomAffilie ?? "",
			prenomAffilie: params.prenomAffilie ?? "",
			matriculeAffilie: params.matriculeAffilie ?? "",
			institutionAffilie: (params as any).institutionAffilie ?? "",
			adresseBureau: (params as any).adresseBureau ?? "",
			telephoneBureau: (params as any).telephoneBureau ?? "",
			adressePrivee: (params as any).adressePrivee ?? "",
			dateCessation: (params as any).dateCessation ?? "",
			nomConjoint: (params as any).nomConjoint ?? "",
			prenomConjoint: (params as any).prenomConjoint ?? "",
			matriculeConjoint: (params as any).matriculeConjoint ?? "",
			signaturePng: (params as any).signaturePng ?? "",
			conjointSignaturePng: (params as any).conjointSignaturePng ?? ""
		});
		personneACharge.value = (params as any).personneACharge ?? null;
	}
	salaireNet.value = salaire;
};

// ── Gestion personnes
const ouvrirEditionPersonne = (p: any) => {
	personneEditId.value = p.id;
	personneEditState.nom = p.nom;
	personneEditState.prenom = p.prenom;
	personneEditState.relation = p.relation ?? "";
};
const annulerEditionPersonne = () => { personneEditId.value = null; };
const sauvegarderPersonne2 = async (id: number) => {
	personneSaving.value = true;
	try {
		await updatePersonne(id, { nom: personneEditState.nom.trim(), prenom: personneEditState.prenom.trim(), relation: personneEditState.relation } as any);
		personnes.value = await getAllPersonnes();
		personneEditId.value = null;
	} finally { personneSaving.value = false; }
};
const supprimerPersonne = async (id: number) => {
	await deletePersonne(id);
	personnes.value = await getAllPersonnes();
	personneDeleteConfirmId.value = null;
	if (selectedPersonneId.value === id) selectedPersonneId.value = null;
};

// ── Saisie rapide
const sauvegarderPersonne = async () => {
	if (!nouvellePersonne.prenom.trim() || !nouvellePersonne.nom.trim()) return;
	ajoutPersonneSaving.value = true;
	try {
		await createPersonne({ nom: nouvellePersonne.nom.trim(), prenom: nouvellePersonne.prenom.trim(), relation: nouvellePersonne.relation || undefined });
		personnes.value = await getAllPersonnes();
		Object.assign(nouvellePersonne, { nom: "", prenom: "", relation: "" });
		ajouterPersonneOpen.value = false;
		toast.add({ title: t("toast.person_added"), color: "success" });
	} catch (e) {
		toast.add({ title: t("toast.error"), description: String(e), color: "error" });
	} finally { ajoutPersonneSaving.value = false; }
};

const validerSaisieRapide = async () => {
	if (!selectedPersonneId.value || !saisieRapide.date || !(saisieRapide.montant > 0)) return;
	if (reachedFreeLimit.value) { licenceModalOpen.value = true; return; }
	const personne = personnes.value.find(p => p.id === selectedPersonneId.value);
	if (!personne) return;
	const doublons = listeFactures.value.filter(f =>
		f.nom.toLowerCase() === personne.nom.toLowerCase()
		&& f.prenom.toLowerCase() === personne.prenom.toLowerCase()
		&& (f.numeroPage ?? "") === (saisieRapide.numeroPage ?? "")
		&& f.dateFacture === saisieRapide.date
		&& Math.abs(montantTotalEuroEffectif(f) - saisieRapide.montant) < 0.01
	);
	if (doublons.length > 0) {
		doublonsDetectes.value = doublons;
		doublonModal1Open.value = true;
		return;
	}
	await creerFactureConfirmee();
};

const confirmerDoublon = () => { doublonModal1Open.value = false; doublonModal2Open.value = true; };

const creerFactureConfirmee = async () => {
	const personne = personnes.value.find(p => p.id === selectedPersonneId.value);
	if (!personne) return;
	saisieRapideLoading.value = true;
	doublonModal1Open.value = false;
	doublonModal2Open.value = false;
	try {
		await createFacture({
			nom: personne.nom, prenom: personne.prenom,
			matricule: personne.matricule || null,
			numeroPage: saisieRapide.numeroPage || null,
			dateFacture: saisieRapide.date,
			montantTotalEuro: saisieRapide.montant,
			montant: saisieRapide.montant
		});
		Object.assign(saisieRapide, { numeroPage: "", date: todayISO(), montant: 0 });
		selectedPersonneId.value = null;
		await load();
		toast.add({ title: t("toast.invoice_saved"), color: "success" });
	} catch (e) {
		toast.add({ title: t("toast.error"), description: String(e), color: "error" });
	} finally { saisieRapideLoading.value = false; }
};

// ── Suppression
const confirmDelete = (f: Facture) => { factureToDelete.value = f; deleteModalOpen.value = true; };
const doDelete = async () => {
	if (!factureToDelete.value) return;
	deleting.value = true;
	try {
		await deleteFacture(factureToDelete.value.id!);
		await load();
		deleteModalOpen.value = false;
		toast.add({ title: t("toast.invoice_deleted"), color: "success" });
	} catch { toast.add({ title: t("toast.error"), color: "error" }); }
	finally { deleting.value = false; }
};

// ── Édition
const openEditModal = (f: Facture) => {
	factureEditee.value = f;
	Object.assign(editState, {
		numeroPage: f.numeroPage ?? "", nom: f.nom, prenom: f.prenom,
		dateFacture: f.dateFacture, montantTotalEuro: montantTotalEuroEffectif(f)
	});
	const found = personnes.value.find(p => p.nom === f.nom && p.prenom === f.prenom);
	editSelectedPersonneId.value = found?.id ?? null;
	editModalOpen.value = true;
};
const onEditPersonneSelect = () => {
	if (!editSelectedPersonneId.value) return;
	const p = personnes.value.find(p => p.id === editSelectedPersonneId.value);
	if (p) { editState.nom = p.nom; editState.prenom = p.prenom; }
};
const saveEdit = async () => {
	if (!factureEditee.value) return;
	editSaving.value = true;
	const f = factureEditee.value;
	try {
		await updateFacture(f.id!, {
			nom: editState.nom.trim(), prenom: editState.prenom.trim(),
			numeroPage: editState.numeroPage || null,
			dateFacture: editState.dateFacture,
			montantTotalEuro: editState.montantTotalEuro,
			montant: editState.montantTotalEuro,
			matricule: f.matricule, pays: f.pays,
			montantMaxRemboursable: f.montantMaxRemboursable,
			montantTotalRemboursePays: f.montantTotalRemboursePays,
			montantJSIS: montantJSISEffectif(f),
			montantCommission: f.montantCommission,
			montantRembourse: f.montantRembourse
		});
		editModalOpen.value = false;
		await load();
		toast.add({ title: t("toast.invoice_updated"), color: "success" });
	} catch { toast.add({ title: t("toast.update_error"), color: "error" }); }
	finally { editSaving.value = false; }
};

// ── Annuler lot soumis
const annulerLot = async (groupe: GroupeSoumis) => {
	try {
		const ids = groupe.factures.map(f => f.id!);
		await annulerGroupe(ids);
		await load();
		toast.add({ title: "Lot annulé", color: "success" });
		const dateEnvoi = formatDate(groupe.soumisAt.split("T")[0]);
		const n = groupe.factures.length;
		const statementsWord = n > 1 ? t("all.statements") : t("all.statement");
		const expediteur = `${profilState.prenomAffilie} ${profilState.nomAffilie}`.trim();
		const sujet = encodeURIComponent(t("email.cancel_subject", { date: dateEnvoi }));
		const corps = encodeURIComponent(
			t("email.cancel_salutation") + "\n\n" +
			t("email.cancel_body", { sent_date: dateEnvoi, from_date: formatDate(groupe.dateMin), to_date: formatDate(groupe.dateMax), n, statements: statementsWord, amount: fmt(groupe.total) }) + "\n\n" +
			t("email.cancel_line2") + "\n\n" +
			t("email.cancel_closing") + "\n" + (expediteur || "…")
		);
		await shellOpen(`mailto:PMO-RCAM@ec.europa.eu?subject=${sujet}&body=${corps}`);
	} catch (e) { toast.add({ title: t("toast.error"), description: String(e), color: "error" }); }
};

// ── Soumission complète
const ouvrirSoumission = () => {
	if (!meilleureFenetre.value || !profilComplet.value) return;
	soumissionModalOpen.value = true;
};

const buildFillData = () => {
	const f = meilleureFenetre.value;
	if (!f) return null;
	return {
		prenomAffilie: profilState.prenomAffilie, nomAffilie: profilState.nomAffilie,
		matriculeAffilie: profilState.matriculeAffilie, institutionAffilie: profilState.institutionAffilie,
		adresseBureau: profilState.adresseBureau, telephoneBureau: profilState.telephoneBureau,
		adressePrivee: profilState.adressePrivee, dateCessation: profilState.dateCessation,
		startDate: f.startDate, endDate: f.endDate,
		nomConjoint: profilState.nomConjoint, prenomConjoint: profilState.prenomConjoint,
		matriculeConjoint: profilState.matriculeConjoint,
		signaturePng: profilState.signaturePng || null,
		conjointSignaturePng: profilState.conjointSignaturePng || null
	};
};

const genererCSVContent = (factures: FactureEnrichie[]): string => {
	const bom = "﻿";
	const entetes = ["Date", "Page", "Prénom", "Nom", "Matricule", "Pays", "Total €", "JSIS €", "Commission €", "Reste CE €"];
	const lignes = factures.map(f => {
		const total = montantTotalEuroEffectif(f);
		const jsis = montantJSISEffectif(f);
		return [
			formatDate(f.dateFacture), f.numeroPage ?? "", f.prenom, f.nom,
			f.matricule ?? "", f.pays ?? "",
			total.toFixed(2).replace(".", ","), jsis.toFixed(2).replace(".", ","),
			(f.montantCommission ?? 0).toFixed(2).replace(".", ","),
			f.reste.toFixed(2).replace(".", ",")
		].map(v => `"${String(v).replace(/"/g, '""')}"`).join(";");
	});
	return `${bom + entetes.map(e => `"${e}"`).join(";")}\n${lignes.join("\n")}`;
};

const confirmerSoumissionComplete = async () => {
	if (!meilleureFenetre.value) return;
	soumettant.value = true;
	try {
		const dateStr = new Date().toISOString().split("T")[0]!;
		const os = await osType();
		const exeDir = await invoke<string>("get_exe_dir");
		const exeLower = exeDir.toLowerCase();
		const isPortable = os === "windows" && !!exeDir && !exeLower.includes("program files") && !exeLower.includes("appdata");
		const nativeSep = os === "windows" ? "\\" : "/";
		const exeDirClean = exeDir.replace(/[\\/]$/, "");
		const docDir = isPortable ? "" : (await invoke<string>("get_documents_dir")).replace(/[\\/]$/, "");
		const rcamAbs = isPortable ? `${exeDirClean}\\RCAM\\${dateStr}` : `${docDir}${nativeSep}RCAM${nativeSep}${dateStr}`;
		const saveFile = async (filename: string, data: Uint8Array) => {
			await invoke("write_file_abs", { path: `${rcamAbs}${nativeSep}${filename}`, data: Array.from(data) });
		};
		const saveText = async (filename: string, text: string) => {
			await invoke("write_file_abs", { path: `${rcamAbs}${nativeSep}${filename}`, data: Array.from(new TextEncoder().encode(text)) });
		};
		// 1. PDF
		const data = buildFillData();
		let pdfPath = "";
		if (data) {
			const pdfBytes = await fillFormRemb(data, currentLocale.value);
			const pdfFilename = `RCAM_DRS_${dateStr}.pdf`;
			await saveFile(pdfFilename, pdfBytes);
			pdfPath = `${rcamAbs}${nativeSep}${pdfFilename}`;
		}
		// 2. CSV
		const csvFilename = `RCAM_${meilleureFenetre.value.startDate}_${meilleureFenetre.value.endDate}.csv`;
		await saveText(csvFilename, genererCSVContent(facturesMeilleureTriees.value));
		// 3. Email
		const expediteur = `${profilState.prenomAffilie} ${profilState.nomAffilie}`.trim();
		const corpsLignes = [t("email.salutation"), "", t("email.body_line1"), "", t("email.body_line2", { lang: currentLocale.value.toUpperCase() }), "", t("email.body_line3"), "", t("email.closing"), expediteur || "…"];
		const sujet = t("email.subject");
		if (os === "macos") {
			const asBody = corpsLignes.map(l => `"${l.replace(/"/g, "'")}"`).join(" & return & ");
			const pdfPathEscaped = pdfPath.replace(/"/g, '\\"');
			const scriptLines = [`tell application "Mail"`, `  set theMsg to make new outgoing message with properties {subject:"${sujet}", content:${asBody}, visible:true}`, `  tell theMsg`, `    make new to recipient at end of to recipients with properties {address:"PMO-RCAM@ec.europa.eu"}`];
			if (pdfPath) scriptLines.push(`    make new attachment with properties {file name:POSIX file "${pdfPathEscaped}"} at after last paragraph`);
			scriptLines.push(`  end tell`, `  activate`, `end tell`);
			const scriptFilename = `rcam_mail_${dateStr}.applescript`;
			await saveText(scriptFilename, scriptLines.join("\n"));
			const scriptPath = `${rcamAbs}/${scriptFilename}`;
			const scriptEscaped = scriptPath.replace(/'/g, "'\\''");
			await Command.create("exec-sh", ["-c", `osascript '${scriptEscaped}'`]).execute();
			try { await invoke("remove_file_abs", { path: scriptPath }); } catch {}
		} else {
			const psEsc = (s: string) => s.replace(/`/g, "``").replace(/"/g, '`"').replace(/\$/g, '`$');
			const bodyPs = corpsLignes.map(psEsc).join("`n");
			const pdfPathWin = pdfPath.replace(/\//g, "\\");
			const psLines = [`$OutputEncoding = [System.Text.UTF8Encoding]::new()`, `[Console]::OutputEncoding = [System.Text.Encoding]::UTF8`, `$to = "PMO-RCAM@ec.europa.eu"`, `$subject = "${psEsc(sujet)}"`, `$body = "${bodyPs}"`, `$attachment = "${pdfPathWin}"`, `try {`, `  $ol = New-Object -ComObject Outlook.Application`, `  $mail = $ol.CreateItem(0)`, `  $mail.To = $to`, `  $mail.Subject = $subject`, `  $mail.Body = $body`, `  if ($attachment -and (Test-Path $attachment)) { $mail.Attachments.Add($attachment) | Out-Null }`, `  $mail.Display()`, `} catch {`, `  $uri = "mailto:" + $to + "?subject=" + [uri]::EscapeDataString($subject)`, `  Start-Process $uri`, `}`].join("\r\n");
			const psFilename = `rcam_mail_${dateStr}.ps1`;
			await saveText(psFilename, `﻿${psLines}`);
			const psPath = `${rcamAbs}\\${psFilename}`;
			await Command.create("exec-ps", ["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-File", psPath]).execute();
			try { await invoke("remove_file_abs", { path: `${rcamAbs}\\${psFilename}` }); } catch {}
		}
		// 4. Marquer soumis
		const soumissionId = new Date().toISOString();
		await marquerSoumis(meilleureFenetre.value.factures.map(f => f.id!), true, soumissionId);
		await load();
		soumissionModalOpen.value = false;
		toast.add({ title: "Dossier envoyé !", description: "PDF et CSV enregistrés. Vérifiez votre messagerie.", color: "success" });
	} catch (e) {
		toast.add({ title: t("toast.error"), description: String(e), color: "error" });
	} finally { soumettant.value = false; }
};

onMounted(load);
</script>
