
import axios from "axios";



class  geminiAIService {

    static async callGemini(prompt){
        try {
            const res = await axios.post(
                `${process.env.GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`, 
                {
                    contents: [
                        {
                            parts: [{text: prompt}]
                        }
                    ]
                }
            )
            return res.data?.coordinates?.[0]?.content?.parts?.[0]?.text
        } catch (err) {
            console.error('Gemini API Error', err.response?.data || err.message)
            throw err;
        }
    }


    static async generateDescription(data){
        try {
            const prompt = `Generate a detailed crime report description based on the following data: ${JSON.stringify(data)}`
            return await this.callGemini(prompt)
        } catch (error) {
            console.error('Failed to generate description', error.response?.data || error.message)
            throw error;
        }
        
    }

    static async generateSeverity(description){
        try {
            const prompt = `Generate a severity level for the following crime report description: ${description}`
            const result = await this.callGemini(prompt)
            const severity = result?.trim().toUpperCase();
            
            return ["LOW","MEDIUM","HIGH","CRITICAL"].includes(severity)
                ? severity
                : "MEDIUM";

        } catch {
            return "MEDIUM";
        }
    }

    static async generateSummary(description, crimeType, location){
        try {
            const prompt = `Generate a summary for the following crime report description: 
            Description: ${description}
            Crime Type: ${crimeType}
            Location: ${location}
            Return a concise structured summary.`

            const result = await this.callGemini(prompt)
            return result
        } catch (error) {
            console.error('Gemini API Error', error.response?.data || error.message)
            return description.slice(0, 100)
        }
    }


}

export default geminiAIService;