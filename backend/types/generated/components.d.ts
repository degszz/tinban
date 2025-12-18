import type { Schema, Struct } from '@strapi/strapi';

export interface ComponentLink extends Struct.ComponentSchema {
  collectionName: 'components_component_links';
  info: {
    displayName: 'Link';
    icon: 'dashboard';
  };
  attributes: {
    href: Schema.Attribute.String & Schema.Attribute.DefaultTo<'#'>;
    isExternal: Schema.Attribute.Boolean;
    label: Schema.Attribute.String;
  };
}

export interface LayoutAuctionsSection extends Struct.ComponentSchema {
  collectionName: 'components_layout_auctions_sections';
  info: {
    displayName: 'Auctions Section';
    icon: 'apps';
  };
  attributes: {
    cards: Schema.Attribute.Component<'layout.card', true>;
    idd: Schema.Attribute.String;
    subtitle: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface LayoutCard extends Struct.ComponentSchema {
  collectionName: 'components_layout_cards';
  info: {
    displayName: 'Card';
    icon: 'folder';
  };
  attributes: {
    badge: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    image: Schema.Attribute.Media<'images' | 'files', true>;
    link: Schema.Attribute.Component<'component.link', true>;
    measurements: Schema.Attribute.String;
    Price: Schema.Attribute.Integer;
    quantity: Schema.Attribute.String;
    stat: Schema.Attribute.Enumeration<['active', 'closed', 'upcoming']>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface LayoutHeader extends Struct.ComponentSchema {
  collectionName: 'components_layout_headers';
  info: {
    displayName: 'Header';
    icon: 'arrowUp';
  };
  attributes: {
    Link: Schema.Attribute.Component<'component.link', true>;
    logo: Schema.Attribute.Media<'images' | 'files'>;
    logoMobile: Schema.Attribute.Media<'images' | 'files'>;
  };
}

export interface LayoutHeroSection extends Struct.ComponentSchema {
  collectionName: 'components_layout_hero_sections';
  info: {
    displayName: 'Hero Section';
    icon: 'apps';
  };
  attributes: {
    heading: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images' | 'files' | 'videos'> &
      Schema.Attribute.Required;
    link: Schema.Attribute.Component<'component.link', false>;
    subHeading: Schema.Attribute.Text;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'component.link': ComponentLink;
      'layout.auctions-section': LayoutAuctionsSection;
      'layout.card': LayoutCard;
      'layout.header': LayoutHeader;
      'layout.hero-section': LayoutHeroSection;
    }
  }
}
