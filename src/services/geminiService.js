import axios from "axios";
import { apis } from "../types";
import { getUserData } from "../userStore/userData";

export const generateChatResponse = async (history, currentMessage, systemInstruction) => {
    try {
        const token = getUserData()?.token;
        const payload = {
            content: currentMessage,
            history: history,
            systemInstruction: systemInstruction
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