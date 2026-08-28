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

<!-- -------------------------- -->
## Audit logs
Tasks	Task Creation	task.create
Tasks	Task Update / Edit	task.update
Tasks	Task Status Change	task.status_change
Tasks	Task Deletion	task.delete
Task Comments	Comment Posted	task.comment_create
Issues	Issue Creation	issue.create
Issues	Issue Update / Edit	issue.update
Issues	Issue Status Change	issue.status_change
Issues	Issue Deletion	issue.delete
Issue Comments	Comment Posted	issue.comment_create
Customer Desk	Customer Created	customer.create
Customer Desk	Customer Updated	customer.update
Customer Desk	Customer Deleted	customer.delete
Customer Desk	Service Request Logged	request.create