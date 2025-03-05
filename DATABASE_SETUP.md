# Database Setup Guide

This guide will help you set up your Supabase database and integrate it with Clerk for authentication.

## Prerequisites

1. A Supabase account and project
2. A Clerk account and project
3. Node.js and npm installed

## Step 1: Set Up Supabase

1. Create a new Supabase project at [https://app.supabase.com/](https://app.supabase.com/)
2. Once your project is created, go to the SQL Editor
3. Run the migration script from `prisma/migrations/migration_script.sql` to set up the database schema

## Step 2: Update Environment Variables

1. Copy the `.env.example` file to `.env`
2. Update the `DATABASE_URL` with your Supabase connection string:
   ```
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
   ```
3. Update the Clerk environment variables with your Clerk API keys
4. Add the Supabase URL and anon key:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
   ```

## Step 3: Set Up Clerk Webhook

1. In your Clerk dashboard, go to "Webhooks"
2. Create a new webhook with the endpoint: `https://your-domain.com/api/webhooks/clerk`
3. Select the following events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
4. Copy the webhook secret and add it to your `.env` file:
   ```
   CLERK_WEBHOOK_SECRET=your_webhook_secret
   ```

## Step 4: Generate Prisma Client

Run the following command to generate the Prisma client:

```bash
npx prisma generate
```

## Step 5: Push Schema to Database

If you need to update the schema, run:

```bash
npx prisma db push
```

## Step 6: Start the Development Server

```bash
npm run dev
```

## Database Schema

The database schema consists of the following models:

### User

Stores user information from Clerk:

- `id`: The Clerk user ID
- `email`: The user's email address
- `name`: The user's full name
- `profileImageUrl`: The URL to the user's profile image
- `createdAt`: When the user was created
- `updatedAt`: When the user was last updated

### ArtConfiguration

Stores art configurations created by users:

- `id`: Unique identifier
- `name`: The name of the configuration
- `code`: The JSON configuration data
- `thumbnail`: Optional thumbnail image URL
- `createdAt`: When the configuration was created
- `updatedAt`: When the configuration was last updated
- `userId`: The ID of the user who created the configuration
- `isPublic`: Whether the configuration is publicly visible
- `tags`: Array of tags for searching
- `baseFrequency`, `harmonicRatio`, `mode`, `colorScheme`: Extracted metadata for filtering

### Like

Tracks which users have liked which configurations:

- `id`: Unique identifier
- `userId`: The ID of the user who liked the configuration
- `configId`: The ID of the liked configuration
- `createdAt`: When the like was created 