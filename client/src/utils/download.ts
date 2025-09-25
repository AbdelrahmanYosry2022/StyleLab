export function downloadBlob(filename: string, mime: string, data: BlobPart) {
  const blob = new Blob([data], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function downloadText(filename: string, text: string, mime = 'text/plain;charset=utf-8') {
  downloadBlob(filename, mime, text);
}

export function downloadMany(files: { filename: string; mime: string; content: string }[]) {
  for (const file of files) {
    downloadText(file.filename, file.content, file.mime);
  }
}
