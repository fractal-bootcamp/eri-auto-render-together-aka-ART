import { NextResponse } from "next/server";
import { WebhookEvent } from "@clerk/nextjs/server";
import { Webhook } from "svix";
import { db } from "~/server/db";

// Webhook secret from Clerk Dashboard
const webhookSecret = process.env.CLERK_WEBHOOK_SECRET || "";

export async function POST(req: Request) {
    try {
        // Get the body
        const payload = await req.text();

        // Get the headers
        const headersList = Object.fromEntries(req.headers);
        const svix_id = headersList["svix-id"];
        const svix_timestamp = headersList["svix-timestamp"];
        const svix_signature = headersList["svix-signature"];

        // If there are no headers, error out
        if (!svix_id || !svix_timestamp || !svix_signature) {
            console.error("Missing svix headers");
            return new NextResponse("Error: Missing svix headers", { status: 400 });
        }

        // Verify the webhook signature
        if (!webhookSecret) {
            console.error("Missing webhook secret");
            return new NextResponse("Error: Missing webhook secret", { status: 400 });
        }

        const wh = new Webhook(webhookSecret);
        let evt: WebhookEvent;

        try {
            evt = wh.verify(payload, {
                "svix-id": svix_id,
                "svix-timestamp": svix_timestamp,
                "svix-signature": svix_signature,
            }) as WebhookEvent;
        } catch (err) {
            console.error("Error verifying webhook:", err);
            return new NextResponse("Error verifying webhook", { status: 400 });
        }

        // Extract the event data
        const { id } = evt.data;
        const eventType = evt.type;

        console.log(`Webhook received: ${eventType}`);

        // Only process if we have a valid ID
        if (!id) {
            console.error("Missing user ID in webhook data");
            return NextResponse.json({ success: false, error: "Missing user ID" }, { status: 400 });
        }

        // Get profile image URL if available (only for user events)
        let profileImageUrl = null;
        if (eventType.startsWith("user.") && "image_url" in evt.data) {
            profileImageUrl = evt.data.image_url;
        }

        switch (eventType) {
            case "user.created":
                // Create a new user in our database
                await db.user.create({
                    data: {
                        id: id,
                        email: evt.data.email_addresses?.[0]?.email_address || null,
                        name: evt.data.first_name
                            ? `${evt.data.first_name} ${evt.data.last_name || ""}`
                            : null,
                        profileImageUrl,
                    },
                });
                break;

            case "user.updated":
                // Update the user in our database
                await db.user.update({
                    where: { id: id },
                    data: {
                        email: evt.data.email_addresses?.[0]?.email_address || null,
                        name: evt.data.first_name
                            ? `${evt.data.first_name} ${evt.data.last_name || ""}`
                            : null,
                        profileImageUrl,
                    },
                });
                break;

            case "user.deleted":
                // Delete the user from our database
                await db.user.delete({
                    where: { id: id },
                });
                break;

            default:
                console.log(`Unhandled webhook event: ${eventType}`);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        // Catch all errors to prevent server crashes
        console.error("Critical error in webhook handler:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
} 