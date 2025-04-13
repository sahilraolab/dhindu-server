const mongoose = require("mongoose");

const WhatsappMessageLogSchema = new mongoose.Schema(
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
        customer_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer"
        },
        order_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order"
        },
        config_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "WhatsappConfig"
        },
        phone_number: {
            type: String,
            required: true
        },
        template_name: {
            type: String,
            required: true
        },
        payload: {
            type: mongoose.Schema.Types.Mixed
        },
        response_data: {
            type: mongoose.Schema.Types.Mixed
        },
        message_status: {
            type: String,
            enum: ["pending", "sent", "failed"],
            default: "pending"
        },
        error_message: {
            type: String
        },
        api_hit_count: {
            type: Number,
            default: 1
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("WhatsappMessageLog", WhatsappMessageLogSchema);
