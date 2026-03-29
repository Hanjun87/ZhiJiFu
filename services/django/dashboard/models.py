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
