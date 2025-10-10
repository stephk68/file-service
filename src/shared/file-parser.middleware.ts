import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import multer = require('multer');


@Injectable()
export class BodyParserMiddleware implements NestMiddleware {
  private readonly logger = new Logger(BodyParserMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    if (!req.is('multipart/form-data')) return next();
  
    const upload = multer().any();
    upload(req, res, (err) => {
      if (err) {
        this.logger.error('Failed to parse form data', err);
        return res.status(400).json({ error: 'Invalid form data' });
      }
  
      this.logger.log(`Parsed form data for ${req.method} ${req.url}: ${JSON.stringify(req.body)}`);
      next();
    });
  }
  
}

