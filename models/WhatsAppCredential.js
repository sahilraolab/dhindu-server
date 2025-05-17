const mongoose = require('mongoose');

const WhatsAppCredentialSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        whatsAppApiUrl: {
            type: String,
            required: true,
            default: 'https://graph.facebook.com/v17.0',
        },
        accessToken: {
            type: String,
            required: true,
        },
        phoneNumberId: {
            type: String,
            required: true,
        },
        businessAccountId: {
            type: String,
            required: true,
        },
        brand_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Brand',
            required: true,
        },
        outlet_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Outlet',
            required: true,
        },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active',
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
);

// Ensure name is unique within each outlet
WhatsAppCredentialSchema.index({ name: 1, outlet_id: 1 }, { unique: true });

module.exports = mongoose.model('WhatsAppCredential', WhatsAppCredentialSchema);
