import { getConfig } from '@/lib/config';
import { getMarkdownContent, getBibtexContent, getTomlContent, getPageConfig } from '@/lib/content';
import { parseBibTeX } from '@/lib/bibtexParser';
import HomePageClient, { type HomePageLocaleData } from '@/components/home/HomePageClient';
import { Publication } from '@/types/publication';
import { BasePageConfig, PublicationPageConfig, TextPageConfig, CardPageConfig } from '@/types/page';
import { getRuntimeI18nConfig } from '@/lib/i18n/config';

interface SectionConfig {
  id: string;
  type: 'markdown' | 'publications' | 'list';
  title?: string;
  source?: string;
  filter?: string;
  limit?: number;
  content?: string;
  publications?: Publication[];
  items?: NewsItem[];
  sort_by?: string;
  sortBy?: string;
}

interface NewsItem {
  date: string;
  content: string;
}

type PageData =
  | { type: 'about'; id: string; sections: SectionConfig[] }
  | { type: 'publication'; id: string; config: PublicationPageConfig; publications: Publication[] }
  | { type: 'text'; id: string; config: TextPageConfig; content: string }
  | { type: 'card'; id: string; config: CardPageConfig };

function processSections(sections: SectionConfig[], locale?: string): SectionConfig[] {
  return sections.map((section: SectionConfig) => {
    switch (section.type) {
      case 'markdown':
        return {
          ...section,
          content: section.source ? getMarkdownContent(section.source, locale) : '',
        };
      case 'publications': {
        const bibtex = getBibtexContent('publications.bib', locale);
        const allPubs = parseBibTeX(bibtex, locale);
        let filteredPubs = section.filter === 'selected'
          ? allPubs.filter((p) => p.selected)
          : allPubs;

        const sortBy = section.sort_by || section.sortBy || (section.id === 'featured_publications' ? 'impact_factor' : undefined);
        if (sortBy === 'impact_factor' || sortBy === 'if') {
          filteredPubs = [...filteredPubs].sort((a, b) => {
            const getIF = (pub: Publication) => {
              if (pub.impactFactor === undefined || pub.impactFactor === null) return -1;
              const val = typeof pub.impactFactor === 'number' ? pub.impactFactor : parseFloat(String(pub.impactFactor));
              return isNaN(val) ? -1 : val;
            };
            const ifA = getIF(a);
            const ifB = getIF(b);

            if (ifB !== ifA) {
              return ifB - ifA;
            }

            if (b.year !== a.year) {
              return b.year - a.year;
            }

            const getMonth = (m?: string | number) => {
              if (!m) return 1;
              if (typeof m === 'number') return m;
              const parsed = parseInt(m);
              return isNaN(parsed) ? 1 : parsed;
            };
            return getMonth(b.month) - getMonth(a.month);
          });
        }
        return {
          ...section,
          publications: filteredPubs.slice(0, section.limit || 5),
        };
      }
      case 'list': {
        const newsData = section.source ? getTomlContent<{ news: NewsItem[] }>(section.source, locale) : null;
        return {
          ...section,
          items: newsData?.news || [],
        };
      }
      default:
        return section;
    }
  });
}

function loadPageDataForLocale(locale: string | undefined): HomePageLocaleData {
  const localeConfig = getConfig(locale);
  const enableOnePageMode = localeConfig.features.enable_one_page_mode;

  const aboutConfig = getPageConfig<{ profile?: { research_interests?: string[] }; sections?: SectionConfig[] }>('about', locale);
  const researchInterests = aboutConfig?.profile?.research_interests;

  let pagesToShow: PageData[] = [];

  if (enableOnePageMode) {
    pagesToShow = localeConfig.navigation
      .filter((item) => item.type === 'page')
      .map((item) => {
        const rawConfig = getPageConfig(item.target, locale);
        if (!rawConfig) return null;

        const pageConfig = rawConfig as BasePageConfig;

        if (pageConfig.type === 'about' || 'sections' in (rawConfig as object)) {
          return {
            type: 'about',
            id: item.target,
            sections: processSections((rawConfig as { sections: SectionConfig[] }).sections || [], locale),
          } as PageData;
        }

        if (pageConfig.type === 'publication') {
          const pubConfig = pageConfig as PublicationPageConfig;
          const bibtex = getBibtexContent(pubConfig.source, locale);
          return {
            type: 'publication',
            id: item.target,
            config: pubConfig,
            publications: parseBibTeX(bibtex, locale),
          } as PageData;
        }

        if (pageConfig.type === 'text') {
          const textConfig = pageConfig as TextPageConfig;
          return {
            type: 'text',
            id: item.target,
            config: textConfig,
            content: getMarkdownContent(textConfig.source, locale),
          } as PageData;
        }

        if (pageConfig.type === 'card') {
          return {
            type: 'card',
            id: item.target,
            config: pageConfig as CardPageConfig,
          } as PageData;
        }

        return null;
      })
      .filter((item): item is PageData => item !== null);
  } else if (aboutConfig) {
    pagesToShow = [{
      type: 'about',
      id: 'about',
      sections: processSections(aboutConfig.sections || [], locale),
    }];
  }

  return {
    author: localeConfig.author,
    social: localeConfig.social,
    features: localeConfig.features,
    enableOnePageMode,
    researchInterests,
    pagesToShow,
  };
}

export default function Home() {
  const baseConfig = getConfig();
  const runtimeI18n = getRuntimeI18nConfig(baseConfig.i18n);
  const targetLocales = runtimeI18n.enabled ? runtimeI18n.locales : [runtimeI18n.defaultLocale];

  const dataByLocale: Record<string, HomePageLocaleData> = {};

  for (const locale of targetLocales) {
    dataByLocale[locale] = loadPageDataForLocale(locale);
  }

  if (!dataByLocale[runtimeI18n.defaultLocale]) {
    dataByLocale[runtimeI18n.defaultLocale] = loadPageDataForLocale(undefined);
  }

  return <HomePageClient dataByLocale={dataByLocale} defaultLocale={runtimeI18n.defaultLocale} />;
}
