from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from app.database import get_db
from app import schemas, crud, models
from app.auth import get_current_active_user

router = APIRouter()


@router.get("/", response_model=List[schemas.FormInDB])
async def list_my_forms(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    forms = crud.form_crud.get_forms_by_owner(db, current_user.id)
    # annotate responses_count
    for f in forms:
        try:
            f.responses_count = len(f.responses)
        except Exception:
            f.responses_count = 0
    return forms


@router.post("/", response_model=schemas.FormInDB)
async def create_form(
    form: schemas.FormCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    created = crud.form_crud.create_form(db, current_user.id, form)
    created.responses_count = 0
    return created


@router.get("/{form_id}", response_model=schemas.FormInDB)
async def get_form(
    form_id: UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    f = crud.form_crud.get_form(db, form_id)
    if not f:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found")
    # Only owner can view form details
    if f.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")
    f.responses_count = len(f.responses)
    return f


@router.put("/{form_id}", response_model=schemas.FormInDB)
async def update_form(
    form_id: UUID,
    form_update: schemas.FormUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    f = crud.form_crud.get_form(db, form_id)
    if not f:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found")
    if f.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")
    updated = crud.form_crud.update_form(db, form_id, form_update)
    updated.responses_count = len(updated.responses)
    return updated


@router.delete("/{form_id}")
async def delete_form(
    form_id: UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    f = crud.form_crud.get_form(db, form_id)
    if not f:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found")
    if f.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")
    crud.form_crud.delete_form(db, form_id)
    return {"message": "Form deleted"}


@router.post("/{form_id}/responses", response_model=schemas.FormResponseInDB)
async def submit_response(
    form_id: UUID,
    payload: schemas.FormResponseCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    f = crud.form_crud.get_form(db, form_id)
    if not f:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found")
    # For now, only authenticated submissions
    resp = crud.form_crud.create_response(db, form_id, current_user.id, payload.data)
    return resp


@router.get("/{form_id}/responses", response_model=List[schemas.FormResponseInDB])
async def list_responses(
    form_id: UUID,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    f = crud.form_crud.get_form(db, form_id)
    if not f:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found")
    if f.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")
    return crud.form_crud.get_form_responses(db, form_id, limit=limit, offset=offset)


@router.get("/responses/recent", response_model=List[schemas.FormResponseInDB])
async def recent_responses(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    return crud.form_crud.get_recent_responses_for_owner(db, current_user.id, limit=limit)
