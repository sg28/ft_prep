# How OCR (Optical Character Recognition) Works

## End-to-End Pipeline

```
┌──────────────┐
│  INPUT IMAGE  │   scanned doc / photo / PDF page / camera frame
│ (or PDF/scan) │
└───────┬──────┘
        │
        ▼
┌──────────────────────────────────────────────────────────────┐
│                    1. PRE-PROCESSING                          │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ │
│  │ Grayscale  │→│ Noise      │→│ Binarization│→│ Deskew /   │ │
│  │ Conversion │ │ Removal    │ │ (B&W thresh)│ │ Rotation   │ │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘ │
│  Goal: strip color/noise, boost contrast, straighten the page │
└───────────────────────────┬────────────────────────────────┘
                            ▼
┌──────────────────────────────────────────────────────────────┐
│              2. LAYOUT / PAGE SEGMENTATION                    │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐                │
│  │ Detect      │→│ Detect      │→│ Detect      │               │
│  │ Text Blocks │ │ Lines       │ │ Words/Chars │               │
│  │ (vs images, │ │ within each │ │ within each │               │
│  │  tables)    │ │ block       │ │ line        │               │
│  └────────────┘ └────────────┘ └────────────┘                │
│  Goal: figure out WHERE the text is before reading WHAT it is │
└───────────────────────────┬────────────────────────────────┘
                            ▼
┌──────────────────────────────────────────────────────────────┐
│            3. CHARACTER / TEXT RECOGNITION (the "OCR" core)   │
│                                                                │
│   Classical pipeline:                                         │
│   ┌────────────┐   ┌────────────┐   ┌────────────┐           │
│   │  Feature    │→ │  Character  │→ │  Classifier │           │
│   │  Extraction │  │  Segmentation│ │ (per glyph) │           │
│   │ (edges,     │  │ (split word  │  │ e.g. SVM,   │           │
│   │  contours)  │  │  into chars) │  │ template    │           │
│   └────────────┘   └────────────┘   └────────────┘           │
│                                                                │
│   Modern deep-learning pipeline (most tools today):           │
│   ┌────────────┐   ┌────────────┐   ┌────────────┐           │
│   │   CNN       │→ │   RNN/LSTM  │→ │   CTC       │           │
│   │ (extracts   │  │ (reads      │  │ Decoding    │           │
│   │  visual     │  │  sequence   │  │ (aligns     │           │
│   │  features   │  │  of glyph   │  │  predicted  │           │
│   │  per image  │  │  features   │  │  chars to   │           │
│   │  slice)     │  │  left→right)│  │  final text)│           │
│   └────────────┘   └────────────┘   └────────────┘           │
│  Goal: turn pixel patterns into actual character predictions  │
└───────────────────────────┬────────────────────────────────┘
                            ▼
┌──────────────────────────────────────────────────────────────┐
│              4. POST-PROCESSING                               │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐                │
│  │ Spell-check │→│ Dictionary/ │→│ Confidence  │               │
│  │ / language  │ │ NLP context │ │ scoring per │               │
│  │ model fix   │ │ correction  │ │ word/char   │               │
│  └────────────┘ └────────────┘ └────────────┘                │
│  Goal: fix likely misreads using language context             │
│  e.g. "rn" misread as "m", "0" vs "O", "1" vs "l"              │
└───────────────────────────┬────────────────────────────────┘
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                  5. OUTPUT                                    │
│   Plain text │ Searchable PDF │ Structured JSON               │
│   (with per-word bounding boxes + confidence scores)           │
└──────────────────────────────────────────────────────────────┘
```

---

## Stage-by-Stage Explanation

### 1. Pre-processing

Raw input (a photo or scan) is messy — shadows, skew, low contrast, background noise. OCR accuracy depends heavily on this stage:

- **Grayscale conversion** — drop color info, keep only intensity.
- **Noise removal** — smooth out scanner speckle/JPEG artifacts.
- **Binarization** — threshold each pixel to pure black or white, isolating "ink" from "background."
- **Deskew/rotation** — detect the page's tilt angle and rotate it straight; text recognition assumes roughly horizontal lines.

### 2. Layout / Page Segmentation

Before reading *what* the text says, the system figures out *where* it is:

- Separates text regions from images, tables, and whitespace.
- Within a text region, detects individual **lines** (using horizontal projection profiles — rows of mostly-black pixels).
- Within a line, detects **word** and **character** boundaries (using vertical gaps between ink clusters).

### 3. Character/Text Recognition (the core "OCR" step)

Two eras of approach:

**Classical (pre-2015-ish, still used for simple/constrained text):**

- Segment each line into individual character images.
- Extract hand-crafted features (edges, contours, stroke width).
- Feed features into a classifier (template matching, Support Vector Machine) trained to output the most likely character.
- Weakness: struggles with cursive/connected fonts because segmenting into clean individual characters is hard.

**Modern deep-learning (what Tesseract 4+, Google Vision OCR, AWS Textract, etc. use):**

- A **CNN (Convolutional Neural Network)** slides over the line image and extracts visual features — it doesn't need pre-segmented characters.
- An **RNN/LSTM (Recurrent Neural Network / Long Short-Term Memory)** reads the sequence of extracted features left-to-right, using context from neighboring characters (this is why it handles cursive/connected text far better — "does this squiggle look like 'rn' or 'm'?" depends on what's around it).
- **CTC (Connectionist Temporal Classification) decoding** aligns the RNN's raw per-timestep character probabilities into a final clean string, collapsing repeated predictions and removing blanks — this solves the problem of not knowing in advance exactly how many "time slices" of the image correspond to one character.

### 4. Post-processing

Even a strong model makes visually-ambiguous mistakes (`0`/`O`, `1`/`l`/`I`, `rn`/`m`). Post-processing cleans these up using:

- A dictionary or **language model** to check if the recognized word is a real word, or to pick the most probable word given surrounding context — this is where **NLP (Natural Language Processing)** techniques come in.
- **Confidence scoring** — each character/word gets a probability score, so downstream systems know which parts of the output to trust vs. flag for human review.

### 5. Output

Final result isn't just raw text — most OCR systems output:

- Plain text
- A **searchable PDF (Portable Document Format)** — the original image with an invisible text layer overlaid, so you can select/search/copy text while still seeing the scanned image
- Structured JSON with per-word bounding boxes (x/y coordinates) and confidence scores, useful for downstream automation (e.g., extracting specific fields from an invoice)

---

## Common Failure Modes

```
  Low-contrast/blurry image     → garbled characters, low confidence scores
  Skewed/rotated page           → lines misread as merged or split incorrectly
  Unusual fonts/handwriting     → classical OCR fails outright;
                                   deep-learning OCR degrades gracefully but needs
                                   training data covering that style
  Dense tables/multi-column     → layout segmentation misorders text
                                   (reads across columns instead of down)
  Similar-looking characters    → post-processing language model is the main defense
  (0/O, 1/l/I, rn/m)
```

---

## Next Step

Once this pipeline is clear, a good next step is picking a concrete tool to build with — e.g. **Tesseract** (open-source, runs locally, good for plain documents) vs. a cloud API like **AWS Textract** or **Google Cloud Vision OCR** (better accuracy on complex layouts/handwriting, but a paid API call per request). Want to go that direction next?
