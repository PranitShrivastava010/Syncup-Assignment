export const safeParseJSON = <T = unknown>(text: string): T => {
  const cleaned = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const jsonLike = cleaned.match(/\{[\s\S]*\}/);

    if (jsonLike) {
      return JSON.parse(jsonLike[0]) as T;
    }

    throw new Error("AI returned invalid JSON");
  }
};
