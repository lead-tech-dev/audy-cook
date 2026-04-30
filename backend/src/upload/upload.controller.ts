import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { uuidv4 } from '../products/uuid';

const uploadDir = join(process.cwd(), 'uploads');
if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });

@Controller('admin/upload')
export class UploadController {
  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: uploadDir,
        filename: (_req, file, cb) => {
          cb(null, `${uuidv4()}${extname(file.originalname).toLowerCase()}`);
        },
      }),
      limits: { fileSize: 8 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          cb(new BadRequestException('Seules les images sont acceptées'), false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Aucun fichier reçu');
    const base = process.env.BACKEND_PUBLIC_URL || `http://localhost:${process.env.PORT || 8001}`;
    return { url: `${base}/uploads/${file.filename}` };
  }
}
