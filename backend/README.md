# Malaab Backend — Class Diagram

This document describes the persisted domain model of the Malaab backend. It is generated from the Mongoose schemas in `src/modules` and shows the main classes, embedded value objects, enums, and relationships between collections.

## Domain class diagram

```mermaid
classDiagram
    direction LR

    class User {
        +ObjectId id
        +String firstName
        +String lastName
        +String email
        -String password
        +String role
        +Boolean isActive
        +Date createdAt
        +Date updatedAt
        +comparePassword(candidate) Promise~Boolean~
    }

    class Stadium {
        +ObjectId id
        +String name
        +String description
        +String[] images
        +String[] amenities
        +Number pricePerHour
        +Number averageRating
        +Number reviewCount
        +Boolean isActive
        +Date createdAt
        +Date updatedAt
    }

    class Location {
        +String address
        +String city
        +String coordinateType
        +Number[2] coordinates
    }

    class WorkingDay {
        +Number dayOfWeek
        +Boolean isOpen
        +String openTime
        +String closeTime
    }

    class Image {
        +ObjectId id
        +String url
        +String publicId
        +Boolean isPrimary
        +Date createdAt
        +Date updatedAt
    }

    class Booking {
        +ObjectId id
        +Date startAt
        +Date endAt
        +Number price
        +String currency
        +String status
        +String cancellationReason
        +Date cancelledAt
        +Date completedAt
        +Date createdAt
        +Date updatedAt
    }

    class Review {
        +ObjectId id
        +Number rating
        +String comment
        +Date createdAt
        +Date updatedAt
    }

    class Conversation {
        +ObjectId id
        +Date createdAt
        +Date updatedAt
    }

    class Message {
        +ObjectId id
        +String content
        +Date createdAt
        +Date updatedAt
    }

    class Notification {
        +ObjectId id
        +String type
        +String title
        +String message
        +String relatedEntityType
        +Boolean isRead
        +Date createdAt
    }

    class AdminAction {
        +ObjectId id
        +String action
        +String targetType
        +String reason
        +Date createdAt
    }

    User "1" --> "0..*" Stadium : owns
    Stadium "1" *-- "1" Location : embeds
    Stadium "1" *-- "7" WorkingDay : embeds
    Stadium "1" --> "0..5" Image : has uploads

    User "1" --> "0..*" Booking : makes
    Stadium "1" --> "0..*" Booking : receives
    User "0..1" <-- "0..*" Booking : cancelled by

    Booking "1" --> "0..1" Review : produces
    User "1" --> "0..*" Review : writes
    Stadium "1" --> "0..*" Review : receives

    User "1" --> "0..*" Conversation : joins as player
    User "1" --> "0..*" Conversation : joins as owner
    Stadium "1" --> "0..*" Conversation : concerns
    Conversation "1" *-- "0..*" Message : contains
    User "1" --> "0..*" Message : sends

    User "1" --> "0..*" Notification : receives
    Notification ..> Booking : may reference
    Notification ..> Conversation : may reference
    Notification ..> User : may reference

    User "1" --> "0..*" AdminAction : performs as admin
    AdminAction "0..*" --> "1" User : targets
```

## Relationship guide

| Relationship | Meaning |
| --- | --- |
| `User → Stadium` | An owner can create multiple stadiums; every stadium belongs to one owner. |
| `Stadium ◆→ Location` | Location is embedded directly inside the stadium document. |
| `Stadium ◆→ WorkingDay` | Each stadium embeds a seven-day working-hours schedule. |
| `Stadium → Image` | Uploaded Cloudinary images are stored as separate image documents and belong to one stadium. |
| `User → Booking` | A player can create multiple bookings. |
| `Stadium → Booking` | A stadium can receive multiple bookings. |
| `Booking → Review` | A completed booking can produce at most one review because `bookingId` is unique. |
| `Conversation ◆→ Message` | A conversation contains messages; every message belongs to one conversation. |
| `Notification ⇢ related entity` | `relatedEntityType` and `relatedEntityId` form a polymorphic reference to a booking, conversation, or user. |
| `AdminAction → User` | An administrator action records both the administrator and the targeted user. |

## Important model constraints

- `User.email` is unique, normalized to lowercase, and passwords are hashed before saving.
- `Stadium.location.coordinates` has a `2dsphere` index for geospatial queries.
- Stadium working days use values `0` through `6` and are embedded without individual IDs.
- `Image.stadiumId`, `Booking.playerId`, `Booking.stadiumId`, and other frequently queried references are indexed.
- A conversation is unique for one player, one owner, and one stadium.
- Messages are indexed by conversation and creation date.
- Review ratings are integers in the application layer and restricted to the range `1–5` by the schema.
- One booking can have only one review.
- Notifications are indexed by recipient/date and recipient/read status.
- `Notification.relatedEntityId` and `AdminAction.targetId` are logical references rather than Mongoose `ref` fields.

## Source mapping

| Diagram class | Source file |
| --- | --- |
| `User` | `src/modules/auth/auth.model.ts` |
| `Stadium`, `Location`, `WorkingDay` | `src/modules/stadium/stadium.model.ts` |
| `Image` | `src/modules/image/image.model.ts` |
| `Booking` | `src/modules/booking/booking.model.ts` |
| `Review` | `src/modules/review/review.model.ts` |
| `Conversation`, `Message` | `src/modules/conversation/conversation.model.ts` |
| `Notification` | `src/modules/notifications/notifications.model.ts` |
| `AdminAction` | `src/modules/admin/admin.model.ts` |

> Note: `Stadium.images` exists as a string array in the stadium schema while uploaded images are also represented by the separate `Image` collection. Both are included because both structures exist in the current backend model.
