import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
await mkdir('dist', { recursive: true });
for (const path of ['index.html', 'about.html', 'contacts.html', 'assets', 'css', 'js']) {
  await cp(path, `dist/${path}`, { recursive: true });
}
const html = await readFile('dist/index.html', 'utf8');
await writeFile('dist/index.html', html.replace('https://georgiy-treyger-site.vercel.app/api/intake', '/api/intake'));
