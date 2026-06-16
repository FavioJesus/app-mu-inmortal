import express from 'express';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const app = express();
const port = process.env.PORT || 4000;
const browserDistFolder = resolve('dist/app-mu-inmortal/browser');

app.use('/api', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Vary', 'Origin');
  next();
});

app.get('/api/guild', async (_req, res) => {
  const sheetId = process.env.GOOGLE_SHEETS_ID;
  const apiKey = process.env.GOOGLE_SHEETS_API_KEY;
  const membersRange = process.env.GOOGLE_SHEETS_MEMBERS_RANGE || 'Characters!A:J';
  const galleryRange = process.env.GOOGLE_SHEETS_GALLERY_RANGE || 'Gallery!A:F';

  if (!sheetId || !apiKey) {
    res.status(500).json({
      message: 'Faltan GOOGLE_SHEETS_ID o GOOGLE_SHEETS_API_KEY en el .env del servidor.',
    });
    return;
  }

  try {
    const [membersRows, galleryRows] = await Promise.all([
      readSheetRange(sheetId, apiKey, membersRange),
      readOptionalSheetRange(sheetId, apiKey, galleryRange),
    ]);

    res.json({
      members: parseMembers(membersRows),
      gallery: parseGallery(galleryRows),
    });
  } catch (error) {
    res.status(error.status || 502).json({
      message: error.message || 'No se pudo conectar con Google Sheets desde el servidor.',
    });
  }
});

app.get('/api/image/drive/:fileId', async (req, res) => {
  const driveImageUrl = `https://drive.google.com/thumbnail?id=${encodeURIComponent(
    req.params.fileId,
  )}&sz=w1200`;

  try {
    const driveResponse = await fetch(driveImageUrl);

    if (!driveResponse.ok || !driveResponse.body) {
      res.sendStatus(404);
      return;
    }

    const contentType = driveResponse.headers.get('content-type') || 'image/webp';
    const imageBuffer = Buffer.from(await driveResponse.arrayBuffer());

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(imageBuffer);
  } catch {
    res.sendStatus(502);
  }
});

if (existsSync(browserDistFolder)) {
  app.use(
    express.static(browserDistFolder, {
      maxAge: '1y',
      index: false,
      redirect: false,
    }),
  );

  app.use((_req, res) => {
    res.sendFile(join(browserDistFolder, 'index.html'));
  });
}

app.listen(port, (error) => {
  if (error) {
    throw error;
  }

  console.log(`AllStar server listening on http://localhost:${port}`);
});

async function readSheetRange(sheetId, apiKey, range) {
  const sheetsUrl = new URL(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(range)}`,
  );
  sheetsUrl.searchParams.set('key', apiKey);

  const response = await fetch(sheetsUrl);
  const body = await response.json();

  if (!response.ok) {
    const error = new Error(body.error?.message || 'Google Sheets rechazo la solicitud.');
    error.status = response.status;
    throw error;
  }

  return body.values || [];
}

async function readOptionalSheetRange(sheetId, apiKey, range) {
  try {
    return await readSheetRange(sheetId, apiKey, range);
  } catch {
    return [];
  }
}

function parseMembers(rows) {
  return rows
    .slice(1)
    .map((row) => ({
      nick: cleanCell(row[0], 'Unknown'),
      characterClass: cleanCell(row[1], 'Class pending'),
      rank: cleanCell(row[2], 'Member'),
      level: cleanCell(row[3], '-'),
      masterLevel: cleanCell(row[4], '-'),
      guildRole: normalizeGuildRole(cleanCell(row[5], 'Member')),
      status: cleanCell(row[6], 'Active'),
      image: normalizeImageUrl(cleanCell(row[7], '')),
      quote: cleanCell(row[8], ''),
      active: parseActive(row[9]),
    }))
    .filter((member) => member.active && member.nick.trim().length > 0)
    .map(({ active: _active, ...member }) => member);
}

function parseGallery(rows) {
  return rows
    .slice(1)
    .map((row, index) => {
      const type = normalizeGalleryType(cleanCell(row[1], 'photo'));
      const rawImage = cleanCell(row[2], '');
      const rawVideo = cleanCell(row[3], '');
      const videoUrl = type === 'video' ? normalizeVideoUrl(rawVideo) : '';
      const fallbackImage = type === 'photo' && isDriveValue(rawVideo) ? rawVideo : '';
      const youtubeThumb = type === 'video' ? getYoutubeThumbnail(rawVideo) : '';
      const src = normalizeImageUrl(rawImage) || normalizeImageUrl(fallbackImage) || youtubeThumb;

      return {
        id: cleanCell(row[0], `gallery-${index + 1}`),
        type,
        src,
        videoUrl,
        caption: {
          es: cleanCell(row[4], ''),
          en: cleanCell(row[5], cleanCell(row[4], '')),
        },
        active: parseActive(row[6]),
      };
    })
    .filter((item) => item.active && item.src.trim().length > 0)
    .map(({ active: _active, ...item }) => item);
}

function cleanCell(value, fallback) {
  const cleaned = value?.trim();
  return cleaned && cleaned.length > 0 ? cleaned : fallback;
}

function parseActive(value) {
  const normalized = value?.trim().toLowerCase();

  if (!normalized) {
    return true;
  }

  return ['true', 'si', 'sí', 'yes', '1', 'activo', 'active'].includes(normalized);
}

function normalizeGuildRole(value) {
  const normalized = value.trim().toLowerCase();

  if (normalized === 'leader') {
    return 'Leader';
  }

  if (normalized === 'assistant') {
    return 'Assistant';
  }

  if (normalized === 'battle master' || normalized === 'battlemaster') {
    return 'Battle Master';
  }

  return 'Member';
}

function normalizeGalleryType(value) {
  const normalized = value.trim().toLowerCase();
  return normalized === 'video' ? 'video' : 'photo';
}

function normalizeImageUrl(value) {
  const trimmed = value.trim();

  if (!trimmed || isPlaceholderValue(trimmed)) {
    return '';
  }

  const fileId =
    trimmed.match(/drive\.google\.com\/file\/d\/([^/]+)/)?.[1] ||
    trimmed.match(/[?&]id=([^&]+)/)?.[1] ||
    trimmed.match(/^[a-zA-Z0-9_-]{20,}$/)?.[0];

  if (fileId) {
    return `/api/image/drive/${fileId}`;
  }

  return trimmed;
}

function normalizeVideoUrl(value) {
  const trimmed = value.trim();

  if (!trimmed || isPlaceholderValue(trimmed)) {
    return '';
  }

  const youtubeId = getYoutubeId(trimmed);
  if (youtubeId) {
    return `https://www.youtube.com/embed/${youtubeId}`;
  }

  const driveFileId =
    trimmed.match(/drive\.google\.com\/file\/d\/([^/]+)/)?.[1] ||
    trimmed.match(/[?&]id=([^&]+)/)?.[1];

  if (driveFileId) {
    return `https://drive.google.com/file/d/${driveFileId}/preview`;
  }

  return trimmed;
}

function getYoutubeThumbnail(value) {
  const youtubeId = getYoutubeId(value);
  return youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : '';
}

function getYoutubeId(value) {
  const trimmed = value.trim();
  return (
    trimmed.match(/[?&]v=([^&]+)/)?.[1] ||
    trimmed.match(/youtu\.be\/([^?]+)/)?.[1] ||
    trimmed.match(/youtube\.com\/embed\/([^?]+)/)?.[1] ||
    ''
  );
}

function isDriveValue(value) {
  const trimmed = value.trim();
  return /drive\.google\.com/.test(trimmed) || /^[a-zA-Z0-9_-]{20,}$/.test(trimmed);
}

function isPlaceholderValue(value) {
  const normalized = value.trim().toLowerCase();
  return (
    normalized === 'link o id drive' ||
    normalized === 'link o id thumbnail' ||
    normalized === 'id_o_link_de_drive' ||
    normalized === 'id_o_link_thumbnail' ||
    normalized.startsWith('link o id')
  );
}
