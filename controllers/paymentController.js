const Stripe = require('stripe');
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.confirmPayment = async (req, res) => {
  try {
    // Log amount for debugging
    console.log("Received amount:", req.body.amount);

    // Validate the amount to ensure it's a number and not undefined or null
    if (!req.body.amount || isNaN(parseInt(req.body.amount))) {
      return res.status(400).json({ error: "Invalid or missing amount" });
    }

    // Create a PaymentIntent with the validated amount
    const paymentIntent = await stripe.paymentIntents.create({
      amount: parseInt(req.body.amount) * 100, // Convert to cents
      currency: "npr",
      automatic_payment_methods: { enabled: true },
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
      dpmCheckerLink: `https://dashboard.stripe.com/settings/payment_methods/review?transaction_id=${paymentIntent.id}`,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({ error: error.message });
  }
};
