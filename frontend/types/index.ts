// types/index.ts

export interface IHeroSectionProps {
  heading: string;
  subHeading: string;
  image: {
    url: string;
    alternativeText?: string;
  };
  link?: {
    href: string;
    label: string;
  };
}

export interface IStrapiMedia {
  id: number;
  url: string;
  alternativeText?: string;
  caption?: string;
  width?: number;
  height?: number;
  formats?: Record<string, any>;
}

export interface IUser {
  id: number;
  username: string;
  email: string;
  blocked?: boolean;
  confirmed?: boolean;
}

export interface IAuction {
  id: number;
  title: string;
  description: string;
  starting_price: number;
  current_price: number;
  start_date: string;
  end_date: string;
  status: 'draft' | 'active' | 'ended';
  image?: IStrapiMedia;
}

export interface IBid {
  id: number;
  amount: number;
  auction_id: string;
  auction_title: string;
  user?: IUser;
  createdAt: string;
}

export interface IStrapiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface IStrapiError {
  error: {
    status: number;
    name: string;
    message: string;
    details?: any;
  };
}
