export type NewsSource = {
  code: string;
  name: string;
  url: string;
  selectors: {
    item: string;
    title: string;
    link: string;
    datetime?: string;
    content?: string;
  };
};

export const NEWS_SOURCES: NewsSource[] = [
  {
    code: "cafef",
    name: "CafeF",
    url: "https://cafef.vn/thi-truong-chung-khoan.chn",
    selectors: {
      item: "article, .tlitem, .item",
      title: "h3, h2, .title",
      link: "a",
      datetime: "time, .time",
      content: "p",
    },
  },
  {
    code: "vietstock",
    name: "Vietstock",
    url: "https://vietstock.vn/chung-khoan.htm",
    selectors: {
      item: "article, .story, .item",
      title: "h3, h2, .title",
      link: "a",
      datetime: "time, .date",
      content: "p",
    },
  },
  {
    code: "vietnambiz",
    name: "Vietnambiz",
    url: "https://vietnambiz.vn/chung-khoan.htm",
    selectors: {
      item: "article, .story, .item-news",
      title: "h3, h2, .title",
      link: "a",
      datetime: "time, .time",
      content: "p",
    },
  },
  {
    code: "govnews",
    name: "Bao Chinh Phu",
    url: "https://baochinhphu.vn/kinh-te.htm",
    selectors: {
      item: "article, .box-story, .story",
      title: "h3, h2, .story__heading",
      link: "a",
      datetime: "time",
      content: "p",
    },
  },
];

export const DEFAULT_NEWS_TAGS = [
  "hpg",
  "thep",
  "dau-tu-cong",
  "bat-dong-san",
  "xuat-khau",
  "dung-quat-2",
  "gia-quang",
];
