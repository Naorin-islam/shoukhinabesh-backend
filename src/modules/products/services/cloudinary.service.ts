import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

/**
 * Cloudinary Service
 * Integrates Cloudinary cloud infrastructure to securely store multi-image craft galleries
 * via streamed buffer upload operations.
 */
@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME', 'my_luxury_cloud'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY', '123456789012345'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET', 'my_secret_cloudinary_key'),
    });
    this.logger.log('Cloudinary SDK initialized with custom brand repository settings');
  }

  /**
   * Upload single memory buffer file to Cloudinary with WebP optimization and folder tagging
   */
  async uploadImage(file: Express.Multer.File, folder = 'shoukhinabesh/products'): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          format: 'webp', // Convert automatically to modern WebP for extreme performance
          transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto:best' }],
        },
        (error, result: UploadApiResponse) => {
          if (error) {
            this.logger.error(`Cloudinary upload failed: ${error.message}`);
            return reject(new InternalServerErrorException('Failed to process and archive product image to Cloudinary'));
          }
          if (!result || !result.secure_url) {
            return reject(new InternalServerErrorException('No secure image URI returned by storage provider'));
          }
          resolve(result.secure_url);
        },
      );

      const stream = Readable.from(file.buffer);
      stream.pipe(uploadStream);
    });
  }

  /**
   * Concurrent batch uploading of product image arrays
   */
  async uploadMultipleImages(files: Express.Multer.File[], folder = 'shoukhinabesh/products'): Promise<string[]> {
    const uploadPromises = files.map(file => this.uploadImage(file, folder));
    return Promise.all(uploadPromises);
  }
}
