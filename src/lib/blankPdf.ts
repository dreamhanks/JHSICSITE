/* =============================================================
   Minimal single-page A4 PDF, assembled byte-by-byte at runtime.

   Kept here rather than inline in the click handler so the byte
   layout is documented in one place. No package, no server call,
   no committed binary.

   A PDF is four objects plus a cross-reference table:

     1  Catalog  — the document root, points at the page tree
     2  Pages    — the page tree, one kid
     3  Page     — MediaBox 0 0 595 842, i.e. A4 at 72dpi
     xref        — byte offset of every object, so a reader can
                   seek directly instead of scanning
     trailer     — Size and Root, then startxref, then %%EOF

   The offsets in the xref MUST be exact byte counts from the
   start of the file, which is why the string is built in order
   and each offset recorded as it goes rather than hardcoded.
   Every xref entry is exactly 20 bytes ("nnnnnnnnnn ggggg n \n")
   — readers rely on that fixed width.

   THE PAGE IS DELIBERATELY BLANK. Drawing 「モックアップ用サンプル
   （内容なし）」 would need a CJK font: the 14 standard PDF fonts are
   Latin-only, and a predefined Adobe-Japan1 CMap only works if the
   reader already has a matching font installed. Embedding a real
   Japanese face would add megabytes to every download for one line
   of text, so the page carries no content stream at all.
   ============================================================= */

/** A4 at 72dpi, in PDF points. */
const A4_WIDTH = 595
const A4_HEIGHT = 842

export function blankPdfBytes(): Uint8Array<ArrayBuffer> {
  const objects = [
    '<</Type/Catalog/Pages 2 0 R>>',
    '<</Type/Pages/Kids[3 0 R]/Count 1>>',
    `<</Type/Page/Parent 2 0 R/MediaBox[0 0 ${A4_WIDTH} ${A4_HEIGHT}]/Resources<<>>>>`,
  ]

  let pdf = '%PDF-1.4\n'
  const offsets: number[] = []
  objects.forEach((body, i) => {
    offsets.push(pdf.length)
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`
  })

  const startxref = pdf.length
  const size = objects.length + 1 // +1 for the mandatory free entry 0
  pdf += `xref\n0 ${size}\n`
  pdf += '0000000000 65535 f \n'
  for (const offset of offsets) {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`
  }
  pdf += `trailer\n<</Size ${size}/Root 1 0 R>>\nstartxref\n${startxref}\n%%EOF\n`

  // Every byte above is ASCII, so char index === byte index and the
  // recorded offsets stay valid without a TextEncoder round trip.
  // Backed by an explicit ArrayBuffer so the result is a BlobPart:
  // a bare `new Uint8Array(n)` widens to ArrayBufferLike, which
  // admits SharedArrayBuffer and is rejected by the Blob signature.
  const bytes = new Uint8Array(new ArrayBuffer(pdf.length))
  for (let i = 0; i < pdf.length; i++) bytes[i] = pdf.charCodeAt(i)
  return bytes
}

/** Document label -> download filename.
 *
 *  Strips the characters Windows and POSIX both reject in a filename
 *  and collapses runs of whitespace. Japanese characters are kept: they
 *  are legal on every target filesystem and the label is the point. */
export function pdfFileName(label: string): string {
  const safe = label.replace(/[/\\:*?"<>|]/g, '').replace(/\s+/g, ' ').trim()
  return `${safe}.pdf`
}

/** Builds the blob, triggers the save, then releases the object URL. */
export function downloadBlankPdf(label: string): void {
  const blob = new Blob([blankPdfBytes()], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = pdfFileName(label)
  document.body.appendChild(a)
  a.click()
  a.remove()

  // Revoked on the next macrotask, not inline: revoking synchronously
  // after click() races the browser's fetch of the blob in some
  // versions and can abort the download.
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
