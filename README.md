# HPG Intelligence Terminal

Dashboard phan tich co phieu HPG theo thoi gian thuc voi kien truc Next.js 15 + Prisma + Neon PostgreSQL.

## 1) Kien truc tong the

- Frontend: Next.js App Router + TypeScript + TailwindCSS + Zustand + Recharts.
- Backend: Next.js API Routes (crawler, dashboard snapshot, recommendation, SSE stream).
- Database: PostgreSQL (Neon) thong qua Prisma ORM.
- Realtime: SSE endpoint `/api/news/stream` cap nhat news feed.
- AI: OpenAI (neu co `OPENAI_API_KEY`), fallback heuristic neu khong co key.
- Cron: endpoint `/api/cron/news` de gan Vercel Cron moi 15 phut.
- Auth: NextAuth credentials endpoint `/api/auth/[...nextauth]`.

## 2) Cau truc thu muc

```text
app/
	dashboard/
	news/
	financials/
	analysis/
	settings/
	api/
components/
	charts/
	cards/
	news/
	recommendation/
lib/
	ai/
	crawler/
	technical/
	macro/
	financial/
	dashboard/
prisma/
scripts/
store/
```

## 3) Setup nhanh

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:push
npm run dev
```

## 4) Bien moi truong

- `DATABASE_URL`: ket noi Neon PostgreSQL.
- `OPENAI_API_KEY`: tuy chon de sentiment/summary bang AI.
- `OPENAI_MODEL`: mac dinh `gpt-4o-mini`.
- `NEXTAUTH_SECRET`, `NEXTAUTH_URL`: cho NextAuth.
- `AUTH_DEMO_USER`, `AUTH_DEMO_PASS`: tai khoan demo credentials.
- `CRON_SECRET`: bao ve endpoint cron.

## 5) API chinh

- `GET /api/dashboard`: tong hop quote + score + recommendation.
- `POST /api/news/crawl`: crawl tin tuc ngay lap tuc.
- `GET /api/news/stream`: SSE stream tin tuc realtime.
- `GET /api/recommendation`: lay khuyen nghi moi nhat.
- `GET /api/cron/news`: endpoint cho Vercel Cron (15 phut).

## 6) Cong thuc recommendation

He thong khong hard-code khuyen nghi. Diem tong duoc tinh:

```text
WeightedScore = News*0.30 + Technical*0.30 + Financial*0.20 + Macro*0.20
```

Sau do map sang:

- 80-100: STRONG_BUY
- 65-79: BUY
- 45-64: HOLD
- 25-44: SELL
- 0-24: STRONG_SELL

## 7) Luu y van hanh

- Crawler dung selector HTML linh hoat, can tinh chinh selector theo tung trang thuc te.
- Du lieu quote/macro hien dang cho phep fallback mau neu DB chua co du lieu.
- App luon tra ve xac suat va confidence, khong khang dinh 100%.
