import { createDecipheriv, createHash } from 'node:crypto';

export type PdfRenderDocumentType = 'cotizacion' | 'certificado';

export function readPdfRenderToken(
  token: string,
  expectedType: PdfRenderDocumentType,
  secret: string,
): Record<string, unknown> {
  if (secret.trim().length < 32) throw new Error('PDF render secret is not configured');
  const [version, ivText, tagText, ciphertextText, ...extra] = token.split('.');
  if (version !== 'v1' || !ivText || !tagText || !ciphertextText || extra.length) {
    throw new Error('Invalid PDF render token');
  }
  const decipher = createDecipheriv(
    'aes-256-gcm',
    createHash('sha256').update(secret).digest(),
    Buffer.from(ivText, 'base64url'),
  );
  decipher.setAuthTag(Buffer.from(tagText, 'base64url'));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(ciphertextText, 'base64url')),
    decipher.final(),
  ]).toString('utf8');
  const payload = JSON.parse(plaintext) as {
    audience?: string;
    documentType?: PdfRenderDocumentType;
    expiresAt?: number;
    snapshot?: Record<string, unknown>;
  };
  if (payload.audience !== 'sterinova-pdf-render' || payload.documentType !== expectedType) {
    throw new Error('PDF render token audience or document type mismatch');
  }
  if (!Number.isFinite(payload.expiresAt) || Number(payload.expiresAt) <= Date.now()) {
    throw new Error('PDF render token expired');
  }
  const expectedDocumentType = expectedType === 'cotizacion' ? 'COTIZACION' : 'CERTIFICADO';
  const snapshotType = (payload.snapshot?.documento as Record<string, unknown> | undefined)?.tipo;
  if (!payload.snapshot || snapshotType !== expectedDocumentType) {
    throw new Error('PDF render snapshot type mismatch');
  }
  return payload.snapshot;
}
