# Prix plancher

Calculateur de négociation de PrintOS, à ajouter à l'écran d'accueil du téléphone.

La page ne contient **aucune donnée**. Elle lit la liste des prix (nom, prix affiché, prix plancher) dans le gist
secret que PrintOS met à jour, dont l'adresse suit le `#` du lien donné par PrintOS (Réglages → Téléphone), et garde
la dernière liste reçue sur le téléphone.

- `index.html` : la page.
- `verdict.js` : la règle (accepter dès le plancher, sinon contre-proposer le milieu entre l'offre et le prix affiché,
  arrondi à l'euro supérieur, jamais sous le plancher ni au-dessus du prix).
- Vérifier la règle : `node --test`.
