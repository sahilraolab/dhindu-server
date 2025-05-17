const mongoose = require("mongoose");
const Order = require("./models/Order"); // Adjust the path as needed

const sampleOrders = [
    {
        brand_id: mongoose.Types.ObjectId("67ed727fd16f702d39096404"),
        outlet_id: mongoose.Types.ObjectId("67f0d4d4960492b41f279d8c"),
        customer_id: mongoose.Types.ObjectId("680dc769056f140262134754"),
        order_type_id: mongoose.Types.ObjectId("68074e0b53e3f40f9988fd32"),
        items: [
            {
                item_id: mongoose.Types.ObjectId("67fabbf2ab9d57965d6f5b8d"),
                quantity: 2,
                price: 200,
                addons: [mongoose.Types.ObjectId("680bb716096105ab1f835a83")]
            },
            {
                item_id: mongoose.Types.ObjectId("67fabbf2ab9d57965d6f5b9d"),
                quantity: 1,
                price: 150,
                addons: []
            }
        ],
        subtotal: 550,
        discount: {
            discount_id: mongoose.Types.ObjectId("680c87fa320290259be8da67"),
            amount: 50
        },
        extra_charge: {
            charge_id: mongoose.Types.ObjectId("67f5595c67709b5f35aef2cf"),
            amount: 30
        },
        total_amount: 530,
        payment_status: "paid",
        payment_type_id: mongoose.Types.ObjectId("68076a4507279d53d13d0ad4"),
        order_status: "confirmed",
        placed_at: new Date(),
        completed_at: new Date(),
        notes: "Please deliver to the front gate."
    },
    {
        brand_id: mongoose.Types.ObjectId("680485860fb4f631e475204f"),
        outlet_id: mongoose.Types.ObjectId("680720384d7af658018580ed"),
        customer_id: mongoose.Types.ObjectId("680e2fa7a6017b31d50bb378"),
        order_type_id: mongoose.Types.ObjectId("680750e1cc745521abc934e1"),
        items: [
            {
                item_id: mongoose.Types.ObjectId("67fabbf2ab9d57965d6f5b91"),
                quantity: 1,
                price: 250,
                addons: [mongoose.Types.ObjectId("67fabe70597006602e982dd7")]
            }
        ],
        subtotal: 250,
        discount: {
            discount_id: mongoose.Types.ObjectId("680c87fa320290259be8da67"),
            amount: 20
        },
        extra_charge: {
            charge_id: mongoose.Types.ObjectId("67fabe70597006602e982dd7"),
            amount: 40
        },
        total_amount: 270,
        payment_status: "pending",
        payment_type_id: mongoose.Types.ObjectId("68076a5007279d53d13d0ae1"),
        order_status: "pending",
        placed_at: new Date(),
        notes: "Extra napkins."
    },
    {
        brand_id: mongoose.Types.ObjectId("67ed727fd16f702d39096404"),
        outlet_id: mongoose.Types.ObjectId("680721bccce8c05a4a2ce24c"),
        customer_id: mongoose.Types.ObjectId("680e2fa7a6017b31d50bb37b"),
        order_type_id: mongoose.Types.ObjectId("680750f4cc745521abc934e9"),
        items: [
            {
                item_id: mongoose.Types.ObjectId("67fabbf2ab9d57965d6f5b95"),
                quantity: 3,
                price: 100,
                addons: [mongoose.Types.ObjectId("680a896869eaf82e34579591")]
            }
        ],
        subtotal: 300,
        discount: {
            discount_id: mongoose.Types.ObjectId("680c87fa320290259be8da67"),
            amount: 30
        },
        extra_charge: {
            charge_id: mongoose.Types.ObjectId("67f5595c67709b5f35aef2cf"),
            amount: 25
        },
        total_amount: 295,
        payment_status: "paid",
        payment_type_id: mongoose.Types.ObjectId("68076a5007279d53d13d0ae1"),
        order_status: "completed",
        placed_at: new Date(),
        completed_at: new Date(),
        notes: "Leave at the doorstep."
    }
];

const addOrders = async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/dhinduDB4", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        const result = await Order.insertMany(sampleOrders);
        console.log(`${result.length} orders inserted successfully.`);
    } catch (error) {
        console.error("Error inserting orders:", error);
    } finally {
        mongoose.connection.close();
    }
};

addOrders();
