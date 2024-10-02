export interface IBlog {
  blogId: string;
  title: string;
  content: string;
  image?: string;
  date: Date;
  isListed: boolean;
}
