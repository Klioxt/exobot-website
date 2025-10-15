# TODO: Implémenter la connexion réelle du dashboard au bot Discord

## Étape 1: Créer le serveur backend
- [ ] Créer package.json avec les dépendances (express, discord.js, axios, cors, dotenv)
- [ ] Créer server.js avec les endpoints OAuth2 et API Discord
- [ ] Configurer les variables d'environnement (.env)

## Étape 2: Implémenter l'OAuth2 sécurisé
- [ ] Endpoint /auth/discord pour initier l'OAuth
- [ ] Endpoint /auth/callback pour échanger le code contre un token
- [ ] Stocker les tokens de manière sécurisée

## Étape 3: API Discord intégration
- [ ] Endpoint /api/user pour récupérer les données utilisateur
- [ ] Endpoint /api/guilds pour récupérer les serveurs
- [ ] Endpoint /api/guild/:id pour les détails d'un serveur

## Étape 4: Persistance des paramètres
- [ ] Système de stockage des paramètres (JSON file ou base de données)
- [ ] Endpoints pour sauvegarder/charger les paramètres

## Étape 5: Modifier le frontend
- [ ] Modifier script.js pour appeler les vrais endpoints API
- [ ] Supprimer les fonctions simulées
- [ ] Ajouter gestion d'erreurs côté frontend

## Étape 6: Sécurité et CORS
- [ ] Configurer CORS pour permettre les requêtes du frontend
- [ ] Ajouter validation des tokens
- [ ] Gestion des erreurs et sécurité

## Étape 7: Test et déploiement
- [ ] Tester le flux OAuth complet
- [ ] Tester la récupération des données
- [ ] Déployer sur GitHub Pages (frontend) et serveur (si nécessaire)
- [ ] Mettre à jour les URLs dans le code si besoin

## Notes importantes
- Client ID Discord: 1423667743793746113
- Nécessite un client secret Discord (à configurer dans .env)
- Le backend devra tourner sur un serveur séparé du frontend statique
