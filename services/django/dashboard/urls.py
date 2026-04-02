from django.urls import path

from . import views


urlpatterns = [
    path("dashboard/", views.index, name="index"),
    path("api/health", views.health, name="health"),
    # 识别皮肤问题
    path("api/analyze-skin", views.analyze_skin, name="analyze-skin"),
    # 记录皮肤状态
    path("api/analyze-skin-record", views.analyze_skin_record, name="analyze-skin-record"),
    # 疾病趋势诊断Agent
    path("api/disease-trend-analysis", views.disease_trend_analysis, name="disease-trend-analysis"),
    # 管理后台API
    path("api/admin/ai/providers", views.providers, name="providers"),
    path("api/admin/ai/config", views.config, name="config"),
    path("api/admin/ai/analyze", views.analyze, name="analyze"),
    # 社区API
    path("api/community/posts", views.list_posts, name="list-posts"),
    path("api/community/posts/create", views.create_post, name="create-post"),
    path("api/community/posts/<str:post_id>", views.get_post_detail, name="post-detail"),
    path("api/community/posts/<str:post_id>/like", views.like_post, name="like-post"),
    path("api/community/posts/<str:post_id>/comments", views.create_comment, name="create-comment"),
    path("api/community/skin-records", views.get_skin_records, name="skin-records"),
]
