# 📚 Documentation API File-Service

## 🎯 Vue d'ensemble

Cette documentation couvre l'API File-Service qui fournit des endpoints pour :

- **Authentification JWT** des utilisateurs
- **Gestion de fichiers** (upload, téléchargement, mise à jour, suppression)
- **Gestion de projets/buckets** Supabase

---

## 🚀 Démarrage rapide

### 1. Installation des dépendances

```bash
yarn install
```

### 2. Configuration

Créez un fichier `.env` à la racine du projet :

```env
PORT=3000
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
JWT_SECRET=your_jwt_secret
```

### 3. Lancer l'application

```bash
# Mode développement
yarn start:dev

# Mode production
yarn build
yarn start:prod
```

### 4. Accéder à la documentation

Une fois l'application démarrée, la documentation Swagger est disponible à :

**🌐 http://localhost:3000/api**

---

## 📖 Documentation Swagger

### Fonctionnalités Swagger UI

La documentation Swagger interactive vous permet de :

✅ **Tester tous les endpoints** directement depuis le navigateur  
✅ **Authentification JWT** intégrée (bouton "Authorize")  
✅ **Exemples de requêtes/réponses** pour chaque endpoint  
✅ **Validation automatique** des paramètres  
✅ **Téléchargement de la spécification OpenAPI** (JSON/YAML)

### Comment s'authentifier dans Swagger

1. Cliquez sur le bouton **"Authorize"** 🔒 en haut à droite
2. Appelez d'abord l'endpoint `POST /user/signUp` pour obtenir un token JWT
3. Copiez le token retourné
4. Dans la popup "Authorize", collez le token dans le champ "Value"
5. Cliquez sur **"Authorize"** puis **"Close"**
6. Tous vos appels suivants incluront automatiquement le token JWT

### Tags disponibles

- **👤 user** : Authentification et gestion des utilisateurs
- **📁 file** : Upload, mise à jour, suppression de fichiers
- **📂 project** : Gestion des buckets Supabase

---

## 📮 Collection Postman

### Importation de la collection

1. Ouvrez **Postman**
2. Cliquez sur **"Import"**
3. Sélectionnez les fichiers dans le dossier `postman/` :
   - `File-Service-API.postman_collection.json` (collection complète)
   - `File-Service-Local.postman_environment.json` (environnement local)
   - `File-Service-Production.postman_environment.json` (environnement production)

### Configuration de l'environnement

Sélectionnez l'environnement **"File-Service Local"** ou **"File-Service Production"** dans Postman.

Variables disponibles :

- `base_url` : URL de base de l'API (ex: http://localhost:3000)
- `jwt_token` : Token JWT (rempli automatiquement après login)
- `project_name` : Nom du bucket par défaut
- `filepath` : Chemin du fichier (rempli automatiquement après upload)

### Utilisation de la collection

#### 1. Authentification

```
POST /user/signUp
```

Exécutez cette requête en premier. Le token JWT sera automatiquement sauvegardé dans la variable `jwt_token`.

#### 2. Upload d'un fichier

```
POST /file
```

- Sélectionnez un fichier dans le champ `file`
- Le `filepath` sera automatiquement sauvegardé pour les autres requêtes

#### 3. Autres opérations

Toutes les autres requêtes utilisent automatiquement :

- Le token JWT pour l'authentification
- Les variables `project_name` et `filepath` sauvegardées

---

## 🔑 Endpoints disponibles

### Authentication

| Méthode | Endpoint       | Description               | Auth   |
| ------- | -------------- | ------------------------- | ------ |
| POST    | `/user/signUp` | Login/Sign up utilisateur | ❌ Non |

### Files

| Méthode | Endpoint | Description                  | Auth   |
| ------- | -------- | ---------------------------- | ------ |
| POST    | `/file`  | Upload un fichier            | ✅ JWT |
| GET     | `/file`  | Récupérer l'URL d'un fichier | ✅ JWT |
| PATCH   | `/file`  | Mettre à jour un fichier     | ✅ JWT |
| DELETE  | `/file`  | Supprimer un fichier         | ✅ JWT |

### Projects

| Méthode | Endpoint                      | Description                      | Auth   |
| ------- | ----------------------------- | -------------------------------- | ------ |
| GET     | `/project`                    | Lister tous les buckets          | ✅ JWT |
| GET     | `/project/:bucketName`        | Lister les fichiers d'un bucket  | ✅ JWT |
| GET     | `/project/:bucketName/folder` | Lister les fichiers d'un dossier | ✅ JWT |

---

## 🔐 Authentification JWT

### Format du token

Tous les endpoints protégés nécessitent un header Authorization :

```
Authorization: Bearer <votre_token_jwt>
```

### Obtenir un token

```bash
POST /user/signUp
Content-Type: application/json

{
  "username": "johndoe",
  "password": "strongpassword123"
}
```

Réponse :

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123",
    "username": "johndoe"
  }
}
```

---

## 📤 Exemples d'utilisation

### 1. Upload d'un fichier

```bash
POST /file
Content-Type: multipart/form-data
Authorization: Bearer <token>

file: [binary]
project: my-project-bucket
filepath: documents/report.pdf
```

Réponse :

```json
{
  "url": "https://cdn.example.com/my-project-bucket/documents/report.pdf",
  "filename": "report.pdf",
  "filepath": "documents/report.pdf",
  "mimetype": "application/pdf",
  "size": 102400
}
```

### 2. Récupérer l'URL d'un fichier

```bash
GET /file?filepath=documents/report.pdf&project=my-project-bucket
Authorization: Bearer <token>
```

Réponse :

```json
{
  "url": "https://cdn.example.com/my-project-bucket/documents/report.pdf"
}
```

### 3. Lister les fichiers d'un projet

```bash
GET /project/my-project-bucket
Authorization: Bearer <token>
```

### 4. Supprimer un fichier

```bash
DELETE /file
Content-Type: application/json
Authorization: Bearer <token>

{
  "filepath": "documents/report.pdf",
  "project": "my-project-bucket"
}
```

Réponse :

```json
{
  "success": true,
  "message": "File deleted from my-project-bucket/documents/report.pdf"
}
```

---

## 🛠️ Formats de fichiers supportés

L'API supporte tous les types de fichiers. Les formats courants incluent :

- **Documents** : PDF, DOCX, TXT, MD
- **Images** : JPG, PNG, GIF, SVG, WEBP
- **Vidéos** : MP4, AVI, MOV
- **Audio** : MP3, WAV, OGG
- **Archives** : ZIP, RAR, TAR

---

## ⚙️ Configuration avancée Swagger

### Personnalisation

Dans `src/main.ts`, vous pouvez personnaliser :

```typescript
const config = new DocumentBuilder()
  .setTitle('Votre Titre')
  .setDescription('Votre Description')
  .setVersion('2.0')
  .addTag('votre-tag', 'Description du tag')
  .addServer('https://votre-serveur.com', 'Description')
  .build();
```

### Options Swagger UI

```typescript
SwaggerModule.setup('api', app, document, {
  swaggerOptions: {
    persistAuthorization: true, // Garde le token après refresh
    docExpansion: 'none', // Collapse les endpoints
    filter: true, // Active la recherche
    showRequestDuration: true, // Affiche la durée
  },
});
```

---

## 🧪 Tests

### Avec Swagger UI

1. Accédez à http://localhost:3000/api
2. Authentifiez-vous avec le bouton "Authorize"
3. Testez chaque endpoint directement dans l'interface

### Avec Postman

1. Importez la collection `File-Service-API.postman_collection.json`
2. Sélectionnez l'environnement "File-Service Local"
3. Exécutez les requêtes dans l'ordre suggéré

### Avec cURL

```bash
# Login
curl -X POST http://localhost:3000/user/signUp \
  -H "Content-Type: application/json" \
  -d '{"username":"johndoe","password":"strongpassword123"}'

# Upload
curl -X POST http://localhost:3000/file \
  -H "Authorization: Bearer <token>" \
  -F "file=@/path/to/file.pdf" \
  -F "project=my-project-bucket" \
  -F "filepath=documents/file.pdf"
```

---

## 📝 Scripts disponibles

```bash
# Développement
yarn start:dev          # Lance le serveur en mode watch

# Production
yarn build              # Compile le projet
yarn start:prod         # Lance le serveur compilé

# Tests
yarn test               # Lance les tests unitaires
yarn test:e2e           # Lance les tests end-to-end
yarn test:cov           # Génère le rapport de couverture

# Qualité du code
yarn lint               # Vérifie le code avec ESLint
yarn format             # Formate le code avec Prettier
```

---

## 🐛 Dépannage

### Swagger ne s'affiche pas

1. Vérifiez que l'application est démarrée : http://localhost:3000/api
2. Vérifiez les logs de la console
3. Nettoyez le cache du navigateur

### Token JWT expiré

1. Réexécutez `POST /user/signUp` pour obtenir un nouveau token
2. Mettez à jour le token dans Swagger (bouton "Authorize")
3. Dans Postman, le token sera automatiquement mis à jour

### Erreur d'upload de fichier

1. Vérifiez que le bucket existe dans Supabase
2. Vérifiez les permissions du bucket
3. Vérifiez la taille maximale autorisée

---

## 📞 Support

Pour toute question ou problème :

- 📧 Email : support@example.com
- 🐛 Issues : [GitHub Issues](https://github.com/votre-repo/issues)
- 📖 Documentation complète : http://localhost:3000/api

---

## 📄 Licence

UNLICENSED - Usage interne uniquement
