# STAR Story 1 — Customer Impact (RAG / OCR)

**Maps to:** Deliver for Customers, Excellence

## Full Answer

> **Situation:** Engineering teams were losing 10-15 minutes per document lookup — scattered documentation across systems meant every question about an internal process turned into a hunt.
>
> **Task:** I led the build of an AI-powered document intelligence platform to make that lookup instant instead of a 10-15 minute detour.
>
> **Action:** I built an OCR pipeline to digitize scanned/unstructured docs, generated embeddings, and stood up a vector store for retrieval. Rather than accept the first retrieval setup, I benchmarked 3 embedding models against our actual document corpus before picking one, and added a re-ranking step on top of raw vector similarity to push the truly relevant result to the top instead of just "close enough." I also built a feedback loop where analysts could flag wrong or low-quality answers, which fed back into tuning retrieval and re-ranking. Then I integrated the whole thing into the existing developer portal so it was where people already were, not a separate tool to remember to open.
>
> **Result:** 85% reduction in retrieval time, a 40% accuracy gain from adding re-ranking on top of raw retrieval, and a 25% productivity gain for the teams using it day to day.

## Follow-Up Prep (draft answers — adapt with your real specifics)

**"Which embedding model and why?"**
> Frame the answer around the *benchmarking process*, not just a model name: state what you evaluated against (retrieval precision on a held-out set of real queries + answers), what tradeoffs you weighed (embedding dimensionality/cost vs retrieval quality, latency), and why the winner won on your actual corpus rather than a generic benchmark. If you tested an open-source model (e.g. a sentence-transformers variant) against a hosted API model (e.g. OpenAI/Cohere embeddings), the interesting answer is usually a cost/latency/quality tradeoff, not "it scored highest on paper."

**"How did you measure accuracy?"**
> Describe the held-out evaluation set: a sample of real questions with known-correct source documents, checked for whether the top-K retrieved chunks actually contained the answer (retrieval accuracy) separately from whether the final generated answer was correct (end-to-end accuracy) — these are different failure points and should be measured separately so you know whether a miss is a retrieval problem or a generation problem.

**"What happens when RAG returns wrong info?"**
> This is where the analyst feedback loop matters — describe it as the safety net: a flagged wrong answer gets routed back for review, and repeated failure patterns (e.g. a document type that consistently retrieves poorly) become a targeted fix rather than a one-off correction. Also worth naming: whether the system shows its sources/citations so a human can sanity-check the answer rather than trusting it blindly — that's a design choice that directly limits the damage of a wrong retrieval.
