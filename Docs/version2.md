Application-Level Encryption Setup
Type definitions: 

encryptedField
 (ciphertext, iv, tag) and 

maybeEncryptedField
 (v.union(v.string(), encryptedField)) allow zero-downtime migration and backward compatibility with existing legacy string data.
Fields already configured for ALE:
tasks.description
taskComments.comment
issues.description
issueComments.comment
serviceCustomers.name, serviceCustomers.email, serviceCustomers.contact, serviceCustomers.emailBlindIndex
serviceRequests.description
Audit Logs Setup
Table definition: 

auditLogs
 is configured with indexes (by_project_time, by_project_action) to record actions (task, issue, customer, request) per project.

 <!-- ------------------------ -->
## Encryption

Encryption & Privacy Summary
Module	Field	Encryption Status	Indexing & Search
Tasks	description	AES-256-GCM Encrypted	Encrypted payload
Tasks	taskComments	AES-256-GCM Encrypted	Encrypted payload
Tasks	title & metadata	Plaintext	Instant indexing & filtering
Issues	description	AES-256-GCM Encrypted	Encrypted payload
Issues	issueComments	AES-256-GCM Encrypted	Encrypted payload
Issues	title & metadata	Plaintext	Instant indexing & filtering
