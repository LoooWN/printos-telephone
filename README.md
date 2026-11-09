# Prix plancher

Calculateur de négociation de PrintOS, à ajouter à l'écran d'accueil du téléphone.

La page ne contient **aucune donnée**. Elle lit la liste des prix (nom, prix affiché, prix plancher ; depuis PrintOS 2.16, aussi les réglages de coût) dans le gist
secret que PrintOS met à jour, dont l'adresse suit le `#` du lien donné par PrintOS (Réglages → Téléphone), et garde
la dernière liste reçue sur le téléphone.

- `index.html` : la page.
- `verdict.js` : la règle (accepter dès le plancher ; prix affiché déjà sous le plancher : tenir ce prix ; sinon contre-proposer le milieu entre l'offre et le prix affiché,
  arrondi à l'euro supérieur, jamais sous le plancher ni au-dessus du prix).
- `calcul.js` : le calculateur libre (PrintOS 2.16) — poids et durée tapés à la main → coût, prix conseillé, plancher,
  bénéfice et marge, avec le même calcul que `src/core/pricing.ts` de PrintOS et les réglages de coût envoyés dans le gist.
- Vérifier : `node --test` (les chiffres attendus du calculateur viennent de PrintOS).
