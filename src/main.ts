// main.ts
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuration Swagger avec authentification JWT
  const config = new DocumentBuilder()
    .setTitle('File-Service API')
    .setDescription(
      'API de gestion de fichiers avec stockage Supabase et authentification JWT',
    )
    .setVersion('1.6')
    .addTag(
      'user',
      'Endpoints pour la gestion des utilisateurs et authentification',
    )
    .addTag('file', 'Endpoints pour la gestion des fichiers')
    .addTag('project', 'Endpoints pour la gestion des projets/buckets')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Entrez votre token JWT',
        in: 'header',
      },
      'JWT-auth', // Ce nom sera utilisé dans les décorateurs @ApiBearerAuth()
    )
    .addServer('http://localhost:3000', 'Serveur de développement')
    .addServer('https://api.example.com', 'Serveur de production')
    .build();

  // Generate the Swagger document
  const document = SwaggerModule.createDocument(app, config);

  // Setup Swagger UI
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // Garde le token après rafraîchissement
      docExpansion: 'none', // Collapse tous les endpoints par défaut
      filter: true, // Active la barre de recherche
      showRequestDuration: true, // Affiche la durée des requêtes
    },
    customSiteTitle: 'File-Service API Documentation',
  });

  app.useGlobalPipes(new ValidationPipe());
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Application démarrée sur http://localhost:${port}`);
  console.log(
    `📚 Documentation Swagger disponible sur http://localhost:${port}/api`,
  );
}
bootstrap();
