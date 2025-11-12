# 🚀 Scripts pour la documentation API

## Script pour exporter la spécification OpenAPI

Ce script permet d'exporter automatiquement la spécification OpenAPI depuis Swagger.

### Installation des dépendances supplémentaires (optionnel)

```bash
yarn add -D @nestjs/swagger swagger-ui-express
```

### Export manuel de la spécification OpenAPI

1. Démarrez l'application :

```bash
yarn start:dev
```

2. Accédez à l'URL suivante pour télécharger le JSON :

```
http://localhost:3000/api-json
```

### Script d'export automatique

Créez un script `scripts/export-openapi.ts` :

```typescript
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';
import * as fs from 'fs';

async function exportOpenApi() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('File-Service API')
    .setDescription('API de gestion de fichiers avec stockage Supabase')
    .setVersion('1.6')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Export en JSON
  fs.writeFileSync('./postman/openapi.json', JSON.stringify(document, null, 2));

  // Export en YAML (nécessite js-yaml)
  // const yaml = require('js-yaml');
  // fs.writeFileSync('./postman/openapi.yaml', yaml.dump(document));

  console.log('✅ OpenAPI spec exportée vers ./postman/openapi.json');
  await app.close();
}

exportOpenApi();
```

### Ajout du script dans package.json

```json
{
  "scripts": {
    "export:openapi": "ts-node scripts/export-openapi.ts"
  }
}
```

### Utilisation

```bash
yarn export:openapi
```

---

## Conversion OpenAPI vers Postman

### Méthode 1 : Via Postman UI

1. Ouvrez Postman
2. Cliquez sur **Import**
3. Sélectionnez l'onglet **Link**
4. Entrez : `http://localhost:3000/api-json`
5. Cliquez sur **Continue** puis **Import**

### Méthode 2 : Via CLI (nécessite Node.js)

```bash
# Installation de l'outil de conversion
npm install -g openapi-to-postmanv2

# Conversion
openapi2postmanv2 -s postman/openapi.json -o postman/generated-collection.json -p
```

---

## Génération automatique de la documentation

### Script de documentation complète

Créez `scripts/generate-docs.sh` :

```bash
#!/bin/bash

echo "🚀 Génération de la documentation API..."

# Démarrer l'application
yarn start:dev &
APP_PID=$!

# Attendre que l'application démarre
sleep 5

# Exporter l'OpenAPI spec
curl http://localhost:3000/api-json > postman/openapi.json

# Tuer l'application
kill $APP_PID

echo "✅ Documentation générée !"
```

### Pour Windows (PowerShell)

Créez `scripts/generate-docs.ps1` :

```powershell
Write-Host "🚀 Génération de la documentation API..." -ForegroundColor Green

# Démarrer l'application en arrière-plan
Start-Process -NoNewWindow -FilePath "yarn" -ArgumentList "start:dev"

# Attendre que l'application démarre
Start-Sleep -Seconds 5

# Exporter l'OpenAPI spec
Invoke-WebRequest -Uri "http://localhost:3000/api-json" -OutFile "postman/openapi.json"

# Arrêter l'application
Stop-Process -Name "node" -Force

Write-Host "✅ Documentation générée !" -ForegroundColor Green
```

---

## Tests automatisés de la documentation

### Newman (Postman CLI)

Installation :

```bash
npm install -g newman
```

Exécution des tests :

```bash
newman run postman/File-Service-API.postman_collection.json \
  -e postman/File-Service-Local.postman_environment.json \
  --reporters cli,json \
  --reporter-json-export postman/test-results.json
```

---

## Validation de la spécification OpenAPI

### Installation de l'outil de validation

```bash
npm install -g @stoplight/spectral-cli
```

### Validation

```bash
spectral lint postman/openapi.json
```

---

## CI/CD Integration

### GitHub Actions

Créez `.github/workflows/api-docs.yml` :

```yaml
name: API Documentation

on:
  push:
    branches: [main, develop]

jobs:
  generate-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: yarn install

      - name: Build application
        run: yarn build

      - name: Start application
        run: yarn start:prod &

      - name: Wait for app to start
        run: sleep 10

      - name: Export OpenAPI spec
        run: curl http://localhost:3000/api-json > openapi.json

      - name: Upload OpenAPI spec
        uses: actions/upload-artifact@v3
        with:
          name: openapi-spec
          path: openapi.json
```

---

## Hébergement de la documentation

### Option 1 : Swagger UI statique

```bash
# Installer swagger-ui-dist
yarn add swagger-ui-dist

# Copier les fichiers statiques
cp -r node_modules/swagger-ui-dist/. docs/swagger/

# Modifier docs/swagger/index.html pour pointer vers votre spec
```

### Option 2 : Redoc

```bash
# Installer Redoc CLI
npm install -g redoc-cli

# Générer la documentation HTML
redoc-cli bundle postman/openapi.json -o docs/api.html
```

### Option 3 : GitHub Pages

Hébergez automatiquement votre documentation sur GitHub Pages :

1. Générez la documentation HTML
2. Committez dans la branche `gh-pages`
3. Activez GitHub Pages dans les paramètres du repo

---

## Maintenance de la documentation

### Checklist avant chaque release

- [ ] Vérifier que tous les endpoints sont documentés
- [ ] Mettre à jour les exemples de requêtes/réponses
- [ ] Valider la spécification OpenAPI
- [ ] Tester la collection Postman
- [ ] Régénérer les fichiers exportés
- [ ] Mettre à jour le README si nécessaire
- [ ] Incrémenter le numéro de version

### Commandes utiles

```bash
# Linter le code
yarn lint

# Formater le code
yarn format

# Tester l'API
yarn test:e2e

# Build de production
yarn build
```

---

## Ressources supplémentaires

- [Documentation NestJS Swagger](https://docs.nestjs.com/openapi/introduction)
- [Spécification OpenAPI 3.0](https://swagger.io/specification/)
- [Documentation Postman](https://learning.postman.com/)
- [Newman Documentation](https://learning.postman.com/docs/running-collections/using-newman-cli/command-line-integration-with-newman/)
