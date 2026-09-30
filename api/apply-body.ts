// Vercel serverless function: POST /api/apply-body
// Receives the 〈몸〉 interactive performance application form and creates a
// page in the Notion database configured via NOTION_TOKEN / NOTION_BODY_DATABASE_ID.
// See README.md for how to obtain these.

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
  const databaseId = process.env.NOTION_BODY_DATABASE_ID;
  if (!token || !databaseId) {
    res.status(500).json({ error: "Server is not configured (missing NOTION_TOKEN or NOTION_BODY_DATABASE_ID)." });
    return;
  }

  const form = req.body ?? {};

  const requiredFields = [
    "displayName",
    "phone",
    "participantType",
    "mediaConsent",
    "privacyAgreement",
  ];
  const missing = requiredFields.filter((key) => {
    const value = form[key];
    if (typeof value === "boolean") return value !== true;
    return value === undefined || value === null || value === "";
  });
  if (form.participantType === "new" && form.feeAgreement !== true) {
    missing.push("feeAgreement");
  }
  if (missing.length > 0) {
    res.status(400).json({ error: `Missing required fields: ${missing.join(", ")}` });
    return;
  }

  const properties: Record<string, unknown> = {
    "이름 / 활동명": { title: [{ text: { content: String(form.displayName).slice(0, 2000) } }] },
    "연락처": { phone_number: String(form.phone) },
    "인스타그램": text(form.instagram),
    "참여 구분": {
      select: { name: form.participantType === "existing" ? "기존 연구회 참여자 (참가비 면제)" : "신규 참여자" },
    },
    "참가비 동의": { checkbox: Boolean(form.feeAgreement) },
    "얼굴 노출/촬영 동의": {
      select: { name: form.mediaConsent === "agree" ? "동의" : "비공개 요청 (얼굴 노출 원치 않음)" },
    },
    "개인정보 동의": { checkbox: Boolean(form.privacyAgreement) },
    "신청 동기 및 전하는 말": text(form.motivation),
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
