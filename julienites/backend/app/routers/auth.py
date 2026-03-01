from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from app.database import get_db
from app import schemas, crud
from app.auth import (
    authenticate_user,
    create_access_token,
    create_refresh_token,
    verify_token,
    get_current_user,
    get_password_hash
)
from app.config import settings

router = APIRouter()


@router.post("/login", response_model=schemas.Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Authenticate user and return access/refresh tokens"""
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    
    # Update last login time
    user.last_login_at = datetime.utcnow()
    db.commit()
    
    # Create tokens
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id), "username": user.username},
        expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(
        data={"sub": str(user.id), "username": user.username}
    )
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }


@router.post("/register", response_model=schemas.UserInDB)
async def register(
    user_data: schemas.RegisterRequest,
    db: Session = Depends(get_db)
):
    """Register a new user"""
    # Check if email already exists
    existing_user = crud.user_crud.get_user_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if username already exists
    existing_username = crud.user_crud.get_user_by_username(db, user_data.username)
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Create user
    user = crud.user_crud.create_user(db, user_data)
    return user


@router.post("/refresh", response_model=schemas.Token)
async def refresh_token(
    refresh_token: str,
    db: Session = Depends(get_db)
):
    """Refresh access token using refresh token"""
    payload = verify_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    user_id = payload.get("sub")
    user = crud.user_crud.get_user(db, user_id)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    # Create new tokens
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id), "username": user.username},
        expires_delta=access_token_expires
    )
    new_refresh_token = create_refresh_token(
        data={"sub": str(user.id), "username": user.username}
    )
    
    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }


@router.post("/logout")
async def logout(
    current_user: schemas.UserInDB = Depends(get_current_user)
):
    """Logout user (client should discard tokens)"""
    return {"message": "Successfully logged out"}


@router.get("/me", response_model=schemas.UserInDB)
async def get_current_user_info(
    current_user: schemas.UserInDB = Depends(get_current_user)
):
    """Get current user information"""
    return current_user


@router.put("/me", response_model=schemas.UserInDB)
async def update_current_user(
    user_update: schemas.UserUpdate,
    current_user: schemas.UserInDB = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user information"""
    updated_user = crud.user_crud.update_user(db, current_user.id, user_update)
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return updated_user


@router.post("/password/change")
async def change_password(
    password_data: schemas.PasswordChangeRequest,
    current_user: schemas.UserInDB = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Change user password"""
    from app.auth import verify_password
    
    # Verify current password
    if not verify_password(password_data.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Update password
    current_user.password_hash = get_password_hash(password_data.new_password)
    db.commit()
    
    return {"message": "Password updated successfully"}


@router.post("/password/reset/request")
async def request_password_reset(
    reset_request: schemas.PasswordResetRequest,
    db: Session = Depends(get_db)
):
    """Request password reset (send email with reset link)"""
    user = crud.user_crud.get_user_by_email(db, reset_request.email)
    if user:
        # In a real app, send email with reset token
        # For now, just return success
        pass
    
    # Always return success to prevent email enumeration
    return {"message": "If the email exists, a reset link has been sent"}


# Import datetime at the top
from datetime import datetime