import { REQUIRED_DOCS } from '@/utils/constants';
import { docStateFor } from '@/data/docStates';

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

export function buildDocuments(applications) {
  const docs = [];
  applications.forEach((app) => {
    const seq = parseInt(app.id.split('-')[2], 10);
    REQUIRED_DOCS.forEach((req, i) => {
      const state = docStateFor(app.status, seq, i);
      if (!state.present) return;
      docs.push({
        id: `DOC-${String(seq).padStart(4, '0')}-${i + 1}`,
        applicationId: app.id,
        docKey: req.key,
        name: req.name,
        category: req.category,
        fileName: `${slug(req.name)}_${String(seq).padStart(4, '0')}.${req.ext}`,
        fileType: req.ext,
        fileSize: (120 + ((seq * 37 + i * 53) % 880)) * 1024,
        uploadedAt: app.submittedAt || app.createdAt,
        validationStatus: state.validation,
        reviewed: state.reviewed,
      });
    });
  });
  return docs;
}
