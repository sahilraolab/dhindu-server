const mongoose = require("mongoose");

const WhatsappConfigSchema = new mongoose.Schema(
    {
        brand_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Brand",
            required: true
        },
        outlet_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Outlet",
            required: true
        },
        access_token: {
            type: String,
            required: true
        },
        business_id: {
            type: String,
            required: true
        },
        phone_number_id: {
            type: String,
            required: true
        },
        sender_phone_number: {
            type: String,
            required: true
        },
        templates: [
            {
                name: { type: String, required: true },
                language: { type: String, default: "en" },
                category: { type: String },
                components: { type: mongoose.Schema.Types.Mixed } // headers, body, buttons etc.
            }
        ],
        is_active: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("WhatsappConfig", WhatsappConfigSchema);
