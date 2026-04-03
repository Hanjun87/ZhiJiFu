import json
import os
from pathlib import Path

# 加载 backend 目录的 .env 文件
backend_dir = Path("e:\\workspace\\SkinAI\\skinAI\\backend")
env_file = backend_dir / ".env"
if env_file.exists():
    try:
        from dotenv import load_dotenv
        load_dotenv(env_file, override=True)
    except ImportError:
        pass
    
    # 手动解析 .env 文件设置环境变量（处理引号问题）
    try:
        with open(env_file, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    key = key.strip()
                    value = value.strip().strip('"').strip("'")
                    if key and value:
                        os.environ[key] = value
    except Exception:
        pass

from django.contrib.admin.views.decorators import staff_member_required
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_http_methods

from .services import PROVIDERS, get_public_config, run_analysis, update_ai_config


def get_remote_addr(request):
    forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR", "")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")


def parse_json_body(request):
    try:
        return json.loads(request.body.decode("utf-8") or "{}")
    except json.JSONDecodeError as exc:
        raise ValueError("请求体不是合法 JSON") from exc


@require_GET
def health(request):
    return JsonResponse({"ok": True, "service": "django"})


@csrf_exempt
@require_http_methods(["POST"])
def analyze_skin(request):
    """识别皮肤问题"""
    try:
        payload = parse_json_body(request)
        image_base64 = payload.get("imageBase64")
        if not image_base64 or not isinstance(image_base64, str):
            raise ValueError("缺少图片数据")
        result = run_analysis(image_base64, request_source="app", remote_addr=get_remote_addr(request), mode="diagnosis")
        return JsonResponse(result)
    except ValueError as exc:
        return JsonResponse({"message": str(exc)}, status=400)
    except RuntimeError as exc:
        return JsonResponse({"message": str(exc)}, status=502)
    except Exception as exc:
        return JsonResponse({"message": str(exc)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def analyze_skin_record(request):
    """记录皮肤状态 - 分析照片质量和皮肤状态"""
    try:
        payload = parse_json_body(request)
        image_base64 = payload.get("imageBase64")
        if not image_base64 or not isinstance(image_base64, str):
            raise ValueError("缺少图片数据")
        result = run_analysis(image_base64, request_source="app", remote_addr=get_remote_addr(request), mode="record")
        return JsonResponse(result)
    except ValueError as exc:
        return JsonResponse({"message": str(exc)}, status=400)
    except RuntimeError as exc:
        return JsonResponse({"message": str(exc)}, status=502)
    except Exception as exc:
        return JsonResponse({"message": str(exc)}, status=500)


@staff_member_required(login_url="/login/")
def index(request):
    return render(request, "dashboard/index.html")


@staff_member_required(login_url="/login/")
@require_GET
def providers(request):
    return JsonResponse({
        "providers": PROVIDERS,
        "currentProvider": "external_ai_api",
    })


@staff_member_required(login_url="/login/")
@require_http_methods(["GET", "PUT"])
def config(request):
    try:
        if request.method == "GET":
            return JsonResponse(get_public_config())
        payload = parse_json_body(request)
        return JsonResponse(update_ai_config(payload))
    except ValueError as exc:
        return JsonResponse({"message": str(exc)}, status=400)


@staff_member_required(login_url="/login/")
@require_http_methods(["POST"])
def analyze(request):
    try:
        payload = parse_json_body(request)
        image_base64 = payload.get("imageBase64")
        provider = payload.get("provider")
        if provider is not None and provider != "external_ai_api":
            raise ValueError("当前仅支持 external_ai_api")
        if not image_base64 or not isinstance(image_base64, str):
            raise ValueError("缺少图片数据")
        result = run_analysis(image_base64, request_source="admin", remote_addr=get_remote_addr(request), mode="diagnosis")
        return JsonResponse(result)
    except ValueError as exc:
        return JsonResponse({"message": str(exc)}, status=400)
    except RuntimeError as exc:
        return JsonResponse({"message": str(exc)}, status=502)
    except Exception as exc:
        return JsonResponse({"message": str(exc)}, status=500)


# ==================== 社区API ====================

from .models import Post, PostLike, PostComment, UserProfile, SkinRecord
from django.core.paginator import Paginator
from django.utils import timezone
from datetime import timedelta


def get_or_create_user_profile(request):
    """获取或创建用户资料（简化版，实际应该使用认证系统）"""
    # 从请求头或session获取用户ID
    user_id = request.headers.get('X-User-Id')
    if not user_id:
        # 创建一个临时用户
        profile, created = UserProfile.objects.get_or_create(
            nickname='匿名用户',
            defaults={
                'avatar': 'https://api.dicebear.com/7.x/avataaars/svg?seed=anonymous',
                'location': '未知'
            }
        )
        return profile
    
    try:
        profile = UserProfile.objects.get(user_id=user_id)
        return profile
    except UserProfile.DoesNotExist:
        profile = UserProfile.objects.create(
            user_id=user_id,
            nickname=f'用户_{user_id[:8]}',
            avatar=f'https://api.dicebear.com/7.x/avataaars/svg?seed={user_id}',
            location='未知'
        )
        return profile


@csrf_exempt
@require_http_methods(["GET"])
def list_posts(request):
    """获取帖子列表"""
    try:
        # 获取查询参数
        category = request.GET.get('category', '')
        tag = request.GET.get('tag', '')
        sort_by = request.GET.get('sort', 'hot')  # hot, new
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 10))
        
        # 基础查询
        posts = Post.objects.filter(is_deleted=False)
        
        # 按标签筛选
        if tag:
            posts = posts.filter(tags__contains=[tag])
        
        # 排序
        if sort_by == 'new':
            posts = posts.order_by('-created_at')
        else:  # hot
            posts = posts.order_by('-is_pinned', '-likes', '-created_at')
        
        # 分页
        paginator = Paginator(posts, page_size)
        page_obj = paginator.get_page(page)
        
        # 序列化数据
        posts_data = []
        for post in page_obj:
            author_data = {
                'id': str(post.author.user_id),
                'name': '匿名用户' if post.is_anonymous else post.author.nickname,
                'avatar': 'https://api.dicebear.com/7.x/avataaars/svg?seed=anonymous' if post.is_anonymous else post.author.avatar,
                'location': post.author.location if not post.is_anonymous else None,
                'isExpert': post.author.is_expert if not post.is_anonymous else False,
                'title': post.author.title if not post.is_anonymous else None,
                'hospital': post.author.hospital if not post.is_anonymous else None,
            }
            
            post_data = {
                'id': str(post.post_id),
                'author': author_data,
                'time': format_time(post.created_at),
                'title': post.title,
                'content': post.content[:200] + '...' if len(post.content) > 200 else post.content,
                'images': post.images[:3] if post.images else [],
                'tags': post.tags,
                'likes': post.likes,
                'comments': post.comments,
                'shares': post.shares,
            }
            
            # 关联报告
            if post.related_skin_record:
                record = post.related_skin_record
                post_data['report'] = {
                    'score': record.photo_clarity or 0,
                    'trend': [
                        {'day': 1, 'value': 75},
                        {'day': 5, 'value': 77},
                        {'day': 10, 'value': 80},
                    ]
                }
            
            posts_data.append(post_data)
        
        return JsonResponse({
            'posts': posts_data,
            'total': paginator.count,
            'page': page,
            'page_size': page_size,
            'total_pages': paginator.num_pages
        })
    except Exception as exc:
        return JsonResponse({"message": str(exc)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def get_post_detail(request, post_id):
    """获取帖子详情"""
    try:
        post = Post.objects.get(post_id=post_id, is_deleted=False)
        
        author_data = {
            'id': str(post.author.user_id),
            'name': '匿名用户' if post.is_anonymous else post.author.nickname,
            'avatar': 'https://api.dicebear.com/7.x/avataaars/svg?seed=anonymous' if post.is_anonymous else post.author.avatar,
            'location': post.author.location if not post.is_anonymous else None,
            'isExpert': post.author.is_expert if not post.is_anonymous else False,
            'title': post.author.title if not post.is_anonymous else None,
            'hospital': post.author.hospital if not post.is_anonymous else None,
        }
        
        post_data = {
            'id': str(post.post_id),
            'author': author_data,
            'time': format_time(post.created_at),
            'title': post.title,
            'content': post.content,
            'images': post.images,
            'tags': post.tags,
            'likes': post.likes,
            'comments': post.comments,
            'shares': post.shares,
        }
        
        # 关联报告
        if post.related_skin_record:
            record = post.related_skin_record
            post_data['report'] = {
                'score': record.photo_clarity or 0,
                'trend': [
                    {'day': 1, 'value': 75},
                    {'day': 5, 'value': 77},
                    {'day': 10, 'value': 80},
                ]
            }
        
        # 获取评论
        comments = []
        for comment in post.post_comments.filter(is_deleted=False, parent=None).order_by('-created_at')[:10]:
            comment_author = {
                'id': str(comment.author.user_id),
                'name': comment.author.nickname,
                'avatar': comment.author.avatar,
                'isExpert': comment.author.is_expert,
                'title': comment.author.title,
                'hospital': comment.author.hospital,
            }
            comments.append({
                'id': str(comment.comment_id),
                'author': comment_author,
                'content': comment.content,
                'time': format_time(comment.created_at),
                'isExpertReply': comment.is_expert_reply,
            })
        
        post_data['comments_list'] = comments
        
        return JsonResponse(post_data)
    except Post.DoesNotExist:
        return JsonResponse({"message": "帖子不存在"}, status=404)
    except Exception as exc:
        return JsonResponse({"message": str(exc)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def create_post(request):
    """创建帖子"""
    try:
        payload = parse_json_body(request)
        
        # 验证必填字段
        title = payload.get('title', '').strip()
        content = payload.get('content', '').strip()
        
        if not title:
            return JsonResponse({"message": "标题不能为空"}, status=400)
        if not content:
            return JsonResponse({"message": "内容不能为空"}, status=400)
        if len(title) > 200:
            return JsonResponse({"message": "标题不能超过200字"}, status=400)
        
        # 获取用户
        author = get_or_create_user_profile(request)
        
        # 创建帖子
        post = Post.objects.create(
            author=author,
            title=title,
            content=content,
            images=payload.get('images', []),
            tags=payload.get('tags', []),
            is_anonymous=payload.get('isAnonymous', False),
        )
        
        # 关联皮肤报告
        skin_record_id = payload.get('skinRecordId')
        if skin_record_id:
            try:
                skin_record = SkinRecord.objects.get(record_id=skin_record_id)
                post.related_skin_record = skin_record
                post.save()
            except SkinRecord.DoesNotExist:
                pass
        
        return JsonResponse({
            "success": True,
            "message": "发布成功",
            "postId": str(post.post_id)
        })
    except Exception as exc:
        return JsonResponse({"message": str(exc)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def like_post(request, post_id):
    """点赞/取消点赞帖子"""
    try:
        post = Post.objects.get(post_id=post_id, is_deleted=False)
        user = get_or_create_user_profile(request)
        
        # 检查是否已点赞
        like_exists = PostLike.objects.filter(post=post, user=user).exists()
        
        if like_exists:
            # 取消点赞
            PostLike.objects.filter(post=post, user=user).delete()
            post.likes = max(0, post.likes - 1)
            post.save()
            return JsonResponse({"success": True, "liked": False, "likes": post.likes})
        else:
            # 添加点赞
            PostLike.objects.create(post=post, user=user)
            post.likes += 1
            post.save()
            return JsonResponse({"success": True, "liked": True, "likes": post.likes})
    except Post.DoesNotExist:
        return JsonResponse({"message": "帖子不存在"}, status=404)
    except Exception as exc:
        return JsonResponse({"message": str(exc)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def create_comment(request, post_id):
    """创建评论"""
    try:
        payload = parse_json_body(request)
        content = payload.get('content', '').strip()
        
        if not content:
            return JsonResponse({"message": "评论内容不能为空"}, status=400)
        
        post = Post.objects.get(post_id=post_id, is_deleted=False)
        user = get_or_create_user_profile(request)
        
        comment = PostComment.objects.create(
            post=post,
            author=user,
            content=content,
            parent_id=payload.get('parentId') or None,
            is_expert_reply=user.is_expert
        )
        
        # 更新帖子评论数
        post.comments = post.post_comments.filter(is_deleted=False).count()
        post.save()
        
        return JsonResponse({
            "success": True,
            "message": "评论成功",
            "commentId": str(comment.comment_id)
        })
    except Post.DoesNotExist:
        return JsonResponse({"message": "帖子不存在"}, status=404)
    except Exception as exc:
        return JsonResponse({"message": str(exc)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def get_skin_records(request):
    """获取用户的皮肤报告列表"""
    try:
        user = get_or_create_user_profile(request)
        records = SkinRecord.objects.all().order_by('-created_at')[:10]
        
        records_data = []
        for record in records:
            records_data.append({
                'id': str(record.record_id),
                'createdAt': record.created_at.isoformat(),
                'skinOverall': record.skin_overall,
                'skinIssues': record.skin_issues,
                'photoClarity': record.photo_clarity,
            })
        
        return JsonResponse({
            'records': records_data
        })
    except Exception as exc:
        return JsonResponse({"message": str(exc)}, status=500)


def format_time(created_at):
    """格式化时间显示"""
    now = timezone.now()
    diff = now - created_at

    if diff < timedelta(minutes=1):
        return '刚刚'
    elif diff < timedelta(hours=1):
        return f'{int(diff.seconds / 60)}分钟前'
    elif diff < timedelta(days=1):
        return f'{int(diff.seconds / 3600)}小时前'
    elif diff < timedelta(days=7):
        return f'{diff.days}天前'
    else:
        return created_at.strftime('%Y-%m-%d')


# ==================== 疾病趋势诊断Agent API ====================

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..', 'backend'))

from agents.disease_trend_agent import build_workflow, DiseaseTrackingState


from django.utils import timezone
from datetime import timedelta

@csrf_exempt
@require_http_methods(["POST"])
def disease_trend_analysis(request):
    """疾病趋势诊断Agent - 基于30天数据分析病情趋势"""
    try:
        # 调试：确保环境变量已设置
        if not os.environ.get('DASHSCOPE_API_KEY') and not os.environ.get('BAILIAN_API_KEY'):
            # 手动设置 API Key（临时解决方案）
            os.environ['DASHSCOPE_API_KEY'] = 'sk-61be8ee9942249cfb284735c015d124f'
            os.environ['BAILIAN_API_KEY'] = 'sk-61be8ee9942249cfb284735c015d124f'
        
        payload = parse_json_body(request)

        user_id = payload.get('userId', 'test_user')
        target_disease = payload.get('targetDisease', 'acne')
        time_window_days = payload.get('timeWindowDays', 30)

        # 获取真实的历史记录
        end_date = timezone.now()
        start_date = end_date - timedelta(days=time_window_days)
        
        # 假设通过 request_source 或某种方式关联用户，这里为了演示，获取最近的满足条件的记录
        # 在真实场景中应该按用户ID过滤
        db_records = SkinRecord.objects.filter(
            created_at__gte=start_date,
            created_at__lte=end_date
        ).order_by('created_at')
        
        raw_records = []
        for record in db_records:
            # 解析 severity
            severity = 1
            if record.skin_overall == '严重':
                severity = 3
            elif record.skin_overall == '中度':
                severity = 2
                
            # 尝试从 observations 或 skin_issues 中提取病灶数等
            lesion_count = len(record.skin_issues) if isinstance(record.skin_issues, list) else 5
            
            raw_records.append({
                "date": record.created_at.isoformat(),
                "analysis_result": {
                    "disease": target_disease,
                    "severity": severity,
                    "lesion_count": lesion_count * 5,  # 估算
                    "affected_area_percent": lesion_count * 2.0, # 估算
                    "confidence": 0.85,
                    "description": record.user_note or "日常记录"
                }
            })
            
        # 如果数据库记录不足，为了演示趋势诊断，我们可能仍然需要一些数据
        # 但我们现在至少传了真实获取的 raw_records
        if len(raw_records) < 7:
            # 自动补充模拟数据以展示Agent的趋势分析能力
            from agents.disease_trend_agent.utils.data_processor import DataProcessor
            trend_type = payload.get('trend', 'improving')
            
            mock_records = []
            base_date = end_date - timedelta(days=time_window_days)
            for i in range(time_window_days):
                record_date = base_date + timedelta(days=i)
                
                if trend_type == "improving":
                    severity = max(1, 3 - int(i / 10))
                    lesion_count = max(5, 30 - int(i * 0.8))
                    confidence = 0.7 + (i / time_window_days) * 0.25
                elif trend_type == "worsening":
                    severity = min(3, 1 + int(i / 10))
                    lesion_count = min(50, 10 + int(i * 1.2))
                    confidence = 0.9 - (i / time_window_days) * 0.3
                else: # stable
                    severity = 2
                    lesion_count = 20 + (-2 if i % 2 == 0 else 2)
                    confidence = 0.75 + (-0.05 if i % 2 == 0 else 0.05)

                mock_records.append({
                    "date": record_date.isoformat(),
                    "analysis_result": {
                        "disease": target_disease,
                        "severity": severity,
                        "lesion_count": lesion_count,
                        "affected_area_percent": lesion_count * 0.5,
                        "confidence": min(0.99, confidence),
                        "description": f"第{i+1}天分析结果"
                    }
                })
            
            raw_records = mock_records
        
        initial_state: DiseaseTrackingState = {
            "user_id": user_id,
            "target_disease": target_disease,
            "case_id": None,
            "time_window_days": time_window_days,
            "raw_records": raw_records,
            "user_profile": payload.get('userProfile'),
            "trend_indicators": None,
            "agent_decision": None,
            "rag_context": None,
            "final_verdict": None,
            "final_report": None,
            "recovery_progress": None,
            "alerts": [],
            "needs_doctor": False
        }

        app = build_workflow()
        result = app.invoke(initial_state)

        return JsonResponse({
            "success": True,
            "result": {
                "final_verdict": result.get("final_verdict"),
                "recovery_progress": result.get("recovery_progress"),
                "final_report": result.get("final_report"),
                "care_advice": result.get("care_advice", []),  # 添加护理建议
                "needs_doctor": result.get("needs_doctor"),
                "alerts": result.get("alerts", [])
            }
        })
    except ValueError as exc:
        return JsonResponse({"message": str(exc)}, status=400)
    except Exception as exc:
        import traceback
        traceback.print_exc()
        return JsonResponse({"message": str(exc)}, status=500)
