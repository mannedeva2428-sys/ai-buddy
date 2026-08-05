"""
This project talks to MongoDB directly with Motor (no ORM), so there's no
class-based model here. This file documents the shape of a "user" document
stored in the `users` collection, for reference:

{
    "_id": ObjectId,
    "name": str,
    "email": str (unique),
    "password": str (bcrypt hash, never stored in plain text),
    "bio": str,
    "avatar_color": str  # hex color used for the profile avatar in the UI
}
"""
