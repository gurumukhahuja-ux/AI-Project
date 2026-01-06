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
        return "Sorry, I am having trouble connecting to the A-Series network right now.";
    }
};