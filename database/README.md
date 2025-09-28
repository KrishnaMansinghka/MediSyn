# MediSyn Local Database

This folder contains the local database storage system for the MediSyn application. The database uses browser localStorage for data persistence.

## Files

- `medisyn_db.json` - Initial database structure with sample data
- `schema.ts` - TypeScript interfaces and type definitions
- `db-utils.ts` - Database utility functions and CRUD operations
- `README.md` - This documentation file

## Database Structure

The database contains the following main collections:

### Doctors
- `id`: Unique identifier (e.g., "doc_001")
- `clinicName`: Name of the clinic
- `doctorName`: Full name of the doctor
- `email`: Email address (unique)
- `password`: Encrypted password
- `createdAt`: ISO timestamp
- `updatedAt`: ISO timestamp
- `isActive`: Boolean status
- `role`: Always "doctor"

### Patients
- `id`: Unique identifier (e.g., "pat_001")
- `name`: Full name of the patient
- `dateOfBirth`: Date in YYYY-MM-DD format
- `address`: Full address
- `email`: Email address (unique)
- `password`: Encrypted password
- `createdAt`: ISO timestamp
- `updatedAt`: ISO timestamp
- `isActive`: Boolean status
- `role`: Always "patient"

### Sessions
- `sessionId`: Unique session identifier
- `userId`: ID of the logged-in user
- `userType`: "doctor" or "patient"
- `createdAt`: Session creation timestamp
- `expiresAt`: Session expiration timestamp
- `isActive`: Boolean session status

## Usage

### Import the database utility

```typescript
import { mediSynDB } from '../database/db-utils';
```

### Creating Users

```typescript
// Create a doctor
const doctorData = {
  clinicName: "Downtown Medical Center",
  doctorName: "Dr. John Smith",
  email: "john@medical.com",
  password: "securepassword",
  role: "doctor" as const
};

const newDoctor = await mediSynDB.createDoctor(doctorData);

// Create a patient
const patientData = {
  name: "Jane Doe",
  dateOfBirth: "1990-05-15",
  address: "123 Main St, City, State",
  email: "jane@email.com",
  password: "securepassword",
  role: "patient" as const
};

const newPatient = await mediSynDB.createPatient(patientData);
```

### Authentication

```typescript
// Authenticate user login
const user = await mediSynDB.authenticateUser("user@email.com", "password");

if (user) {
  // Create session
  const session = await mediSynDB.createSession(user.id, user.role);
  console.log("Login successful:", session.sessionId);
}
```

### Data Queries

```typescript
// Get all doctors
const doctors = await mediSynDB.getAllDoctors();

// Get all patients
const patients = await mediSynDB.getAllPatients();

// Find user by email
const user = await mediSynDB.findUserByEmail("user@email.com");

// Get database statistics
const stats = await mediSynDB.getStats();
```

### Session Management

```typescript
// Find active session
const session = await mediSynDB.findSession(sessionId);

// Invalidate session (logout)
await mediSynDB.invalidateSession(sessionId);

// Clean expired sessions
const cleanedCount = await mediSynDB.cleanExpiredSessions();
```

### Utility Functions

```typescript
// Backup database
const backupKey = await mediSynDB.backupDatabase();

// Get database stats
const stats = await mediSynDB.getStats();
```

## Security Notes

⚠️ **Important**: This is a development/demo database implementation. For production use:

1. **Password Hashing**: Implement proper password hashing (bcrypt, scrypt, etc.)
2. **Data Encryption**: Encrypt sensitive data before storing
3. **Input Validation**: Add comprehensive input validation
4. **Rate Limiting**: Implement rate limiting for authentication attempts
5. **Session Security**: Use secure session tokens (JWT, etc.)
6. **HTTPS**: Always use HTTPS in production
7. **Data Backup**: Implement proper backup strategies
8. **Access Control**: Add role-based access control

## Sample Data

The database comes pre-populated with sample data:

### Sample Doctors
- Dr. Sarah Johnson (Downtown Medical Center)
- Dr. Michael Chen (Family Health Clinic)

### Sample Patients  
- John Smith (DOB: 1985-03-15)
- Emily Davis (DOB: 1992-07-22)

## Data Storage

The database uses browser localStorage with the key `medisyn_database`. Data persists across browser sessions but is specific to each browser/domain.

## Browser Compatibility

This database system works in all modern browsers that support localStorage:
- Chrome 4+
- Firefox 3.5+
- Safari 4+
- Internet Explorer 8+
- Edge (all versions)

## Development

To modify the database structure:

1. Update the interfaces in `schema.ts`
2. Modify the utility functions in `db-utils.ts`
3. Update the sample data in `medisyn_db.json`
4. Test all CRUD operations

## Troubleshooting

### Common Issues

1. **localStorage Full**: Browser localStorage has size limits (usually 5-10MB)
2. **Private/Incognito Mode**: Data may not persist in private browsing
3. **CORS Issues**: Access localStorage from the same domain/protocol
4. **Data Corruption**: Use the backup function regularly

### Debugging

```typescript
// Check if database exists
const data = localStorage.getItem('medisyn_database');
console.log('Database exists:', !!data);

// View current database
console.log('Current DB:', JSON.parse(data || '{}'));

// Clear database (use with caution)
localStorage.removeItem('medisyn_database');
```