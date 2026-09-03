// Vercel serverless function: POST /api/apply
// Receives the application form and creates a page in the Notion database
// configured via the NOTION_TOKEN / NOTION_DATABASE_ID environment variables.
// See README.md for how to obtain these.

const SESSION_LABELS: Record<string, string> = {
  "0915": "09.15 관찰 연습",
  "0922": "09.22 사랑의 기술 북토크",
  "0929": "09.29 왜 나는 너를 사랑하는가 북토크",
  "1006": "10.06 각자의 사랑",
  "1009": "10.09 인터랙티브 퍼포먼스 몸",
};

type Req = { method?: string; body?: any };
type Res = {
  status: (code: number) => Res;
  json: (body: unknown) => void;
};

function text(value: unknown) {
  return { rich_text: [{ text: { content: String(value ?? "").slice(0, 2000) } }] };
}

export default async function handler(req: Req, res: Res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const token = process.env.NOTION_TOKEN;
  const databaseId = process.env.NOTION_DATABASE_ID;
  if (!token || !databaseId) {
    res.status(500).json({ error: "Server is not configured (missing NOTION_TOKEN or NOTION_DATABASE_ID)." });
    return;
  }

  const form = req.body ?? {};

  const requiredFields = [
    "displayName",
    "birthDate",
    "phone",
    "availableSessions",
    "attendanceAgreement",
    "bodyPerformanceAcknowledgement",
    "applicationReason",
    "definitionOfLove",
    "loveQuestion",
    "researchInterest",
    "communityAgreement",
    "feeAgreement",
    "privacyAgreement",
    "mediaConsent",
  ];
  const missing = requiredFields.filter((key) => {
    const value = form[key];
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === "boolean") return value !== true && key !== "communityAgreement";
    return value === undefined || value === null || value === "";
  });
  if (missing.length > 0) {
    res.status(400).json({ error: `Missing required fields: ${missing.join(", ")}` });
    return;
  }

  const sessions: string[] = Array.isArray(form.availableSessions) ? form.availableSessions : [];

  const properties: Record<string, unknown> = {
    "이름 / 활동명": { title: [{ text: { content: String(form.displayName).slice(0, 2000) } }] },
    "생년월일": { date: { start: form.birthDate } },
    "연락처": { phone_number: String(form.phone) },
    "인스타그램": text(form.instagram),
    "참여 가능 일정": {
      multi_select: sessions
        .map((code) => SESSION_LABELS[code])
        .filter((label): label is string => Boolean(label))
        .map((name) => ({ name })),
    },
    "참여 일정 서약": { checkbox: Boolean(form.attendanceAgreement) },
    "몸 퍼포먼스 확인": { checkbox: Boolean(form.bodyPerformanceAcknowledgement) },
    "신청 이유": text(form.applicationReason),
    "사랑의 정의": text(form.definitionOfLove),
    "사랑에 대한 질문": text(form.loveQuestion),
    "반복되는 패턴": text(form.repeatedPattern),
    "연구회에서 기대하는 것": text(form.researchInterest),
    "커뮤니티 약속 동의": { select: { name: form.communityAgreement === "disagree" ? "disagree" : "agree" } },
    "참가비 동의": { checkbox: Boolean(form.feeAgreement) },
    "개인정보 동의": { checkbox: Boolean(form.privacyAgreement) },
    "촬영/SNS 동의": { select: { name: String(form.mediaConsent) } },
    "운영진에게 전하는 말": text(form.additionalNote),
  };

  const response = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      parent: { database_id: databaseId },
      properties,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("Notion API error:", response.status, detail);
    let notionMessage = "";
    try {
      notionMessage = JSON.parse(detail)?.message ?? "";
    } catch {
      // ignore parse failure, fall back to generic message
    }
    res.status(502).json({
      error: `Failed to save application to Notion (${response.status})${notionMessage ? `: ${notionMessage}` : ""}`,
    });
    return;
  }

  res.status(200).json({ ok: true });
}
