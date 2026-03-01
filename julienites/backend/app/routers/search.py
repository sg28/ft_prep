from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List, Optional
from uuid import UUID

from app.database import get_db
from app import schemas, crud, models
from app.auth import get_current_active_user

router = APIRouter()


@router.get("/users", response_model=List[schemas.UserPublic])
async def search_users(
    q: str = Query(..., min_length=1, max_length=100, description="Search query"),
    limit: int = Query(20, ge=1, le=100, description="Number of results"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Search for users"""
    users = crud.user_crud.search_users(db, q, limit=limit)
    return users


@router.get("/posts", response_model=List[schemas.PostInDB])
async def search_posts(
    q: str = Query(..., min_length=1, max_length=100, description="Search query"),
    limit: int = Query(20, ge=1, le=100, description="Number of results"),
    skip: int = Query(0, ge=0, description="Number of results to skip"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Search for posts"""
    search_term = f"%{q}%"
    
    posts = db.query(models.Post).filter(
        and_(
            models.Post.content.ilike(search_term),
            models.Post.is_public == True
        )
    ).order_by(models.Post.created_at.desc()).offset(skip).limit(limit).all()
    
    return posts


@router.get("/skills", response_model=List[schemas.SkillInDB])
async def search_skills(
    q: str = Query(..., min_length=1, max_length=100, description="Search query"),
    limit: int = Query(20, ge=1, le=100, description="Number of results"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Search for skills"""
    search_term = f"%{q}%"
    
    skills = db.query(models.Skill).filter(
        models.Skill.name.ilike(search_term)
    ).limit(limit).all()
    
    return skills


@router.get("/global", response_model=schemas.SearchResults)
async def global_search(
    q: str = Query(..., min_length=1, max_length=100, description="Search query"),
    limit: int = Query(10, ge=1, le=50, description="Number of results per type"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Global search across users, posts, and skills"""
    # Search users
    users = crud.user_crud.search_users(db, q, limit=limit)
    
    # Search posts
    search_term = f"%{q}%"
    posts = db.query(models.Post).filter(
        and_(
            models.Post.content.ilike(search_term),
            models.Post.is_public == True
        )
    ).order_by(models.Post.created_at.desc()).limit(limit).all()
    
    # Search skills
    skills = db.query(models.Skill).filter(
        models.Skill.name.ilike(search_term)
    ).limit(limit).all()
    
    # Get total counts (approximate)
    total_users = db.query(models.User).filter(
        or_(
            models.User.name.ilike(search_term),
            models.User.username.ilike(search_term),
            models.User.bio.ilike(search_term)
        )
    ).count()
    
    total_posts = db.query(models.Post).filter(
        and_(
            models.Post.content.ilike(search_term),
            models.Post.is_public == True
        )
    ).count()
    
    return schemas.SearchResults(
        users=users,
        posts=posts,
        total_users=total_users,
        total_posts=total_posts
    )


@router.get("/alumni", response_model=List[schemas.UserPublic])
async def search_alumni(
    graduation_year: Optional[int] = Query(None, description="Graduation year"),
    location: Optional[str] = Query(None, description="Location"),
    skills: Optional[str] = Query(None, description="Comma-separated list of skills"),
    limit: int = Query(20, ge=1, le=100, description="Number of results"),
    skip: int = Query(0, ge=0, description="Number of results to skip"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Advanced alumni search with filters"""
    query = db.query(models.User).filter(models.User.is_active == True)
    
    # Filter by graduation year
    if graduation_year:
        query = query.filter(models.User.graduation_year == graduation_year)
    
    # Filter by location
    if location:
        location_term = f"%{location}%"
        query = query.filter(models.User.location.ilike(location_term))
    
    # Filter by skills
    if skills:
        skill_list = [skill.strip() for skill in skills.split(",") if skill.strip()]
        if skill_list:
            # Get users who have any of the specified skills
            query = query.join(models.UserSkill).join(models.Skill).filter(
                models.Skill.name.in_(skill_list)
            )
    
    # Exclude current user
    query = query.filter(models.User.id != current_user.id)
    
    # Order by most relevant (you can customize this)
    query = query.order_by(
        models.User.followers_count.desc(),  # Popular users first
        models.User.created_at.desc()  # Then newest users
    )
    
    users = query.offset(skip).limit(limit).all()
    return users


@router.get("/autocomplete")
async def autocomplete(
    q: str = Query(..., min_length=1, max_length=50, description="Search query"),
    limit: int = Query(5, ge=1, le=20, description="Number of suggestions"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Autocomplete suggestions for search"""
    search_term = f"%{q}%"
    
    # User suggestions
    user_suggestions = db.query(models.User).filter(
        or_(
            models.User.username.ilike(search_term),
            models.User.name.ilike(search_term)
        ),
        models.User.is_active == True
    ).limit(limit).all()
    
    # Skill suggestions
    skill_suggestions = db.query(models.Skill).filter(
        models.Skill.name.ilike(search_term)
    ).limit(limit).all()
    
    return {
        "users": [
            {
                "id": str(user.id),
                "username": user.username,
                "name": user.name,
                "type": "user"
            }
            for user in user_suggestions
        ],
        "skills": [
            {
                "id": str(skill.id),
                "name": skill.name,
                "type": "skill"
            }
            for skill in skill_suggestions
        ]
    }