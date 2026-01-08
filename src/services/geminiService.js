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
        let document = null;
        let finalMessage = currentMessage;

        if (attachment && attachment.url) {
            if (attachment.url.startsWith('data:')) {
                // Handle Base64 Data URIs
                const base64Data = attachment.url.split(',')[1];
                const mimeType = attachment.url.substring(attachment.url.indexOf(':') + 1, attachment.url.indexOf(';'));

                if (attachment.type === 'image') {
                    image = { mimeType, base64Data };
                } else {
                    document = { mimeType: mimeType || 'application/pdf', base64Data };
                }
            } else {
                // Handle External Links (Drive, etc.)
                finalMessage = `${currentMessage} [Shared File: ${attachment.name || 'Link'} - ${attachment.url}]`.trim();
            }
        }

        // Limit history to last 50 messages to prevent token overflow in unlimited chats
        const recentHistory = history.length > 50 ? history.slice(-50) : history;

        const payload = {
            content: finalMessage,
            history: recentHistory,
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
            // Allow backend detail to override if present, otherwise default
            const detail = error.response?.data?.details || error.response?.data?.error;
            if (detail) return `System Busy (429): ${detail}`;
            return "The AI Mall system is currently busy (Quota limit reached). Please wait 60 seconds and try again.";
        }
        // Return backend error message if available
        if (error.response?.data?.error) {
            return `System Message: ${error.response.data.error}`;
        }
        if (error.response?.data?.details) {
            return `System Error: ${error.response.data.details}`;
        }
        return "Sorry, I am having trouble connecting to the AI Mall network right now. Please check your connection.";
    }
};