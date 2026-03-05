from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID
from enum import Enum


# Enums
class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"
    MODERATOR = "moderator"


# Base schemas
class BaseSchema(BaseModel):
    class Config:
        from_attributes = True
        json_encoders = {
            UUID: str,
            datetime: lambda dt: dt.isoformat()
        }


# User schemas
class UserBase(BaseSchema):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    name: str = Field(..., min_length=2, max_length=255)
    

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    graduation_year: Optional[int] = None
    
    @validator('graduation_year')
    def validate_graduation_year(cls, v):
        if v is not None:
            current_year = datetime.now().year
            if v < 1900 or v > current_year + 5:  # Allow up to 5 years in future
                raise ValueError(f'Graduation year must be between 1900 and {current_year + 5}')
        return v


class UserUpdate(BaseSchema):
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    bio: Optional[str] = None
    location: Optional[str] = None
    current_role: Optional[str] = None
    graduation_year: Optional[int] = None
    phone: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    twitter_handle: Optional[str] = None
    profile_image_url: Optional[str] = None


class UserInDB(UserBase):
    id: UUID
    graduation_year: Optional[int] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    current_role: Optional[str] = None
    profile_image_url: Optional[str] = None
    phone: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    twitter_handle: Optional[str] = None
    following_count: Optional[int] = 0
    followers_count: Optional[int] = 0
    post_count: Optional[int] = 0
    is_active: Optional[bool] = True
    is_verified: Optional[bool] = False
    role: Optional[UserRole] = UserRole.USER
    created_at: datetime
    updated_at: Optional[datetime] = None
    last_login_at: Optional[datetime] = None


class UserPublic(UserInDB):
    """User data safe for public viewing"""
    email: Optional[str] = None  # Hide email in public view
    phone: Optional[str] = None  # Hide phone in public view


# Education schemas
class EducationBase(BaseSchema):
    institution: str = Field(..., max_length=255)
    degree: Optional[str] = Field(None, max_length=100)
    field: Optional[str] = Field(None, max_length=255)
    year: Optional[int] = None


class EducationCreate(EducationBase):
    pass


class EducationUpdate(EducationBase):
    pass


class EducationInDB(EducationBase):
    id: UUID
    user_id: UUID
    created_at: datetime


# Experience schemas
class ExperienceBase(BaseSchema):
    company: str = Field(..., max_length=255)
    position: str = Field(..., max_length=255)
    duration: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None


class ExperienceCreate(ExperienceBase):
    pass


class ExperienceUpdate(ExperienceBase):
    pass


class ExperienceInDB(ExperienceBase):
    id: UUID
    user_id: UUID
    created_at: datetime


# Skill schemas
class SkillBase(BaseSchema):
    name: str = Field(..., max_length=100)
    category: Optional[str] = Field(None, max_length=100)


class SkillCreate(SkillBase):
    pass


class SkillInDB(SkillBase):
    id: UUID
    created_at: datetime


class UserSkillBase(BaseSchema):
    skill_id: UUID


class UserSkillCreate(UserSkillBase):
    pass


class UserSkillInDB(UserSkillBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    skill: SkillInDB


# Post tag enum
POST_TAGS = ["Questions", "Celebration", "Alert", "Social", "Post Truth"]


# Post schemas
class PostBase(BaseSchema):
    content: str = Field(..., min_length=1, max_length=10000)
    media_urls: Optional[List[str]] = None
    is_public: bool = True
    is_anonymous: bool = False
    tag: Optional[str] = None

    @validator('tag')
    def validate_tag(cls, v):
        if v is not None and v not in POST_TAGS:
            raise ValueError(f'tag must be one of {POST_TAGS}')
        return v


class PostCreate(PostBase):
    pass


class PostUpdate(BaseSchema):
    content: Optional[str] = Field(None, min_length=1, max_length=10000)
    is_public: Optional[bool] = None
    tag: Optional[str] = None

    @validator('tag')
    def validate_tag(cls, v):
        if v is not None and v not in POST_TAGS:
            raise ValueError(f'tag must be one of {POST_TAGS}')
        return v


class PostInDB(PostBase):
    id: UUID
    user_id: UUID
    tag: Optional[str] = None
    likes_count: Optional[int] = 0
    comments_count: Optional[int] = 0
    reposts_count: Optional[int] = 0
    created_at: datetime
    updated_at: Optional[datetime] = None
    user: UserPublic


# Comment schemas
class CommentBase(BaseSchema):
    content: str = Field(..., min_length=1, max_length=5000)
    parent_comment_id: Optional[UUID] = None


class CommentCreate(CommentBase):
    pass


class CommentUpdate(BaseSchema):
    content: Optional[str] = Field(None, min_length=1, max_length=5000)


class CommentInDB(CommentBase):
    id: UUID
    post_id: UUID
    user_id: UUID
    likes_count: int = 0
    created_at: datetime
    updated_at: Optional[datetime] = None
    user: UserPublic


# Authentication schemas
class Token(BaseSchema):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class TokenData(BaseSchema):
    user_id: Optional[UUID] = None
    username: Optional[str] = None


class LoginRequest(BaseSchema):
    email: EmailStr
    password: str


class RegisterRequest(UserCreate):
    pass


class PasswordResetRequest(BaseSchema):
    email: EmailStr


class PasswordChangeRequest(BaseSchema):
    current_password: str
    new_password: str = Field(..., min_length=8)


# Search schemas
class SearchQuery(BaseSchema):
    q: str = Field(..., min_length=1, max_length=100)
    limit: int = Field(20, ge=1, le=100)
    offset: int = Field(0, ge=0)


class SearchResults(BaseSchema):
    users: List[UserPublic] = []
    posts: List[PostInDB] = []
    total_users: int = 0
    total_posts: int = 0


# Connection schemas
class ConnectionCreate(BaseSchema):
    following_id: UUID


class ConnectionInDB(BaseSchema):
    follower_id: UUID
    following_id: UUID
    created_at: datetime
    following: UserPublic


# Notification schemas
class NotificationBase(BaseSchema):
    type: str
    title: str
    message: str
    data: Optional[Dict[str, Any]] = None


class NotificationInDB(NotificationBase):
    id: UUID
    user_id: UUID
    is_read: bool = False
    created_at: datetime


# Response schemas
class PaginatedResponse(BaseSchema):
    items: List[Any]
    total: int
    page: int
    size: int
    pages: int


class ErrorResponse(BaseSchema):
    detail: str
    code: Optional[str] = None


# Complete user profile with all related data
class UserProfile(UserPublic):
    education: List[EducationInDB] = []
    experience: List[ExperienceInDB] = []
    skills: List[UserSkillInDB] = []
    posts: List[PostInDB] = []
    following: List[UserPublic] = []
    followers: List[UserPublic] = []