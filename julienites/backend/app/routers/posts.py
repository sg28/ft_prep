from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from app.database import get_db
from app import schemas, crud, models
from app.auth import get_current_active_user

router = APIRouter()


@router.get("/", response_model=List[schemas.PostInDB])
async def get_feed_posts(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Get feed posts (posts from followed users and own posts)"""
    posts = crud.post_crud.get_feed_posts(db, current_user.id, skip=skip, limit=limit)
    return posts


@router.get("/user/{user_id}", response_model=List[schemas.PostInDB])
async def get_user_posts(
    user_id: UUID,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Get posts by a specific user"""
    posts = crud.post_crud.get_user_posts(db, user_id, skip=skip, limit=limit)
    return posts


@router.get("/{post_id}", response_model=schemas.PostInDB)
async def get_post(
    post_id: UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Get a specific post"""
    post = crud.post_crud.get_post(db, post_id)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    # Check if post is public or user has access
    if not post.is_public and post.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to view this post"
        )
    
    return post


@router.post("/", response_model=schemas.PostInDB)
async def create_post(
    post: schemas.PostCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Create a new post"""
    return crud.post_crud.create_post(db, current_user.id, post)


@router.put("/{post_id}", response_model=schemas.PostInDB)
async def update_post(
    post_id: UUID,
    post_update: schemas.PostUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Update a post"""
    post = crud.post_crud.get_post(db, post_id)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    # Only post owner can update
    if post.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to update this post"
        )
    
    updated_post = crud.post_crud.update_post(db, post_id, post_update)
    if not updated_post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    return updated_post


@router.delete("/{post_id}")
async def delete_post(
    post_id: UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Delete a post"""
    post = crud.post_crud.get_post(db, post_id)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    # Only post owner or admin can delete
    if post.user_id != current_user.id and current_user.role not in ["admin", "moderator"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to delete this post"
        )
    
    success = crud.post_crud.delete_post(db, post_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    return {"message": "Post deleted successfully"}


@router.post("/{post_id}/like")
async def like_post(
    post_id: UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Like a post"""
    post = crud.post_crud.get_post(db, post_id)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    success = crud.post_crud.like_post(db, post_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already liked this post"
        )
    
    return {"message": "Post liked successfully"}


@router.delete("/{post_id}/like")
async def unlike_post(
    post_id: UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Unlike a post"""
    success = crud.post_crud.unlike_post(db, post_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Not liked this post"
        )
    
    return {"message": "Post unliked successfully"}


# Comments endpoints
@router.get("/{post_id}/comments", response_model=List[schemas.CommentInDB])
async def get_post_comments(
    post_id: UUID,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Get comments for a post"""
    post = crud.post_crud.get_post(db, post_id)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    # Get top-level comments (no parent)
    comments = db.query(models.Comment).filter(
        models.Comment.post_id == post_id,
        models.Comment.parent_comment_id == None
    ).order_by(models.Comment.created_at.desc()).offset(skip).limit(limit).all()
    
    return comments


@router.post("/{post_id}/comments", response_model=schemas.CommentInDB)
async def create_comment(
    post_id: UUID,
    comment: schemas.CommentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Create a comment on a post"""
    post = crud.post_crud.get_post(db, post_id)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    # Check parent comment exists if specified
    if comment.parent_comment_id:
        parent_comment = db.query(models.Comment).filter(
            models.Comment.id == comment.parent_comment_id
        ).first()
        if not parent_comment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Parent comment not found"
            )
    
    # Create comment
    db_comment = models.Comment(
        post_id=post_id,
        user_id=current_user.id,
        **comment.dict()
    )
    db.add(db_comment)
    
    # Update post comment count
    post.comments_count += 1
    
    db.commit()
    db.refresh(db_comment)
    
    return db_comment


@router.put("/comments/{comment_id}", response_model=schemas.CommentInDB)
async def update_comment(
    comment_id: UUID,
    comment_update: schemas.CommentUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Update a comment"""
    comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )
    
    # Only comment owner can update
    if comment.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to update this comment"
        )
    
    update_data = comment_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(comment, field, value)
    
    db.commit()
    db.refresh(comment)
    
    return comment


@router.delete("/comments/{comment_id}")
async def delete_comment(
    comment_id: UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Delete a comment"""
    comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )
    
    # Only comment owner or admin can delete
    if comment.user_id != current_user.id and current_user.role not in ["admin", "moderator"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to delete this comment"
        )
    
    # Update post comment count
    post = db.query(models.Post).filter(models.Post.id == comment.post_id).first()
    if post and post.comments_count > 0:
        post.comments_count -= 1
    
    db.delete(comment)
    db.commit()
    
    return {"message": "Comment deleted successfully"}