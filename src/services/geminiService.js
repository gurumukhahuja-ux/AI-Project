import axios from "axios";
import { apis } from "../types";
import { getUserData } from "../userStore/userData";

export const generateChatResponse = async (history, currentMessage, systemInstruction, attachment, language) => {
    try {
        const token = getUserData()?.token;

        // Enhanced system instruction based on user language
        const langInstruction = language ? `You are a helpful AI assistant. Please respond to the user in ${language}. ` : '';
        const combinedSystemInstruction = (langInstruction + (systemInstruction || '')).trim();

        let image = null;
        if (attachment && attachment.type === 'image' && attachment.url) {
            // Extract base64 data (remove "data:image/png;base64," prefix)
            const base64Data = attachment.url.split(',')[1];
            // Infer mimeType or default to png
            const mimeType = attachment.url.substring(attachment.url.indexOf(':') + 1, attachment.url.indexOf(';'));

            image = {
                mimeType,
                base64Data
            };
        }

        let document = null;
        if (attachment && (attachment.type === 'pdf' || attachment.type === 'file') && attachment.url) {
            const base64Data = attachment.url.split(',')[1];
            // Infer mimeType
            const mimeType = attachment.url.substring(attachment.url.indexOf(':') + 1, attachment.url.indexOf(';'));

            document = {
                mimeType: mimeType || 'application/pdf',
                base64Data
            };
        }

        const payload = {
            content: currentMessage,
            history: history,
            systemInstruction: combinedSystemInstruction,
            image: image,
            document: document
        };

        const result = await axios.post(apis.chatAgent, payload, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return result.data.reply || "I'm sorry, I couldn't generate a response.";

    } catch (error) {
        console.error("Gemini API Error:", error);
        if (error.response?.status === 429) {
            return "The AI Mall system is currently busy (Quota limit reached). Please wait 60 seconds and try again.";
        }
        return "Sorry, I am having trouble connecting to the AI Mall network right now.";
    }
};