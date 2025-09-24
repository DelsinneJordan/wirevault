export function extFromMime(mime: string) {
  if (mime === 'application/pdf') return 'pdf'
  if (mime.startsWith('image/')) return mime.split('/')[1]
  return 'bin'
}
