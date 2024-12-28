const express = require('express');
const cors = require('cors');

require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/create-checkout-session', async (req, res) => {
  const origin = req.get('origin');
  const lineItems = req.body.map((item) => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: item.name,
        images: [item.imageUrl],
      },
      unit_amount: Math.round(item.price * 100),
    },
    quantity: item.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: `${origin}/success`,
    cancel_url: `${origin}/cancel`,
  });

  res.json({ id: session.id });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
