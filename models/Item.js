const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema(
    {
        menu_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Menu",
            required: true
        },
        category_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true
        },
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        food_type: {
            type: String,
            enum: ["veg", "non-veg", "vegan"],
            required: true
        },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active"
        },
        images: [
            {
                url: {
                    type: String,
                    validate: {
                        validator: function (v) {
                            return !v || /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/.test(v);
                        },
                        message: props => `${props.value} is not a valid image URL`
                    }
                },
                data: Buffer, // For storing binary image data (optional)
                contentType: {
                    type: String,
                    enum: ["image/jpeg", "image/png", "image/webp", "image/gif"],
                }
            }
        ]
    },
    { timestamps: true }
);

// Unique index to prevent duplicate item names in the same menu
ItemSchema.index({ menu_id: 1, name: 1 }, { unique: true });

// Pre-save validation to ensure either image URL or image data is provided for each image
ItemSchema.pre("save", function (next) {
    const invalid = this.images.some(img => !img.url && !img.data);
    if (invalid) {
        return next(new Error("Each image must have either a URL or binary data."));
    }
    next();
});

module.exports = mongoose.model("Item", ItemSchema);
