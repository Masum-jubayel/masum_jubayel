---
title: "Building Jarvis: A Personal AI Agent That Uses Tools"
excerpt: "How I combined large language models, retrieval from my own documents and safe tool use into an assistant that finishes real work."
date: "2026-10-30"
category: "AI and Intelligent Agents"
tags: ["AI agents", "LLM", "RAG", "ChromaDB", "Python", "Prompt engineering", "Automation"]
cover: "/images/projects/jarvis-ai-agent.jpg"
coverStyle: "chip"
featured: true
---

Chat assistants are great at answering questions. I wanted something that would **do** things: open the right portal, pull the data, compare it, build the spreadsheet and hand me the result to approve. That is Jarvis.

## The agent loop

Jarvis runs a simple loop:

1. **Understand** the request and break it into steps.
2. **Act** with a tool — browser, file system, spreadsheet, script.
3. **Check** the result against what was expected.
4. **Repeat** until done, or stop and ask.

The language model (Claude or OpenAI) does the planning; tools do the work.

## Memory with RAG

Jarvis answers from *my* information, not guesses. Documents, procedures and notes are split into chunks, turned into embeddings and stored in **ChromaDB**. At question time the most relevant chunks are retrieved by semantic search and passed to the model with the request.

## Skills: procedures, not prompts

Recurring jobs — like auditing radios against SIM records — are written as **skills**: clear step-by-step procedures with the exact checks and file formats. A skill is easier to test and improve than a clever prompt.

## Guard-rails

An agent that can click and type needs limits:

- **Confirmation** before anything irreversible — sending, deleting, submitting.
- **No secrets in prompts**; credentials stay with the user.
- **Least privilege**: each tool only reaches what it needs.
- **Logs** of every action so I can review what happened.

## The interface

Jarvis has a heads-up-display look in cyan and gold. I liked it enough that this site now has a **Jarvis theme** — try the theme switch in the top bar.

## What I learned

Better tools and better procedures beat a bigger model. And safety has to be designed in from the start, not bolted on.

See the full project: [Jarvis — Personal AI Agent](/projects/jarvis-ai-agent).
