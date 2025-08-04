-- WebSocket Chat Database Migration for Supabase
-- Execute this in Supabase SQL Editor

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_by INTEGER REFERENCES users(id),
    is_private BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- Create room_members table
CREATE TABLE IF NOT EXISTS room_members (
    id SERIAL PRIMARY KEY,
    room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(room_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_room_id ON messages(room_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_room_members_room_id ON room_members(room_id);
CREATE INDEX IF NOT EXISTS idx_room_members_user_id ON room_members(user_id);

-- Insert current data from local database
-- Users
INSERT INTO users (id, username, email, password, created_at) VALUES 
(1, 'prathamesh', 'prathamesh@gmail.com', '$2b$10$AbRnrHzbKbNsJYCchKRjE.10Dvm5rJZ1X3CGKyXtnEg2Wfalbc3K.', '2025-08-04 18:11:07.201492'),
(2, 'joe', 'joe@gmail.com', '$2b$10$QwWhRXMvBzkA9/8w5dwJU.VIjnLguzpno.d03CMQXVn1WPuzjB4YO', '2025-08-04 18:52:04.679179')
ON CONFLICT (id) DO NOTHING;

-- Rooms
INSERT INTO rooms (id, name, description, created_by, is_private, created_at, updated_at) VALUES 
(3, 'Test', 'Testing room', 2, false, '2025-08-04 19:33:44.361239', '2025-08-04 19:33:44.361239')
ON CONFLICT (id) DO NOTHING;

-- Messages
INSERT INTO messages (id, room_id, user_id, content, message_type, created_at, updated_at, deleted_at) VALUES 
(1, 3, 1, 'Hi this is first message', 'text', '2025-08-04 19:35:30.990784', '2025-08-04 19:35:30.990784', NULL)
ON CONFLICT (id) DO NOTHING;

-- Room Members
INSERT INTO room_members (id, room_id, user_id, role, joined_at) VALUES 
(5, 3, 2, 'admin', '2025-08-04 19:33:44.364969'),
(6, 3, 1, 'member', '2025-08-04 19:34:21.253961')
ON CONFLICT (id) DO NOTHING;

-- Create a default General room
INSERT INTO rooms (name, description, is_private) VALUES 
('General', 'Welcome to the general chat room!', false)
ON CONFLICT (name) DO NOTHING;

-- Update sequences to correct values
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('rooms_id_seq', (SELECT MAX(id) FROM rooms));
SELECT setval('messages_id_seq', (SELECT MAX(id) FROM messages));
SELECT setval('room_members_id_seq', (SELECT MAX(id) FROM room_members));

-- Verify the migration
SELECT 'Users count:' as info, COUNT(*) as count FROM users
UNION ALL
SELECT 'Rooms count:' as info, COUNT(*) as count FROM rooms
UNION ALL
SELECT 'Messages count:' as info, COUNT(*) as count FROM messages
UNION ALL
SELECT 'Room members count:' as info, COUNT(*) as count FROM room_members;