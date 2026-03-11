# API Reference - Updated Person Schema

## Person API Endpoints

### List Persons
```http
GET /api/v1/persons

Response: [
  {
    "id": 1,
    "name": "John Doe",
    "age": 28,
    "gender": "Male",
    "employee_id": "EMP001",
    "is_active": true,
    "created_at": "2026-03-12T10:00:00",
    "updated_at": "2026-03-12T10:00:00"
  }
]
```

### Create Person
```http
POST /api/v1/persons
Content-Type: application/json

{
  "name": "John Doe",
  "age": 28,
  "gender": "Male",
  "employee_id": "EMP001"
}

Response: {
  "id": 1,
  "name": "John Doe",
  "age": 28,
  "gender": "Male",
  "employee_id": "EMP001",
  "is_active": true,
  "created_at": "2026-03-12T10:00:00",
  "updated_at": "2026-03-12T10:00:00"
}
```

### Update Person
```http
PUT /api/v1/persons/{id}
Content-Type: application/json

{
  "name": "John Smith",
  "age": 29,
  "gender": "Male"
}

Response: {
  "id": 1,
  "name": "John Smith",
  "age": 29,
  "gender": "Male",
  "employee_id": "EMP001",
  "is_active": true,
  "created_at": "2026-03-12T10:00:00",
  "updated_at": "2026-03-12T10:00:00"
}
```

### Get Person
```http
GET /api/v1/persons/{id}

Response: {
  "id": 1,
  "name": "John Doe",
  "age": 28,
  "gender": "Male",
  "employee_id": "EMP001",
  "is_active": true,
  "created_at": "2026-03-12T10:00:00",
  "updated_at": "2026-03-12T10:00:00"
}
```

### Delete Person
```http
DELETE /api/v1/persons/{id}

Response: 204 No Content
```

## Person Schema

### Fields

- **id** (integer, auto-generated): Unique identifier
- **name** (string, required): Full name of the person
- **age** (integer, optional): Person's age (1-120)
- **gender** (string, optional): Gender (Male, Female, Other)
- **employee_id** (string, optional, unique): Employee identifier
- **is_active** (boolean, default: true): Whether person is active in system
- **created_at** (datetime, auto-generated): Creation timestamp
- **updated_at** (datetime, auto-generated): Last update timestamp

### Validation Rules

- **name**: Required, non-empty string
- **age**: Optional, integer between 1 and 120
- **gender**: Optional, one of: "Male", "Female", "Other"
- **employee_id**: Optional, must be unique if provided

### Example Person Object

```json
{
  "id": 1,
  "name": "Jane Smith",
  "age": 32,
  "gender": "Female",
  "employee_id": "EMP002",
  "is_active": true,
  "created_at": "2026-03-12T10:00:00.000Z",
  "updated_at": "2026-03-12T10:00:00.000Z"
}
```

## Migration from Old Schema

### Removed Fields
- `email` - No longer needed for face detection
- `phone` - No longer needed for face detection
- `department` - Simplified for MVP

### Added Fields
- `age` - Useful for demographics and identification
- `gender` - Useful for demographics and identification

### Why These Changes?

The simplified schema focuses on essential information for a face detection system:

1. **Name**: Core identifier for the person
2. **Age**: Helps with identification and demographics
3. **Gender**: Helps with identification and demographics
4. **Employee ID**: Maintains workplace integration capability

Removed fields (email, phone, department) were more suited for a full HR system rather than a focused face detection system. They can be added back if needed in the future.
