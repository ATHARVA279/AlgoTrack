const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  }

  async analyzeCode(code, language, questionTitle = '', questionDescription = '', sampleInput = '', sampleOutput = '') {
    try {
      const prompt = this.buildAnalysisPrompt(code, language, questionTitle, questionDescription, sampleInput, sampleOutput);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const parsed = this.parseAnalysisResponse(text, code);
      return parsed;
    } catch (error) {
      console.error('Gemini API Error:', error);
      return this.getFallbackAnalysis(code);
    }
  }

  buildAnalysisPrompt(code, language, questionTitle, questionDescription, sampleInput, sampleOutput) {
    const maxDescLength = 500;
    const truncatedDesc = questionDescription.length > maxDescLength 
      ? questionDescription.substring(0, maxDescLength) + "..."
      : questionDescription;

    return `Analyze this ${language} solution for "${questionTitle}":

Problem: ${truncatedDesc}

Sample Input:
${sampleInput}

Sample Output:
${sampleOutput}

Code:
\`\`\`${language}
${code}
\`\`\`

When providing explanations, strengths, improvements, alternative approaches, and smart suggestions, use proper Markdown formatting:
- Use **bold** for key terms and headings.
- Use *italics* for emphasis.
- For lists, use a new line and a dash (-) for each bullet point.
- For numbered lists, use 1., 2., etc. on separate lines.
- Do not use asterisks for bullets unless they are on a new line.

Respond with JSON:
{
  "lineByLineExplanation": [
    {"lineNumber": 1, "code": "line", "explanation": "what it does"}
  ],
  "bigOComplexity": {
    "time": "O(n)",
    "space": "O(1)", 
    "explanation": "complexity analysis"
  },
  "codeAnalysis": {
    "approach": "algorithm used",
    "strengths": ["strength1"],
    "improvements": ["improvement1"],
    "alternativeApproaches": ["approach1"]
  },
  "smartSuggestions": [
    {"type": "optimization", "description": "suggestion", "relatedTopics": ["topic1"]}
  ],
  "overallScore": 85
}`;
  }

  parseAnalysisResponse(responseText, originalCode) {
    try {
      let jsonText = responseText.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/, '').replace(/\n?```$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/, '').replace(/\n?```$/, '');
      }
      const analysis = JSON.parse(jsonText);
      let smartSuggestions = analysis.smartSuggestions;
      if (typeof smartSuggestions === 'string') {
        try {
          smartSuggestions = JSON.parse(smartSuggestions);
        } catch (e) {
          console.warn('Failed to parse smartSuggestions string:', smartSuggestions);
          smartSuggestions = [];
        }
      }
      return {
        lineByLineExplanation: this.validateLineExplanations(analysis.lineByLineExplanation),
        bigOComplexity: this.validateBigOComplexity(analysis.bigOComplexity),
        codeAnalysis: this.validateCodeAnalysis(analysis.codeAnalysis),
        smartSuggestions: this.validateSmartSuggestions(smartSuggestions),
        overallScore: this.validateScore(analysis.overallScore)
      };
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      return this.getFallbackAnalysis(originalCode);
    }
  }

  validateLineExplanations(data) {
    if (!Array.isArray(data)) return [];
    return data.map(item => ({
      lineNumber: Number(item.lineNumber) || 1,
      code: String(item.code || ''),
      explanation: String(item.explanation || "Analysis not available")
    }));
  }

  validateBigOComplexity(data) {
    if (!data || typeof data !== 'object') {
      return { time: "O(n)", space: "O(1)", explanation: "Complexity unavailable" };
    }
    return {
      time: String(data.time || "O(n)"),
      space: String(data.space || "O(1)"),
      explanation: String(data.explanation || "Complexity unavailable")
    };
  }

  validateCodeAnalysis(data) {
    if (!data || typeof data !== 'object') {
      return {
        approach: "Standard approach",
        strengths: [],
        improvements: [],
        alternativeApproaches: []
      };
    }
    return {
      approach: String(data.approach || "Standard approach"),
      strengths: Array.isArray(data.strengths) ? data.strengths.map(String) : [],
      improvements: Array.isArray(data.improvements) ? data.improvements.map(String) : [],
      alternativeApproaches: Array.isArray(data.alternativeApproaches) ? data.alternativeApproaches.map(String) : []
    };
  }

  validateSmartSuggestions(data) {
    if (!Array.isArray(data)) {
      return [];
    }
    return data.map(item => {
      if (typeof item !== 'object' || !item) {
        return { type: "info", description: "Invalid suggestion format", relatedTopics: [] };
      }
      return {
        type: String(item.type || "info"),
        description: String(item.description || "No description available"),
        relatedTopics: Array.isArray(item.relatedTopics) ? item.relatedTopics.map(String) : []
      };
    });
  }

  validateScore(score) {
    const numScore = Number(score);
    if (isNaN(numScore)) return 70;
    return Math.max(0, Math.min(100, numScore));
  }

  getFallbackAnalysis(code) {
    const lines = code.split('\n');
    const rawSuggestions = [{
      type: "info",
      description: "AI analysis will be available once the service is restored",
      relatedTopics: ["algorithms", "data-structures"]
    }];
    return {
      lineByLineExplanation: lines.map((line, index) => ({
        lineNumber: index + 1,
        code: line.trim(),
        explanation: "AI analysis temporarily unavailable"
      })),
      bigOComplexity: {
        time: "O(n)",
        space: "O(1)",
        explanation: "Complexity analysis requires manual review"
      },
      codeAnalysis: {
        approach: "Code submitted for analysis",
        strengths: ["Code structure appears organized"],
        improvements: ["AI analysis will provide detailed feedback"],
        alternativeApproaches: ["Multiple approaches may be possible"]
      },
      smartSuggestions: this.validateSmartSuggestions(rawSuggestions),
      overallScore: 70
    };
  }
}

module.exports = new GeminiService();
const BASE_API_URL = process.env.BASE_API_URL || "http://localhost:5000";

module.exports = new GeminiService();
