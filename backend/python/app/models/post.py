from datetime import datetime
from typing import List, Optional

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Table,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import TSVECTOR
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

# Association table for post <-> tags (many-to-many)
post_tags = Table(
    "post_tags",
    Base.metadata,
    Column("post_id", Integer, ForeignKey("posts.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", Integer, ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)


class Author(Base):
    __tablename__ = "authors"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
    avatar: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    github: Mapped[Optional[str]] = mapped_column(String(300), nullable=True)
    linkedin: Mapped[Optional[str]] = mapped_column(String(300), nullable=True)
    twitter: Mapped[Optional[str]] = mapped_column(String(300), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)

    posts: Mapped[List["Post"]] = relationship("Post", back_populates="author")


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    slug: Mapped[str] = mapped_column(String(200), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(200))
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    posts: Mapped[List["Post"]] = relationship("Post", back_populates="category")


class Tag(Base):
    __tablename__ = "tags"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    slug: Mapped[str] = mapped_column(String(200), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(200))

    posts: Mapped[List["Post"]] = relationship(
        "Post", secondary=post_tags, back_populates="tags"
    )


class Post(Base):
    __tablename__ = "posts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    slug: Mapped[str] = mapped_column(String(300), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(500))
    excerpt: Mapped[str] = mapped_column(Text, default="")
    body: Mapped[str] = mapped_column(Text, default="")
    published_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    read_time_minutes: Mapped[int] = mapped_column(Integer, default=1)
    cover_image: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    draft: Mapped[bool] = mapped_column(Boolean, default=False)
    # Full-text search vector — rebuilt periodically by APScheduler
    search_vector = Column(TSVECTOR, nullable=True)

    author_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("authors.id"), nullable=True
    )
    category_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("categories.id"), nullable=True
    )

    author: Mapped[Optional["Author"]] = relationship("Author", back_populates="posts")
    category: Mapped[Optional["Category"]] = relationship(
        "Category", back_populates="posts"
    )
    tags: Mapped[List["Tag"]] = relationship(
        "Tag", secondary=post_tags, back_populates="posts"
    )

    __table_args__ = (
        # GIN index enables fast full-text search queries
        Index("ix_posts_search_vector", "search_vector", postgresql_using="gin"),
        Index("ix_posts_published_at", "published_at"),
    )
