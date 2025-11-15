# Quiet Operation Examples

## ❌ Verbose (Incorrect)

Agent explicitly narrates every memory operation:

```text
User: "What's the status of the API refactor?"

Agent: "Let me search the memory system for information about the API refactor..."
[calls search_knowledge]

Agent: "I found 3 relevant memories. Now I'll store this query as a hypothesis..."
[calls store_knowledge]

Agent: "Based on the search results, the API refactor is 60% complete. I'm now recording this fact..."
[calls store_knowledge again]

Agent: "Memory operations complete. The answer is: The API refactor is 60% complete, with authentication endpoints finished and data layer in progress."
```

**Problem:** User sees unnecessary implementation details and wait times.

---

## ✅ Quiet (Correct)

Agent uses memory silently in the background:

```text
User: "What's the status of the API refactor?"

[Agent silently calls search_knowledge("API refactor status progress")]
[Agent silently calls store_knowledge with HYPOTHESIS if unsure]
[Agent silently calls store_knowledge with RESULT after verification]

Agent: "The API refactor is 60% complete. Authentication endpoints are finished, and we're currently working on the data layer refactor."
```

**Benefit:** Natural, fast response. Memory system works like working memory—invisible to the user.

---

## When to Break Silence

### 1. Protocol Hints Received

```json
{
  "success": true,
  "id": "mem-123",
  "protocolHints": [{
    "code": "MISSING_PRECEDENT",
    "severity": "warning",
    "message": "This assertion is not linked to prior evidence..."
  }]
}
```

**Agent response:** "I've recorded this information, but the memory system is suggesting I search for supporting evidence first. Let me refine my approach..."

### 2. Memory System Errors

```text
Agent: "I attempted to store this information, but encountered a validation error. Let me try a different approach..."
```

### 3. User Asks About Memory Usage

```text
User: "What do you remember about our authentication system?"

Agent: "I have 14 memories about our authentication system, including 3 proven design decisions and 2 active hypotheses. The most recent update was yesterday when we decided to use JWT tokens..."
```

---

## Implementation Pattern

```typescript
// Good: Silent memory operations
async function answerQuestion(query: string): Promise<string> {
  // Search silently
  const memories = await searchKnowledge(query);
  
  // Store hypothesis silently if making an inference
  if (needsVerification) {
    await storeKnowledge({
      content: hypothesis,
      metadata: { documentType: "HYPOTHESIS", ... }
    });
  }
  
  // Return clean answer
  return synthesizeAnswer(memories);
}

// Bad: Verbose memory operations
async function answerQuestionVerbose(query: string): Promise<string> {
  console.log("Searching memory for:", query);
  const memories = await searchKnowledge(query);
  console.log("Found", memories.length, "memories");
  console.log("Storing hypothesis...");
  await storeKnowledge(...);
  console.log("Memory operations complete");
  return synthesizeAnswer(memories);
}
```

---

## Summary

**Memory operations are cognitive infrastructure—not user-facing features.**

- ✅ Use memory automatically and silently
- ✅ Let protocolHints guide refinement
- ✅ Report errors when they block progress
- ❌ Don't narrate searches, stores, or retrievals
- ❌ Don't make users wait for "memory operations"
- ❌ Don't treat memory like a separate system

**The best memory system is invisible.**
