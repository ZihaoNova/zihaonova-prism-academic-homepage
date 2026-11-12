export interface BasePageConfig {
    type: 'about' | 'publication' | 'card' | 'text' | 'projects';
    title: string;
    description?: string;
}

export interface PublicationPageConfig extends BasePageConfig {
    type: 'publication';
    source: string;
}

export interface TextPageConfig extends BasePageConfig {
    type: 'text';
    source: string;
}

export interface CardItem {
    title: string;
    subtitle?: string;
    date?: string;
    content?: string;
    tags?: string[];
    link?: string;
    image?: string;
    location?: string;
}

export interface CardSection {
    title: string;
    icon?: string;
    columns?: 1 | 2;
    items: CardItem[];
}

export interface CardPageConfig extends BasePageConfig {
    type: 'card';
    layout?: 'grid' | 'timeline';
    items?: CardItem[];
    sections?: CardSection[];
}

export interface ProjectLink {
    label: string;
    url: string;
    kind?: 'paper' | 'code' | 'demo' | 'website' | 'patent';
}

export interface ProjectItem {
    id: string;
    title: string;
    category: string;
    category_label?: string;
    subtitle?: string;
    summary: string;
    description?: string;
    image?: string;
    date?: string;
    status?: string;
    role?: string;
    funding?: string;
    code_id?: string;
    featured?: boolean;
    home_featured?: boolean;
    tags?: string[];
    links?: ProjectLink[];
}

export interface ProjectCategory {
    id: string;
    label: string;
}

export interface ProjectsPageConfig extends BasePageConfig {
    type: 'projects';
    categories?: ProjectCategory[];
    items: ProjectItem[];
}
