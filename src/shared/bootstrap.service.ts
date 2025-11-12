import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { RedisService } from './redis.service';

/**
 * Service Bootstrap pour initialiser les données par défaut dans Redis
 * au démarrage de l'application
 */
@Injectable()
export class BootstrapService implements OnModuleInit {
  private readonly logger = new Logger(BootstrapService.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    this.logger.log("🚀 Démarrage de l'initialisation Bootstrap...");

    try {
      // Attendre que Redis soit connecté
      await this.waitForRedis();

      // Initialiser les credentials par défaut
      await this.initializeDefaultCredentials();

      // Initialiser d'autres données par défaut si nécessaire
      await this.initializeDefaultSettings();

      this.logger.log('✅ Bootstrap terminé avec succès');
    } catch (error) {
      this.logger.error('❌ Erreur lors du Bootstrap:', error.message);
      throw error;
    }
  }

  /**
   * Attendre que Redis soit connecté
   */
  private async waitForRedis(maxRetries = 10): Promise<void> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        await this.redisService.client.ping();
        this.logger.log('✅ Redis est connecté et prêt');
        return;
      } catch (error) {
        if (i < maxRetries - 1) {
          this.logger.warn(
            `⏳ Attente de Redis... (tentative ${i + 1}/${maxRetries})`,
          );
          await this.sleep(1000); // Attendre 1 seconde
        } else {
          throw new Error(
            "Redis n'est pas disponible après plusieurs tentatives",
          );
        }
      }
    }
  }

  /**
   * Initialiser les credentials par défaut dans Redis
   */
  private async initializeDefaultCredentials(): Promise<void> {
    this.logger.log('📝 Initialisation des credentials par défaut...');

    const credentialsKey = 'credentials';

    // Vérifier si les credentials existent déjà
    const exists = await this.redisService.client.exists(credentialsKey);

    if (exists) {
      this.logger.log('ℹ️  Les credentials existent déjà, ignoré');
      return;
    }

    // Hasher le mot de passe par défaut
    const hashedPassword = await bcrypt.hash(
      process.env.DEFAULT_ADMIN_PASSWORD || 'SDIVD2025#',
      10,
    );

    // Créer l'objet credentials avec username et password
    const credentials = {
      username: process.env.DEFAULT_ADMIN_USERNAME || 'File-System',
      password: hashedPassword,
    };

    // Stocker dans Redis en tant que JSON (pas en string)
    await this.redisService.client.json.set(credentialsKey, '$', credentials);

    this.logger.log(`✅ Credentials créés: ${credentials.username}`);
  }

  /**
   * Initialiser les paramètres par défaut de l'application
   */
  private async initializeDefaultSettings(): Promise<void> {
    this.logger.log('⚙️  Initialisation des paramètres par défaut...');

    const settingsKey = 'app:settings';
    const exists = await this.redisService.client.exists(settingsKey);

    if (exists) {
      this.logger.log('ℹ️  Les paramètres existent déjà, ignoré');
      return;
    }

    const defaultSettings = {
      appName: 'File-Service',
      version: this.configService.get('VERSION', '1.0.0'),
      defaultBucket: this.configService.get('DEFAULT_BUCKET', 'api-buckets'),
      maxFileSize: 50 * 1024 * 1024, // 50 MB
      allowedFileTypes: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
        'application/zip',
        'text/plain',
      ],
      features: {
        fileUpload: true,
        fileDelete: true,
        fileUpdate: true,
        autoCleanup: true,
      },
      initializedAt: new Date().toISOString(),
    };

    await this.redisService.client.json.set(settingsKey, '$', defaultSettings);

    this.logger.log('✅ Paramètres par défaut configurés');
  }

  /**
   * Utilitaire pour attendre un délai
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Méthode publique pour réinitialiser les credentials (utilisée en dev/test)
   */
  async resetDefaultCredentials(): Promise<void> {
    this.logger.warn('⚠️  RÉINITIALISATION des credentials par défaut...');

    // Supprimer les credentials existants
    await this.redisService.client.del('credentials');

    // Supprimer les paramètres
    await this.redisService.client.del('app:settings');

    // Réinitialiser
    await this.initializeDefaultCredentials();
    await this.initializeDefaultSettings();

    this.logger.log('✅ Réinitialisation terminée');
  }
}
