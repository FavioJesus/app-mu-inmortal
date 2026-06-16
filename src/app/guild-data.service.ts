import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import {
  GalleryItem,
  GuildMember,
  GuildPayload,
  GuildRole,
  RawCharacter,
  RawGalleryItem,
} from './guild.model';

/**
 * Carga los datos de la guild desde archivos JSON locales (public/character.json
 * y public/gallery.json). No depende de Google Sheets ni de ninguna API externa.
 *
 * Las imágenes se resuelven como rutas locales dentro de public/ (ver
 * public/images/). Cualquier valor que sea una URL completa se respeta tal cual.
 */
@Injectable({ providedIn: 'root' })
export class GuildDataService {
  private readonly http = inject(HttpClient);

  load(): Observable<GuildPayload> {
    return forkJoin({
      characters: this.http
        .get<RawCharacter[]>('character.json')
        .pipe(catchError(() => of<RawCharacter[]>([]))),
      gallery: this.http
        .get<RawGalleryItem[]>('gallery.json')
        .pipe(catchError(() => of<RawGalleryItem[]>([]))),
    }).pipe(
      map(({ characters, gallery }) => ({
        members: parseMembers(characters),
        gallery: parseGallery(gallery),
      })),
    );
  }
}

function parseMembers(rows: RawCharacter[]): GuildMember[] {
  return (rows ?? [])
    .map((row) => ({
      nick: cleanCell(row.Nick, 'Unknown'),
      characterClass: cleanCell(row.Class, 'Class pending'),
      rank: cleanCell(row.Rank, 'Member'),
      level: cleanCell(row.Level, '-'),
      masterLevel: cleanCell(row.MasterLevel, '-'),
      guildRole: normalizeGuildRole(cleanCell(row.GuildRole, 'Member')),
      status: cleanCell(row.Status, 'Active'),
      image: normalizeImage(cleanCell(row.Image, '')),
      quote: cleanCell(row.Quote, ''),
      active: parseActive(row.Active),
    }))
    .filter((member) => member.active && member.nick.trim().length > 0)
    .map(({ active: _active, ...member }) => member);
}

function parseGallery(rows: RawGalleryItem[]): GalleryItem[] {
  return (rows ?? [])
    .map((row, index) => {
      const type = normalizeGalleryType(cleanCell(row.Type, 'photo'));
      const rawImage = cleanCell(row.Image, '');
      const rawVideo = cleanCell(row.VideoUrl, '');
      const videoUrl = type === 'video' ? normalizeVideoUrl(rawVideo) : '';
      const youtubeThumb = type === 'video' ? getYoutubeThumbnail(rawVideo) : '';
      const src = normalizeImage(rawImage) || youtubeThumb;

      return {
        id: cleanCell(row.Id, `gallery-${index + 1}`),
        type,
        src,
        videoUrl,
        caption: {
          es: cleanCell(row.CaptionEs, ''),
          en: cleanCell(row.CaptionEn, cleanCell(row.CaptionEs, '')),
        },
        active: parseActive(row.Active),
      };
    })
    .filter((item) => item.active && item.src.trim().length > 0)
    .map(({ active: _active, ...item }) => item);
}

function cleanCell(value: string | number | undefined, fallback: string): string {
  const cleaned = value === undefined || value === null ? '' : String(value).trim();
  return cleaned.length > 0 ? cleaned : fallback;
}

function parseActive(value: boolean | string | undefined): boolean {
  if (typeof value === 'boolean') {
    return value;
  }

  const normalized = value?.toString().trim().toLowerCase();

  if (!normalized) {
    return true;
  }

  return ['true', 'si', 'sí', 'yes', '1', 'activo', 'active'].includes(normalized);
}

function normalizeGuildRole(value: string): GuildRole {
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

function normalizeGalleryType(value: string): 'photo' | 'video' {
  return value.trim().toLowerCase() === 'video' ? 'video' : 'photo';
}

/**
 * Las imágenes ahora son locales. Devolvemos el valor tal cual (ruta relativa
 * dentro de public/, p. ej. "images/characters/fakeelf.png") salvo que sea un
 * placeholder. Las URLs externas (YouTube, etc.) también se respetan.
 */
function normalizeImage(value: string): string {
  const trimmed = value.trim();

  if (!trimmed || isPlaceholderValue(trimmed)) {
    return '';
  }

  return trimmed;
}

function normalizeVideoUrl(value: string): string {
  const trimmed = value.trim();

  if (!trimmed || isPlaceholderValue(trimmed)) {
    return '';
  }

  const youtubeId = getYoutubeId(trimmed);
  if (youtubeId) {
    return `https://www.youtube.com/embed/${youtubeId}`;
  }

  return trimmed;
}

function getYoutubeThumbnail(value: string): string {
  const youtubeId = getYoutubeId(value);
  return youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : '';
}

function getYoutubeId(value: string): string {
  const trimmed = value.trim();
  return (
    trimmed.match(/[?&]v=([^&]+)/)?.[1] ||
    trimmed.match(/youtu\.be\/([^?]+)/)?.[1] ||
    trimmed.match(/youtube\.com\/embed\/([^?]+)/)?.[1] ||
    ''
  );
}

function isPlaceholderValue(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return (
    normalized === 'link o id drive' ||
    normalized === 'link o id thumbnail' ||
    normalized === 'id_o_link_de_drive' ||
    normalized === 'id_o_link_thumbnail' ||
    normalized.startsWith('link o id')
  );
}
