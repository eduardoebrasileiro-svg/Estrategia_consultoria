# Security Specification - Finanz App

## Data Invariants
1. A user can only access their own profile and transactions.
2. An admin can read all user data and transactions if needed (though we'll keep it tight).
3. Transactions must have valid amounts (positive) and types.
4. User roles can only be set during initialization or by an existing admin.

## Collection Overview
- `/users/{userId}`: Personal profile.
- `/users/{userId}/transactions/{transactionId}`: Private financial records.
- `/admins/{userId}`: UID list for administrative access.

## The Dirty Dozen (Attack Vectors)
1. Someone tries to create a transaction in another user's subcollection.
2. Someone tries to change their role to 'admin' in their profile.
3. Someone tries to delete an admin record.
4. Someone tries to list all users' transactions.
5. Someone tries to create a transaction with a negative amount.
6. Someone tries to update the `createdAt` timestamp of a transaction.
7. Someone tries to inject a massive string in the description.
8. Someone tries to spoof the user ID in the transaction payload.
9. Someone tries to create a user profile without a role.
10. Someone tries to read the `admins` collection without being signed in.
11. Someone tries to update a transaction once it is "terminal" (not applicable yet but good to keep in mind).
12. Someone tries to read another user's PII (email) from the profile.
