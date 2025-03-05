import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";

// Define the schema for the art configuration
const artConfigSchema = z.object({
    title: z.string(),
    thumbnail: z.string(), // Base64 encoded image
    code: z.string(), // JSON stringified configuration
    isPublic: z.boolean().default(true),
    harmonicParameters: z.object({
        baseFrequency: z.number(),
        harmonicRatio: z.number(),
        waveNumber: z.number(),
        damping: z.number(),
        amplitude: z.number(),
        mode: z.string(),
        colorScheme: z.string(),
        resolution: z.number(),
    }),
});

export const artRouter = createTRPCRouter({
    // Get all public art configurations
    getPublic: publicProcedure.query(async ({ ctx }) => {
        return ctx.db.artConfiguration.findMany({
            where: {
                isPublic: true,
            },
            include: {
                user: {
                    select: {
                        name: true,
                    },
                },
                _count: {
                    select: {
                        likes: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }),

    // Get art configurations for the current user
    getMine: protectedProcedure.query(async ({ ctx }) => {
        return ctx.db.artConfiguration.findMany({
            where: {
                userId: ctx.userId,
            },
            include: {
                _count: {
                    select: {
                        likes: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }),

    // Get a specific art configuration by ID
    getById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            return ctx.db.artConfiguration.findUnique({
                where: {
                    id: input.id,
                },
                include: {
                    user: {
                        select: {
                            name: true,
                        },
                    },
                    _count: {
                        select: {
                            likes: true,
                        },
                    },
                },
            });
        }),

    // Create a new art configuration
    create: protectedProcedure
        .input(artConfigSchema)
        .mutation(async ({ ctx, input }) => {
            return ctx.db.artConfiguration.create({
                data: {
                    name: input.title,
                    thumbnail: input.thumbnail,
                    code: input.code,
                    isPublic: input.isPublic,
                    userId: ctx.userId,
                },
            });
        }),

    // Toggle like on an art configuration
    toggleLike: protectedProcedure
        .input(z.object({ configId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            // Check if the user has already liked this configuration
            const existingLike = await ctx.db.like.findUnique({
                where: {
                    userId_configId: {
                        userId: ctx.userId,
                        configId: input.configId,
                    },
                },
            });

            if (existingLike) {
                // If the like exists, remove it
                await ctx.db.like.delete({
                    where: {
                        id: existingLike.id,
                    },
                });
                return { liked: false };
            } else {
                // If the like doesn't exist, create it
                await ctx.db.like.create({
                    data: {
                        userId: ctx.userId,
                        configId: input.configId,
                    },
                });
                return { liked: true };
            }
        }),

    // Delete an art configuration
    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            // Verify that the user owns this configuration
            const config = await ctx.db.artConfiguration.findUnique({
                where: {
                    id: input.id,
                },
            });

            if (!config || config.userId !== ctx.userId) {
                throw new Error("Unauthorized: You can only delete your own configurations");
            }

            // Delete all likes associated with this configuration
            await ctx.db.like.deleteMany({
                where: {
                    configId: input.id,
                },
            });

            // Delete the configuration
            return ctx.db.artConfiguration.delete({
                where: {
                    id: input.id,
                },
            });
        }),
});
