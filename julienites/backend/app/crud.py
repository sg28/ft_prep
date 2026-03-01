from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func, desc
from typing import List, Optional, Dict, Any
from uuid import UUID
import uuid

from app import models, schemas
from app.auth import get_password_hash


# User CRUD operations
class UserCRUD:
    @staticmethod
    def get_user(db: Session, user_id: UUID) -> Optional[models.User]:
        return db.query(models.User).filter(models.User.id == user_id).first()
    
    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
        return db.query(models.User).filter(models.User.email == email).first()
    
    @staticmethod
    def get_user_by_username(db: Session, username: str) -> Optional[models.User]:
        return db.query(models.User).filter(models.User.username == username).first()
    
    @staticmethod
    def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[models.User]:
        return db.query(models.User).offset(skip).limit(limit).all()
    
    @staticmethod
    def create_user(db: Session, user: schemas.UserCreate) -> models.User:
        hashed_password = get_password_hash(user.password)
        db_user = models.User(
            email=user.email,
            username=user.username,
            name=user.name,
            password_hash=hashed_password,
            graduation_year=user.graduation_year
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    
    @staticmethod
    def update_user(db: Session, user_id: UUID, user_update: schemas.UserUpdate) -> Optional[models.User]:
        db_user = UserCRUD.get_user(db, user_id)
        if not db_user:
            return None
        
        update_data = user_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_user, field, value)
        
        db.commit()
        db.refresh(db_user)
        return db_user
    
    @staticmethod
    def delete_user(db: Session, user_id: UUID) -> bool:
        db_user = UserCRUD.get_user(db, user_id)
        if not db_user:
            return False
        db.delete(db_user)
        db.commit()
        return True
    
    @staticmethod
    def search_users(db: Session, query: str, limit: int = 20) -> List[models.User]:
        search_term = f"%{query}%"
        return db.query(models.User).filter(
            or_(
                models.User.name.ilike(search_term),
                models.User.username.ilike(search_term),
                models.User.email.ilike(search_term),
                models.User.bio.ilike(search_term),
                models.User.location.ilike(search_term),
                models.User.current_role.ilike(search_term)
            )
        ).limit(limit).all()


# Education CRUD operations
class EducationCRUD:
    @staticmethod
    def get_education_by_user(db: Session, user_id: UUID) -> List[models.Education]:
        return db.query(models.Education).filter(models.Education.user_id == user_id).all()
    
    @staticmethod
    def create_education(db: Session, user_id: UUID, education: schemas.EducationCreate) -> models.Education:
        db_education = models.Education(
            user_id=user_id,
            **education.dict()
        )
        db.add(db_education)
        db.commit()
        db.refresh(db_education)
        return db_education
    
    @staticmethod
    def update_education(db: Session, education_id: UUID, education_update: schemas.EducationUpdate) -> Optional[models.Education]:
        db_education = db.query(models.Education).filter(models.Education.id == education_id).first()
        if not db_education:
            return None
        
        update_data = education_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_education, field, value)
        
        db.commit()
        db.refresh(db_education)
        return db_education
    
    @staticmethod
    def delete_education(db: Session, education_id: UUID) -> bool:
        db_education = db.query(models.Education).filter(models.Education.id == education_id).first()
        if not db_education:
            return False
        db.delete(db_education)
        db.commit()
        return True


# Experience CRUD operations
class ExperienceCRUD:
    @staticmethod
    def get_experience_by_user(db: Session, user_id: UUID) -> List[models.Experience]:
        return db.query(models.Experience).filter(models.Experience.user_id == user_id).all()
    
    @staticmethod
    def create_experience(db: Session, user_id: UUID, experience: schemas.ExperienceCreate) -> models.Experience:
        db_experience = models.Experience(
            user_id=user_id,
            **experience.dict()
        )
        db.add(db_experience)
        db.commit()
        db.refresh(db_experience)
        return db_experience
    
    @staticmethod
    def update_experience(db: Session, experience_id: UUID, experience_update: schemas.ExperienceUpdate) -> Optional[models.Experience]:
        db_experience = db.query(models.Experience).filter(models.Experience.id == experience_id).first()
        if not db_experience:
            return None
        
        update_data = experience_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_experience, field, value)
        
        db.commit()
        db.refresh(db_experience)
        return db_experience
    
    @staticmethod
    def delete_experience(db: Session, experience_id: UUID) -> bool:
        db_experience = db.query(models.Experience).filter(models.Experience.id == experience_id).first()
        if not db_experience:
            return False
        db.delete(db_experience)
        db.commit()
        return True


# Skill CRUD operations
class SkillCRUD:
    @staticmethod
    def get_or_create_skill(db: Session, skill_name: str) -> models.Skill:
        skill = db.query(models.Skill).filter(models.Skill.name == skill_name).first()
        if not skill:
            skill = models.Skill(name=skill_name)
            db.add(skill)
            db.commit()
            db.refresh(skill)
        return skill
    
    @staticmethod
    def get_user_skills(db: Session, user_id: UUID) -> List[models.UserSkill]:
        return db.query(models.UserSkill).filter(models.UserSkill.user_id == user_id).all()
    
    @staticmethod
    def add_user_skill(db: Session, user_id: UUID, skill_name: str) -> models.UserSkill:
        skill = SkillCRUD.get_or_create_skill(db, skill_name)
        
        # Check if user already has this skill
        existing = db.query(models.UserSkill).filter(
            models.UserSkill.user_id == user_id,
            models.UserSkill.skill_id == skill.id
        ).first()
        
        if existing:
            return existing
        
        user_skill = models.UserSkill(user_id=user_id, skill_id=skill.id)
        db.add(user_skill)
        db.commit()
        db.refresh(user_skill)
        return user_skill
    
    @staticmethod
    def remove_user_skill(db: Session, user_id: UUID, skill_id: UUID) -> bool:
        user_skill = db.query(models.UserSkill).filter(
            models.UserSkill.user_id == user_id,
            models.UserSkill.skill_id == skill_id
        ).first()
        
        if not user_skill:
            return False
        
        db.delete(user_skill)
        db.commit()
        return True


# Post CRUD operations
class PostCRUD:
    @staticmethod
    def get_post(db: Session, post_id: UUID) -> Optional[models.Post]:
        return db.query(models.Post).filter(models.Post.id == post_id).first()
    
    @staticmethod
    def get_user_posts(db: Session, user_id: UUID, skip: int = 0, limit: int = 50) -> List[models.Post]:
        return db.query(models.Post).filter(
            models.Post.user_id == user_id,
            models.Post.is_public == True
        ).order_by(desc(models.Post.created_at)).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_feed_posts(db: Session, user_id: UUID, skip: int = 0, limit: int = 50) -> List[models.Post]:
        # Get posts from users that the current user follows
        following_ids = db.query(models.UserConnection.following_id).filter(
            models.UserConnection.follower_id == user_id
        ).subquery()
        
        return db.query(models.Post).filter(
            or_(
                models.Post.user_id == user_id,  # User's own posts
                models.Post.user_id.in_(following_ids)  # Posts from followed users
            ),
            models.Post.is_public == True
        ).order_by(desc(models.Post.created_at)).offset(skip).limit(limit).all()
    
    @staticmethod
    def create_post(db: Session, user_id: UUID, post: schemas.PostCreate) -> models.Post:
        db_post = models.Post(
            user_id=user_id,
            **post.dict()
        )
        db.add(db_post)
        
        # Update user's post count
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if user:
            user.post_count += 1
        
        db.commit()
        db.refresh(db_post)
        return db_post
    
    @staticmethod
    def update_post(db: Session, post_id: UUID, post_update: schemas.PostUpdate) -> Optional[models.Post]:
        db_post = PostCRUD.get_post(db, post_id)
        if not db_post:
            return None
        
        update_data = post_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_post, field, value)
        
        db.commit()
        db.refresh(db_post)
        return db_post
    
    @staticmethod
    def delete_post(db: Session, post_id: UUID) -> bool:
        db_post = PostCRUD.get_post(db, post_id)
        if not db_post:
            return False
        
        # Update user's post count
        user = db.query(models.User).filter(models.User.id == db_post.user_id).first()
        if user and user.post_count > 0:
            user.post_count -= 1
        
        db.delete(db_post)
        db.commit()
        return True
    
    @staticmethod
    def like_post(db: Session, post_id: UUID, user_id: UUID) -> bool:
        # Check if already liked
        existing_like = db.query(models.PostLike).filter(
            models.PostLike.post_id == post_id,
            models.PostLike.user_id == user_id
        ).first()
        
        if existing_like:
            return False
        
        # Create like
        like = models.PostLike(post_id=post_id, user_id=user_id)
        db.add(like)
        
        # Update post like count
        post = db.query(models.Post).filter(models.Post.id == post_id).first()
        if post:
            post.likes_count += 1
        
        db.commit()
        return True
    
    @staticmethod
    def unlike_post(db: Session, post_id: UUID, user_id: UUID) -> bool:
        like = db.query(models.PostLike).filter(
            models.PostLike.post_id == post_id,
            models.PostLike.user_id == user_id
        ).first()
        
        if not like:
            return False
        
        # Update post like count
        post = db.query(models.Post).filter(models.Post.id == post_id).first()
        if post and post.likes_count > 0:
            post.likes_count -= 1
        
        db.delete(like)
        db.commit()
        return True


# Connection CRUD operations
class ConnectionCRUD:
    @staticmethod
    def follow_user(db: Session, follower_id: UUID, following_id: UUID) -> bool:
        # Check if already following
        existing = db.query(models.UserConnection).filter(
            models.UserConnection.follower_id == follower_id,
            models.UserConnection.following_id == following_id
        ).first()
        
        if existing or follower_id == following_id:
            return False
        
        # Create connection
        connection = models.UserConnection(
            follower_id=follower_id,
            following_id=following_id
        )
        db.add(connection)
        
        # Update follower/following counts
        follower = db.query(models.User).filter(models.User.id == follower_id).first()
        following = db.query(models.User).filter(models.User.id == following_id).first()
        
        if follower:
            follower.following_count += 1
        if following:
            following.followers_count += 1
        
        db.commit()
        return True
    
    @staticmethod
    def unfollow_user(db: Session, follower_id: UUID, following_id: UUID) -> bool:
        connection = db.query(models.UserConnection).filter(
            models.UserConnection.follower_id == follower_id,
            models.UserConnection.following_id == following_id
        ).first()
        
        if not connection:
            return False
        
        # Update follower/following counts
        follower = db.query(models.User).filter(models.User.id == follower_id).first()
        following = db.query(models.User).filter(models.User.id == following_id).first()
        
        if follower and follower.following_count > 0:
            follower.following_count -= 1
        if following and following.followers_count > 0:
            following.followers_count -= 1
        
        db.delete(connection)
        db.commit()
        return True
    
    @staticmethod
    def get_followers(db: Session, user_id: UUID) -> List[models.User]:
        followers = db.query(models.User).join(
            models.UserConnection,
            models.UserConnection.follower_id == models.User.id
        ).filter(
            models.UserConnection.following_id == user_id
        ).all()
        return followers
    
    @staticmethod
    def get_following(db: Session, user_id: UUID) -> List[models.User]:
        following = db.query(models.User).join(
            models.UserConnection,
            models.UserConnection.following_id == models.User.id
        ).filter(
            models.UserConnection.follower_id == user_id
        ).all()
        return following
    
    @staticmethod
    def is_following(db: Session, follower_id: UUID, following_id: UUID) -> bool:
        connection = db.query(models.UserConnection).filter(
            models.UserConnection.follower_id == follower_id,
            models.UserConnection.following_id == following_id
        ).first()
        return connection is not None


# Initialize CRUD instances
user_crud = UserCRUD()
education_crud = EducationCRUD()
experience_crud = ExperienceCRUD()
skill_crud = SkillCRUD()
post_crud = PostCRUD()
connection_crud = ConnectionCRUD()