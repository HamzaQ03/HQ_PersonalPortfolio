import { GoogleGenerativeAI } from '@google/generative-ai'
import { HAMZA_KNOWLEDGE } from './knowledge'

export const runtime = 'edge'

const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY!
)

const SYSTEM_PROMPT = `You are "Hamza's Intel" — a professional AI assistant on Hamza Qureshi's portfolio website. Your ONLY purpose is to answer questions about Hamza Qureshi, his professional background, experience, skills, certifications, projects, education, and anything related to his field of Cybersecurity, GRC (Governance, Risk & Compliance), and A&A (Assessment & Authorization).

Below is the complete knowledge base about Hamza. Use ONLY this information to answer questions. Do not make up or fabricate details that are not in this knowledge base.

${HAMZA_KNOWLEDGE}

STRICT RULES:

1. ONLY answer questions about Hamza, his portfolio, his career, his field of cybersecurity/GRC/A&A, and directly related topics.

2. If asked anything unrelated, respond exactly: "I'm only able to answer questions about Hamza Qureshi and his professional background. Is there something specific about Hamza you'd like to know?"

3. Be professional, concise, and helpful.

4. If you don't know a specific detail about Hamza from the knowledge base, say so honestly and suggest the visitor reach out via the Connect page on his portfolio.

5. NEVER make up or fabricate details about Hamza, his work, his employers, or his accomplishments.

6. Speak in third person (e.g., "Hamza has experience in...").

7. Keep responses concise — under 200 words unless the visitor explicitly asks for more detail.

8. When relevant, direct visitors to specific pages on the portfolio (e.g., "Check the Projects page at /projects for case-file details" or "Visit /connect to request his resume").

9. For questions about contacting Hamza, ALWAYS mention the Connect page first, then provide email/LinkedIn/Calendly as additional options.

10. Be warm and professional. The visitor is likely a recruiter, hiring manager, or industry peer evaluating Hamza for a real opportunity.`

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json()
    // Model fallback chain — try primary first, fall through to
    // lite on any failure (503, 429, network, etc.). When 2.5-flash
    // is healthy the user gets the better model; when Google is
    // load-shedding 2.5-flash, lite handles the request transparently.
    const MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite']

    let text: string | null = null
    let lastError: unknown = null

    for (const modelName of MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName })
        const chat = model.startChat({
          history: history || [],
          generationConfig: { maxOutputTokens: 500 },
        })
        const result = await chat.sendMessage(
          SYSTEM_PROMPT + '\n\nUser question: ' + message
        )
        text = result.response.text()
        console.log('[hamzas-intel] Response from:', modelName)
        break
      } catch (error) {
        console.error('[hamzas-intel] Model failed:', modelName, error)
        lastError = error
        // continue to next model in the chain
      }
    }

    // Every model in the chain failed — throw so the outer catch
    // turns it into the same 500 the user would have seen before.
    if (text === null) {
      throw lastError ?? new Error('All models failed')
    }

    return Response.json({ reply: text })
  } catch (error) {
    console.error('[hamzas-intel] Error:', error)
    return Response.json(
      { error: 'Failed to get response' },
      { status: 500 }
    )
  }
}
