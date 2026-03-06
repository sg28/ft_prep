from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import csv
import io

from app.database import get_db
from app import schemas, models
from app.auth import get_current_active_user

router = APIRouter()


@router.post("/analyze", response_model=schemas.DatasetAnalysis)
async def analyze_dataset(
    upload: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    filename = upload.filename or "dataset"
    ext = (filename.split(".")[-1] if "." in filename else "").lower()

    if ext not in ("csv", "tsv"):
        return schemas.DatasetAnalysis(
            filename=filename,
            filetype=ext or "",
            rows=0,
            columns=[],
            samples=[],
            summaries=[],
            note="Only CSV/TSV supported for analysis right now."
        )

    raw = await upload.read()
    # Try to decode with UTF-8, fallback to latin-1
    text = None
    for enc in ("utf-8", "utf-8-sig", "latin-1"):
        try:
            text = raw.decode(enc)
            break
        except Exception:
            continue
    if text is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unable to decode file")

    # Select delimiter
    delimiter = "," if ext == "csv" else "\t"
    reader = csv.reader(io.StringIO(text), delimiter=delimiter)

    try:
        headers = next(reader)
    except StopIteration:
        return schemas.DatasetAnalysis(
            filename=filename,
            filetype=ext,
            rows=0,
            columns=[],
            samples=[],
            summaries=[],
            note="Empty file"
        )

    columns = [h.strip() or f"col_{i}" for i, h in enumerate(headers)]
    col_count = len(columns)

    # Accumulators
    rows = 0
    samples: List[Dict[str, Any]] = []
    missing = [0] * col_count
    numeric_counts = [0] * col_count
    numeric_sums = [0.0] * col_count
    numeric_mins = [None] * col_count  # type: ignore
    numeric_maxs = [None] * col_count  # type: ignore
    cat_counts: List[Dict[str, int]] = [dict() for _ in range(col_count)]

    MAX_SAMPLES = 5
    MAX_ROWS = 100000  # safety cap

    for row in reader:
        if not row:
            continue
        rows += 1
        if rows <= MAX_SAMPLES:
            sample_obj = {}
            for i in range(col_count):
                val = row[i] if i < len(row) else ""
                sample_obj[columns[i]] = val
            samples.append(sample_obj)

        for i in range(col_count):
            val = row[i] if i < len(row) else ""
            val_str = (val or "").strip()
            if val_str == "":
                missing[i] += 1
                continue
            # numeric?
            try:
                number = float(val_str)
                numeric_counts[i] += 1
                numeric_sums[i] += number
                if numeric_mins[i] is None or number < numeric_mins[i]:
                    numeric_mins[i] = number
                if numeric_maxs[i] is None or number > numeric_maxs[i]:
                    numeric_maxs[i] = number
            except ValueError:
                # category count (cap to top few later)
                d = cat_counts[i]
                d[val_str] = d.get(val_str, 0) + 1

        if rows >= MAX_ROWS:
            break

    summaries: List[schemas.ColumnSummary] = []
    for i, name in enumerate(columns):
        num_stat = None
        if numeric_counts[i] > 0:
            mean = numeric_sums[i] / numeric_counts[i]
            num_stat = schemas.ColumnNumericStats(
                count=numeric_counts[i], mean=mean, min=numeric_mins[i], max=numeric_maxs[i]
            )
        tops = None
        if cat_counts[i]:
            items = sorted(cat_counts[i].items(), key=lambda x: (-x[1], x[0]))[:5]
            tops = [schemas.ColumnCategoryTop(value=k, count=v) for k, v in items]
        summaries.append(
            schemas.ColumnSummary(name=name, missing=missing[i], numeric=num_stat, top_values=tops)
        )

    return schemas.DatasetAnalysis(
        filename=filename,
        filetype=ext,
        rows=rows,
        columns=columns,
        samples=samples,
        summaries=summaries,
        note=None
    )
