
## Sprint
So, when you see that "Add tasks from backlog" list in your screenshot, it's showing you all the tasks you created earlier in the "Tasks" tab that haven't been assigned to a sprint yet!

Does that make sense? It's basically your "Pool of ready work."


### Making of KAYA 
## why mem0 
What Mem0 gives Kaya
Without Mem0, Kaya only remembers the current thread (via InMemorySaver). Once the session ends, everything is gone. Mem0 adds a persistent, semantic memory layer per user, so Kaya can:

Remember a user's product domain (e.g. "Alice works on a B2B SaaS fintech app")
Recall past decisions ("last week we decided to defer the CSV export feature")
Personalize PRDs and task breakdowns based on team context
Build up a mental model of the user's backlog, tech stack, and priorities over time

Think of InMemorySaver as short-term (within session) and Mem0 as long-term (across sessions).
{
  "thread_id": "session-abc-123",
  "user_id": "auth0|user-xyz-456",
  "message": "Let's write a PRD for the export feature"
} -> sended by frontend.




### errors
20/4/2026, 6:16:37 pm [CONVEX H(POST /createCalendarEvent)] [LOG] '[createCalendarEvent] received:' {
  projectId: 'j97b275yse9v1gkabn7gtcxyf584prt7',
  title: 'Client Meet',
  description: '',
  type: 'event',
  start: 1776709800000,
  end: 1776709800000,
  allDay: true
}
20/4/2026, 6:16:37 pm [CONVEX H(POST /createCalendarEvent)] [LOG] '[createCalendarEvent] created id:' 'k1706z65pdahy3rf7dwsct3xmd857s10'

event created but no tool ui seen on ui and agent asksed 3 times and after approval - stream ended...