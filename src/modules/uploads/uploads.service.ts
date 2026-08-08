import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

@Injectable()
export class UploadsService {
  constructor() {
    // Note: In production, configure Cloudinary via ConfigService / .env
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
      api_key: process.env.CLOUDINARY_API_KEY || '123456789012345',
      api_secret: process.env.CLOUDINARY_API_SECRET || 'secret',
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'shoukhinabesh',
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  async uploadMultipleFiles(files: Express.Multer.File[]): Promise<(UploadApiResponse | UploadApiErrorResponse)[]> {
    return Promise.all(files.map(file => this.uploadFile(file)));
  }
}
