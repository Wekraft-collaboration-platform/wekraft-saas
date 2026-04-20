
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


### Sprint
1. What the Cards Show (Your Real Data)
Sprint Progress: Directly reads stats.completedItems vs stats.totalItems from your Convex query. As you mark things done, that progress bar will fill up.
Open Bugs: Filters your current sprint issues on the fly to count any bug that isn't closed.
Burn Rate: Displays the stats.burnRate from your backend, calculating the mathematical pace of items completed per day.
2. The Timeline (Burndown Chart)
Right now, the "Timeline" chart is a sleek placeholder. It uses CSS to draw dynamic fake bars just to mimic Linear's famous "Burndown" aesthetic. To make it real, we would eventually need to tweak the backend to return an array of "items remaining per day", then we could plot real backend data onto those bars!






### errors
