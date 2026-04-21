import { runNewsCrawler } from "@/lib/crawler/news-crawler";

async function main() {
  const result = await runNewsCrawler();
  console.log("News crawler completed", result);
}

main()
  .catch((error) => {
    console.error("News crawler failed", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
