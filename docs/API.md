# API Reference

Complete documentation of all REST API endpoints for the BeyondChats Article Enhancement Platform.

## Base URL

```
http://localhost:3000/api
```

For production, replace with your deployed domain.

## Authentication

Currently, the API has **no authentication**. All endpoints are public.

**Future Consideration:** Add API keys or JWT authentication for production.

## Response Format

All responses are JSON with the following structure:

### Success Response (2xx)
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "Article Title",
  "content": "...",
  "author": "Author Name",
  "date": "2024-01-15T00:00:00Z",
  "url": "https://example.com/article",
  "isUpdated": true,
  "updatedContent": "...",
  "references": ["https://ref1.com", "https://ref2.com"],
  "createdAt": "2024-01-20T12:30:45.123Z",
  "updatedAt": "2024-01-20T14:20:30.456Z"
}
```

### Error Response (4xx, 5xx)
```json
{
  "error": "Error message describing what went wrong"
}
```

## Endpoints

### 1. List All Articles

**Endpoint:** `GET /articles`

**Description:** Retrieve all articles with optional filtering.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `enhanced` | boolean | No | Filter by enhancement status. `true` = only enhanced, `false` = only original |

**Examples:**

Get all articles:
```bash
curl http://localhost:3000/api/articles
```

Get only enhanced articles:
```bash
curl http://localhost:3000/api/articles?enhanced=true
```

Get only original articles:
```bash
curl http://localhost:3000/api/articles?enhanced=false
```

**Response:** `200 OK`
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Article 1",
    "content": "...",
    "author": "Author Name",
    "date": "2024-01-15T00:00:00Z",
    "url": "https://example.com/article1",
    "isUpdated": true,
    "updatedContent": "...",
    "references": ["https://ref1.com"],
    "createdAt": "2024-01-20T12:30:45.123Z",
    "updatedAt": "2024-01-20T14:20:30.456Z"
  },
  {
    "_id": "507f1f77bcf86cd799439012",
    "title": "Article 2",
    ...
  }
]
```

**Status Codes:**
- `200 OK` - Success
- `500 Internal Server Error` - Database connection error

---

### 2. Get Single Article

**Endpoint:** `GET /articles/:id`

**Description:** Retrieve a specific article by ID.

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | MongoDB ObjectId of the article |

**Examples:**

```bash
curl http://localhost:3000/api/articles/507f1f77bcf86cd799439011
```

**Response:** `200 OK`
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "Article Title",
  "content": "Article content here...",
  "author": "Author Name",
  "date": "2024-01-15T00:00:00Z",
  "url": "https://example.com/article",
  "isUpdated": true,
  "updatedContent": "Enhanced content here...",
  "references": [
    "https://reference1.com",
    "https://reference2.com"
  ],
  "createdAt": "2024-01-20T12:30:45.123Z",
  "updatedAt": "2024-01-20T14:20:30.456Z"
}
```

**Status Codes:**
- `200 OK` - Article found and returned
- `404 Not Found` - Article ID doesn't exist
- `500 Internal Server Error` - Database error

---

### 3. Create Article

**Endpoint:** `POST /articles`

**Description:** Create a new article in the database.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Article title (max 500 chars) |
| `content` | string | Yes | Article HTML content |
| `author` | string | Yes | Author name (max 200 chars) |
| `date` | string (ISO 8601) | Yes | Publication date |
| `url` | string | Yes | Unique article URL |

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/articles \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Understanding Next.js",
    "content": "<p>Next.js is a React framework...</p>",
    "author": "John Doe",
    "date": "2024-01-15",
    "url": "https://beyondchats.com/blog/nextjs-guide"
  }'
```

**Response:** `201 Created`
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "title": "Understanding Next.js",
  "content": "<p>Next.js is a React framework...</p>",
  "author": "John Doe",
  "date": "2024-01-15T00:00:00Z",
  "url": "https://beyondchats.com/blog/nextjs-guide",
  "isUpdated": false,
  "updatedContent": null,
  "references": [],
  "createdAt": "2024-01-20T15:45:30.123Z",
  "updatedAt": "2024-01-20T15:45:30.123Z"
}
```

**Status Codes:**
- `201 Created` - Article successfully created
- `400 Bad Request` - Missing required fields or invalid data
- `500 Internal Server Error` - Database error

**Validation Rules:**
- All fields required
- URL must be unique (no duplicates)
- Date must be valid ISO 8601 format
- Content must not be empty

---

### 4. Update Article

**Endpoint:** `PUT /articles/:id`

**Description:** Update an existing article (typically used to add enhanced content).

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | MongoDB ObjectId of article to update |

**Request Headers:**
```
Content-Type: application/json
```

**Request Body** (all optional - provide only fields to update):

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | New article title |
| `content` | string | New article content |
| `author` | string | New author name |
| `date` | string | New publication date |
| `url` | string | New article URL |
| `isUpdated` | boolean | Whether article is enhanced |
| `updatedContent` | string | Enhanced article content |
| `references` | array | URLs of reference articles |

**Example Request (Enhancement Update):**
```bash
curl -X PUT http://localhost:3000/api/articles/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "isUpdated": true,
    "updatedContent": "Enhanced article content with AI improvements...",
    "references": [
      "https://reference1.com",
      "https://reference2.com"
    ]
  }'
```

**Example Request (Basic Update):**
```bash
curl -X PUT http://localhost:3000/api/articles/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "author": "New Author"
  }'
```

**Response:** `200 OK`
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "Article Title",
  "content": "...",
  "author": "Author Name",
  "date": "2024-01-15T00:00:00Z",
  "url": "https://example.com/article",
  "isUpdated": true,
  "updatedContent": "Enhanced content...",
  "references": [
    "https://reference1.com",
    "https://reference2.com"
  ],
  "createdAt": "2024-01-20T12:30:45.123Z",
  "updatedAt": "2024-01-20T16:00:15.789Z"
}
```

**Status Codes:**
- `200 OK` - Article successfully updated
- `400 Bad Request` - Invalid data format
- `404 Not Found` - Article ID doesn't exist
- `500 Internal Server Error` - Database error

**Notes:**
- `updatedAt` timestamp is automatically set
- `_id` and `createdAt` cannot be modified
- Provide only fields you want to update

---

### 5. Delete Article

**Endpoint:** `DELETE /articles/:id`

**Description:** Delete an article from the database.

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | MongoDB ObjectId of article to delete |

**Example Request:**
```bash
curl -X DELETE http://localhost:3000/api/articles/507f1f77bcf86cd799439011
```

**Response:** `200 OK`
```json
{
  "message": "Article deleted successfully"
}
```

**Status Codes:**
- `200 OK` - Article successfully deleted
- `404 Not Found` - Article ID doesn't exist
- `500 Internal Server Error` - Database error

**Warning:** This operation cannot be undone. Delete carefully.

---

## Common Use Cases

### Use Case 1: Scraper Integration

The scraper (`scrapeBlogs.js`) automatically uses the POST endpoint internally:

```javascript
// POST new article
const response = await axios.post('http://localhost:3000/api/articles', {
  title: article.title,
  content: article.content,
  author: article.author,
  date: article.date,
  url: article.url
});
```

### Use Case 2: Enhancement Integration

The enhancement script updates articles with AI-generated content:

```javascript
// PUT update with enhanced content
const response = await axios.put(
  `http://localhost:3000/api/articles/${articleId}`,
  {
    isUpdated: true,
    updatedContent: enhancedText,
    references: citedUrls
  }
);
```

### Use Case 3: Frontend Display

Homepage fetches articles:

```javascript
// GET all articles or filtered
const response = await fetch('/api/articles?enhanced=true');
const articles = await response.json();
```

Detail page fetches single article:

```javascript
// GET single article
const response = await fetch(`/api/articles/${articleId}`);
const article = await response.json();
```

---

## Error Handling

### Common Errors

**400 Bad Request**
```json
{
  "error": "Missing required fields: title, content"
}
```

**404 Not Found**
```json
{
  "error": "Article not found"
}
```

**500 Internal Server Error**
```json
{
  "error": "Database connection failed"
}
```

### Handling Errors in Code

```javascript
try {
  const response = await fetch('/api/articles/invalid-id');
  if (!response.ok) {
    const error = await response.json();
    console.error(error.error);
    // Handle error appropriately
  }
  const data = await response.json();
} catch (err) {
  console.error('Network error:', err);
}
```

---

## Rate Limiting

Currently **no rate limiting** is implemented on the API.

**Recommended for production:**
- Implement rate limiting middleware (express-rate-limit)
- Limit to 100 requests per IP per hour
- Add API key authentication

---

## CORS

The API is configured for **same-origin requests only** (from Next.js frontend).

To allow cross-origin requests from other domains, update the Next.js API configuration.

---

## Pagination

Currently **no pagination** is implemented.

For large datasets, consider adding:
- `limit` and `skip` query parameters
- Total count in response
- Cursor-based pagination

Example:
```bash
curl http://localhost:3000/api/articles?limit=10&skip=20
```

---

## Versioning

Current API version: **v1** (implicit)

The endpoint structure may change in future versions. Always check documentation after updates.

---

## Examples with Different Languages

### Node.js / JavaScript
```javascript
const axios = require('axios');

// GET all articles
const articles = await axios.get('http://localhost:3000/api/articles');
console.log(articles.data);

// POST new article
const newArticle = await axios.post('http://localhost:3000/api/articles', {
  title: 'New Article',
  content: 'Content here',
  author: 'Author',
  date: '2024-01-20',
  url: 'https://example.com'
});
```

### Python
```python
import requests

# GET all articles
response = requests.get('http://localhost:3000/api/articles')
articles = response.json()
print(articles)

# POST new article
data = {
    'title': 'New Article',
    'content': 'Content here',
    'author': 'Author',
    'date': '2024-01-20',
    'url': 'https://example.com'
}
response = requests.post('http://localhost:3000/api/articles', json=data)
new_article = response.json()
```

### cURL (Shell)
```bash
# GET all articles
curl http://localhost:3000/api/articles

# POST new article
curl -X POST http://localhost:3000/api/articles \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Article",
    "content": "Content here",
    "author": "Author",
    "date": "2024-01-20",
    "url": "https://example.com"
  }'

# PUT update article
curl -X PUT http://localhost:3000/api/articles/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{"isUpdated": true}'

# DELETE article
curl -X DELETE http://localhost:3000/api/articles/507f1f77bcf86cd799439011
```

---

## Testing Endpoints

### Using Postman

1. **Import Collection:**
   - Create new request
   - Method: GET
   - URL: http://localhost:3000/api/articles
   - Send

2. **Create Article:**
   - Method: POST
   - URL: http://localhost:3000/api/articles
   - Body (JSON): `{"title": "Test", ...}`
   - Send

### Using VS Code REST Client

Install REST Client extension, create `test.rest`:

```
### Get all articles
GET http://localhost:3000/api/articles

### Get single article
GET http://localhost:3000/api/articles/507f1f77bcf86cd799439011

### Create article
POST http://localhost:3000/api/articles
Content-Type: application/json

{
  "title": "Test Article",
  "content": "Test content",
  "author": "Test Author",
  "date": "2024-01-20",
  "url": "https://test.com"
}

### Update article
PUT http://localhost:3000/api/articles/507f1f77bcf86cd799439011
Content-Type: application/json

{
  "isUpdated": true,
  "updatedContent": "Enhanced content"
}

### Delete article
DELETE http://localhost:3000/api/articles/507f1f77bcf86cd799439011
```
