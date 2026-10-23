import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import { v2 as cloudinary } from 'cloudinary';
import { randomUUID } from 'node:crypto';
import { rm } from 'node:fs/promises';
import sharp from 'sharp';

const MAX_OUTPUT_BYTES = 150 * 1024;
const MAX_INPUT_PIXELS = 100_000_000;

@Injectable()
export class TeamCrestStorageService {
  constructor(
    private readonly config: ConfigService,
    private readonly logger: PinoLogger,
  ) {}

  async upload(file: Express.Multer.File): Promise<{ url: string }> {
    try {
      let metadata: Awaited<ReturnType<ReturnType<typeof sharp>['metadata']>>;
      try {
        metadata = await sharp(file.path, { limitInputPixels: MAX_INPUT_PIXELS }).metadata();
      } catch {
        throw new BadRequestException('No se pudo procesar la imagen. Usa un PNG o SVG válido.');
      }

      if (!metadata.width || !metadata.height || !['png', 'svg'].includes(metadata.format ?? '')) {
        throw new BadRequestException('El archivo debe ser una imagen PNG o SVG válida.');
      }

      let compressedImage: Buffer;
      try {
        compressedImage = await this.compress(file.path);
      } catch (error) {
        if (error instanceof BadRequestException) throw error;
        throw new BadRequestException('No se pudo procesar la imagen. Verifica sus dimensiones y formato.');
      }

      this.configureCloudinary();
      const result = await this.uploadToCloudinary(compressedImage);
      return { url: result };
    } finally {
      await rm(file.path, { force: true });
    }
  }

  private configureCloudinary(): void {
    const cloudinaryUrl = this.config.get<string>('CLOUDINARY_URL');
    if (!cloudinaryUrl) {
      throw new InternalServerErrorException('La integración de almacenamiento de imágenes no está configurada.');
    }

    let credentials: URL;
    try {
      credentials = new URL(cloudinaryUrl);
    } catch {
      throw new InternalServerErrorException('La URL de configuración de Cloudinary no es válida.');
    }

    const cloudName = credentials.hostname;
    const apiKey = decodeURIComponent(credentials.username);
    const apiSecret = decodeURIComponent(credentials.password);
    if (credentials.protocol !== 'cloudinary:' || !cloudName || !apiKey || !apiSecret) {
      throw new InternalServerErrorException('La URL de configuración de Cloudinary no es válida.');
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
  }

  private async compress(filePath: string): Promise<Buffer> {
    for (let dimension = 1024; dimension >= 32; dimension = Math.floor(dimension * 0.75)) {
      for (let quality = 80; quality >= 10; quality -= 10) {
        const output = await sharp(filePath, { limitInputPixels: MAX_INPUT_PIXELS })
          .rotate()
          .resize({ width: dimension, height: dimension, fit: 'inside', withoutEnlargement: true })
          .webp({ quality, effort: 5 })
          .toBuffer();

        if (output.length <= MAX_OUTPUT_BYTES) return output;
      }
    }

    throw new BadRequestException('No fue posible reducir el escudo al límite de 150 KB.');
  }

  private uploadToCloudinary(image: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'golliga/team-crests',
          public_id: randomUUID(),
          resource_type: 'image',
          format: 'webp',
        },
        (error, result) => {
          if (error || !result?.secure_url) {
            this.logger.error(
              { errorType: error?.name ?? 'CloudinaryUploadError' },
              'Cloudinary team crest upload failed',
            );
            reject(new BadGatewayException('No se pudo guardar el escudo en el almacenamiento de imágenes.'));
            return;
          }

          resolve(result.secure_url);
        },
      );

      stream.end(image);
    });
  }
}
