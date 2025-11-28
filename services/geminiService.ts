
import { GoogleGenAI } from "@google/genai";
import { Session } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeSessionRisk = async (session: Session): Promise<string> => {
  try {
    const prompt = `
      You are a Senior Security Operations Center (SOC) Analyst AI.
      Analyze the following user session for behavioral anomalies and security threats.
      
      Session Metadata:
      - User: ${session.user.name} (${session.user.email})
      - Role: ${session.user.role}
      - Location: ${session.location} (IP: ${session.ip})
      - Device: ${session.device} / ${session.os}
      - Risk Score: ${session.riskScore}/100
      - Detected Factors: ${session.riskFactors.join(', ')}

      Behavioral Biometrics:
      - Typing Speed: ${session.behavioralData.typingSpeed} WPM (Normal: 40-80)
      - Typing Variance: ${session.behavioralData.typingVariance} (0.0=Bot/Script, 0.2-0.5=Human)
      - Mouse Velocity: ${session.behavioralData.mouseVelocity} px/s
      - Click Rate: ${session.behavioralData.clickRate} clicks/min

      Task:
      1. Explain *why* the risk score is ${session.riskScore}.
      2. Analyze the behavioral biometrics (Is it human or a script?).
      3. Recommend an immediate action (e.g., Block, MFA Challenge, Ignore).

      Keep the response concise, technical, and use Markdown.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Analysis failed.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "AI Analysis unavailable. Check network connection or API Key.";
  }
};

export const generateSecurityReport = async (sessions: Session[]): Promise<string> => {
  try {
    const highRisk = sessions.filter(s => s.riskScore > 50);
    const summary = highRisk.map(s => `- ${s.user.email} (${s.location}): Risk ${s.riskScore} [${s.riskFactors.join(', ')}]`).join('\n');
    
    const prompt = `
      Generate a daily executive security briefing based on these high-risk sessions detected in our SaaS platform:
      ${summary}

      Identify common attack patterns (e.g., credential stuffing, impossible travel) and suggest a policy update.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Report generation failed.";
  } catch (error) {
    console.error("Gemini Report Error:", error);
    return "Could not generate report.";
  }
}
