# Backend Architecture Documentation

This document explains the complete backend logic for the WebSocket Chat application, including database design, API flows, and query explanations.

## **Database Schema Overview**

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│    USERS    │    │    ROOMS     │    │  MESSAGES   │
├─────────────┤    ├──────────────┤    ├─────────────┤
│ id (PK)     │    │ id (PK)      │    │ id (PK)     │
│ username    │    │ name         │    │ room_id (FK)│
│ email       │    │ description  │    │ user_id (FK)│
│ password    │    │ created_by   │    │ content     │
│ created_at  │    │ is_private   │    │ created_at  │
└─────────────┘    │ created_at   │    │ message_type│
                   │ updated_at   │    │ updated_at  │
                   └──────────────┘    │ deleted_at  │
                          │            └─────────────┘
                          │
                   ┌──────────────┐
                   │ ROOM_MEMBERS │
                   ├──────────────┤
                   │ id (PK)      │
                   │ room_id (FK) │
                   │ user_id (FK) │
                   │ role         │
                   │ joined_at    │
                   └──────────────┘
```

### **Table Relationships**

- **users** ↔ **room_members**: One-to-Many (user can be in multiple rooms)
- **rooms** ↔ **room_members**: One-to-Many (room can have multiple members)
- **rooms** ↔ **messages**: One-to-Many (room can have multiple messages)
- **users** ↔ **messages**: One-to-Many (user can send multiple messages)
- **rooms.created_by** → **users.id**: Foreign key (room creator)

### **Indexes for Performance**

```sql
CREATE INDEX idx_messages_room_id ON messages(room_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_room_members_room_id ON room_members(room_id);
CREATE INDEX idx_room_members_user_id ON room_members(user_id);
```

## **API Flow Diagrams**

### **1. GET /api/rooms - List All Rooms**

```
Client Request
     │
     ▼
┌─────────────────────────────────────┐
│ authenticateToken middleware        │
│ • Verifies JWT token                │
│ • Extracts userId from token        │
│ • Adds user info to req.user        │
└─────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────┐
│ SQL Query: Get Rooms with           │
│ Member Info                         │
│                                     │
│ SELECT r.*,                         │
│   COALESCE(rm_count.member_count,0) │
│     as member_count,                │
│   CASE WHEN user_rm.user_id         │
│     IS NOT NULL THEN true           │
│     ELSE false END as is_member     │
│ FROM rooms r                        │
│ LEFT JOIN (                         │
│   SELECT room_id, COUNT(*)          │
│     as member_count                 │
│   FROM room_members                 │
│   GROUP BY room_id                  │
│ ) rm_count ON r.id = rm_count.room_id│
│ LEFT JOIN room_members user_rm      │
│   ON r.id = user_rm.room_id         │
│   AND user_rm.user_id = $1          │
│ WHERE r.is_private = false          │
│   OR user_rm.user_id IS NOT NULL    │
│ ORDER BY r.created_at DESC          │
└─────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────┐
│ Response Format:                    │
│ [                                   │
│   {                                 │
│     id: 1,                          │
│     name: "General",                │
│     description: "Welcome...",      │
│     member_count: 5,                │
│     is_member: true,                │
│     is_private: false,              │
│     created_at: "2024-01-01..."     │
│   }                                 │
│ ]                                   │
└─────────────────────────────────────┘
```

**Query Explanation:**
- **Main SELECT**: Gets all room data
- **rm_count subquery**: Counts total members per room
- **user_rm JOIN**: Checks if current user is member
- **WHERE clause**: Shows public rooms + private rooms user belongs to
- **COALESCE**: Handles rooms with 0 members

### **2. POST /api/rooms - Create New Room**

```
Client Request: POST /api/rooms
Body: { name: "New Room", description: "...", is_private: false }
     │
     ▼
┌─────────────────────────────────────┐
│ authenticateToken middleware        │
└─────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────┐
│ Step 1: Validate Input              │
│ • Check name is provided            │
│ • Trim whitespace                   │
└─────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────┐
│ Step 2: Check Name Uniqueness       │
│                                     │
│ SELECT id FROM rooms                │
│ WHERE LOWER(name) = LOWER($1)       │
└─────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────┐
│ Step 3: Create Room                 │
│                                     │
│ INSERT INTO rooms                   │
│ (name, description, created_by,     │
│  is_private)                        │
│ VALUES ($1, $2, $3, $4)             │
│ RETURNING *                         │
└─────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────┐
│ Step 4: Add Creator as Admin        │
│                                     │
│ INSERT INTO room_members            │
│ (room_id, user_id, role)            │
│ VALUES ($1, $2, 'admin')            │
└─────────────────────────────────────┘
     │
     ▼
Success Response: Room object with member_count: 1, is_member: true
```

### **3. POST /api/rooms/:id/join - Join a Room**

```
Client Request: POST /api/rooms/1/join
     │
     ▼
┌─────────────────────────────────────┐
│ authenticateToken middleware        │
└─────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────┐
│ Step 1: Verify Room Exists & Public │
│                                     │
│ SELECT * FROM rooms                 │
│ WHERE id = $1 AND is_private = false│
└─────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────┐
│ Step 2: Check Not Already Member    │
│                                     │
│ SELECT id FROM room_members         │
│ WHERE room_id = $1 AND user_id = $2 │
└─────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────┐
│ Step 3: Add User to Room            │
│                                     │
│ INSERT INTO room_members            │
│ (room_id, user_id, role)            │
│ VALUES ($1, $2, 'member')           │
└─────────────────────────────────────┘
     │
     ▼
Success Response: { message: "Successfully joined room" }
```

### **4. GET /api/messages/:roomId - Get Message History**

```
Client Request: GET /api/messages/1?limit=50&before=2024-01-01T10:00:00Z
     │
     ▼
┌─────────────────────────────────────┐
│ authenticateToken middleware        │
└─────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────┐
│ Step 1: Verify User Access to Room  │
│                                     │
│ SELECT rm.* FROM room_members rm    │
│ JOIN rooms r ON rm.room_id = r.id   │
│ WHERE rm.room_id = $1               │
│   AND rm.user_id = $2               │
│   AND (r.is_private = false         │
│   OR rm.user_id IS NOT NULL)        │
└─────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────┐
│ Step 2: Build Pagination Query      │
│                                     │
│ Base Query:                         │
│ SELECT m.*, u.username              │
│ FROM messages m                     │
│ JOIN users u ON m.user_id = u.id    │
│ WHERE m.room_id = $1                │
│   AND m.deleted_at IS NULL          │
│                                     │
│ If 'before' provided:               │
│   AND m.created_at < $2             │
│                                     │
│ ORDER BY m.created_at DESC          │
│ LIMIT $3                            │
└─────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────┐
│ Step 3: Format Response             │
│ • Reverse messages (oldest first)   │
│ • Calculate hasMore flag            │
│ • Return oldest message timestamp   │
│                                     │
│ {                                   │
│   messages: [...],                  │
│   hasMore: boolean,                 │
│   oldest: "2024-01-01T09:30:00Z"    │
│ }                                   │
└─────────────────────────────────────┘
```

**Pagination Logic:**
- Messages fetched newest-first (DESC)
- Client sends `before` timestamp for older messages
- `hasMore` = true if result count equals limit
- Frontend reverses array to show chronological order

### **5. POST /api/messages/:roomId - Send Message**

```
Client Request: POST /api/messages/1
Body: { content: "Hello world!", message_type: "text" }
     │
     ▼
┌─────────────────────────────────────┐
│ authenticateToken middleware        │
└─────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────┐
│ Step 1: Validate Input              │
│ • Check content is not empty        │
│ • Trim whitespace                   │
│ • Default message_type to 'text'    │
└─────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────┐
│ Step 2: Verify User Access          │
│ (Same access check as messages GET) │
└─────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────┐
│ Step 3: Insert Message              │
│                                     │
│ INSERT INTO messages                │
│ (room_id, user_id, content,         │
│  message_type)                      │
│ VALUES ($1, $2, $3, $4)             │
│ RETURNING *                         │
└─────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────┐
│ Step 4: Get Message with Username   │
│                                     │
│ SELECT m.*, u.username              │
│ FROM messages m                     │
│ JOIN users u ON m.user_id = u.id    │
│ WHERE m.id = $1                     │
└─────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────┐
│ Response: Complete Message Object   │
│ {                                   │
│   id: 123,                          │
│   room_id: 1,                       │
│   user_id: 5,                       │
│   content: "Hello world!",          │
│   message_type: "text",             │
│   username: "john_doe",             │
│   created_at: "2024-01-01T10:00:00",│
│   updated_at: "2024-01-01T10:00:00" │
│ }                                   │
└─────────────────────────────────────┘
```

## **WebSocket Flow**

### **Room Join/Leave Events**

```
User Navigates to Room Page
     │
     ▼
┌─────────────────────────────────────┐
│ Frontend: socket.emit("join-room",  │
│                      roomId)        │
└─────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────┐
│ Backend WebSocket Handler:          │
│ socket.on("join-room", (roomId) => {│
│   socket.join(`room-${roomId}`)     │
│   socket.to(`room-${roomId}`)       │
│     .emit("user-joined", {          │
│       socketId: socket.id,          │
│       roomId                        │
│     })                              │
│ })                                  │
└─────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────┐
│ Other Users in Room:                │
│ Receive "user-joined" event         │
│ Can update online user list         │
└─────────────────────────────────────┘

User Leaves Room/Page
     │
     ▼
┌─────────────────────────────────────┐
│ Frontend: socket.emit("leave-room", │
│                      roomId)        │
└─────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────┐
│ Backend: socket.leave(`room-${id}`) │
│ Notifies others: "user-left"        │
└─────────────────────────────────────┘
```

### **Real-time Message Flow**

```
User Types Message & Hits Send
     │
     ▼
┌─────────────────────────────────────┐
│ 1. Frontend: API Call               │
│    POST /api/messages/1             │
│    • Saves message to database      │
│    • Returns complete message obj   │
└─────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────┐
│ 2. Frontend: Add to Local UI        │
│    setMessages(prev => [...prev, msg])│
│    • Immediate UI update            │
└─────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────┐
│ 3. Frontend: Broadcast via Socket   │
│    socket.emit("room-message", {    │
│      roomId: roomId.toString(),     │
│      message: newMessage            │
│    })                               │
└─────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────┐
│ 4. Backend: Room-based Broadcast    │
│    socket.on("room-message", (data) => {│
│      socket.to(`room-${data.roomId}`)│
│        .emit("room-message",        │
│              data.message)          │
│    })                               │
│    • Sends to all room members      │
│    • Excludes sender (avoids dupe)  │
└─────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────┐
│ 5. Other Users: Real-time Update    │
│    socket.on("room-message", (msg) => {│
│      setMessages(prev => [...prev, msg])│
│    })                               │
│    • Instant message appears        │
└─────────────────────────────────────┘
```

## **Authentication Flow**

### **JWT Token Verification**

```
API Request with Authorization Header
     │
     ▼
┌─────────────────────────────────────┐
│ authenticateToken Middleware        │
│                                     │
│ 1. Extract token from header:       │
│    Bearer <jwt-token>               │
│                                     │
│ 2. Verify token with JWT_SECRET:    │
│    jwt.verify(token, secret)        │
│                                     │
│ 3. Decode payload:                  │
│    { userId: 123, username: "..." } │
│                                     │
│ 4. Add to request object:           │
│    req.user = { userId, username }  │
└─────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────┐
│ Route Handler Execution             │
│ • Has access to req.user.userId     │
│ • Can perform user-specific queries │
└─────────────────────────────────────┘
```

## **Access Control Logic**

### **Room Access Matrix**

| Room Type | User Status | Can See | Can Join | Can Send Messages |
|-----------|-------------|---------|----------|-------------------|
| Public    | Non-member  | ✅      | ✅       | ❌                |
| Public    | Member      | ✅      | N/A      | ✅                |
| Private   | Non-member  | ❌      | ❌       | ❌                |
| Private   | Member      | ✅      | N/A      | ✅                |

### **Role Permissions**

| Action | Member | Moderator | Admin |
|--------|--------|-----------|-------|
| Send messages | ✅ | ✅ | ✅ |
| Delete own messages | ✅ | ✅ | ✅ |
| Delete others' messages | ❌ | ✅ | ✅ |
| Invite to private room | ❌ | ✅ | ✅ |
| Change room settings | ❌ | ❌ | ✅ |
| Delete room | ❌ | ❌ | ✅ |

## **Database Queries Reference**

### **Common Query Patterns**

**Get user's rooms:**
```sql
SELECT r.*, rm.role, rm.joined_at
FROM rooms r
JOIN room_members rm ON r.id = rm.room_id
WHERE rm.user_id = $1
ORDER BY rm.joined_at DESC;
```

**Get room members with usernames:**
```sql
SELECT rm.*, u.username
FROM room_members rm
JOIN users u ON rm.user_id = u.id
WHERE rm.room_id = $1
ORDER BY rm.joined_at ASC;
```

**Check if user can access room:**
```sql
SELECT EXISTS(
  SELECT 1 FROM room_members rm
  JOIN rooms r ON rm.room_id = r.id
  WHERE rm.room_id = $1 
    AND rm.user_id = $2
    AND (r.is_private = false OR rm.user_id IS NOT NULL)
) as has_access;
```

**Get latest messages for room:**
```sql
SELECT m.*, u.username
FROM messages m
JOIN users u ON m.user_id = u.id
WHERE m.room_id = $1 
  AND m.deleted_at IS NULL
ORDER BY m.created_at DESC
LIMIT 50;
```

## **Performance Considerations**

### **Database Optimizations**

1. **Indexes on Foreign Keys**: All FK columns indexed
2. **Composite Indexes**: `(room_id, user_id)` for room_members
3. **Partial Indexes**: `WHERE deleted_at IS NULL` for active messages
4. **Query Optimization**: Use JOINs instead of subqueries where possible

### **Caching Strategy**

1. **Room Lists**: Cache public room list (rarely changes)
2. **User Permissions**: Cache user-room relationships
3. **Message Counts**: Cache room member counts
4. **Redis Integration**: For session management and real-time features

### **Scalability Notes**

1. **Database Connection Pooling**: Uses pg Pool for connection management
2. **Room-based Socket Channels**: Prevents broadcasting to all users
3. **Message Pagination**: Prevents loading entire chat history
4. **Soft Deletes**: Messages marked as deleted, not physically removed

## **Error Handling Patterns**

### **Common Error Responses**

```javascript
// 401 Unauthorized
{ error: "Access token required" }
{ error: "Invalid or expired token" }

// 403 Forbidden
{ error: "Access denied to this room" }
{ error: "Not authorized to delete this message" }

// 404 Not Found
{ error: "Room not found or access denied" }
{ error: "Message not found" }

// 400 Bad Request
{ error: "Room name is required" }
{ error: "Message content is required" }
{ error: "Username or email already exists" }

// 500 Internal Server Error
{ error: "Internal server error" }
```

### **Database Error Handling**

```javascript
try {
  const result = await query('SELECT ...', [params])
  // Handle success
} catch (error) {
  console.error('Database error:', error)
  
  if (error.code === '23505') { // Unique violation
    return res.status(400).json({ error: 'Already exists' })
  }
  
  res.status(500).json({ error: 'Internal server error' })
}
```

This architecture provides a solid foundation for a scalable, real-time chat application with proper access controls and data persistence.