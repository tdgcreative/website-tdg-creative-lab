import fs from 'node:fs/promises';
import path from 'node:path';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

function parseJsonBody(req: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf-8');
        resolve(raw ? JSON.parse(raw) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res: any, status: number, payload: any) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

async function syncMarkdownFiles(rootDir: string, blogData: any) {
  try {
    const idDir = path.join(rootDir, 'src/content/blog/id');
    const enDir = path.join(rootDir, 'src/content/blog/en');
    await fs.mkdir(idDir, { recursive: true });
    await fs.mkdir(enDir, { recursive: true });

    for (const article of blogData.articles || []) {
      if (article.id_lang?.slug) {
        const idMd = `---
title: ${JSON.stringify(article.id_lang.title || '')}
seoTitle: ${JSON.stringify(article.id_lang.seoTitle || '')}
seoDescription: ${JSON.stringify(article.id_lang.seoDescription || '')}
focusKeyword: ${JSON.stringify(article.id_lang.focusKeyword || '')}
excerpt: ${JSON.stringify(article.id_lang.excerpt || '')}
category: ${JSON.stringify(article.category || '')}
coverImage: ${JSON.stringify(article.coverImage || '')}
coverAlt: ${JSON.stringify(article.id_lang.coverAlt || '')}
author: ${JSON.stringify(article.author || 'The Digital Grounds Team')}
publishedAt: ${JSON.stringify(article.publishedAt || '')}
updatedAt: ${JSON.stringify(article.updatedAt || '')}
status: ${JSON.stringify(article.status || 'published')}
translationSlug: ${JSON.stringify(article.en_lang?.slug || '')}
tags: ${JSON.stringify(article.id_lang.tags || [])}
---

${article.id_lang.content || ''}
`;
        await fs.writeFile(path.join(idDir, `${article.id_lang.slug}.md`), idMd, 'utf-8');
      }

      if (article.en_lang?.slug) {
        const enMd = `---
title: ${JSON.stringify(article.en_lang.title || '')}
seoTitle: ${JSON.stringify(article.en_lang.seoTitle || '')}
seoDescription: ${JSON.stringify(article.en_lang.seoDescription || '')}
focusKeyword: ${JSON.stringify(article.en_lang.focusKeyword || '')}
excerpt: ${JSON.stringify(article.en_lang.excerpt || '')}
category: ${JSON.stringify(article.category || '')}
coverImage: ${JSON.stringify(article.coverImage || '')}
coverAlt: ${JSON.stringify(article.en_lang.coverAlt || '')}
author: ${JSON.stringify(article.author || 'The Digital Grounds Team')}
publishedAt: ${JSON.stringify(article.publishedAt || '')}
updatedAt: ${JSON.stringify(article.updatedAt || '')}
status: ${JSON.stringify(article.status || 'published')}
translationSlug: ${JSON.stringify(article.id_lang?.slug || '')}
tags: ${JSON.stringify(article.en_lang.tags || [])}
---

${article.en_lang.content || ''}
`;
        await fs.writeFile(path.join(enDir, `${article.en_lang.slug}.md`), enMd, 'utf-8');
      }
    }
  } catch (err) {
    console.warn('Warning syncing markdown files:', err);
  }
}

export function tdgAdminVitePlugin() {
  return {
    name: 'tdg-admin-cms-api',
    configureServer(server: any) {
      const rootDir = process.cwd();

      server.middlewares.use('/api/admin', async (req: any, res: any, next: any) => {
        const url = (req.url || '/').split('?')[0];

        try {
          if (req.method === 'GET' && url === '/state') {
            const [homeRaw, portfoliosRaw, blogRaw] = await Promise.all([
              fs.readFile(path.join(rootDir, 'src/data/home.json'), 'utf-8'),
              fs.readFile(path.join(rootDir, 'src/data/portfolios.json'), 'utf-8'),
              fs.readFile(path.join(rootDir, 'src/data/blog.json'), 'utf-8'),
            ]);
            return sendJson(res, 200, {
              ok: true,
              mode: 'local',
              home: JSON.parse(homeRaw),
              portfolios: JSON.parse(portfoliosRaw),
              blog: JSON.parse(blogRaw),
            });
          }

          if (req.method === 'POST' && url === '/home') {
            const body = await parseJsonBody(req);
            const targetPath = path.join(rootDir, 'src/data/home.json');
            await fs.writeFile(targetPath, JSON.stringify(body, null, 2) + '\n', 'utf-8');
            return sendJson(res, 200, { ok: true, message: 'Data Home berhasil disimpan ke src/data/home.json' });
          }

          if (req.method === 'POST' && url === '/portfolios') {
            const body = await parseJsonBody(req);
            const targetPath = path.join(rootDir, 'src/data/portfolios.json');
            await fs.writeFile(targetPath, JSON.stringify(body, null, 2) + '\n', 'utf-8');
            return sendJson(res, 200, { ok: true, message: 'Data Portofolio berhasil disimpan ke src/data/portfolios.json' });
          }

          if (req.method === 'POST' && url === '/blog') {
            const body = await parseJsonBody(req);
            const targetPath = path.join(rootDir, 'src/data/blog.json');
            await fs.writeFile(targetPath, JSON.stringify(body, null, 2) + '\n', 'utf-8');
            await syncMarkdownFiles(rootDir, body);
            return sendJson(res, 200, { ok: true, message: 'Artikel Blog berhasil disimpan & disinkronkan ke Markdown' });
          }

          if (req.method === 'POST' && url === '/upload') {
            const body = await parseJsonBody(req);
            const { filename, folder = 'portfolio', dataUrl } = body;
            if (!filename || !dataUrl) {
              return sendJson(res, 400, { ok: false, error: 'Filename dan dataUrl wajib diisi' });
            }

            const safeName = filename
              .toLowerCase()
              .replace(/[^a-z0-9._-]/g, '-')
              .replace(/-+/g, '-');

            const folderMap: Record<string, string> = {
              portfolio: 'public/images/portfolio',
              logos: 'public/images/logos',
              blog: 'public/images/blog',
              videos: 'public/videos',
              docs: 'public/docs',
            };

            const relDir = folderMap[folder] || 'public/images/portfolio';
            const absDir = path.join(rootDir, relDir);
            await fs.mkdir(absDir, { recursive: true });

            const base64Data = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
            const buffer = Buffer.from(base64Data, 'base64');
            const absFile = path.join(absDir, safeName);
            await fs.writeFile(absFile, buffer);

            const publicUrl = '/' + relDir.replace(/^public\//, '') + '/' + safeName;
            return sendJson(res, 200, { ok: true, url: publicUrl, filename: safeName });
          }

          if (req.method === 'POST' && url === '/git-sync') {
            const body = await parseJsonBody(req);
            const commitMsg = body.message || 'chore(cms): update website content via TDG Admin';
            try {
              await execAsync('git add src/data public src/content', { cwd: rootDir });
              const { stdout: statusOut } = await execAsync('git status --porcelain', { cwd: rootDir });
              if (!statusOut.trim()) {
                return sendJson(res, 200, { ok: true, message: 'Tidak ada perubahan baru untuk di-commit (sudah up-to-date).' });
              }
              await execAsync(`git commit -m ${JSON.stringify(commitMsg)}`, { cwd: rootDir });
              await execAsync('git push origin main', { cwd: rootDir });
              return sendJson(res, 200, { ok: true, message: 'Berhasil commit & push ke GitHub (tdgcreative/website-tdg-creative-lab)!' });
            } catch (gitErr: any) {
              return sendJson(res, 500, {
                ok: false,
                error: gitErr?.stderr || gitErr?.message || 'Gagal menjalankan git push',
              });
            }
          }

          next();
        } catch (err: any) {
          sendJson(res, 500, { ok: false, error: err?.message || 'Internal Server Error' });
        }
      });
    },
  };
}

