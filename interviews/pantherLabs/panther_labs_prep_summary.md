# Panther Labs — AI Engineer, SOC Agent Platform
## Candidate Prep Guide Summary

**Role:** Staff AI Engineer, SOC Agent Platform (IC5)
**Format:** 4 interviews via Zoom | San Francisco, CA
**Focus:** Building AI-powered SOC analyst solutions — autonomous agents for alert triage, interactive chat, detection code generation, and text-to-search, deeply integrated with Panther's ingestion pipeline.

They want engineers who combine **strong agentic development skills**, **security domain knowledge**, and a **startup ownership mindset**.

---

## Interview 1 — Agent Development & AI Integration
**Duration:** 45–60 min | Technical Design Discussion (no live coding)

Design an AI-powered SOC alert triage agent. Walk through architecture decisions, embedding/retrieval strategy, deterministic vs. LLM-driven logic, and production operation.

### Signals Evaluated
| Signal | What They Want |
|---|---|
| Agent Architecture Depth | Layered agentic loops, tool design, composition, evaluation — not just LLM wrappers |
| RAG & Retrieval Design | Embeddings, vector DBs, multi-layered pipelines, token budget management |
| Prompt Engineering at Scale | Composable, maintainable prompt systems across multiple conversation types |
| Security / SOC Fluency | What's safe to automate vs. what requires human judgment |
| Production Engineering Maturity | Evaluation, monitoring, drift detection, failure modes |
| AI Security Awareness | Prompt injection, adversarial inputs, defense-in-depth in a security product |
| Product & Customer Thinking | Measurable outcomes, customer trust, phased autonomy over time |

### How to Prepare
- **Agent architecture fundamentals:** context pre-loading, tool calling, deterministic vs. LLM steps, async inference, structured output, post-inference processing
- **RAG stack:** multi-layered retrieval, token budget constraints, handle "50K matching events in a 200K token context window"
- **Prompt engineering at scale:** avoid 12 monolithic prompts drifting independently — composable modules, shared bases, testing
- **AI security blindspots:** prompt injection is real when log events are attacker-controlled; structural defenses + RBAC at tool execution boundary
- **Production metrics:** offline eval sets, online metrics (analyst override rate, classification distribution), regression detection, feedback loops
- **Brush up on:** RAG, LLM tool calling, MCP (Model Context Protocol), agentic loop design, prompt composition, confidence scoring, SOC alert triage workflows

---

## Interview 2 — Systems Design
**Duration:** 60 min | High-Level Technical Discussion (no coding)

Design scalable, well-reasoned systems. Walk through architecture decisions — processes, storage/databases, networking, APIs — and discuss tradeoffs, prioritization, and cross-team collaboration.

### Signals Evaluated
| Signal | What They Want |
|---|---|
| Systems Thinking | End-to-end design with clear data abstractions, API boundaries, storage strategies |
| Technical Reasoning | Articulating tradeoffs — not just "it depends" but what and why |
| Problem-Solving Under Ambiguity | Good clarifying questions, defining success criteria, systematic approach |
| Failure Mode Awareness | Proactively thinking about what can go wrong and how to detect/mitigate it |
| Collaboration & Communication | Explaining technical decisions to non-technical stakeholders |
| Strategic Fit | Good judgment, initiative, alignment with how they think about security and AI |

### How to Prepare
- Pick 1–2 complex projects to discuss deeply (ideally AI, automation, or agentic systems) — key architectural tradeoffs, what you'd do differently
- Practice designing an agentic system from scratch: data flow, storage decisions, API design, concurrency, latency, failure handling
- Think in tradeoffs: latency vs. cost, consistency vs. availability — explain why you made each decision and what the alternatives were
- Come with good questions — curiosity about their technical challenges signals strong alignment

---

## Interview 3 — Project Retrospective
**Duration:** 60 min | Discussion-Based (no coding)

Deep-dive into a recent, complex technical project you led end-to-end. You choose the project.

### Signals Evaluated
| Signal | What They Want |
|---|---|
| Project Scope | Meaningful initiative requiring real technical leadership and cross-functional coordination |
| Technical Ownership | Genuine end-to-end accountability, deep understanding of the full stack |
| Business Impact | Connecting engineering decisions to business and customer outcomes |
| Measurement of Success | Concrete metrics — not just "it shipped" but what changed and by how much |
| Problem Solving | Biggest technical challenges, how you solved them, tradeoffs made |
| Collaboration & Influence | Working with PMs, designers, engineers, business stakeholders |

### Choosing Your Project
- Completed in the last 18 months
- At least 3 months in duration
- Cross-functional (PM, design, other engineering teams, business stakeholders)
- Within the domain of this role (AI/ML engineering, backend systems, security tooling)
- You had genuine end-to-end ownership — not just one contributor among many

### Come Prepared to Discuss
- Your specific scope and responsibilities; project duration, team size, and functions involved
- Technology stack and key architectural decisions with tradeoffs
- The business problem, how you measured success, and the biggest technical challenge
- The outcome, quantified if possible — and what you'd do differently

---

## Interview 4 — Culture Interview
**Duration:** 45 min | Behavioral Discussion

Panther's culture is built on three core values. This round assesses grit, autonomy, and the attributes that make competence actionable.

### Core Values
| Value | What It Means |
|---|---|
| Create Customer Love | Direct customer engagement; building things that solve real problems over technically interesting ones |
| Be an Owner | End-to-end accountability, proactively fixing problems, founder-level responsibility |
| Take Care of the Team | Supporting teammates, sharing knowledge, prioritizing team success over personal credit |

### Additional Signals
| Signal | What They Want |
|---|---|
| Grit & Ambiguity | Making progress in undefined environments; handling failure, pivots, unclear requirements |
| Startup Mindset | Energized by building from scratch; comfortable with high ownership and fast movement |
| Self-Awareness | Honest identification of strengths and growth areas; learning from mistakes |

### How to Prepare
- Prepare 4–6 specific stories from your career demonstrating Panther's core values — specific, recent, showing your individual impact
- For each story: Situation → your specific action → outcome → what you'd do differently
- Think about times you've: gone above and beyond for a customer; owned a problem without being asked; stepped up for a struggling teammate; made a hard call under ambiguity
- Be honest and specific — authentic self-reflection outperforms polished stories; failures discussed candidly are often more compelling than success stories

---

## Key Themes Across All Interviews

| Theme | What It Means |
|---|---|
| Production Thinking Over Prototypes | Real security teams rely on what you build — demonstrate reliability, evaluation, monitoring, and failure mode thinking |
| Security Awareness | This is a security product — show you understand the unique risks of automating decisions in high-stakes environments |
| Customer Obsession | Connect technical decisions to customer outcomes — why does this architecture choice matter? Because it reduces triage time for analysts |
| Startup Ownership | We move fast with a small team — end-to-end accountability, decisions without perfect information, care about the outcome |
| Clarity of Communication | How you explain your thinking matters as much as what you think — structure your answers and explain your reasoning |
| Depth Over Breadth | They're evaluating whether you've actually built these systems — not whether you can recite definitions. Go deep on real experience |
