export interface LocaleMessages {
  common: {
    all: string;
    copyToClipboard: string;
  };
  navigation: {
    openMainMenu: string;
  };
  theme: {
    system: string;
    light: string;
    dark: string;
    currentTheme: string;
    cycleTheme: string;
  };
  profile: {
    email: string;
    location: string;
    workAddress: string;
    click: string;
    googleMap: string;
    send: string;
    sendEmail: string;
    institutionalProfile: string;
    researchInterests: string;
    like: string;
    liked: string;
    thanks: string;
  };
  home: {
    about: string;
    news: string;
    featuredProjects: string;
    selectedPublications: string;
    viewAll: string;
  };
  projects: {
    featuredBadge: string;
    viewDetails: string;
    close: string;
    noProjects: string;
    summaryTotal: string;
    role: string;
    funding: string;
  };
  publications: {
    searchPlaceholder: string;
    filters: string;
    year: string;
    type: string;
    noResults: string;
    abstract: string;
    bibtex: string;
    code: string;
    previousImage: string;
    nextImage: string;
    imagePosition: string;
    imageGallery: string;
  };
  footer: {
    lastUpdated: string;
    builtWithPrism: string;
  };
}

const en: LocaleMessages = {
  common: {
    all: 'All',
    copyToClipboard: 'Copy to clipboard',
  },
  navigation: {
    openMainMenu: 'Open main menu',
  },
  theme: {
    system: 'System',
    light: 'Light',
    dark: 'Dark',
    currentTheme: 'Current theme',
    cycleTheme: 'Click to cycle theme',
  },
  profile: {
    email: 'Email',
    location: 'Location',
    workAddress: 'Work Address',
    click: 'Click',
    googleMap: 'Google Map',
    send: 'Send',
    sendEmail: 'Send Email',
    institutionalProfile: 'Institutional Profile',
    researchInterests: 'Research Interests',
    like: 'Like',
    liked: 'Liked',
    thanks: 'Thanks!',
  },
  home: {
    about: 'About',
    news: 'News',
    featuredProjects: 'Featured Projects',
    selectedPublications: 'Selected Publications',
    viewAll: 'View All',
  },
  projects: {
    featuredBadge: 'Featured',
    viewDetails: 'Details',
    close: 'Close',
    noProjects: 'No projects in this category yet.',
    summaryTotal: 'items',
    role: 'Role',
    funding: 'Funding',
  },
  publications: {
    searchPlaceholder: 'Search publications...',
    filters: 'Filters',
    year: 'Year',
    type: 'Type',
    noResults: 'No publications found matching your criteria.',
    abstract: 'Abstract',
    bibtex: 'BibTeX',
    code: 'Code',
    previousImage: 'Previous image',
    nextImage: 'Next image',
    imagePosition: 'Image {current} of {total}',
    imageGallery: 'Publication image gallery',
  },
  footer: {
    lastUpdated: 'Last updated',
    builtWithPrism: 'Built with PRISM',
  },
};

const zh: LocaleMessages = {
  common: {
    all: '全部',
    copyToClipboard: '复制到剪贴板',
  },
  navigation: {
    openMainMenu: '打开主菜单',
  },
  theme: {
    system: '跟随系统',
    light: '浅色',
    dark: '深色',
    currentTheme: '当前主题',
    cycleTheme: '点击切换主题',
  },
  profile: {
    email: '邮箱',
    location: '位置',
    workAddress: '工作地址',
    click: '点击',
    googleMap: 'Google 地图',
    send: '发送',
    sendEmail: '发送邮件',
    institutionalProfile: '官方个人主页',
    researchInterests: '研究兴趣',
    like: '喜欢',
    liked: '已喜欢',
    thanks: '感谢支持！',
  },
  home: {
    about: '关于',
    news: '动态',
    featuredProjects: '代表性项目',
    selectedPublications: '代表性论文',
    viewAll: '查看全部',
  },
  projects: {
    featuredBadge: '重点项目',
    viewDetails: '查看详情',
    close: '关闭',
    noProjects: '当前分类下暂无项目。',
    summaryTotal: '项',
    role: '角色',
    funding: '资助来源',
  },
  publications: {
    searchPlaceholder: '搜索论文...',
    filters: '筛选',
    year: '年份',
    type: '类型',
    noResults: '没有找到符合条件的论文。',
    abstract: '摘要',
    bibtex: 'BibTeX',
    code: '代码',
    previousImage: '上一张图片',
    nextImage: '下一张图片',
    imagePosition: '第 {current} 张，共 {total} 张',
    imageGallery: '论文图片轮播',
  },
  footer: {
    lastUpdated: '最近更新',
    builtWithPrism: '基于 PRISM 构建',
  },
};

export const messages: Record<string, LocaleMessages> = {
  en,
  zh,
};

export function getMessages(locale: string): LocaleMessages {
  return messages[locale] || en;
}
