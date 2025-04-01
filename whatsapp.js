require("dotenv").config();
const axios = require("axios");

const WHATSAPP_API_URL = "https://graph.facebook.com/v17.0"; // Ensure correct version
const { WHATSAPP_ACCESS_TOKEN, PHONE_NUMBER_ID } = process.env;

/**
 * Send a WhatsApp Template Message with Named Parameters
 */
const sendTemplateMessage = async (to, templateName, name) => {
    try {
        const response = await axios.post(
            `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
            {
                messaging_product: "whatsapp",
                to,
                type: "template",
                template: {
                    name: templateName,
                    language: { code: "en" },
                    components: [
                        {
                            "type": "body",
                            "parameters": [
                                {
                                    "type": "text",
                                    "parameter_name": "customer_name",
                                    "text": "Karan Rao",
                                }
                            ]
                        }
                    ]
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log("✅ Template Message Sent:", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ Error sending template message:", error.response?.data || error.message);
        return null;
    }
};

// ✅ Test the function with correct named parameter
async function notifyCustomer() {
    const phone = "919910971182";
    const template = "order_confirmed";
    const name = "Sahil Yadav"; // ✅ Correct named parameter format

    const response = await sendTemplateMessage(phone, template, name);
    console.log("✅ Message Sent Response:", response);
}

// 📢 Run the function
notifyCustomer();
