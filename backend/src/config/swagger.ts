import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Stadium Booking Platform API",
      version: "1.0.0",
      description:
        "API documentation for the football stadium reservation marketplace.",
    },
    servers: [
      {
        url: "http://localhost:5000/api",
        description: "Local development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            error: {
              type: "object",
              properties: {
                message: { type: "string", example: "Something went wrong" },
              },
            },
          },
        },
        User: {
          type: "object",
          properties: {
            id: { type: "string" },
            firstName: { type: "string" },
            lastName: { type: "string" },
            email: { type: "string", format: "email" },
            role: {
              type: "string",
              enum: ["PLAYER", "OWNER", "ADMIN"],
            },
          },
        },
        WorkingHour: {
          type: "object",
          properties: {
            dayOfWeek: { type: "integer", minimum: 0, maximum: 6 },
            isOpen: { type: "boolean" },
            openTime: { type: "string", nullable: true, example: "08:00" },
            closeTime: { type: "string", nullable: true, example: "23:00" },
          },
        },
        Location: {
          type: "object",
          properties: {
            address: { type: "string" },
            city: { type: "string" },
            coordinates: {
              type: "object",
              properties: {
                type: { type: "string", example: "Point" },
                coordinates: {
                  type: "array",
                  items: { type: "number" },
                  example: [-7.5898, 33.5731],
                },
              },
            },
          },
        },
        Stadium: {
          type: "object",
          properties: {
            id: { type: "string" },
            ownerId: { type: "string" },
            name: { type: "string" },
            description: { type: "string" },
            location: { $ref: "#/components/schemas/Location" },
            images: { type: "array", items: { type: "string" } },
            amenities: { type: "array", items: { type: "string" } },
            pricePerHour: { type: "number" },
            averageRating: { type: "number" },
            reviewCount: { type: "number" },
            isActive: { type: "boolean" },
            workingHours: {
              type: "array",
              items: { $ref: "#/components/schemas/WorkingHour" },
            },
          },
        },
        Booking: {
          type: "object",
          properties: {
            id: { type: "string" },
            playerId: { type: "string" },
            stadiumId: { type: "string" },
            startAt: { type: "string", format: "date-time" },
            endAt: { type: "string", format: "date-time" },
            price: { type: "number" },
            currency: { type: "string", example: "MAD" },
            status: {
              type: "string",
              enum: ["CONFIRMED", "CANCELLED", "COMPLETED"],
            },
            cancelledAt: {
              type: "string",
              format: "date-time",
              nullable: true,
            },
          },
        },
      },
    },
    Pagination: {
      type: "object",
      properties: {
        page: { type: "integer", example: 1 },
        limit: { type: "integer", example: 10 },
        total: { type: "integer", example: 23 },
        totalPages: { type: "integer", example: 3 },
      },
    },
    Review: {
      type: "object",
      properties: {
        id: { type: "string" },
        bookingId: { type: "string" },
        playerId: { type: "string" },
        stadiumId: { type: "string" },
        rating: { type: "integer", minimum: 1, maximum: 5, example: 5 },
        comment: { type: "string", nullable: true, example: "Great stadium." },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/modules/**/*.routes.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
