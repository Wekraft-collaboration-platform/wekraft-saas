# Assign Tickets

Learn how chat tickets are assigned to developers and tracked within Teamspace channels.

---

## Where to Go & How to Go

### Assigning a Ticket
- **Where to Go**: In your chat channel composer, type `/` to launch the **Create Ticket** popover.
- **How to Go**:
  1. Under the **Assignee** dropdown field in the popover form, click the selector.
  2. Select the name of the developer responsible for resolving the ticket.
  3. Click **Create Ticket**.
  4. The assignee is saved in the database under the `assignedTo` field. 
  5. The ticket can be viewed by anyone with project access in the channel header dropdown.
  6. *Note: Chat tickets do not support re-assigning to a different developer once created.*

---

## Permissions & Roles

- **Access**: Any member who has access to the channel can view, close, or reopen tickets in the header dropdown.
- **Viewers**: Project members with the **Viewer** role can view all active and closed tickets, but cannot close, reopen, or create new tickets.
