from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    id: str = Field(alias="$id")
    name: str
    email: EmailStr
    email_verification: bool = Field(False, alias="emailVerification")


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class BlogCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    slug: str = Field(min_length=1, max_length=80, pattern=r"^[a-z0-9-]+$")
    content: str = Field(min_length=1)
    featuredImage: str = ""
    status: str = Field(default="active", pattern=r"^(active|draft)$")
    excerpt: str = Field(default="", max_length=500)
    tags: list[str] = Field(default_factory=list)


class BlogUpdate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    content: str = Field(min_length=1)
    featuredImage: str | None = None
    status: str = Field(pattern=r"^(active|draft)$")
    excerpt: str = Field(default="", max_length=500)
    tags: list[str] = Field(default_factory=list)


class ProfileUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    bio: str = Field(default="", max_length=2000)
    avatar: str = ""
    website: str = ""
    github: str = ""
    linkedin: str = ""


class BookmarkResponse(BaseModel):
    id: str = Field(alias="$id")
    userID: str
    postID: str
    created_at: datetime
