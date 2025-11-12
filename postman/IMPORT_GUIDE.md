# 📮 Guide d'importation Postman

## 🎯 Fichiers à importer

Dans le dossier `postman/`, vous trouverez :

1. **File-Service-API.postman_collection.json** - Collection complète avec tous les endpoints
2. **File-Service-Local.postman_environment.json** - Environnement pour tests locaux
3. **File-Service-Production.postman_environment.json** - Environnement pour production

---

## 📥 Étapes d'importation

### 1. Importer la collection

1. Ouvrez **Postman Desktop** ou **Postman Web**
2. Cliquez sur le bouton **"Import"** en haut à gauche
3. Faites glisser le fichier `File-Service-API.postman_collection.json` ou cliquez sur **"Choose Files"**
4. Cliquez sur **"Import"**
5. ✅ La collection "File-Service API" apparaît dans votre workspace

### 2. Importer les environnements

1. Cliquez sur **"Import"** à nouveau
2. Sélectionnez les deux fichiers d'environnement :
   - `File-Service-Local.postman_environment.json`
   - `File-Service-Production.postman_environment.json`
3. Cliquez sur **"Import"**
4. ✅ Les environnements apparaissent dans le menu déroulant en haut à droite

### 3. Sélectionner l'environnement

1. Cliquez sur le menu déroulant en haut à droite (où est écrit "No Environment")
2. Sélectionnez **"File-Service Local"** pour vos tests locaux
3. ✅ L'environnement est actif (vous verrez un ✓ vert)

---

## 🚀 Premier test

### Étape 1 : Authentification

1. Dans la collection, ouvrez **"Authentication" → "Sign Up / Login"**
2. Vérifiez le body JSON :
   ```json
   {
     "username": "johndoe",
     "password": "strongpassword123"
   }
   ```
3. Cliquez sur **"Send"**
4. ✅ Le token JWT est automatiquement sauvegardé dans `{{jwt_token}}`

### Étape 2 : Upload d'un fichier

1. Ouvrez **"Files" → "Upload File"**
2. Dans l'onglet **"Body"**, sélectionnez un fichier :
   - Cliquez sur **"Select File"** dans le champ `file`
   - Choisissez un fichier sur votre ordinateur
3. Modifiez si nécessaire :
   - `project` : nom de votre bucket Supabase
   - `filepath` : chemin souhaité (ex: `documents/test.pdf`)
4. Cliquez sur **"Send"**
5. ✅ Le `filepath` est automatiquement sauvegardé pour les requêtes suivantes

### Étape 3 : Tester les autres endpoints

Toutes les requêtes suivantes utilisent automatiquement :

- Le token JWT (authentification)
- Les variables `project_name` et `filepath`

Testez dans l'ordre :

1. **Get File URL** - Récupère l'URL du fichier uploadé
2. **List All Projects** - Liste tous vos buckets
3. **List Files in Bucket** - Liste les fichiers du bucket
4. **Update File** - Met à jour le fichier
5. **Delete File** - Supprime le fichier

---

## 🔧 Configuration des variables

### Variables de collection (automatiques)

Ces variables sont **automatiquement mises à jour** :

- `jwt_token` : Rempli après login
- `filepath` : Rempli après upload

### Variables d'environnement (manuelles)

Vous pouvez modifier ces variables :

1. Cliquez sur l'icône 👁️ à côté du nom de l'environnement
2. Modifiez les valeurs :
   - `base_url` : URL de votre API (ex: `http://localhost:3000`)
   - `project_name` : Nom de votre bucket par défaut

---

## 🔄 Scripts automatiques inclus

### Script post-login (Sign Up / Login)

Sauvegarde automatiquement le token JWT :

```javascript
if (pm.response.code === 201 || pm.response.code === 200) {
  var jsonData = pm.response.json();
  if (jsonData.token) {
    pm.collectionVariables.set('jwt_token', jsonData.token);
    console.log('Token JWT sauvegardé:', jsonData.token);
  }
}
```

### Script post-upload (Upload File)

Sauvegarde automatiquement le filepath :

```javascript
if (pm.response.code === 201) {
  var jsonData = pm.response.json();
  if (jsonData.filepath) {
    pm.collectionVariables.set('filepath', jsonData.filepath);
    console.log('Filepath sauvegardé:', jsonData.filepath);
  }
}
```

---

## 🎨 Organisation de la collection

```
File-Service API
├── 🔐 Authentication
│   └── Sign Up / Login
├── 📁 Files
│   ├── Upload File
│   ├── Get File URL
│   ├── Update File
│   └── Delete File
└── 📂 Projects
    ├── List All Projects (Buckets)
    ├── List Files in Bucket
    └── List Files in Folder
```

---

## ⚙️ Paramètres avancés

### Activer/Désactiver la vérification SSL

Si vous testez en local avec HTTPS auto-signé :

1. Allez dans **Settings** (⚙️)
2. Onglet **General**
3. Désactivez **"SSL certificate verification"**

### Timeout des requêtes

1. Allez dans **Settings** (⚙️)
2. Onglet **General**
3. Modifiez **"Request timeout in ms"** (défaut: 0 = pas de timeout)

### Proxy

1. Allez dans **Settings** (⚙️)
2. Onglet **Proxy**
3. Configurez votre proxy si nécessaire

---

## 🔍 Déboguer les requêtes

### Console Postman

1. Ouvrez la console : **View → Show Postman Console** ou `Ctrl+Alt+C`
2. Vous verrez tous les logs de vos scripts et requêtes

### Logs personnalisés

Les scripts de la collection affichent déjà des logs :

- Token JWT après login
- Filepath après upload

### Voir les requêtes brutes

1. Cliquez sur **"Code"** sous le bouton Send
2. Sélectionnez le format (cURL, JavaScript, etc.)

---

## 🧪 Tests automatisés

### Exécuter toute la collection

1. Cliquez sur les trois points (⋯) à côté du nom de la collection
2. Sélectionnez **"Run collection"**
3. Configurez les options :
   - Nombre d'itérations
   - Délai entre les requêtes
   - Variables d'environnement
4. Cliquez sur **"Run File-Service API"**

### Tests via Newman (CLI)

```bash
# Installation
npm install -g newman

# Exécuter la collection
newman run postman/File-Service-API.postman_collection.json \
  -e postman/File-Service-Local.postman_environment.json

# Avec rapport HTML
newman run postman/File-Service-API.postman_collection.json \
  -e postman/File-Service-Local.postman_environment.json \
  --reporters cli,html \
  --reporter-html-export report.html
```

---

## 📤 Exporter / Partager

### Exporter la collection

1. Cliquez sur les trois points (⋯) à côté du nom de la collection
2. Sélectionnez **"Export"**
3. Choisissez **Collection v2.1** (recommandé)
4. Sauvegardez le fichier JSON

### Partager avec votre équipe

**Option 1 : Fichiers JSON (gratuit)**

- Partagez les fichiers du dossier `postman/` via Git

**Option 2 : Workspace Postman (gratuit pour équipes)**

- Créez un workspace d'équipe
- Invitez vos collaborateurs
- Partagez la collection directement

**Option 3 : API Postman**

- Publiez votre collection sur l'API Postman
- Générez un lien de partage public

---

## 🆘 Problèmes courants

### Le token n'est pas sauvegardé

**Solution :**

1. Vérifiez la réponse de `/user/signUp`
2. Ouvrez la Console Postman pour voir les logs
3. Vérifiez que le champ s'appelle bien `token` dans la réponse

### Les requêtes retournent 401 Unauthorized

**Solutions :**

1. Vérifiez que le token JWT est bien dans les variables
2. Cliquez sur 👁️ et vérifiez la valeur de `jwt_token`
3. Re-exécutez la requête de login
4. Vérifiez que l'authentification Bearer est activée

### Upload de fichier ne fonctionne pas

**Solutions :**

1. Vérifiez que le champ s'appelle bien `file` (pas `files`)
2. Vérifiez que le Content-Type est `multipart/form-data`
3. Vérifiez que le bucket existe dans Supabase
4. Vérifiez les permissions du bucket

### Variables non substituées ({{variable}} apparaît tel quel)

**Solutions :**

1. Vérifiez que l'environnement est bien sélectionné
2. Vérifiez l'orthographe de la variable
3. Cliquez sur 👁️ pour voir les variables disponibles

---

## 📚 Ressources

- [Documentation Postman](https://learning.postman.com/)
- [API Postman](https://www.postman.com/postman/workspace/postman-public-workspace/documentation)
- [Newman Documentation](https://learning.postman.com/docs/running-collections/using-newman-cli/command-line-integration-with-newman/)
- [Postman Variables](https://learning.postman.com/docs/sending-requests/variables/)

---

## ✅ Checklist

- [ ] Collection importée
- [ ] Environnements importés
- [ ] Environnement "Local" sélectionné
- [ ] Application démarrée (`yarn start:dev`)
- [ ] Requête de login testée avec succès
- [ ] Token JWT sauvegardé automatiquement
- [ ] Upload de fichier testé
- [ ] Filepath sauvegardé automatiquement
- [ ] Autres endpoints testés

---

**🎉 Félicitations ! Votre collection Postman est prête à l'emploi !**

Pour toute question, consultez le fichier `README.md` dans le dossier `postman/`.
