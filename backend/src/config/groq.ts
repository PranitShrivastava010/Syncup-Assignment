import Groq from "groq-sdk";
import { GROQ_KEY } from "./jwtConfig";

export const groq = GROQ_KEY
  ? new Groq({
      apiKey: GROQ_KEY,
    })
  : null;
