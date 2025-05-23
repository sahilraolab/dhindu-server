const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
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
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 50
        },
        day: {
            type: String,
            enum: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
            default: null
        },
        start_time: {
            type: String,
            default: "",
            validate: {
                validator: v => v === "" || /^([01]\d|2[0-3]):([0-5]\d)$/.test(v),
                message: props => `${props.value} is not a valid time format (HH:mm)!`
            }
        },
        end_time: {
            type: String,
            default: "",
            validate: {
                validator: v => v === "" || /^([01]\d|2[0-3]):([0-5]\d)$/.test(v),
                message: props => `${props.value} is not a valid time format (HH:mm)!`
            }
        },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active"
        }
    },
    { timestamps: true }
);

// ✅ Unique category name per outlet
CategorySchema.index({ outlet_id: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Category", CategorySchema);
