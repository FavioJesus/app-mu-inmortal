export type GuildRole = 'Leader' | 'Assistant' | 'Battle Master' | 'Member';

export type GuildMember = {
  nick: string;
  characterClass: string;
  rank: string;
  level: string;
  masterLevel: string;
  guildRole: GuildRole;
  status: string;
  image: string;
  quote: string;
};

export type GalleryItem = {
  id: string;
  type: 'photo' | 'video';
  src: string;
  videoUrl: string;
  caption: {
    es: string;
    en: string;
  };
};

export type GuildPayload = {
  members: GuildMember[];
  gallery?: GalleryItem[];
};

/** Forma cruda de cada personaje en public/character.json. */
export type RawCharacter = {
  Nick?: string;
  Class?: string;
  Rank?: string;
  Level?: string | number;
  MasterLevel?: string | number;
  GuildRole?: string;
  Status?: string;
  Image?: string;
  Quote?: string;
  Active?: boolean | string;
};

/** Forma cruda de cada item en public/gallery.json. */
export type RawGalleryItem = {
  Id?: string;
  Type?: string;
  Image?: string;
  VideoUrl?: string;
  CaptionEs?: string;
  CaptionEn?: string;
  Active?: boolean | string;
};
