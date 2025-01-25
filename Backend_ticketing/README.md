## API Documentation

### Authentication Routes

#### POST /auth/signup

**Description:** Register a new user.

**Request:**

```json
{
	"username": "string",
	"email": "string",
	"password": "string"
}
```

**Response:**

- **201 Created**
  ```json
  {
  	"_id": "string",
  	"username": "string",
  	"email": "string",
  	"password": "string",
  	"__v": 0
  }
  ```
- **409 Conflict**
  ```json
  {
  	"message": "User already exists"
  }
  ```

#### POST /auth/login

**Description:** Login an existing user.

**Request:**

```json
{
	"email": "string",
	"password": "string"
}
```

**Response:**

- **201 Created**
  ```json
  {
  	"message": "Logged in",
  	"success": true,
  	"token": "string",
  	"email": "string",
  	"username": "string"
  }
  ```
- **404 Not Found**
  ```json
  {
  	"message": "User not found"
  }
  ```
- **400 Bad Request**
  ```json
  {
  	"message": "Invalid credentials"
  }
  ```

#### POST /auth/logout

**Description:** Logout the current user.

**Request:** No request body.

**Response:**

- **200 OK**
  ```json
  {
  	"message": "Logged out"
  }
  ```
- **500 Internal Server Error**
  ```json
  {
  	"message": "Error message"
  }
  ```

#### GET /auth/tickets

**Description:** Get tickets for the authenticated user.

**Request:** No request body.

**Response:**

- **200 OK**
  ```json
  [
  	{
  		"_id": "string",
  		"event": {
  			"_id": "string",
  			"name": "string",
  			"date": "string"
  			// ...other event fields...
  		}
  		// ...other ticket fields...
  	}
  ]
  ```
- **404 Not Found**
  ```json
  {
  	"message": "User not found"
  }
  ```
- **500 Internal Server Error**
  ```json
  {
  	"message": "Error message"
  }
  ```

### Event Routes

#### GET /events

**Description:** Get all events.

**Request:** No request body.

**Response:**

- **200 OK**
  ```json
  [
  	{
  		"_id": "string",
  		"name": "string",
  		"date": "string"
  		// ...other event fields...
  	}
  ]
  ```
- **500 Internal Server Error**
  ```json
  {
  	"message": "Error message"
  }
  ```

#### POST /events

**Description:** Create a new event.

**Request:**

```json
{
	"name": "string",
	"date": "string"
	// ...other event fields...
}
```

**Response:**

- **201 Created**
  ```json
  {
  	"_id": "string",
  	"name": "string",
  	"date": "string"
  	// ...other event fields...
  }
  ```
- **400 Bad Request**
  ```json
  {
  	"message": "Invalid data"
  }
  ```
- **500 Internal Server Error**
  ```json
  {
  	"message": "Error message"
  }
  ```

### Payment Routes

#### POST /payment

**Description:** Process a payment.

**Request:**

```json
{
	"amount": "number",
	"token": "string"
	// ...other payment fields...
}
```

**Response:**

- **200 OK**
  ```json
  {
  	"message": "Payment successful"
  	// ...other response fields...
  }
  ```
- **400 Bad Request**
  ```json
  {
  	"message": "Invalid data"
  }
  ```
- **500 Internal Server Error**
  ```json
  {
  	"message": "Error message"
  }
  ```

### Ticket Routes

#### GET /tickets

**Description:** Get all tickets.

**Request:** No request body.

**Response:**

- **200 OK**
  ```json
  [
  	{
  		"_id": "string",
  		"event": {
  			"_id": "string",
  			"name": "string",
  			"date": "string"
  			// ...other event fields...
  		}
  		// ...other ticket fields...
  	}
  ]
  ```
- **500 Internal Server Error**
  ```json
  {
  	"message": "Error message"
  }
  ```

#### POST /tickets

**Description:** Create a new ticket.

**Request:**

```json
{
	"eventId": "string"
	// ...other ticket fields...
}
```

**Response:**

- **201 Created**
  ```json
  {
  	"_id": "string",
  	"event": {
  		"_id": "string",
  		"name": "string",
  		"date": "string"
  		// ...other event fields...
  	}
  	// ...other ticket fields...
  }
  ```
- **400 Bad Request**
  ```json
  {
  	"message": "Invalid data"
  }
  ```
- **500 Internal Server Error**
  ```json
  {
  	"message": "Error message"
  }
  ```
