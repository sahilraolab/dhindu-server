const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
    {
        brand_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Brand",
            required: true
        },
        apply_on_all_outlets: {
            type: Boolean,
            default: false
        },
        outlet_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Outlet",
            required: function () {
                return !this.apply_on_all_outlets; // Required if not applying to all outlets
            }
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
            enum: [
                "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"
            ],
            required: true
        },
        start_time: {
            type: String,
            required: true,
            validate: {
                validator: function (v) {
                    return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v); // HH:mm format validation
                },
                message: props => `${props.value} is not a valid time format (HH:mm)!`
            }
        },
        end_time: {
            type: String,
            required: true,
            validate: {
                validator: function (v) {
                    return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
                },
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

// **Indexes for optimized queries & uniqueness**
CategorySchema.index(
    { brand_id: 1, outlet_id: 1, name: 1, day: 1 },
    { unique: true, partialFilterExpression: { apply_on_all_outlets: false } }
);
CategorySchema.index(
    { brand_id: 1, name: 1, day: 1 },
    { unique: true, partialFilterExpression: { apply_on_all_outlets: true } }
);

module.exports = mongoose.model("Category", CategorySchema);
