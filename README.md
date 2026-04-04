# Golden Gym Full-Stack Setup

This project now includes:

- A Node.js + Express backend
- MongoDB Atlas-ready models and routes
- Public APIs for contact forms, membership signups, trainers, and classes
- Admin login and dashboard APIs
- Payment record tracking for memberships
- A frontend admin panel, contact form, join form, and Google Maps section

## 1. Install dependencies

```bash
npm install
```

## 2. Create your environment file

Copy `.env.example` to `.env` and fill in your own values.

Required values:

- `MONGODB_URI`
- `JWT_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

## 3. Start the app

```bash
npm run dev
```

Or:

```bash
npm start
```

The site will run at:

```text
http://localhost:5000
```

## 4. Deploy to Vercel

- Keep frontend assets in `public/` so Vercel can serve them correctly
- Add these variables in the Vercel project settings:
  `MONGODB_URI`, `MONGODB_DB_NAME`, `JWT_SECRET`, `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`
- Push the repository to GitHub and import it into Vercel
- After changing any environment variable in Vercel, redeploy the project

## 5. Admin login

Use the credentials from your `.env` file in the Admin Panel section on the site.

## 6. Payment note

The current payment flow stores payment records in MongoDB and generates a payment reference for each membership signup.

It is ready for a real gateway integration, but it does not yet connect to a live provider such as:

- Razorpay
- Stripe

If you want, the next step can be a live payment gateway integration.
