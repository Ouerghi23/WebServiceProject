# Plateforme de Profils pour Freelances

## 🔍 Contexte & Problématique

Actuellement, la gestion des profils freelances se fait de manière non centralisée (emails, WhatsApp...), ce qui entraîne :
- ❌ Perte d'informations importantes
- ❌ Difficile suivi des candidats
- ❌ Manque de structure pour les recruteurs

🎯 **Objectif** : Mettre en place une API Web permettant la gestion centralisée des profils freelances avec des fonctionnalités CRUD, recherche, et mise à jour de disponibilité.

---

## 🧩 Modèle de Données (Entités & Relations)

### 📄 Freelance
- `id` (UUID)
- `informations_personnelles` (nom, email, téléphone, localisation)
- `competences` (Liste de `Competence`)
- `liens_professionnels` (Liste de `Lien_Professionnel`)
- `tarifs_horaires`
- `disponibilite`
- `date_creation`, `date_modification`

### 🛠️ Competence
- `id`
- `nom`
- `niveau` (débutant, intermédiaire, expert)
- `certifications`

### 🔗 Lien_Professionnel
- `id`
- `type` (portfolio, social, repository)
- `url`
- `description`

---

## 🛠️ Fonctionnalités Web Service

| Fonction | Description |
|---------|-------------|
| `createFreelance()` | Crée un nouveau profil freelance |
| `getFreelance(id)` | Récupère les informations d’un freelance |
| `updateFreelance(id, data)` | Met à jour un profil existant |
| `deleteFreelance(id)` | Supprime un profil |
| `searchFreelances(filters)` | Recherche des freelances selon des filtres (compétences, localisation, etc.) |
| `addSkill(freelanceId, skill)` | Ajoute une compétence à un profil |
| `updateAvailability(freelanceId, availability)` | Met à jour la disponibilité |

---

## 🏗️ Architecture Recommandée

**🔧 GraphQL**  
- Permet des requêtes ciblées sur des structures complexes (ex : récupérer seulement les compétences et le tarif d’un freelance)
- Flexibilité et performance dans l’exploration des profils

---

## 📦 Structure Projet (suggestion)
freelance-platform/
├── src/
│ ├── schema/ # Définition GraphQL (types, mutations, queries)
│ ├── resolvers/ # Logique des requêtes/mutations
│ ├── models/ # Modèles de données (ORM ou objets JS)
│ ├── services/ # Services métiers
│ └── validators/ # Validation des entrées
├── tests/ # Tests unitaires
├── docs/ # Documentation API
└── README.md


---

## 💡 Technologies Suggérées

- **GraphQL Server** : Apollo Server / GraphQL.js
- **Base de données** : PostgreSQL (ou SQLite pour tests)
- **ORM** : Prisma / Sequelize / TypeORM
- **Validation** : Joi, Yup, ou built-in GraphQL scalars
- **Tests** : Jest ou Mocha

---

## ✅ Critères de Qualité

1. **Validation rigoureuse** des champs à l’entrée
2. **Gestion des erreurs** cohérente et informative
3. **Filtres dynamiques** sur la recherche de profils
4. **Logs & debugs** bien structurés
5. **Sécurité de base** (rate-limiting, validation, CORS)

---

## 📄 Exemples d’Utilisation (GraphQL)

### 🔍 Query : Rechercher des freelances par compétence

```graphql
query {
  searchFreelances(filter: { competence: "Node.js" }) {
    nom
    competences {
      nom
      niveau
    }
    disponibilite
  }
}
### ➕ Mutation : Ajouter un profil

mutation {
  createFreelance(input: {
    nom: "Chaima Ouerghi"
    email: "chaima@example.com"
    localisation: "Tunis"
    competences: [
      { nom: "Angular", niveau: "expert" }
    ]
    disponibilite: "Temps plein"
  }) {
    id
    nom
  }
}


