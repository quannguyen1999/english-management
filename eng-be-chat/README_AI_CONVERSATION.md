# AI Conversation API

This document describes the new API endpoint for creating conversations with an AI English teacher.

## Overview

The AI Conversation API allows users to create a new conversation with an AI English teacher. This creates a private conversation between the current user and the AI teacher, which can then be used for English learning conversations.

## API Endpoints

### Create AI Conversation

**POST** `/conversations/ai`

Creates a new conversation between the current authenticated user and the AI English teacher.

#### Request

- **Method**: POST
- **Path**: `/conversations/ai`
- **Authentication**: Required (Bearer token)
- **Body**: None required

#### Response

**Success Response (200 OK)**

```json
{
  "id": "uuid-of-conversation",
  "isGroup": false,
  "name": "AI English Teacher",
  "participants": [
    {
      "userId": "current-user-uuid",
      "username": "current-username",
      "joinedAt": "2024-01-01T00:00:00.000Z",
      "avatar": "avatar-url"
    },
    {
      "userId": "ai-teacher-uuid",
      "username": "ai_teacher",
      "joinedAt": "2024-01-01T00:00:00.000Z",
      "avatar": null
    }
  ]
}
```

### Get AI Conversations

**GET** `/conversations/ai`

Retrieves all AI conversations for the current authenticated user.

#### Request

- **Method**: GET
- **Path**: `/conversations/ai`
- **Authentication**: Required (Bearer token)
- **Body**: None required

#### Response

**Success Response (200 OK)**

```json
[
  {
    "id": "uuid-of-conversation-1",
    "isGroup": false,
    "name": "AI English Teacher",
    "participants": [...]
  },
  {
    "id": "uuid-of-conversation-2",
    "isGroup": false,
    "name": "AI English Teacher",
    "participants": [...]
  }
]
```

**Error Response (500 Internal Server Error)**

```json
{
  "message": "AI Teacher user not found. Please create an AI_TEACHER user with UUID '00000000-0000-0000-0000-000000000001' or username 'ai_teacher' first."
}
```

## Prerequisites

Before using this API, ensure that:

1. **AI Teacher User Exists**: A user with role `AI_TEACHER` must exist in the database
2. **Database Migration**: Run the migration `V20250101000000__create_ai_teacher_user.sql` to create the default AI teacher user
3. **Authentication**: The user must be authenticated with a valid JWT token

## Default AI Teacher User

The system expects a default AI teacher user with:

- **UUID**: `00000000-0000-0000-0000-000000000001`
- **Username**: `ai_teacher`
- **Email**: `ai.teacher@english-learning.com`
- **Role**: `AI_TEACHER`

## Usage Examples

### cURL Example

```bash
curl -X POST \
  http://localhost:8080/conversations/ai \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json'
```

### JavaScript Example

```javascript
const response = await fetch("/conversations/ai", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});

const conversation = await response.json();
console.log("AI Conversation created:", conversation);
```

### Get AI Conversations Examples

#### cURL Example

```bash
curl -X GET \
  http://localhost:8080/conversations/ai \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

#### JavaScript Example

```javascript
const response = await fetch("/conversations/ai", {
  method: "GET",
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

const conversations = await response.json();
console.log("AI Conversations:", conversations);
```

## Implementation Details

### Service Layer

- **Interface**: `ConversationService.createAIConversation()` and `ConversationService.getAIConversations()`
- **Implementation**: `ConversationServiceImpl.createAIConversation()` and `ConversationServiceImpl.getAIConversations()`
- **Transaction**: Create method is transactional to ensure data consistency

### Controller Layer

- **POST** `/conversations/ai`: Creates new AI conversation
- **GET** `/conversations/ai`: Retrieves existing AI conversations

### Database Operations

1. Finds or creates AI teacher user
2. Checks for existing AI conversation
3. Creates new conversation if none exists
4. Creates conversation participants
5. Returns conversation response
6. Filters conversations by AI conversation criteria

### Error Handling

- If AI teacher user doesn't exist, throws `RuntimeException`
- If conversation already exists, returns existing conversation
- All database operations are wrapped in transactions

## Future Enhancements

1. **Dynamic AI Teacher Selection**: Allow users to choose from multiple AI teachers
2. **Conversation Templates**: Pre-configure conversations with specific learning goals
3. **AI Teacher Profiles**: Different AI teachers for different skill levels or topics
4. **Conversation History**: Track learning progress and conversation history

## Notes

- This API only creates the conversation structure
- No messages are sent initially
- The conversation can be used later for actual AI chat functionality
- Each user can have only one AI conversation (subsequent calls return existing conversation)
