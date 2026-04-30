import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './blog.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller()
export class BlogController {
  constructor(private readonly service: BlogService) {}

  @Get('blog')
  async list() {
    return this.service.findAll();
  }

  @Get('blog/:slug')
  async getOne(@Param('slug') slug: string) {
    const p = await this.service.findBySlug(slug);
    if (!p) throw new NotFoundException('Post not found');
    return p;
  }

  @Get('share/blog/:slug')
  async ogPreview(@Param('slug') slug: string, @Res() res: Response) {
    const p = await this.service.findBySlug(slug);
    if (!p) throw new NotFoundException('Post not found');

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const articleUrl = `${frontendUrl}/blog/${p.slug}`;

    const esc = (s: string) =>
      s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const stripHtml = (html: string) =>
      html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200);

    const title = esc(p.title.fr || p.title.en);
    const description = esc(stripHtml(p.excerpt.fr || p.excerpt.en || p.body.fr || p.body.en));
    const image = esc(p.cover_image || '');
    const url = esc(articleUrl);

    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <title>${title} – AUDY COOK</title>
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="AUDY COOK" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:url" content="${url}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${image}" />
  <meta http-equiv="refresh" content="0;url=${url}" />
  <script>window.location.replace("${url}");</script>
</head>
<body>
  <p>Redirection vers <a href="${url}">${title}</a>…</p>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/blog')
  async create(@Body() dto: CreateBlogDto) {
    return this.service.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('admin/blog/:id')
  async update(@Param('id') id: string, @Body() dto: CreateBlogDto) {
    const u = await this.service.update(id, dto);
    if (!u) throw new NotFoundException('Post not found');
    return u;
  }

  @UseGuards(JwtAuthGuard)
  @Delete('admin/blog/:id')
  async remove(@Param('id') id: string) {
    const ok = await this.service.delete(id);
    if (!ok) throw new NotFoundException('Post not found');
    return { deleted: true };
  }
}
