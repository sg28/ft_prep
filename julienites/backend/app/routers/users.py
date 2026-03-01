from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from app.database import get_db
from app import schemas, crud, models
from app.auth import get_current_user, get_current_active_user

router = APIRouter()


@router.get("/", response_model=List[schemas.UserPublic])
async def get_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Get all users (paginated)"""
    users = crud.user_crud.get_users(db, skip=skip, limit=limit)
    return users


@router.get("/me", response_model=schemas.UserProfile)
async def get_my_profile(
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get current user's complete profile"""
    return get_user_profile(db, current_user.id)


@router.get("/{user_id}", response_model=schemas.UserProfile)
async def get_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Get user profile by ID"""
    user = crud.user_crud.get_user(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return get_user_profile(db, user_id)


@router.put("/{user_id}", response_model=schemas.UserInDB)
async def update_user(
    user_id: UUID,
    user_update: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Update user profile"""
    # Users can only update their own profile unless they're admin
    if current_user.id != user_id and current_user.role not in ["admin", "moderator"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    updated_user = crud.user_crud.update_user(db, user_id, user_update)
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return updated_user


@router.delete("/{user_id}")
async def delete_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Delete user account"""
    # Users can only delete their own account unless they're admin
    if current_user.id != user_id and current_user.role not in ["admin", "moderator"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    success = crud.user_crud.delete_user(db, user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {"message": "User deleted successfully"}


# Education endpoints
@router.get("/{user_id}/education", response_model=List[schemas.EducationInDB])
async def get_user_education(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Get user's education history"""
    education = crud.education_crud.get_education_by_user(db, user_id)
    return education


@router.post("/{user_id}/education", response_model=schemas.EducationInDB)
async def add_education(
    user_id: UUID,
    education: schemas.EducationCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Add education entry"""
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Can only add education to your own profile"
        )
    
    return crud.education_crud.create_education(db, user_id, education)


@router.put("/education/{education_id}", response_model=schemas.EducationInDB)
async def update_education(
    education_id: UUID,
    education_update: schemas.EducationUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Update education entry"""
    education = db.query(models.Education).filter(models.Education.id == education_id).first()
    if not education:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Education entry not found"
        )
    
    if current_user.id != education.user_id and current_user.role not in ["admin", "moderator"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    updated_education = crud.education_crud.update_education(db, education_id, education_update)
    if not updated_education:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Education entry not found"
        )
    
    return updated_education


@router.delete("/education/{education_id}")
async def delete_education(
    education_id: UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Delete education entry"""
    education = db.query(models.Education).filter(models.Education.id == education_id).first()
    if not education:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Education entry not found"
        )
    
    if current_user.id != education.user_id and current_user.role not in ["admin", "moderator"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    success = crud.education_crud.delete_education(db, education_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Education entry not found"
        )
    
    return {"message": "Education entry deleted successfully"}


# Experience endpoints
@router.get("/{user_id}/experience", response_model=List[schemas.ExperienceInDB])
async def get_user_experience(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Get user's work experience"""
    experience = crud.experience_crud.get_experience_by_user(db, user_id)
    return experience


@router.post("/{user_id}/experience", response_model=schemas.ExperienceInDB)
async def add_experience(
    user_id: UUID,
    experience: schemas.ExperienceCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Add experience entry"""
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Can only add experience to your own profile"
        )
    
    return crud.experience_crud.create_experience(db, user_id, experience)


@router.put("/experience/{experience_id}", response_model=schemas.ExperienceInDB)
async def update_experience(
    experience_id: UUID,
    experience_update: schemas.ExperienceUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Update experience entry"""
    experience = db.query(models.Experience).filter(models.Experience.id == experience_id).first()
    if not experience:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Experience entry not found"
        )
    
    if current_user.id != experience.user_id and current_user.role not in ["admin", "moderator"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    updated_experience = crud.experience_crud.update_experience(db, experience_id, experience_update)
    if not updated_experience:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Experience entry not found"
        )
    
    return updated_experience


@router.delete("/experience/{experience_id}")
async def delete_experience(
    experience_id: UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Delete experience entry"""
    experience = db.query(models.Experience).filter(models.Experience.id == experience_id).first()
    if not experience:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Experience entry not found"
        )
    
    if current_user.id != experience.user_id and current_user.role not in ["admin", "moderator"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    success = crud.experience_crud.delete_experience(db, experience_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Experience entry not found"
        )
    
    return {"message": "Experience entry deleted successfully"}


# Skills endpoints
@router.get("/{user_id}/skills", response_model=List[schemas.UserSkillInDB])
async def get_user_skills(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Get user's skills"""
    user_skills = crud.skill_crud.get_user_skills(db, user_id)
    return user_skills


@router.post("/{user_id}/skills")
async def add_user_skill(
    user_id: UUID,
    skill_name: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Add skill to user"""
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Can only add skills to your own profile"
        )
    
    user_skill = crud.skill_crud.add_user_skill(db, user_id, skill_name)
    return user_skill


@router.delete("/{user_id}/skills/{skill_id}")
async def remove_user_skill(
    user_id: UUID,
    skill_id: UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Remove skill from user"""
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Can only remove skills from your own profile"
        )
    
    success = crud.skill_crud.remove_user_skill(db, user_id, skill_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found"
        )
    
    return {"message": "Skill removed successfully"}


def get_user_profile(db: Session, user_id: UUID) -> schemas.UserProfile:
    """Helper function to get complete user profile"""
    user = crud.user_crud.get_user(db, user_id)
    if not user:
        return None
    
    # Get all related data
    education = crud.education_crud.get_education_by_user(db, user_id)
    experience = crud.experience_crud.get_experience_by_user(db, user_id)
    skills = crud.skill_crud.get_user_skills(db, user_id)
    posts = crud.post_crud.get_user_posts(db, user_id, limit=10)
    following = crud.connection_crud.get_following(db, user_id)
    followers = crud.connection_crud.get_followers(db, user_id)
    
    # Convert to schemas
    user_dict = schemas.UserInDB.from_orm(user).dict()
    
    # Create profile
    profile = schemas.UserProfile(
        **user_dict,
        education=[schemas.EducationInDB.from_orm(edu) for edu in education],
        experience=[schemas.ExperienceInDB.from_orm(exp) for exp in experience],
        skills=[schemas.UserSkillInDB.from_orm(skill) for skill in skills],
        posts=[schemas.PostInDB.from_orm(post) for post in posts],
        following=[schemas.UserPublic.from_orm(user) for user in following],
        followers=[schemas.UserPublic.from_orm(user) for user in followers]
    )
    
    return profile