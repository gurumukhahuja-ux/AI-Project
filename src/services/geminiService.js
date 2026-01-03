import axios from "axios";
import { apis } from "../types";
import { getUserData } from "../userStore/userData";

export const generateChatResponse = async (history, currentMessage, systemInstruction, attachment) => {
    try {
        const token = getUserData()?.token;

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
        if (attachment && attachment.type === 'pdf' && attachment.url) {
            const base64Data = attachment.url.split(',')[1];
            document = {
                mimeType: 'application/pdf',
                base64Data
            };
        }

        const payload = {
            content: currentMessage,
            history: history,
            systemInstruction: systemInstruction,
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
        return "Sorry, I am having trouble connecting to the AI Mall network right now.";
    }
};