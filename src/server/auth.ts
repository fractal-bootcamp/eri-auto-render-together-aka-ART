import { Clerk } from "@clerk/nextjs/server";
import { db } from "~/server/db";

/**
 * Syncs a user from Clerk to our database.
 * This should be called whenever user data might have changed in Clerk.
 */
export async function syncUserWithDatabase(userId: string) {
    try {
        // Get the user from Clerk
        const clerk = Clerk({ secretKey: process.env.CLERK_SECRET_KEY });
        const clerkUser = await clerk.users.getUser(userId);

        if (!clerkUser) {
            console.error(`User with ID ${userId} not found in Clerk`);
            return null;
        }

        // Check if the user already exists in our database
        const existingUser = await db.user.findUnique({
            where: { id: userId },
        });

        // Get the primary email
        const primaryEmail = clerkUser.emailAddresses.find(
            (email: { id: string }) => email.id === clerkUser.primaryEmailAddressId
        )?.emailAddress;

        if (existingUser) {
            // Update the existing user
            return await db.user.update({
                where: { id: userId },
                data: {
                    email: primaryEmail,
                    name: clerkUser.firstName
                        ? `${clerkUser.firstName} ${clerkUser.lastName || ""}`
                        : null,
                    profileImageUrl: clerkUser.imageUrl,
                },
            });
        } else {
            // Create a new user
            return await db.user.create({
                data: {
                    id: userId,
                    email: primaryEmail,
                    name: clerkUser.firstName
                        ? `${clerkUser.firstName} ${clerkUser.lastName || ""}`
                        : null,
                    profileImageUrl: clerkUser.imageUrl,
                },
            });
        }
    } catch (error) {
        console.error("Error syncing user with database:", error);
        return null;
    }
}

/**
 * Webhook handler for Clerk events.
 * This can be used to keep our database in sync with Clerk.
 */
export async function handleClerkWebhook(event: any) {
    try {
        const eventType = event.type;
        const data = event.data;

        switch (eventType) {
            case "user.created":
            case "user.updated":
                await syncUserWithDatabase(data.id);
                break;
            case "user.deleted":
                // When a user is deleted in Clerk, delete them from our database
                await db.user.delete({
                    where: { id: data.id },
                });
                break;
            default:
                console.log(`Unhandled webhook event: ${eventType}`);
        }

        return { success: true };
    } catch (error) {
        console.error("Error handling Clerk webhook:", error);
        return { success: false, error };
    }
} 