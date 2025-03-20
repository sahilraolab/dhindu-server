const SubscriptionSchema = new mongoose.Schema(
    {
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        plan_name: { type: String, required: true }, // Basic, Pro, Enterprise, etc.
        start_date: { type: Date, required: true },
        end_date: { type: Date, required: true },
        status: { type: String, enum: ["active", "expired", "cancelled"], default: "active" },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Subscription", SubscriptionSchema);
