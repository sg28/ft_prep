"""
Background tasks for periodic maintenance.
"""
import logging
from sqlalchemy.orm import Session
from sqlalchemy import func, union, select

from app import models
from app.database import SessionLocal

logger = logging.getLogger(__name__)

MIN_UNIQUE_ENGAGERS = 3


def get_unique_engager_count(db: Session, post_id) -> int:
    """
    Count distinct users who have liked OR commented on a post.
    A single user counts once regardless of how many likes/comments they made.
    """
    likers = select(models.PostLike.user_id).where(models.PostLike.post_id == post_id)
    commenters = select(models.Comment.user_id).where(models.Comment.post_id == post_id)

    combined = union(likers, commenters).subquery()
    count = db.execute(select(func.count()).select_from(combined)).scalar()
    return count or 0


def cleanup_underengaged_posts() -> dict:
    """
    Delete all public posts that have fewer than MIN_UNIQUE_ENGAGERS unique
    users who have liked OR commented on them.

    Returns a summary dict with deleted_count and post_ids.
    """
    db: Session = SessionLocal()
    try:
        # Fetch all public posts
        posts = db.query(models.Post).filter(models.Post.is_public == True).all()

        deleted_ids = []
        for post in posts:
            unique_count = get_unique_engager_count(db, post.id)
            if unique_count < MIN_UNIQUE_ENGAGERS:
                # Decrement post_count on the author
                user = db.query(models.User).filter(models.User.id == post.user_id).first()
                if user and user.post_count > 0:
                    user.post_count -= 1

                deleted_ids.append(str(post.id))
                db.delete(post)

        db.commit()
        logger.info(
            "Weekly post cleanup: deleted %d posts with fewer than %d unique engagers",
            len(deleted_ids),
            MIN_UNIQUE_ENGAGERS,
        )
        return {"deleted_count": len(deleted_ids), "deleted_post_ids": deleted_ids}

    except Exception as exc:
        db.rollback()
        logger.error("Weekly post cleanup failed: %s", exc)
        raise
    finally:
        db.close()
