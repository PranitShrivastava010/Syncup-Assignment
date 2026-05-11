import { groq } from "../config/groq";
import { prisma } from "../lib/prisma";
import { safeParseJSON } from "../utils/safeParseJson";
import { createHttpError } from "../utils/httpError";

type MatchResult = {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  summary: string;
  provider: "groq" | "local";
};

type GroqMatchResponse = {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  summary: string;
};

const stopWords = new Set([
  "and",
  "are",
  "for",
  "from",
  "have",
  "job",
  "our",
  "the",
  "this",
  "that",
  "with",
  "will",
  "you",
  "your",
]);

const extractKeywords = (text: string) => {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9+#. ]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.has(word));

  return [...new Set(words)].slice(0, 50);
};

const localMatch = (resumeText: string, jobText: string): MatchResult => {
  const resume = resumeText.toLowerCase();
  const keywords = extractKeywords(jobText);
  const matchedKeywords = keywords.filter((keyword) => resume.includes(keyword));
  const missingKeywords = keywords.filter((keyword) => !resume.includes(keyword));
  const score = keywords.length
    ? Math.round((matchedKeywords.length / keywords.length) * 100)
    : 0;

  return {
    score,
    matchedKeywords,
    missingKeywords,
    summary:
      "Local keyword scoring was used because Groq is not configured or unavailable.",
    provider: "local",
  };
};

export const calculateResumeMatchService = async ({
  userId,
  resumeId,
  jobId,
}: {
  userId: string;
  resumeId: string;
  jobId: string;
}): Promise<MatchResult> => {
  const [resume, job] = await Promise.all([
    prisma.resume.findFirst({
      where: { id: resumeId, userId },
    }),
    prisma.job.findUnique({
      where: { id: jobId },
    }),
  ]);

  if (!resume) {
    throw createHttpError(404, "Resume not found");
  }

  if (!job || !job.isActive) {
    throw createHttpError(404, "Job not found");
  }

  const resumeText = resume.extractedText ?? "";
  const jobText = [
    job.title,
    job.companyName,
    job.location,
    job.employmentType,
    job.description,
    job.requirements,
  ]
    .filter(Boolean)
    .join("\n");

  const fallback = localMatch(resumeText, jobText);

  if (!groq) {
    return fallback;
  }

  const prompt = `
You are an expert ATS (Applicant Tracking System) matching engine. Your task is to analyze a candidate's resume against a job description and provide a high-precision match report.

CRITICAL RULES:
1. Return ONLY valid JSON. No markdown, no preamble.
2. Be extremely thorough in keyword extraction.
3. Matching is CASE-INSENSITIVE. If "MySQL" is in the job and "mysql" or "MySQL" is in the resume, it is a MATCH.
4. If a skill is mentioned in the resume, DO NOT put it in missingKeywords.
5. Provide a constructive, professional summary of the fit.

Resume Content:
---
${resumeText}
---

Job Description:
---
${jobText}
---

Output JSON Format:
{
  "score": number (0-100),
  "matchedKeywords": string[],
  "missingKeywords": string[],
  "summary": string (2-3 sentences)
}
`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.0,
    });


    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return fallback;
    }

    const parsed = safeParseJSON<GroqMatchResponse>(content);

    if (
      typeof parsed.score !== "number" ||
      !Array.isArray(parsed.matchedKeywords) ||
      !Array.isArray(parsed.missingKeywords) ||
      typeof parsed.summary !== "string"
    ) {
      return fallback;
    }

    return {
      score: Math.max(0, Math.min(100, Math.round(parsed.score))),
      matchedKeywords: parsed.matchedKeywords,
      missingKeywords: parsed.missingKeywords,
      summary: parsed.summary,
      provider: "groq",
    };
  } catch (error) {
    console.warn("[Groq] Resume matching failed. Falling back locally.", error);
    return fallback;
  }
};
