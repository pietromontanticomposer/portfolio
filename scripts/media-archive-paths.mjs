import path from 'path';

const ROOT = process.cwd();
const envArchiveRoot = process.env.PORTFOLIO_MEDIA_ARCHIVE_ROOT?.trim();

export const archiveRoot = envArchiveRoot
  ? path.resolve(envArchiveRoot)
  : path.resolve(ROOT, '..', 'media-archive', 'my-portfolio');

export const localDoneDir = path.join(ROOT, '_blob_done');
export const archiveDoneDir = path.join(archiveRoot, '_blob_done');
export const localUploadsBackupDir = path.join(ROOT, 'scripts', 'uploads-backup');
export const archiveUploadsBackupDir = path.join(archiveRoot, 'scripts', 'uploads-backup');

export function doneDirs() {
  return [localDoneDir, archiveDoneDir];
}
