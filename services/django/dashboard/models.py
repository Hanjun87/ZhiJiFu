import uuid

from django.db import models


class AIProviderConfig(models.Model):
    provider = models.CharField(max_length=32, default="external_ai_api")
    external_endpoint = models.URLField(blank=True)
    external_api_key = models.CharField(max_length=512, blank=True)
    external_model = models.CharField(max_length=128, blank=True)
    external_timeout_ms = models.PositiveIntegerField(default=20000)
    # 识别皮肤问题的提示词
    external_system_prompt = models.TextField(blank=True)
    external_user_prompt_template = models.TextField(blank=True)
    # 记录皮肤状态的提示词
    external_skin_record_system_prompt = models.TextField(blank=True)
    external_skin_record_user_prompt_template = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "AI配置"
        verbose_name_plural = "AI配置"

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.provider} 配置"


class SkinAnalysisRecord(models.Model):
    request_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    provider = models.CharField(max_length=32, default="external_ai_api")
    diagnosis = models.CharField(max_length=255, blank=True)
    probability = models.PositiveSmallIntegerField(null=True, blank=True)
    image_sha256 = models.CharField(max_length=64)
    request_source = models.CharField(max_length=32, default="app")
    remote_addr = models.GenericIPAddressField(blank=True, null=True)
    success = models.BooleanField(default=True)
    error_message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "识别记录"
        verbose_name_plural = "识别记录"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.request_id} - {self.diagnosis or '处理中'}"


class SkinRecord(models.Model):
    """皮肤状态记录（皮肤日记）"""
    record_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    provider = models.CharField(max_length=32, default="external_ai_api")
    # 照片质量评分
    photo_clarity = models.PositiveSmallIntegerField(null=True, blank=True)
    photo_lighting = models.PositiveSmallIntegerField(null=True, blank=True)
    photo_composition = models.PositiveSmallIntegerField(null=True, blank=True)
    # 皮肤状态
    skin_overall = models.CharField(max_length=32, blank=True)
    skin_moisture = models.CharField(max_length=32, blank=True)
    skin_texture = models.CharField(max_length=32, blank=True)
    skin_issues = models.JSONField(default=list, blank=True)
    # AI分析结果
    observations = models.JSONField(default=list, blank=True)
    suggestions = models.JSONField(default=list, blank=True)
    # 用户备注
    user_note = models.TextField(blank=True)
    user_tags = models.JSONField(default=list, blank=True)
    # 图片
    image_sha256 = models.CharField(max_length=64)
    request_source = models.CharField(max_length=32, default="app")
    remote_addr = models.GenericIPAddressField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "皮肤状态记录"
        verbose_name_plural = "皮肤状态记录"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.record_id} - {self.skin_overall or '未评估'}"


class UserProfile(models.Model):
    """用户资料"""
    user_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    nickname = models.CharField(max_length=64, blank=True)
    avatar = models.URLField(blank=True)
    location = models.CharField(max_length=64, blank=True)
    is_expert = models.BooleanField(default=False)
    title = models.CharField(max_length=64, blank=True)
    hospital = models.CharField(max_length=128, blank=True)
    experience = models.CharField(max_length=32, blank=True)
    consultations = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "用户资料"
        verbose_name_plural = "用户资料"

    def __str__(self):
        return f"{self.nickname or self.user_id}"


class Post(models.Model):
    """社区帖子"""
    post_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    author = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='posts')
    title = models.CharField(max_length=200)
    content = models.TextField()
    images = models.JSONField(default=list, blank=True)
    tags = models.JSONField(default=list, blank=True)
    is_anonymous = models.BooleanField(default=False)
    
    # 关联皮肤报告
    related_skin_record = models.ForeignKey(SkinRecord, on_delete=models.SET_NULL, null=True, blank=True, related_name='posts')
    
    # 统计数据
    likes = models.PositiveIntegerField(default=0)
    comments = models.PositiveIntegerField(default=0)
    shares = models.PositiveIntegerField(default=0)
    
    # 状态
    is_deleted = models.BooleanField(default=False)
    is_pinned = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "社区帖子"
        verbose_name_plural = "社区帖子"
        ordering = ["-is_pinned", "-created_at"]

    def __str__(self):
        return f"{self.post_id} - {self.title[:30]}"


class PostLike(models.Model):
    """帖子点赞记录"""
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='like_records')
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='post_likes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "帖子点赞"
        verbose_name_plural = "帖子点赞"
        unique_together = ['post', 'user']

    def __str__(self):
        return f"{self.user} 点赞 {self.post}"


class PostComment(models.Model):
    """帖子评论"""
    comment_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='post_comments')
    author = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    is_expert_reply = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "帖子评论"
        verbose_name_plural = "帖子评论"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.comment_id} - {self.content[:30]}"
