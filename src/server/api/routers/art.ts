import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";

// Define the schema for the art configuration
const artConfigSchema = z.object({
    title: z.string(),
    thumbnail: z.string().optional(), // Base64 encoded image or URL
    code: z.string(), // JSON stringified configuration
    isPublic: z.boolean().default(true),
    tags: z.string().optional(), // Store as JSON string for SQLite
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
            select: {
                id: true,
                name: true,
                code: true,
                thumbnail: true,
                createdAt: true,
                updatedAt: true,
                userId: true,
                isPublic: true,
                baseFrequency: true,
                harmonicRatio: true,
                mode: true,
                colorScheme: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
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
        const userId = ctx.auth?.userId || ctx.userId;
        if (!userId) {
            throw new Error("User not authenticated");
        }

        return ctx.db.artConfiguration.findMany({
            where: {
                userId: userId,
            },
            select: {
                id: true,
                name: true,
                code: true,
                thumbnail: true,
                createdAt: true,
                updatedAt: true,
                userId: true,
                isPublic: true,
                baseFrequency: true,
                harmonicRatio: true,
                mode: true,
                colorScheme: true,
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
                select: {
                    id: true,
                    name: true,
                    code: true,
                    thumbnail: true,
                    createdAt: true,
                    updatedAt: true,
                    userId: true,
                    isPublic: true,
                    baseFrequency: true,
                    harmonicRatio: true,
                    mode: true,
                    colorScheme: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
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
            // Parse the code to extract metadata for searching and filtering
            let parsedCode;
            try {
                parsedCode = JSON.parse(input.code);
            } catch (error) {
                console.error("Error parsing configuration code:", error);
                parsedCode = {};
            }

            // Extract metadata from harmonicParameters
            const { baseFrequency, harmonicRatio, mode, colorScheme } = input.harmonicParameters;
            const userId = ctx.auth?.userId || ctx.userId;
            if (!userId) {
                throw new Error("User not authenticated");
            }

            return ctx.db.artConfiguration.create({
                data: {
                    name: input.title,
                    thumbnail: input.thumbnail,
                    code: input.code,
                    isPublic: input.isPublic,
                    userId: userId,
                    baseFrequency,
                    harmonicRatio,
                    mode,
                    colorScheme,
                },
            });
        }),

    // Toggle like on an art configuration
    toggleLike: protectedProcedure
        .input(z.object({ configId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.auth?.userId || ctx.userId;
            if (!userId) {
                throw new Error("User not authenticated");
            }

            // Check if the user has already liked this configuration
            const existingLike = await ctx.db.like.findUnique({
                where: {
                    userId_configId: {
                        userId: userId,
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
                        userId: userId,
                        configId: input.configId,
                    },
                });
                return { liked: true };
            }
        }),

    // Check if the current user has liked a specific configuration
    checkLiked: protectedProcedure
        .input(z.object({ configId: z.string() }))
        .query(async ({ ctx, input }) => {
            const userId = ctx.auth?.userId || ctx.userId;
            if (!userId) {
                throw new Error("User not authenticated");
            }

            const like = await ctx.db.like.findUnique({
                where: {
                    userId_configId: {
                        userId: userId,
                        configId: input.configId,
                    },
                },
            });
            return { liked: !!like };
        }),

    // Get liked artworks for the current user
    getLiked: protectedProcedure.query(async ({ ctx }) => {
        const userId = ctx.auth?.userId || ctx.userId;
        if (!userId) {
            throw new Error("User not authenticated");
        }

        const likes = await ctx.db.like.findMany({
            where: {
                userId: userId,
            },
            include: {
                config: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                        thumbnail: true,
                        createdAt: true,
                        updatedAt: true,
                        userId: true,
                        isPublic: true,
                        baseFrequency: true,
                        harmonicRatio: true,
                        mode: true,
                        colorScheme: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                        _count: {
                            select: {
                                likes: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return likes.map(like => like.config);
    }),

    // Delete an art configuration
    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.auth?.userId || ctx.userId;
            if (!userId) {
                throw new Error("User not authenticated");
            }

            // Verify that the user owns this configuration
            const config = await ctx.db.artConfiguration.findUnique({
                where: {
                    id: input.id,
                },
            });

            if (!config || config.userId !== userId) {
                throw new Error("Unauthorized: You can only delete your own configurations");
            }

            // Delete the configuration (likes will be cascade deleted due to our schema)
            return ctx.db.artConfiguration.delete({
                where: {
                    id: input.id,
                },
            });
        }),
});
