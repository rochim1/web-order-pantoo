import { cp, copyFile, mkdir, readdir, stat } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const buildDir = join(projectRoot, '.vite-build')
const publicDir = join(projectRoot, 'dist')

// aaPanel can place a protected .user.ini in dist. Vite must never empty that
// directory, so publish the staged build without deleting server-owned files.
const index = join(buildDir, 'index.html')
if (!(await stat(index).catch(() => null))?.isFile()) {
  throw new Error('Build tidak lengkap: .vite-build/index.html tidak ditemukan')
}

await mkdir(publicDir, { recursive: true })
for (const entry of await readdir(buildDir, { withFileTypes: true })) {
  if (entry.name === 'index.html' || entry.name === '.user.ini') continue
  await cp(join(buildDir, entry.name), join(publicDir, entry.name), {
    recursive: entry.isDirectory(),
    force: true
  })
}

// Publish index last so it only references assets that have been copied.
await copyFile(index, join(publicDir, 'index.html'))
console.log('Web Order siap di dist/; .user.ini dan aset rilis lama tetap aman.')
