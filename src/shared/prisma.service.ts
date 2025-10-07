import {
    Injectable,
    Logger,
    OnModuleDestroy,
    OnModuleInit,
  } from '@nestjs/common';
  import { PrismaClient } from '@prisma/client';
  import { ConfigService } from '@nestjs/config';
  
  @Injectable()
  export class PrismaService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy
  {
    private readonly logger = new Logger(PrismaService.name);
    private readonly maxRetries = 10;
    private readonly retryDelay = 2000; // 2 secondes
   
  
    constructor(private readonly configService : ConfigService) {
      super({
        errorFormat: 'pretty',
        log: ['warn', 'error', 'info', 'query'],
        datasources: {
          db: {
            url: configService.get<string>('DATABASE_URL') ?? "URL",
          },
        },
      });
    }
  
    async onModuleInit() {
      await this.connectWithRetry();
    }
  
    async onModuleDestroy() {
      try {
        await this.$disconnect();
        this.logger.log('Connexion à la base de données fermée avec succès');
      } catch (error) {
        this.logger.error(
          'Erreur lors de la fermeture de la connexion Prisma:',
          error,
        );
      }
    }
  
    /**
     * Tente de se connecter avec un mécanisme de retry
     */
    private async connectWithRetry(): Promise<void> {
      for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
        try {
          this.logger.log(
            `Tentative de connexion à la base de données (${attempt}/${this.maxRetries})`,
          );
          await this.$connect();
          this.logger.log('Connexion à la base de données établie avec succès');
          return;
        } catch (error) {
          this.logger.error(
            `Échec de la tentative ${attempt}/${this.maxRetries}:`,
            error.message,
          );
  
          if (attempt === this.maxRetries) {
            this.logger.error(
              'Nombre maximum de tentatives atteint. Impossible de se connecter à la base de données.',
            );
            throw new Error(
              `Impossible de se connecter à la base de données après ${this.maxRetries} tentatives: ${error.message}`,
            );
          }
  
          this.logger.log(`Nouvelle tentative dans ${this.retryDelay}ms...`);
          await this.delay(this.retryDelay);
        }
      }
    }
  
    /**
     * Délai asynchrone
     */
    private delay(ms: number): Promise<void> {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }
  
    /**
     * Vérifie si la connexion est active
     */
    async isConnected(): Promise<boolean> {
      try {
        await this.$queryRaw`SELECT 1`;
        return true;
      } catch (error) {
        this.logger.warn("La connexion à la base de données n'est pas active");
        return false;
      }
    }
  }
  