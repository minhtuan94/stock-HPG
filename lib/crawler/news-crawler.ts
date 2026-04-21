import crypto from "node:crypto";
import axios from "axios";
import * as cheerio from "cheerio";
import { SentimentLabel } from "@prisma/client";
import { getOpenAIClient } from "@/lib/ai/openai";
import { prisma } from "@/lib/db";
import type { NewsSentimentResponse } from "@/lib/types";
import { DEFAULT_NEWS_TAGS, NEWS_SOURCES, type NewsSource } from "@/lib/crawler/news-sources";

type CrawledNews = {
  source: string;
  title: string;
  content: string;
  publishedAt: Date;
  url: string;
  fingerprint: string;
};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 120);
}

function normalizeUrl(base: string, href: string): string {
  try {
    return new URL(href, base).toString();
  } catch {
    return href;
  }
}

function inferTags(content: string): string[] {
  const lower = content.toLowerCase();
  const matched = DEFAULT_NEWS_TAGS.filter((tag) => {
    if (tag === "hpg") return /\bhpg\b|hoa\s*phat/.test(lower);
    if (tag === "thep") return /\bthep\b|steel/.test(lower);
    if (tag === "dau-tu-cong") return /dau\s*tu\s*cong/.test(lower);
    if (tag === "bat-dong-san") return /bat\s*dong\s*san|real\s*estate/.test(lower);
    if (tag === "xuat-khau") return /xuat\s*khau|export/.test(lower);
    if (tag === "dung-quat-2") return /dung\s*quat\s*2/.test(lower);
    if (tag === "gia-quang") return /quang\s*sat|iron\s*ore/.test(lower);
    return false;
  });
  return matched.length > 0 ? matched : ["thep"];
}

function heuristicSentiment(title: string, body: string): NewsSentimentResponse {
  const text = `${title} ${body}`.toLowerCase();
  const positiveHits = ["tang", "dot pha", "mo rong", "du an", "giam gia quang", "ho tro"].filter((k) => text.includes(k)).length;
  const negativeHits = ["giam", "thua lo", "rui ro", "suy yeu", "ap luc", "dong bang"].filter((k) => text.includes(k)).length;
  const rawScore = (positiveHits - negativeHits) * 22;
  const score = Math.max(-100, Math.min(100, rawScore));

  let label: NewsSentimentResponse["label"] = "NEUTRAL";
  if (score >= 70) label = "VERY_POSITIVE";
  else if (score >= 25) label = "POSITIVE";
  else if (score <= -70) label = "VERY_NEGATIVE";
  else if (score <= -25) label = "NEGATIVE";

  return {
    summary: body.slice(0, 240),
    label,
    score,
    confidence: 58,
    reason: "Rule-based fallback sentiment.",
    tags: inferTags(text),
  };
}

async function summarizeAndClassify(title: string, content: string): Promise<NewsSentimentResponse> {
  const client = getOpenAIClient();
  if (!client) {
    return heuristicSentiment(title, content);
  }

  try {
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
    const completion = await client.chat.completions.create({
      model,
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a Vietnamese financial analyst. Return strict JSON with summary,label,score,confidence,reason,tags. score range -100..100.",
        },
        {
          role: "user",
          content: `Title: ${title}\n\nContent: ${content.slice(0, 5000)}`,
        },
      ],
    });

    const parsed = JSON.parse(completion.choices[0]?.message?.content || "{}");
    const response: NewsSentimentResponse = {
      summary: typeof parsed.summary === "string" ? parsed.summary : content.slice(0, 240),
      label: ["VERY_POSITIVE", "POSITIVE", "NEUTRAL", "NEGATIVE", "VERY_NEGATIVE"].includes(parsed.label)
        ? parsed.label
        : "NEUTRAL",
      score: Number.isFinite(parsed.score) ? Math.max(-100, Math.min(100, Math.round(parsed.score))) : 0,
      confidence: Number.isFinite(parsed.confidence) ? Math.max(1, Math.min(100, Math.round(parsed.confidence))) : 60,
      reason: typeof parsed.reason === "string" ? parsed.reason : "AI extracted sentiment.",
      tags: Array.isArray(parsed.tags) ? parsed.tags.map((t: unknown) => String(t).toLowerCase()) : inferTags(content),
    };

    return response;
  } catch {
    return heuristicSentiment(title, content);
  }
}

async function crawlSource(source: NewsSource): Promise<CrawledNews[]> {
  const { data } = await axios.get<string>(source.url, {
    timeout: 12000,
    headers: {
      "User-Agent": "Mozilla/5.0 (HPG-Bot)",
    },
  });

  const $ = cheerio.load(data);
  const rows: CrawledNews[] = [];
  $(source.selectors.item)
    .slice(0, 25)
    .each((_, el) => {
      const title = $(el).find(source.selectors.title).first().text().trim() || $(el).text().trim().slice(0, 180);
      const href = $(el).find(source.selectors.link).first().attr("href") || "";
      const url = normalizeUrl(source.url, href);
      const content = $(el).find(source.selectors.content || "p").first().text().trim() || title;
      const datetimeText = $(el).find(source.selectors.datetime || "time").first().attr("datetime") || "";
      if (!title || !url) return;

      const publishedAt = datetimeText ? new Date(datetimeText) : new Date();
      const fingerprint = crypto.createHash("sha256").update(`${title}-${url}`.toLowerCase()).digest("hex");
      rows.push({
        source: source.name,
        title,
        content,
        publishedAt: Number.isNaN(publishedAt.getTime()) ? new Date() : publishedAt,
        url,
        fingerprint,
      });
    });

  return rows;
}

function mapSentimentLabel(label: NewsSentimentResponse["label"]): SentimentLabel {
  if (label === "VERY_POSITIVE") return SentimentLabel.VERY_POSITIVE;
  if (label === "POSITIVE") return SentimentLabel.POSITIVE;
  if (label === "NEGATIVE") return SentimentLabel.NEGATIVE;
  if (label === "VERY_NEGATIVE") return SentimentLabel.VERY_NEGATIVE;
  return SentimentLabel.NEUTRAL;
}

export async function runNewsCrawler(): Promise<{ fetched: number; inserted: number; deduplicated: number }> {
  const run = await prisma.crawlerRun.create({
    data: {
      crawlerName: "news-crawler",
      status: "RUNNING",
    },
  });

  let fetched = 0;
  let inserted = 0;
  let deduplicated = 0;

  try {
    const tagCache = new Map<string, string>();

    for (const source of NEWS_SOURCES) {
      const items = await crawlSource(source);
      fetched += items.length;

      for (const item of items) {
        const existed = await prisma.news.findFirst({
          where: {
            OR: [{ url: item.url }, { fingerprint: item.fingerprint }],
          },
          select: { id: true },
        });

        if (existed) {
          deduplicated += 1;
          continue;
        }

        const sentiment = await summarizeAndClassify(item.title, item.content);
        const news = await prisma.news.create({
          data: {
            source: item.source,
            title: item.title,
            slug: `${slugify(item.title)}-${item.fingerprint.slice(0, 6)}`,
            content: item.content,
            publishedAt: item.publishedAt,
            url: item.url,
            fingerprint: item.fingerprint,
          },
        });

        for (const tagCode of sentiment.tags.slice(0, 8)) {
          let tagId = tagCache.get(tagCode);
          if (!tagId) {
            const tag = await prisma.newsTag.upsert({
              where: { code: tagCode },
              create: {
                code: tagCode,
                label: tagCode,
              },
              update: {},
            });
            tagId = tag.id;
            tagCache.set(tagCode, tag.id);
          }

          await prisma.newsTagOnNews.upsert({
            where: {
              newsId_tagId: {
                newsId: news.id,
                tagId,
              },
            },
            create: {
              newsId: news.id,
              tagId,
            },
            update: {},
          });
        }

        await prisma.newsSentiment.create({
          data: {
            newsId: news.id,
            summary: sentiment.summary,
            label: mapSentimentLabel(sentiment.label),
            score: sentiment.score,
            confidence: sentiment.confidence,
            reason: sentiment.reason,
            aiProvider: process.env.OPENAI_API_KEY ? "openai" : "heuristic",
            modelName: process.env.OPENAI_MODEL || "heuristic-v1",
          },
        });

        inserted += 1;
      }
    }

    await prisma.crawlerRun.update({
      where: { id: run.id },
      data: {
        status: "SUCCESS",
        fetchedCount: fetched,
        insertedCount: inserted,
        deduplicatedCount: deduplicated,
        finishedAt: new Date(),
      },
    });
  } catch (error) {
    await prisma.crawlerRun.update({
      where: { id: run.id },
      data: {
        status: "FAILED",
        fetchedCount: fetched,
        insertedCount: inserted,
        deduplicatedCount: deduplicated,
        errorMessage: error instanceof Error ? error.message : "Unknown crawler error",
        finishedAt: new Date(),
      },
    });
    throw error;
  }

  return { fetched, inserted, deduplicated };
}
