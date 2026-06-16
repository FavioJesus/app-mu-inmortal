import { Component, ElementRef, ViewChild, inject } from '@angular/core';

import { GuildDataService } from './guild-data.service';
import { GalleryItem, GuildMember, GuildPayload, GuildRole } from './guild.model';

type CharacterPreview = {
  name: string;
  role: string;
  image: string;
};

type FrameWindow = Window & {
  React?: any;
  ReactDOM?: any;
  AS_DATA?: any;
  CoverHeader?: any;
  AboutSection?: any;
  LeadersSection?: any;
  ConquestSection?: any;
  ScheduleSection?: any;
  MediaGallery?: any;
  MembersSection?: any;
  JoinSection?: any;
  SiteFooter?: any;
  MutationObserver?: typeof MutationObserver;
  __allstarDynamicRoot?: any;
  __allstarMenuBound?: boolean;
  __allstarLeaderModalBound?: boolean;
};

const LEADERSHIP_ROLES = new Set(['leader', 'assistant', 'battle master']);
const COVER_IMAGE = 'portada.png';
const RESPONSIVE_STYLE_ID = 'allstar-responsive-overrides';
const YEAR_FROM = '2019';
const YEAR_TO = '2024';
const BROWSER_TITLE = 'AllStar';
const FOOTER_APPEND_TEXT = 'Developed by Fukala.';

// ============================================================
//  DISCORD
//  Pega aqui el enlace de invitacion de tu servidor de Discord.
//  - Si lo dejas vacio (''), el boton "Unete" se oculta por completo.
//  - Si pones un enlace, el boton "Unete" se convierte en un boton
//    "Discord" que abre esa invitacion en una pestana nueva.
//  Ejemplo: const DISCORD_URL = 'https://discord.gg/tuCodigo';
// ============================================================
const DISCORD_URL = '';
const DISCORD_LABEL = 'Discord';
// Textos del boton original que serán reemplazados/ocultados.
const JOIN_LABELS = ['únete', 'unete', 'súmate', 'sumate', 'join'];
const RESPONSIVE_CSS = `
html,
body,
#root {
  max-width: 100%;
  overflow-x: hidden;
}

body {
  display: block !important;
  min-width: 0 !important;
}

* {
  min-width: 0;
}

img,
video,
iframe,
image-slot {
  max-width: 100%;
}

.as-responsive-chip,
.as-responsive-action {
  max-width: 100%;
}

.as-mobile-menu-toggle,
.as-mobile-menu-panel,
.as-mobile-language,
.as-mobile-language-proxy,
.as-mobile-header-frame,
.as-mobile-brand {
  display: none;
}

.as-leader-lightbox {
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: none;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background:
    radial-gradient(circle at 50% 18%, rgba(216, 185, 97, 0.14), transparent 34%),
    rgba(5, 4, 8, 0.88);
  backdrop-filter: blur(8px);
}

.as-leader-lightbox.is-open {
  display: flex;
}

.as-leader-lightbox__card {
  position: relative;
  width: min(430px, calc(100vw - 32px));
  border: 1px solid var(--gold-700);
  border-radius: var(--radius-md);
  overflow: hidden;
  background: linear-gradient(180deg, rgba(38, 31, 48, 0.98), rgba(13, 11, 18, 0.98));
  box-shadow: var(--glow-gold), var(--shadow-lg);
}

.as-leader-lightbox__image {
  display: block;
  width: 100%;
  aspect-ratio: 3 / 4;
  object-fit: cover;
  object-position: center top;
  background: var(--obsidian-900);
}

.as-leader-lightbox__body {
  padding: 18px 18px 20px;
}

.as-leader-lightbox__name {
  margin: 0;
  color: var(--white-pure);
  font-family: var(--font-display);
  font-size: 28px;
  line-height: 1;
  text-transform: uppercase;
}

.as-leader-lightbox__role {
  margin-top: 8px;
  color: var(--gold-300);
  font-family: var(--font-label);
  font-size: 12px;
  letter-spacing: var(--ls-label);
  text-transform: uppercase;
}

.as-leader-lightbox__close {
  position: absolute;
  left: 50%;
  bottom: -58px;
  transform: translateX(-50%);
  min-width: 112px;
  height: 38px;
  border: 1px solid var(--gold-700);
  border-radius: var(--radius-pill);
  background: rgba(7, 6, 10, 0.88);
  color: var(--gold-300);
  font-family: var(--font-label);
  letter-spacing: var(--ls-label);
  text-transform: uppercase;
  cursor: pointer;
}

.as-leader-mobile-photo {
  display: none;
}

section,
header,
footer {
  max-width: 100%;
}

header#top nav {
  width: 100%;
}

header#top nav > div,
header#top > div > div,
section > div,
footer > div {
  width: min(100%, var(--container-max, 1200px)) !important;
  max-width: calc(100vw - 48px) !important;
}

section [style*="grid-template-columns"],
footer [style*="grid-template-columns"] {
  grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr)) !important;
}

#leaders image-slot,
#leaders img {
  display: block !important;
  max-width: 100% !important;
}

#leaders image-slot {
  aspect-ratio: 3 / 4;
}

[style*="width: 100vw"],
[style*="min-width: 100vw"] {
  width: 100% !important;
  min-width: 0 !important;
}

[style*="max-width: 1200px"],
[style*="max-width:1200px"],
[style*="max-width: 1440px"],
[style*="max-width:1440px"] {
  max-width: calc(100vw - 48px) !important;
}

@media (max-width: 1100px) {
  :root {
    --container-max: calc(100vw - 40px);
    --container-wide: calc(100vw - 40px);
    --gutter: 20px;
    --cover-height: 360px;
    --avatar-overlap: -60px;
    --fs-hero: 68px;
    --fs-d1: 44px;
    --fs-d2: 34px;
    --fs-d3: 28px;
  }

  header#top nav > div {
    gap: 18px !important;
  }

  header#top nav a[href^="#"] {
    font-size: 11px !important;
  }
}

@media (max-width: 860px) {
  :root {
    --cover-height: 300px;
    --avatar-overlap: -48px;
    --fs-hero: 54px;
    --fs-d1: 38px;
    --fs-d2: 30px;
    --fs-d3: 25px;
    --fs-h: 20px;
  }

  header#top nav {
    min-height: 58px !important;
    padding: 8px 0 !important;
  }

  header#top nav > div {
    flex-wrap: wrap !important;
    justify-content: center !important;
    row-gap: 8px !important;
  }

  header#top nav a[href^="#"] {
    padding: 6px 4px !important;
  }

  header#top > div > div {
    display: grid !important;
    grid-template-columns: 1fr !important;
    justify-items: center !important;
    text-align: center !important;
    gap: 20px !important;
  }

  header#top [style*="display: flex"] {
    flex-wrap: wrap !important;
    justify-content: center !important;
  }

  header#top h1 {
    font-size: var(--fs-hero) !important;
    line-height: 0.95 !important;
    overflow-wrap: anywhere;
    text-align: center !important;
  }

  header#top [style*="width: 160px"],
  header#top [style*="height: 160px"] {
    width: 124px !important;
    height: 124px !important;
  }

  section [style*="grid-template-columns"],
  footer [style*="grid-template-columns"] {
    grid-template-columns: 1fr !important;
  }

  section [style*="display: flex"],
  footer [style*="display: flex"] {
    flex-wrap: wrap !important;
  }
}

@media (max-width: 640px) {
  :root {
    --container-max: calc(100vw - 28px);
    --container-wide: calc(100vw - 28px);
    --gutter: 14px;
    --cover-height: 230px;
    --avatar-overlap: -40px;
    --fs-hero: 40px;
    --fs-d1: 31px;
    --fs-d2: 25px;
    --fs-d3: 22px;
    --fs-h: 18px;
    --fs-md: 15px;
    --fs-sm: 13px;
  }

  html {
    scroll-padding-top: 62px !important;
  }

  header#top nav {
    position: fixed !important;
    inset: 0 0 auto 0 !important;
    z-index: 9998 !important;
    min-height: 42px !important;
    height: 42px !important;
    padding: 0 !important;
    background: transparent !important;
    border-bottom: 0 !important;
    box-shadow: none !important;
    backdrop-filter: none !important;
  }

  header#top nav a[href^="#"] {
    display: none !important;
  }

  header#top nav > div {
    display: flex !important;
    height: 30px !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 0 !important;
    padding: 0 72px !important;
    margin: 4px 10px 0 !important;
    border: 0 !important;
    border-radius: 0 !important;
    background: transparent !important;
    box-shadow: none !important;
    backdrop-filter: none !important;
  }

  .as-mobile-wordmark-source {
    opacity: 0 !important;
    pointer-events: none !important;
    visibility: hidden !important;
  }

  .as-mobile-menu-toggle {
    display: inline-flex !important;
    position: fixed !important;
    top: 5px !important;
    left: 14px !important;
    z-index: 10002 !important;
    width: 42px !important;
    height: 30px !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 4px !important;
    flex-direction: column !important;
    border: 1px solid var(--gold-700) !important;
    border-radius: var(--radius-pill) !important;
    background: rgba(7, 6, 10, 0.72) !important;
    box-shadow: var(--glow-gold-soft) !important;
    cursor: pointer !important;
  }

  .as-mobile-brand {
    position: fixed !important;
    top: 8px !important;
    left: 50% !important;
    z-index: 10002 !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 8px !important;
    min-height: 28px !important;
    padding: 0 6px !important;
    border: 0 !important;
    border-radius: 0 !important;
    background: transparent !important;
    box-shadow: none !important;
    transform: translateX(-50%) !important;
    pointer-events: none !important;
    color: var(--gold-300) !important;
    font-family: var(--font-wordmark) !important;
    font-size: 18px !important;
    font-weight: 900 !important;
    line-height: 1 !important;
    letter-spacing: 0.03em !important;
    text-transform: uppercase !important;
    white-space: nowrap !important;
    text-shadow: 0 0 16px rgba(236, 210, 138, 0.2), 0 2px 10px rgba(0, 0, 0, 0.52) !important;
    filter: brightness(1.08) !important;
  }

  .as-mobile-brand .as-mobile-brand-star {
    font-size: 15px !important;
    line-height: 1 !important;
    transform: translateY(-1px) !important;
  }

  .as-mobile-language {
    position: fixed !important;
    top: 5px !important;
    right: 14px !important;
    z-index: 10002 !important;
    display: inline-flex !important;
    width: auto !important;
    max-width: 96px !important;
    min-width: 76px !important;
    height: 30px !important;
  }

  header#top .as-mobile-language.as-mobile-language,
  header#top > div:not(:first-child) .as-mobile-language.as-mobile-language,
  header#top nav .as-mobile-language.as-mobile-language {
    position: fixed !important;
    top: 5px !important;
    right: 14px !important;
    left: auto !important;
    z-index: 10002 !important;
    display: inline-flex !important;
    width: auto !important;
    max-width: 96px !important;
    min-width: 76px !important;
    height: 30px !important;
    margin: 0 !important;
    transform: none !important;
  }

  .as-mobile-language * {
    max-width: 100% !important;
  }

  .as-mobile-language-source {
    opacity: 0 !important;
    pointer-events: none !important;
  }

  .as-mobile-language-proxy {
    position: fixed !important;
    top: 5px !important;
    right: 14px !important;
    left: auto !important;
    z-index: 10002 !important;
    display: inline-grid !important;
    grid-template-columns: 1fr 1fr !important;
    width: 76px !important;
    height: 30px !important;
    overflow: hidden !important;
    border: 1px solid var(--gold-700) !important;
    border-radius: var(--radius-pill) !important;
    background: rgba(7, 6, 10, 0.82) !important;
    box-shadow: var(--glow-gold-soft) !important;
  }

  .as-mobile-header-frame {
    position: fixed !important;
    top: 4px !important;
    left: 10px !important;
    right: 10px !important;
    z-index: 10001 !important;
    display: block !important;
    height: 34px !important;
    border: 1px solid rgba(200, 160, 74, 0.34) !important;
    border-radius: 10px !important;
    background: linear-gradient(90deg, rgba(45, 35, 48, 0.82), rgba(66, 54, 58, 0.76), rgba(44, 36, 52, 0.82)) !important;
    box-shadow: 0 8px 22px rgba(0, 0, 0, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.05) !important;
    backdrop-filter: blur(12px) !important;
    pointer-events: none !important;
  }

  .as-mobile-language-proxy button {
    display: flex !important;
    min-width: 0 !important;
    width: 100% !important;
    height: 100% !important;
    align-items: center !important;
    justify-content: center !important;
    border: 0 !important;
    border-radius: 0 !important;
    background: transparent !important;
    color: var(--parchment-100) !important;
    font-family: var(--font-label) !important;
    font-size: 11px !important;
    font-weight: 800 !important;
    letter-spacing: 0 !important;
    line-height: 1 !important;
    padding: 0 !important;
    cursor: pointer !important;
  }

  .as-mobile-language-proxy button.is-active {
    border-radius: var(--radius-pill) !important;
    background: linear-gradient(180deg, var(--gold-300), var(--gold-700)) !important;
    color: var(--obsidian-950) !important;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35) !important;
  }

  .as-mobile-menu-toggle span {
    display: block !important;
    width: 16px !important;
    height: 1px !important;
    background: var(--gold-300) !important;
  }

  .as-mobile-menu-panel {
    position: fixed;
    top: 46px;
    left: 14px;
    right: 14px;
    z-index: 9999;
    display: none;
    grid-template-columns: 1fr;
    gap: 6px;
    padding: 12px;
    border: 1px solid var(--gold-700);
    border-radius: var(--radius-md);
    background: rgba(13, 11, 18, 0.96);
    box-shadow: var(--shadow-lg), var(--glow-gold-soft);
    backdrop-filter: blur(10px);
  }

  .as-mobile-menu-panel.is-open {
    display: grid;
  }

  .as-mobile-menu-panel a {
    display: flex !important;
    width: 100% !important;
    min-height: 38px;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(200, 160, 74, 0.28);
    border-radius: var(--radius-sm);
    color: var(--parchment-100) !important;
    font-family: var(--font-label);
    font-size: 12px;
    letter-spacing: 0.16em;
    text-decoration: none !important;
    text-transform: uppercase;
  }

  header#top nav > div:not(.as-mobile-language),
  header#top > div > div,
  section > div,
  footer > div,
  [style*="max-width: 1200px"],
  [style*="max-width:1200px"],
  [style*="max-width: 1440px"],
  [style*="max-width:1440px"] {
    max-width: calc(100vw - 28px) !important;
  }

  header#top [style*="width: 160px"],
  header#top [style*="height: 160px"] {
    width: 104px !important;
    height: 104px !important;
  }

  header#top button:not(.as-mobile-menu-toggle),
  header#top a,
  section button,
  section a {
    max-width: 100%;
  }

  header#top [style*="white-space"],
  header#top [style*="border-radius: 999px"],
  section [style*="white-space"],
  section h2,
  section h3 {
    white-space: normal !important;
  }

  header#top > div:not(:first-child) [style*="border-radius: 999px"] {
    max-width: 100% !important;
    width: 100% !important;
    justify-content: center !important;
    text-align: center !important;
    overflow-wrap: anywhere;
  }

  .as-responsive-chip {
    display: flex !important;
    width: 100% !important;
    max-width: 100% !important;
    justify-content: center !important;
    text-align: center !important;
    white-space: normal !important;
    overflow-wrap: anywhere;
  }

  .as-responsive-action {
    width: 100% !important;
    max-width: 100% !important;
  }

  header#top .as-responsive-action,
  header#top a:not([href^="#"]):not(.as-mobile-menu-panel a) {
    width: 100% !important;
    justify-content: center !important;
    text-align: center !important;
  }

  section image-slot[id^="leader-"],
  section img[id^="leader-"],
  section [id^="leader-"] image-slot,
  section [id^="leader-"] img {
    display: block !important;
    width: 100% !important;
    max-height: 360px !important;
    object-fit: cover !important;
    object-position: center top !important;
  }

  section [id^="leader-"] {
    cursor: pointer;
  }

  #leaders .as-leader-mobile-photo {
    display: block !important;
    width: 100% !important;
    min-height: min(320px, 72vw);
    max-height: 320px;
    margin: 0 0 16px;
    padding: 0;
    overflow: hidden;
    border: 1px solid var(--gold-700);
    border-radius: var(--radius-sm);
    background: var(--obsidian-900);
    box-shadow: var(--glow-gold-soft);
    cursor: pointer;
  }

  #leaders .as-leader-mobile-photo img {
    display: block !important;
    width: 100% !important;
    min-height: min(320px, 72vw) !important;
    height: min(320px, 72vw) !important;
    object-fit: cover !important;
    object-position: center top !important;
  }

  header#top h1,
  section h2,
  section h3 {
    max-width: 100% !important;
    text-align: center !important;
    overflow-wrap: anywhere;
    line-height: 1.1 !important;
  }

  header#top h1 {
    opacity: 1 !important;
  }

  section {
    padding-left: 0 !important;
    padding-right: 0 !important;
  }

  section [style*="padding: 32px"],
  section [style*="padding:32px"] {
    padding: 20px !important;
  }

  section [style*="gap: 32px"],
  section [style*="gap:32px"] {
    gap: 20px !important;
  }

  #gallery [style*="height: 360px"],
  #gallery [style*="height:360px"],
  #media [style*="height: 360px"],
  #media [style*="height:360px"] {
    height: 260px !important;
  }

  [style*="position: fixed"][style*="inset"] {
    padding: 14px !important;
  }

  [style*="position: fixed"] [style*="width: 80vw"],
  [style*="position: fixed"] [style*="max-width"] {
    width: 100% !important;
    max-width: calc(100vw - 28px) !important;
  }
}

@media (max-width: 430px) {
  :root {
    --cover-height: 205px;
    --fs-hero: 31px;
    --fs-d1: 22px;
    --fs-d2: 19px;
    --fs-d3: 19px;
  }

  section h2 {
    font-size: var(--fs-d2) !important;
  }

  section h3 {
    font-size: var(--fs-d3) !important;
  }

  header#top > div > div,
  section > div,
  footer > div {
    max-width: calc(100vw - 22px) !important;
  }

  header#top [style*="width: 160px"],
  header#top [style*="height: 160px"] {
    width: 92px !important;
    height: 92px !important;
  }

  header#top h1,
  section h2,
  section h3 {
    overflow-wrap: anywhere;
  }

  .as-leader-lightbox {
    padding: 18px 14px 74px;
  }

  .as-leader-lightbox__card {
    width: min(360px, calc(100vw - 28px));
  }

  .as-leader-lightbox__name {
    font-size: 25px;
  }

  .as-mobile-language-proxy {
    right: 14px !important;
    left: auto !important;
  }
}
`;

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  @ViewChild('allstarFrame') private readonly frame?: ElementRef<HTMLIFrameElement>;

  private readonly guildData = inject(GuildDataService);
  private lastPayload: GuildPayload | null = null;
  private isLoadingGuild = false;
  private rosterImages = new Map<string, string>();
  private leaderPreviews = new Map<string, CharacterPreview>();

  protected onFrameLoad(): void {
    document.title = BROWSER_TITLE;

    if (!this.lastPayload && !this.isLoadingGuild) {
      this.loadGuild();
      return;
    }

    this.renderFrame();
  }

  private loadGuild(): void {
    this.isLoadingGuild = true;

    this.guildData.load().subscribe({
      next: (payload) => this.setPayload(payload),
      error: () => {
        this.isLoadingGuild = false;
      },
    });
  }

  private setPayload(payload: GuildPayload): void {
    this.lastPayload = payload;
    this.isLoadingGuild = false;
    this.renderFrame();
  }

  private renderFrame(attempt = 0): void {
    const win = this.frame?.nativeElement.contentWindow as FrameWindow | null;
    const doc = this.frame?.nativeElement.contentDocument;
    const data = win?.AS_DATA;

    if (!win || !doc || !data || !this.isAllStarReady(win)) {
      if (attempt < 160) {
        window.setTimeout(() => this.renderFrame(attempt + 1), 50);
      }

      return;
    }

    const leaders = this.mapLeaders(this.lastPayload?.members ?? []);
    const roster = this.mapRoster(this.lastPayload?.members ?? []);
    const gallery = this.mapGallery(this.lastPayload?.gallery ?? []);

    if (!leaders.length && !roster.length) {
      return;
    }

    if (leaders.length) {
      data.leaders = leaders;
    }

    this.leaderPreviews = new Map(
      leaders
        .filter((leader) => leader.img)
        .map((leader) => [
          leader.id,
          {
            name: leader.name,
            role: leader.role?.es || leader.charClass || '',
            image: leader.img,
          },
        ]),
    );

    data.roster = roster;
    this.rosterImages = new Map(
      roster.filter((member) => member.image).map((member) => [`roster-${this.slug(member.name)}`, member.image]),
    );

    if (gallery.length) {
      data.gallery.slides = gallery;
    }

    if (data.guild) {
      data.guild.founded = Number(YEAR_TO);
    }

    this.replaceYearInValue(data, YEAR_FROM, YEAR_TO);
    data.guild.memberCount = this.lastPayload?.members?.length || data.guild.memberCount;

    const oldRoot = doc.getElementById('root');
    if (!oldRoot) {
      return;
    }

    const root = oldRoot.cloneNode(false) as HTMLElement;
    oldRoot.replaceWith(root);
    win.__allstarDynamicRoot = win.ReactDOM.createRoot(root);
    win.__allstarDynamicRoot.render(this.createAllStarApp(win, data));
    doc.title = BROWSER_TITLE;
    this.syncResponsiveLayout(win);
    this.syncCoverImage(win);
    this.syncCharacterImages(win);
    this.syncLeaderInteractions(win);
    this.replaceRenderedYear(doc, YEAR_FROM, YEAR_TO);
    this.syncFooterAppendix(win);
    this.syncJoinDiscord(win);
  }

  private isAllStarReady(win: FrameWindow): boolean {
    return Boolean(
      win.React &&
        win.ReactDOM &&
        win.AS_DATA &&
        win.CoverHeader &&
        win.AboutSection &&
        win.LeadersSection &&
        win.ConquestSection &&
        win.ScheduleSection &&
        win.MediaGallery &&
        win.MembersSection &&
        win.JoinSection &&
        win.SiteFooter,
    );
  }

  private createAllStarApp(win: FrameWindow, data: any): any {
    const h = win.React.createElement;

    function DynamicAllStarApp() {
      const [joined, setJoined] = win.React.useState(false);
      const [lang, setLang] = win.React.useState(() => {
        try {
          return win.localStorage.getItem('as-lang') || 'es';
        } catch {
          return 'es';
        }
      });

      const onLang = (next: string) => {
        setLang(next);

        try {
          win.localStorage.setItem('as-lang', next);
        } catch {
          // Browser storage can be blocked inside an iframe.
        }
      };

      win.React.useEffect(() => {
        win.document.documentElement.lang = lang;
      }, [lang]);

      const join = () => {
        setJoined(true);
        win.setTimeout(() => {
          const el = win.document.getElementById('join');
          if (el) {
            win.scrollTo({
              top: el.getBoundingClientRect().top + win.scrollY - 20,
              behavior: 'smooth',
            });
          }
        }, 60);
      };

      return h(
        win.React.Fragment,
        null,
        h(win.CoverHeader, { guild: data.guild, onJoin: join, lang, onLang, ui: data.ui }),
        h(win.AboutSection, { guild: data.guild, pillars: data.pillars, lang, ui: data.ui }),
        h(win.LeadersSection, { leaders: data.leaders, lang, ui: data.ui }),
        h(win.ConquestSection, { data: data.conquest, lang, ui: data.ui }),
        h(win.ScheduleSection, { data: data.schedule, lang }),
        h(win.MediaGallery, { data: data.gallery, lang, ui: data.ui }),
        h(win.MembersSection, {
          roster: data.roster,
          count: data.guild.memberCount,
          lang,
          ui: data.ui,
        }),
        h(win.JoinSection, { join: data.join, onJoin: join, joined, lang, ui: data.ui }),
        h(win.SiteFooter, { guild: data.guild, lang, ui: data.ui }),
      );
    }

    return h(DynamicAllStarApp);
  }

  private mapLeaders(members: GuildMember[]): any[] {
    return members
      .filter((member) => LEADERSHIP_ROLES.has(member.guildRole.toLowerCase()))
      .map((member, index) => {
        const role = this.normalizeRole(member.guildRole);

        return {
          name: member.nick,
          id: `leader-${this.slug(member.nick)}`,
          img: this.imageUrl(member.image),
          image: this.imageUrl(member.image),
          role: {
            es: `${role.es}${member.rank ? ` · ${member.rank}` : ''}`,
            en: `${role.en}${member.rank ? ` · ${member.rank}` : ''}`,
          },
          rankLabel: role,
          rank: this.rankTone(member.guildRole, index),
          charClass: member.characterClass,
          level: Number.parseInt(member.level, 10) || member.level || '-',
          ring: this.ringTone(member.guildRole, index),
          status: this.statusTone(member.status),
          initials: this.initials(member.nick),
          motto: {
            es: member.quote || 'AllStar presente en cada batalla.',
            en: member.quote || 'AllStar present in every battle.',
          },
        };
      });
  }

  private mapRoster(members: GuildMember[]): any[] {
    return members
      .filter((member) => member.guildRole.toLowerCase() === 'member')
      .map((member) => ({
        name: member.nick,
        charClass: member.characterClass,
        tone: 'rare',
        image: this.imageUrl(member.image),
      }));
  }

  private mapGallery(items: GalleryItem[]): any[] {
    return items.map((item) => ({
      id: item.id || `gallery-${this.slug(item.caption?.es || item.src)}`,
      type: item.type === 'video' ? 'video' : 'photo',
      src: this.imageUrl(item.src),
      videoUrl: item.videoUrl || '',
      caption: {
        es: item.caption?.es || '',
        en: item.caption?.en || item.caption?.es || '',
      },
    }));
  }

  private syncCharacterImages(win: FrameWindow): void {
    const apply = () => {
      for (const [slotId, preview] of this.leaderPreviews) {
        this.applyImageToSlot(win.document, slotId, preview.image);
      }

      this.applyLeaderImagesByOrder(win.document);
      this.syncLeaderPortraits(win);

      for (const [slotId, image] of this.rosterImages) {
        this.applyImageToSlot(win.document, slotId, image);
      }
    };

    win.setTimeout(apply, 0);

    if (win.MutationObserver) {
      const observer = new win.MutationObserver(apply);
      observer.observe(win.document.body, {
        childList: true,
        subtree: true,
      });
    }
  }

  private applyLeaderImagesByOrder(doc: Document): void {
    const leaderSlots = Array.from(doc.querySelectorAll<HTMLElement>('#leaders image-slot'));
    const fallbackImages = leaderSlots.length
      ? leaderSlots
      : Array.from(doc.querySelectorAll<HTMLElement>('#leaders img')).filter((element) => {
          const src = element.getAttribute('src') || '';
          return !src.startsWith('data:image/svg');
        });
    const previews = Array.from(this.leaderPreviews.values()).filter((preview) => preview.image);

    fallbackImages.slice(0, previews.length).forEach((element, index) => {
      this.applyImageToElement(element, previews[index].image);
    });
  }

  private syncLeaderPortraits(win: FrameWindow): void {
    const section = win.document.getElementById('leaders');
    const previews = Array.from(this.leaderPreviews.values()).filter((preview) => preview.image);
    const modal = this.ensureLeaderModal(win);

    if (!section || !previews.length) {
      return;
    }

    this.findLeaderCards(section, previews)
      .slice(0, previews.length)
      .forEach((card, index) => {
        const preview = previews[index];
        const nativePortrait = card.querySelector<HTMLElement>('image-slot, img');

        if (nativePortrait) {
          this.applyImageToElement(nativePortrait, preview.image);
          this.bindLeaderModal(nativePortrait, modal, preview);
        }

        let portrait = card.querySelector<HTMLButtonElement>('.as-leader-mobile-photo');

        if (!portrait && !nativePortrait) {
          portrait = win.document.createElement('button');
          portrait.className = 'as-leader-mobile-photo';
          portrait.type = 'button';
          portrait.innerHTML = '<img alt="">';
          card.insertBefore(portrait, card.firstChild);
        }

        if (portrait) {
          const img = portrait.querySelector('img');
          if (img instanceof HTMLImageElement) {
            img.src = preview.image;
            img.alt = preview.name;
          }

          this.bindLeaderModal(portrait, modal, preview);
        }
      });
  }

  private findLeaderCards(section: HTMLElement, previews: CharacterPreview[]): HTMLElement[] {
    const byStats = Array.from(section.querySelectorAll<HTMLElement>('article, li, div')).filter((element) => {
      const text = (element.textContent || '').toUpperCase();
      const rect = element.getBoundingClientRect();
      return (
        (text.includes('CLASE') || text.includes('CLASS')) &&
        (text.includes('NIVEL') || text.includes('LEVEL')) &&
        rect.width > 180 &&
        rect.height > 70
      );
    });

    const cards = byStats
      .filter((element) => !byStats.some((other) => other !== element && element.contains(other)))
      .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);

    if (cards.length >= previews.length) {
      return cards;
    }

    const byName = previews
      .map((preview) => {
        const normalizedName = preview.name.toUpperCase();
        const matches = Array.from(section.querySelectorAll<HTMLElement>('article, li, div')).filter((element) => {
          const text = (element.textContent || '').toUpperCase();
          const rect = element.getBoundingClientRect();
          return text.includes(normalizedName) && rect.width > 180 && rect.height > 70;
        });

        return matches
          .filter((element) => !matches.some((other) => other !== element && element.contains(other)))
          .sort((a, b) => {
            const areaA = a.getBoundingClientRect().width * a.getBoundingClientRect().height;
            const areaB = b.getBoundingClientRect().width * b.getBoundingClientRect().height;
            return areaA - areaB;
          })[0];
      })
      .filter((element): element is HTMLElement => Boolean(element));

    return byName.length ? Array.from(new Set(byName)) : cards;
  }

  private applyImageToSlot(doc: Document, slotId: string, image: string): void {
    const slot = doc.getElementById(slotId);

    if (!slot || !image) {
      return;
    }

    this.applyImageToElement(slot, image);
  }

  private applyImageToElement(element: HTMLElement, image: string): void {
    element.setAttribute('src', image);
    element.setAttribute('data-src', image);

    if (element.tagName.toLowerCase() === 'image-slot') {
      element.style.backgroundImage = `url("${image}")`;
      element.style.backgroundSize = 'cover';
      element.style.backgroundPosition = 'center top';
      element.style.backgroundRepeat = 'no-repeat';
    }

    if (element.tagName.toLowerCase() === 'img') {
      (element as HTMLImageElement).src = image;
    }

    const img = element.querySelector?.('img');
    if (img instanceof HTMLImageElement) {
      img.src = image;
    }
  }

  private syncCoverImage(win: FrameWindow): void {
    const apply = () => {
      const cover = Array.from(win.document.querySelectorAll<HTMLElement>('header#top div')).find((element) => {
        const style = element.getAttribute('style') || '';
        return (
          style.includes('background-image') ||
          style.includes('--cover-height') ||
          element.style.height.includes('cover-height')
        );
      });

      if (!cover) {
        return;
      }

      cover.style.backgroundImage = `url("${COVER_IMAGE}")`;
      cover.style.backgroundSize = 'cover';
      cover.style.backgroundPosition = 'center center';
    };

    win.setTimeout(apply, 0);

    if (win.MutationObserver) {
      const observer = new win.MutationObserver(apply);
      observer.observe(win.document.body, {
        childList: true,
        subtree: true,
      });
    }
  }

  private syncResponsiveLayout(win: FrameWindow): void {
    const inject = () => {
      const doc = win.document;
      const isMobile = win.innerWidth <= 640;
      let style = doc.getElementById(RESPONSIVE_STYLE_ID) as HTMLStyleElement | null;

      if (!style) {
        style = doc.createElement('style');
        style.id = RESPONSIVE_STYLE_ID;
        doc.head.appendChild(style);
      }

      if (style.textContent !== RESPONSIVE_CSS) {
        style.textContent = RESPONSIVE_CSS;
      }

      doc
        .querySelectorAll<HTMLElement>('.as-responsive-chip, .as-responsive-action')
        .forEach((element) => {
          element.classList.remove('as-responsive-chip', 'as-responsive-action');
        });
      doc.querySelectorAll<HTMLElement>('.as-mobile-wordmark').forEach((element) => {
        element.classList.remove('as-mobile-wordmark');
      });
      doc.querySelectorAll<HTMLElement>('.as-mobile-wordmark-source').forEach((element) => {
        element.classList.remove('as-mobile-wordmark-source');
      });

      doc.querySelectorAll<HTMLElement>('header#top *').forEach((element) => {
        const text = (element.textContent || '').trim().toUpperCase();
        const isCompact = text.length > 0 && text.length <= 36 && element.childElementCount <= 2;

        if (isCompact && (text.includes('MU INMORTAL') || text.includes('DESDE') || text.includes('MIEMBROS'))) {
          element.classList.add('as-responsive-chip');
        }

        if (isCompact && (text.includes('DISCORD') || text.includes('UNETE') || text.includes('ÚNETE'))) {
          element.classList.add('as-responsive-action');
        }
      });

      if (isMobile) {
        this.syncMobileWordmark(doc);
        this.syncMobileNavigation(win);
      } else {
        this.cleanupMobileHeader(doc);
      }
    };

    inject();
    [0, 50, 200, 600, 1200].forEach((delay) => win.setTimeout(inject, delay));

    if (win.MutationObserver) {
      const observer = new win.MutationObserver(inject);
      observer.observe(win.document.body, {
        childList: true,
        subtree: true,
      });
    }
  }

  private syncMobileNavigation(win: FrameWindow): void {
    const doc = win.document;
    const nav = doc.querySelector<HTMLElement>('header#top nav');

    let toggle = doc.getElementById('as-mobile-menu-toggle') as HTMLButtonElement | null;
    if (!toggle) {
      toggle = doc.createElement('button');
      toggle.id = 'as-mobile-menu-toggle';
      toggle.className = 'as-mobile-menu-toggle';
      toggle.type = 'button';
      toggle.setAttribute('aria-label', 'Abrir menu');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.innerHTML = '<span></span><span></span><span></span>';
      doc.body.appendChild(toggle);
    }

    let panel = doc.getElementById('as-mobile-menu-panel') as HTMLElement | null;
    if (!panel) {
      panel = doc.createElement('div');
      panel.id = 'as-mobile-menu-panel';
      panel.className = 'as-mobile-menu-panel';
      doc.body.appendChild(panel);
    }

    const navLinks = Array.from(doc.querySelectorAll<HTMLAnchorElement>('header#top nav a[href^="#"]'));
    const fallbackLinks = [
      ['#about', 'Quienes somos'],
      ['#leaders', 'Lideres'],
      ['#siege', 'Siege'],
      ['#schedule', 'Agenda'],
      ['#gallery', 'Galeria'],
      ['#members', 'Miembros'],
      ['#join', 'Unete'],
    ];
    const nextItems = navLinks.map((link) => ({
      href: link.getAttribute('href') || '#top',
      text: link.textContent?.trim() || (link.getAttribute('href') || '#top').replace('#', ''),
      external: false,
    }));
    const baseItems = nextItems.length
      ? nextItems
      : fallbackLinks.map(([href, text]) => ({ href, text, external: false }));

    // Transforma el item "Únete": lo convierte en Discord o lo omite.
    const menuItems = baseItems
      .map((item) => {
        const isJoin =
          item.href === '#join' || JOIN_LABELS.some((label) => item.text.toLowerCase().includes(label));

        if (!isJoin) {
          return item;
        }

        if (!DISCORD_URL) {
          return null;
        }

        return { href: DISCORD_URL, text: DISCORD_LABEL, external: true };
      })
      .filter((item): item is { href: string; text: string; external: boolean } => item !== null);

    const currentSignature = Array.from(panel.querySelectorAll<HTMLAnchorElement>('a'))
      .map((link) => `${link.getAttribute('href')}|${link.textContent}`)
      .join('::');
    const nextSignature = menuItems.map((item) => `${item.href}|${item.text}`).join('::');

    if (currentSignature !== nextSignature) {
      panel.replaceChildren(
        ...menuItems.map((link) => {
        const item = doc.createElement('a');
        item.href = link.href;
        item.textContent = link.text;
        if (link.external) {
          item.target = '_blank';
          item.rel = 'noopener noreferrer';
        }
        item.addEventListener('click', () => {
          panel?.classList.remove('is-open');
          toggle?.setAttribute('aria-expanded', 'false');
        });
        return item;
        }),
      );
    }

    if (!toggle.dataset['menuBound']) {
      toggle.dataset['menuBound'] = 'true';
      toggle.addEventListener('click', () => {
        const isOpen = panel?.classList.toggle('is-open') ?? false;
        toggle?.setAttribute('aria-expanded', String(isOpen));
      });
    }

    if (!win.__allstarMenuBound) {
      win.__allstarMenuBound = true;
      doc.addEventListener('click', (event) => {
        const target = event.target as Node | null;
        if (!target || toggle?.contains(target) || panel?.contains(target) || nav?.contains(target)) {
          return;
        }

        panel?.classList.remove('is-open');
        toggle?.setAttribute('aria-expanded', 'false');
      });
    }

    this.syncMobileHeaderFrame(doc);
    this.syncMobileBrand(doc);
    this.syncMobileLanguage(doc);
  }

  private syncMobileHeaderFrame(doc: Document): void {
    let frame = doc.getElementById('as-mobile-header-frame') as HTMLElement | null;

    if (!frame) {
      frame = doc.createElement('div');
      frame.id = 'as-mobile-header-frame';
      frame.className = 'as-mobile-header-frame';
      frame.setAttribute('aria-hidden', 'true');
      doc.body.appendChild(frame);
    }
  }

  private syncMobileWordmark(doc: Document): void {
    const candidates = Array.from(
      doc.querySelectorAll<HTMLElement>('header#top *'),
    )
      .filter((element) => {
        const text = (element.textContent || '').replace(/\s+/g, ' ').trim().toUpperCase();
        const rect = element.getBoundingClientRect();
        const centerDistance = Math.abs(rect.left + rect.width / 2 - doc.documentElement.clientWidth / 2);
        return (
          text.includes('ALLSTAR') &&
          rect.width > 20 &&
          rect.height > 8 &&
          rect.top < 90 &&
          centerDistance < 150
        );
      })
      .sort((a, b) => {
        const areaA = a.getBoundingClientRect().width * a.getBoundingClientRect().height;
        const areaB = b.getBoundingClientRect().width * b.getBoundingClientRect().height;
        return areaB - areaA;
      });

    if (!candidates.length) {
      return;
    }

    candidates.forEach((wordmark) => {
      wordmark.classList.add('as-mobile-wordmark-source');
      wordmark.dataset['mobileWordmarkHidden'] = 'true';
      wordmark.style.setProperty('display', 'none', 'important');
      wordmark.style.setProperty('visibility', 'hidden', 'important');
      wordmark.style.setProperty('opacity', '0', 'important');
    });
  }

  private syncMobileBrand(doc: Document): void {
    let brand = doc.getElementById('as-mobile-brand') as HTMLElement | null;

    if (!brand) {
      brand = doc.createElement('div');
      brand.id = 'as-mobile-brand';
      brand.className = 'as-mobile-brand';
      brand.setAttribute('aria-hidden', 'true');
      brand.innerHTML = '<span class="as-mobile-brand-star">★</span><span>AllStar</span>';
      doc.body.appendChild(brand);
    }
  }

  private cleanupMobileHeader(doc: Document): void {
    doc.getElementById('as-mobile-header-frame')?.remove();
    doc.getElementById('as-mobile-brand')?.remove();
    doc.getElementById('as-mobile-menu-toggle')?.remove();
    doc.getElementById('as-mobile-menu-panel')?.remove();
    doc.getElementById('as-mobile-language-proxy')?.remove();
    doc.querySelectorAll<HTMLElement>('.as-mobile-wordmark-source').forEach((element) => {
      element.classList.remove('as-mobile-wordmark-source');
      if (element.dataset['mobileWordmarkHidden'] === 'true') {
        element.style.removeProperty('display');
        element.style.removeProperty('visibility');
        element.style.removeProperty('opacity');
        delete element.dataset['mobileWordmarkHidden'];
      }
    });
    doc.querySelectorAll<HTMLElement>('.as-mobile-language-source, .as-mobile-language').forEach((element) => {
      element.classList.remove('as-mobile-language-source', 'as-mobile-language');
    });
  }

  private syncMobileLanguage(doc: Document): void {
    doc.querySelectorAll<HTMLElement>('.as-mobile-language').forEach((element) => {
      element.classList.remove('as-mobile-language');
    });
    doc.querySelectorAll<HTMLElement>('.as-mobile-language-source').forEach((element) => {
      element.classList.remove('as-mobile-language-source');
    });

    const candidates = Array.from(doc.querySelectorAll<HTMLElement>('header#top button, header#top div, header#top nav *')).filter(
      (element) => {
        const text = (element.textContent || '').replace(/\s+/g, '').toUpperCase();
        const hasLanguageLabels = text.includes('ES') && text.includes('EN');
        const hasOnlyLanguageText = /^[ESN]+$/.test(text);
        return hasLanguageLabels && hasOnlyLanguageText;
      },
    );

    const language = candidates.sort((a, b) => {
      const areaA = a.getBoundingClientRect().width * a.getBoundingClientRect().height;
      const areaB = b.getBoundingClientRect().width * b.getBoundingClientRect().height;
      return areaB - areaA;
    })[0];

    if (language) {
      language.classList.add('as-mobile-language-source');
      this.syncMobileLanguageProxy(doc, language);
      return;
    }

    this.syncMobileLanguageProxy(doc, null);
  }

  private syncMobileLanguageProxy(doc: Document, source: HTMLElement | null): void {
    let proxy = doc.getElementById('as-mobile-language-proxy') as HTMLElement | null;

    if (!proxy) {
      proxy = doc.createElement('div');
      proxy.id = 'as-mobile-language-proxy';
      proxy.className = 'as-mobile-language-proxy';
      proxy.innerHTML = `
        <button type="button" data-lang="es">ES</button>
        <button type="button" data-lang="en">EN</button>
      `;
      doc.body.appendChild(proxy);
    }

    const currentLang = doc.documentElement.lang?.toLowerCase() || 'es';
    proxy.querySelectorAll<HTMLButtonElement>('button[data-lang]').forEach((button) => {
      const lang = button.dataset['lang'] || '';
      button.classList.toggle('is-active', currentLang === lang);

      if (!button.dataset['languageBound']) {
        button.dataset['languageBound'] = 'true';
        button.addEventListener('click', () => {
          const targetLang = button.dataset['lang'] || '';
          const currentSource =
            source ||
            Array.from(doc.querySelectorAll<HTMLElement>('header#top button, header#top div')).find((element) => {
              const text = (element.textContent || '').replace(/\s+/g, '').toLowerCase();
              return text.includes('es') && text.includes('en');
            }) ||
            null;
          const sourceButtons = currentSource
            ? Array.from(currentSource.querySelectorAll<HTMLButtonElement>('button'))
            : [];
          const sourceButton =
            sourceButtons.find((candidate) => candidate.textContent?.trim().toLowerCase() === targetLang) ||
            sourceButtons.find((candidate) =>
              (candidate.textContent || '').replace(/\s+/g, '').toLowerCase().includes(targetLang),
            );

          if (sourceButton || currentSource) {
            (sourceButton || currentSource)?.click();
          } else {
            try {
              doc.defaultView?.localStorage.setItem('as-lang', targetLang);
            } catch {
              // Storage can be unavailable in embedded contexts.
            }

            doc.documentElement.lang = targetLang;
          }

          proxy
            ?.querySelectorAll<HTMLButtonElement>('button[data-lang]')
            .forEach((item) => item.classList.toggle('is-active', item.dataset['lang'] === targetLang));
        });
      }
    });
  }

  private syncLeaderInteractions(win: FrameWindow): void {
    const apply = () => {
      const modal = this.ensureLeaderModal(win);

      for (const [slotId, preview] of this.leaderPreviews) {
        const slot = win.document.getElementById(slotId);
        if (!slot) {
          continue;
        }

        this.bindLeaderModal(slot, modal, preview);
      }

      const leaderSlots = Array.from(win.document.querySelectorAll<HTMLElement>('#leaders image-slot'));
      const fallbackTargets = leaderSlots.length
        ? leaderSlots
        : Array.from(win.document.querySelectorAll<HTMLElement>('#leaders img'));
      const previews = Array.from(this.leaderPreviews.values()).filter((preview) => preview.image);

      fallbackTargets.slice(0, previews.length).forEach((element, index) => {
        this.bindLeaderModal(element, modal, previews[index]);
      });
    };

    win.setTimeout(apply, 0);

    if (win.MutationObserver) {
      const observer = new win.MutationObserver(apply);
      observer.observe(win.document.body, {
        childList: true,
        subtree: true,
      });
    }
  }

  private replaceYearInValue(value: unknown, from: string, to: string): void {
    if (!value) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => this.replaceYearInValue(item, from, to));
      return;
    }

    if (typeof value !== 'object') {
      return;
    }

    Object.entries(value).forEach(([key, entry]) => {
      if (typeof entry === 'string') {
        (value as Record<string, unknown>)[key] = entry.replaceAll(from, to);
        return;
      }

      if (typeof entry === 'number' && entry === Number(from)) {
        (value as Record<string, unknown>)[key] = Number(to);
        return;
      }

      this.replaceYearInValue(entry, from, to);
    });
  }

  private replaceRenderedYear(doc: Document, from: string, to: string): void {
    const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();

    while (node) {
      if (node.nodeValue?.includes(from)) {
        node.nodeValue = node.nodeValue.replaceAll(from, to);
      }

      node = walker.nextNode();
    }
  }

  private syncFooterAppendix(win: FrameWindow): void {
    const apply = () => {
      const footer = win.document.querySelector('footer');

      if (!footer) {
        return;
      }

      let appendix = win.document.getElementById('allstar-footer-appendix') as HTMLElement | null;

      if (!appendix) {
        appendix = win.document.createElement('p');
        appendix.id = 'allstar-footer-appendix';
        appendix.style.margin = '12px 0 0';
        appendix.style.textAlign = 'center';
        appendix.style.color = 'var(--text-muted)';
        appendix.style.fontFamily = 'var(--font-body)';
        appendix.style.fontSize = '13px';
        appendix.style.lineHeight = '1.6';
        footer.appendChild(appendix);
      }

      if (appendix.textContent !== FOOTER_APPEND_TEXT) {
        appendix.textContent = FOOTER_APPEND_TEXT;
      }
    };

    apply();

    if (win.MutationObserver) {
      const observer = new win.MutationObserver(apply);
      observer.observe(win.document.body, {
        childList: true,
        subtree: true,
      });
    }
  }

  /**
   * Maneja el boton "Únete" del diseño:
   *  - Si DISCORD_URL esta vacio, oculta el boton (lo omitimos).
   *  - Si hay un enlace, convierte el boton "Únete" en un boton "Discord"
   *    funcional que abre la invitacion en una pestana nueva.
   * Tambien activa cualquier elemento que ya diga "Discord".
   */
  private syncJoinDiscord(win: FrameWindow): void {
    const doc = win.document;

    const apply = () => {
      const candidates = Array.from(doc.querySelectorAll<HTMLElement>('a, button'));

      for (const element of candidates) {
        // El menu movil se maneja en syncMobileNavigation para evitar bucles.
        if (element.closest('#as-mobile-menu-panel')) {
          continue;
        }

        const text = (element.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();

        if (!text) {
          continue;
        }

        const isJoin = JOIN_LABELS.some((label) => text.includes(label));
        const isDiscord = text === DISCORD_LABEL.toLowerCase();

        if (!isJoin && !isDiscord) {
          continue;
        }

        if (!DISCORD_URL) {
          if (isJoin) {
            element.style.display = 'none';
          }
          continue;
        }

        if (isJoin) {
          this.setElementLabel(element, DISCORD_LABEL);
        }

        this.bindDiscord(element, DISCORD_URL, win);
      }
    };

    apply();
    [0, 50, 200, 600, 1200].forEach((delay) => win.setTimeout(apply, delay));

    if (win.MutationObserver) {
      const observer = new win.MutationObserver(apply);
      observer.observe(doc.body, {
        childList: true,
        subtree: true,
      });
    }
  }

  /** Reemplaza el texto visible del boton (respetando posibles iconos hijos). */
  private setElementLabel(element: HTMLElement, label: string): void {
    let replaced = false;

    const walk = (node: Node) => {
      for (const child of Array.from(node.childNodes)) {
        if (child.nodeType === 3) {
          const value = (child.nodeValue || '').trim();
          if (value && JOIN_LABELS.some((join) => value.toLowerCase().includes(join))) {
            child.nodeValue = label;
            replaced = true;
          }
        } else {
          walk(child);
        }
      }
    };

    walk(element);

    if (!replaced && element.childElementCount === 0) {
      element.textContent = label;
    }
  }

  /** Hace que un elemento abra el enlace de Discord en una pestana nueva. */
  private bindDiscord(element: HTMLElement, url: string, win: FrameWindow): void {
    if (element.dataset['discordBound']) {
      return;
    }

    element.dataset['discordBound'] = 'true';
    element.style.display = '';

    if (element.tagName === 'A') {
      const anchor = element as HTMLAnchorElement;
      anchor.href = url;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
    }

    element.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      win.open(url, '_blank', 'noopener,noreferrer');
    });
  }

  private bindLeaderModal(element: HTMLElement, modal: HTMLElement, preview: CharacterPreview): void {
    if (element.dataset['leaderModalBound']) {
      return;
    }

    element.dataset['leaderModalBound'] = 'true';
    element.setAttribute('role', 'button');
    element.setAttribute('tabindex', '0');
    element.addEventListener('click', () => this.openLeaderModal(modal, preview));
    element.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        this.openLeaderModal(modal, preview);
      }
    });
  }

  private ensureLeaderModal(win: FrameWindow): HTMLElement {
    const doc = win.document;
    let modal = doc.getElementById('as-leader-lightbox') as HTMLElement | null;

    if (modal) {
      return modal;
    }

    modal = doc.createElement('div');
    modal.id = 'as-leader-lightbox';
    modal.className = 'as-leader-lightbox';
    modal.innerHTML = `
      <div class="as-leader-lightbox__card" role="dialog" aria-modal="true">
        <img class="as-leader-lightbox__image" alt="">
        <div class="as-leader-lightbox__body">
          <h3 class="as-leader-lightbox__name"></h3>
          <div class="as-leader-lightbox__role"></div>
        </div>
        <button class="as-leader-lightbox__close" type="button">x cerrar</button>
      </div>
    `;

    const close = () => modal?.classList.remove('is-open');
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        close();
      }
    });
    modal.querySelector('.as-leader-lightbox__close')?.addEventListener('click', close);
    doc.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        close();
      }
    });
    doc.body.appendChild(modal);
    return modal;
  }

  private openLeaderModal(modal: HTMLElement, preview: CharacterPreview): void {
    const img = modal.querySelector<HTMLImageElement>('.as-leader-lightbox__image');
    const name = modal.querySelector<HTMLElement>('.as-leader-lightbox__name');
    const role = modal.querySelector<HTMLElement>('.as-leader-lightbox__role');

    if (img) {
      img.src = preview.image;
      img.alt = preview.name;
    }

    if (name) {
      name.textContent = preview.name;
    }

    if (role) {
      role.textContent = preview.role;
    }

    modal.classList.add('is-open');
  }

  private normalizeRole(role: GuildRole): { es: string; en: string } {
    if (role === 'Leader') {
      return { es: 'Líder', en: 'Leader' };
    }

    if (role === 'Assistant') {
      return { es: 'Asistente', en: 'Assistant' };
    }

    if (role === 'Battle Master') {
      return { es: 'Battle Master', en: 'Battle Master' };
    }

    return { es: 'Miembro', en: 'Member' };
  }

  private imageUrl(value: string): string {
    return value || '';
  }

  private rankTone(role: GuildRole, index: number): string {
    if (role === 'Leader') {
      return 'legend';
    }

    if (role === 'Battle Master') {
      return 'rare';
    }

    return index % 2 === 0 ? 'mythic' : 'legend';
  }

  private ringTone(role: GuildRole, index: number): string {
    if (role === 'Leader') {
      return 'crimson';
    }

    if (role === 'Battle Master') {
      return 'azure';
    }

    return index % 2 === 0 ? 'gold' : 'azure';
  }

  private statusTone(status: string): string {
    const normalized = status.toLowerCase();

    if (normalized.includes('online') || normalized.includes('activo') || normalized.includes('active')) {
      return 'online';
    }

    return 'rare';
  }

  private initials(name: string): string {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .padEnd(2, name[1] || name[0] || 'A')
      .slice(0, 2);
  }

  private slug(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
}
