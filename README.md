## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```


Ce projet utilise [Orval](https://orval.dev/) pour générer automatiquement les types TypeScript et les hooks React Query à partir de la spécification OpenAPI (Swagger) de notre backend FastAPI.

### Prérequis

1. Copiez le fichier `.env.exemple` et renommez-le en `.env` à la racine de votre projet `front-end`.
2. Assurez-vous que votre backend FastAPI est en cours d'exécution localement sur le port `8000`. L'URL par défaut interrogée par la configuration est : `http://localhost:8000/openapi.json`.

Si le port ou l'URL de l'API est différent, vous pouvez le modifier dans le fichier `orval.config.ts` situé à la racine du ressource-frontend.

### Commandes

Pour regénérer le client API après avoir effectué des changements sur les routes du backend, lancez la commande suivante à la racine du projet `front-end` (avec votre backend allumé) :

```bash
pnpm run orval
# ou
npm run orval
# ou
yarn orval
```

Les hooks générés (`useQuery`, `useMutation`, etc.) ainsi que les modèles TypeScript se trouveront dans le dossier `api/`. Ils utiliseront **Axios** pour les requêtes HTTP.
