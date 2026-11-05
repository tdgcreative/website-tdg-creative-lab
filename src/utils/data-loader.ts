import fs from 'node:fs';
import path from 'node:path';
import bundledHome from '../data/home.json';
import bundledPortfolios from '../data/portfolios.json';
import bundledBlog from '../data/blog.json';

export function loadHomeData(): typeof bundledHome {
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), 'src/data/home.json'), 'utf-8');
    return JSON.parse(raw);
  } catch {
    return bundledHome;
  }
}

export function loadPortfoliosData(): typeof bundledPortfolios {
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), 'src/data/portfolios.json'), 'utf-8');
    return JSON.parse(raw);
  } catch {
    return bundledPortfolios;
  }
}

export function loadBlogData(): typeof bundledBlog {
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), 'src/data/blog.json'), 'utf-8');
    return JSON.parse(raw);
  } catch {
    return bundledBlog;
  }
}

