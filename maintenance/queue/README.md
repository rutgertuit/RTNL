# Review Queue

Output of the three maintenance loops lands here. **Nothing in this directory ever auto-applies.** Rutger reviews via PR.

```
queue/
  model-freshness/      <-- timestamped JSON files
  corporate-alignment/
  cross-linking/
```

Each file structure documented in the parent loop's README.

The queue is intentionally git-committed so review history is durable and the corporate-alignment / freshness state of any item is a `git log` away.
