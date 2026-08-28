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
## Task encryption -> only 2 fields

 description	Encrypted (AES-256-GCM)	Contains sensitive technical specifications, code snippets, internal links, credentials, and business logic.
Task Comments	Encrypted (AES-256-GCM)	Developer discussions, bug notes, reproduction steps, and tokens shared in comments are fully encrypted.
