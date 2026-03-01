from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.database import get_db
from app import schemas, crud, models
from app.auth import get_current_active_user

router = APIRouter()


@router.get("/followers", response_model=List[schemas.UserPublic])
async def get_my_followers(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Get current user's followers"""
    followers = crud.connection_crud.get_followers(db, current_user.id)
    return followers[skip:skip + limit]


@router.get("/following", response_model=List[schemas.UserPublic])
async def get_my_following(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Get users that current user is following"""
    following = crud.connection_crud.get_following(db, current_user.id)
    return following[skip:skip + limit]


@router.get("/{user_id}/followers", response_model=List[schemas.UserPublic])
async def get_user_followers(
    user_id: UUID,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Get a user's followers"""
    user = crud.user_crud.get_user(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    followers = crud.connection_crud.get_followers(db, user_id)
    return followers[skip:skip + limit]


@router.get("/{user_id}/following", response_model=List[schemas.UserPublic])
async def get_user_following(
    user_id: UUID,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Get users that a user is following"""
    user = crud.user_crud.get_user(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    following = crud.connection_crud.get_following(db, user_id)
    return following[skip:skip + limit]


@router.post("/follow/{user_id}")
async def follow_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Follow a user"""
    # Check if user exists
    user_to_follow = crud.user_crud.get_user(db, user_id)
    if not user_to_follow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if user is trying to follow themselves
    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot follow yourself"
        )
    
    # Follow user
    success = crud.connection_crud.follow_user(db, current_user.id, user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already following this user"
        )
    
    return {"message": f"Now following {user_to_follow.name}"}


@router.delete("/follow/{user_id}")
async def unfollow_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Unfollow a user"""
    # Check if user exists
    user_to_unfollow = crud.user_crud.get_user(db, user_id)
    if not user_to_unfollow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Unfollow user
    success = crud.connection_crud.unfollow_user(db, current_user.id, user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Not following this user"
        )
    
    return {"message": f"Unfollowed {user_to_unfollow.name}"}


@router.get("/suggestions", response_model=List[schemas.UserPublic])
async def get_suggested_users(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Get suggested users to follow"""
    # Get users who are not already followed and not the current user
    following_ids = [user.id for user in crud.connection_crud.get_following(db, current_user.id)]
    following_ids.append(current_user.id)
    
    # Get users with similar graduation years or locations
    suggestions = db.query(models.User).filter(
        models.User.id.notin_(following_ids),
        models.User.is_active == True
    ).order_by(
        # Prioritize users with similar graduation years
        models.User.graduation_year.desc()
    ).limit(limit).all()
    
    return suggestions


@router.get("/status/{user_id}")
async def get_connection_status(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Get connection status between current user and another user"""
    user = crud.user_crud.get_user(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    is_following = crud.connection_crud.is_following(db, current_user.id, user_id)
    is_followed_by = crud.connection_crud.is_following(db, user_id, current_user.id)
    
    return {
        "user_id": user_id,
        "is_following": is_following,
        "is_followed_by": is_followed_by,
        "mutual_follow": is_following and is_followed_by
    }