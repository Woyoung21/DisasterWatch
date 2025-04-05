# Example Commands for DB CLI Tool

## User Management

### Insert User
```bash
node cli.js insertUser 101 user "John Doe"
node cli.js insertUser 102 authority "SF Police Dept" "2025-03-01T12:00:00Z"
```

### Get User by ID
```bash
node cli.js getUserById 101
```

### Get All Users
```bash
node cli.js getAllUsers
```

### Update User
```bash
node cli.js updateUser 101 user "John Smith"
node cli.js updateUser 102 authority
```

### Delete User
```bash
node cli.js deleteUser 101
```

## Event Management

### Insert Event
```bash
node cli.js insertEvent 201 101 37.7749 -122.4194 "2025-04-05T10:30:00Z" "2025-04-05T10:30:00Z" "2025-04-06T10:30:00Z" "{\"description\":\"Traffic accident\",\"casualties\":0}" "SF Police" "medium"

node cli.js insertEvent 202 102 37.7833 -122.4167 "2025-04-05T11:45:00Z" "2025-04-05T11:45:00Z" "2025-04-07T11:45:00Z" "{\"description\":\"Protest march\",\"participants\":150}" "SF Police" "low"
```

### Get Event by ID
```bash
node cli.js getEventById 201
```

### Get Events by User ID
```bash
node cli.js getEventsByUserId 101
```

### Update Event
```bash
node cli.js updateEvent 201 37.7750 -122.4195 "" "" "" "{\"description\":\"Traffic accident\",\"casualties\":1}" "" "high"

node cli.js updateEvent 202 "" "" "" "2025-04-05T12:30:00Z" "" "" "SF Police" ""
```

### Delete Event
```bash
node cli.js deleteEvent 201
```

## Help
```bash
node cli.js -h
node cli.js --help
```

Note that when providing JSON data, you need to escape quotes in the shell. Date strings should be in a format parseable by JavaScript's Date constructor.