export interface User {
  id: string;
  name: string;
  avatar: string;
  location?: string;
  isExpert?: boolean;
  title?: string;
  hospital?: string;
  experience?: string;
  consultations?: number;
}

export interface Post {
  id: string;
  author: User;
  time: string;
  title: string;
  content: string;
  images: string[];
  tags: string[];
  likes: number;
  comments: number;
  shares: number;
  report?: {
    score: number;
    trend: { day: number; value: number }[];
  };
  protection?: {
    measures: string[];
    image: string;
  };
  expertReply?: {
    expert: User;
    content: string;
    time: string;
  };
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  cover: string;
  author: User;
  views: string;
  likes: string;
  category: string;
}
