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


# ==================== AI智能医生对话API ====================

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..', 'backend'))

from agents.disease_trend_agent.services.ai_chat_service import chat_with_ai_doctor, stream_chat_with_ai_doctor


@csrf_exempt
@require_http_methods(["POST"])
def ai_doctor_chat(request):
    """AI智能医生对话接口 - 基于疾病档案历史记录回答用户问题"""
    try:
        # 调试：确保环境变量已设置
        if not os.environ.get('DASHSCOPE_API_KEY') and not os.environ.get('BAILIAN_API_KEY'):
            # 手动设置 API Key（临时解决方案）
            os.environ['DASHSCOPE_API_KEY'] = 'sk-61be8ee9942249cfb284735c015d124f'
            os.environ['BAILIAN_API_KEY'] = 'sk-61be8ee9942249cfb284735c015d124f'

        payload = parse_json_body(request)

        user_id = payload.get('userId', 'user_001')
        message = payload.get('message', '')
        disease_context = payload.get('diseaseContext', '')
        chat_history = payload.get('chatHistory', [])

        print(f"[Django AI Chat] 用户ID: {user_id}")
        print(f"[Django AI Chat] 消息: {message}")
        print(f"[Django AI Chat] 疾病上下文: {disease_context}")
        print(f"[Django AI Chat] 对话历史条数: {len(chat_history)}")

        if not message:
            return JsonResponse({"message": "消息不能为空"}, status=400)

        # 优先使用前端传入的历史记录（例如疾病的档案历史记录）
        user_records = payload.get('userRecords')
        
        if not user_records:
            # 如果前端未传入，则获取用户的最新历史记录
            end_date = timezone.now()
            start_date = end_date - timedelta(days=30)
    
            db_records = SkinRecord.objects.filter(
                created_at__gte=start_date,
                created_at__lte=end_date
            ).order_by('-created_at')[:10]
    
            print(f"[Django AI Chat] 数据库记录数: {db_records.count()}")
    
            user_records = []
            for record in db_records:
                user_records.append({
                    "date": record.created_at.strftime('%Y-%m-%d'),
                    "skin_overall": record.skin_overall,
                    "skin_issues": record.skin_issues if isinstance(record.skin_issues, list) else [],
                    "user_note": record.user_note or ""
                })

        print(f"[Django AI Chat] 传递给AI的记录数: {len(user_records) if user_records else 0}")
        if user_records:
            print(f"[Django AI Chat] 第一条记录: {user_records[0]}")

        # 调用AI对话服务
        result = chat_with_ai_doctor(
            user_id=user_id,
            message=message,
            disease_context=disease_context,
            chat_history=chat_history,
            user_records=user_records
        )

        return JsonResponse({
            "success": result.get("success", True),
            "response": result.get("response", ""),
            "timestamp": result.get("timestamp", timezone.now().isoformat())
        })
        
    except ValueError as exc:
        return JsonResponse({"message": str(exc)}, status=400)
    except Exception as exc:
        import traceback
        traceback.print_exc()
        return JsonResponse({"message": str(exc)}, status=500)


@csrf_exempt
def ai_doctor_chat_stream(request):
    """AI智能医生流式对话接口 - 基于疾病档案历史记录回答用户问题"""
    from django.http import StreamingHttpResponse
    import json
    import time
    
    # 处理 CORS 预检请求
    if request.method == 'OPTIONS':
        response = StreamingHttpResponse('', content_type='text/event-stream')
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type'
        return response
    
    if request.method != 'POST':
        return JsonResponse({"error": "Method not allowed"}, status=405)

    def generate():
        try:
            if not os.environ.get('DASHSCOPE_API_KEY') and not os.environ.get('BAILIAN_API_KEY'):
                os.environ['DASHSCOPE_API_KEY'] = 'sk-61be8ee9942249cfb284735c015d124f'
                os.environ['BAILIAN_API_KEY'] = 'sk-61be8ee9942249cfb284735c015d124f'

            payload = parse_json_body(request)

            user_id = payload.get('userId', 'user_001')
            message = payload.get('message', '')
            disease_context = payload.get('diseaseContext', '')
            chat_history = payload.get('chatHistory', [])

            if not message:
                yield "data: " + json.dumps({"error": "消息不能为空"}) + "\n\n"
                return

            user_records = payload.get('userRecords')

            if not user_records:
                end_date = timezone.now()
                start_date = end_date - timedelta(days=30)

                db_records = SkinRecord.objects.filter(
                    created_at__gte=start_date,
                    created_at__lte=end_date
                ).order_by('-created_at')[:10]

                user_records = []
                for record in db_records:
                    user_records.append({
                        "date": record.created_at.strftime('%Y-%m-%d'),
                        "skin_overall": record.skin_overall,
                        "skin_issues": record.skin_issues if isinstance(record.skin_issues, list) else [],
                        "user_note": record.user_note or ""
                    })

            for chunk in stream_chat_with_ai_doctor(
                user_id=user_id,
                message=message,
                disease_context=disease_context,
                chat_history=chat_history,
                user_records=user_records
            ):
                yield "data: " + json.dumps({"content": chunk}) + "\n\n"

            yield "data: " + json.dumps({"done": True}) + "\n\n"

        except Exception as exc:
            import traceback
            traceback.print_exc()
            yield "data: " + json.dumps({"error": str(exc)}) + "\n\n"

    response = StreamingHttpResponse(generate(), content_type='text/event-stream')
    response['Cache-Control'] = 'no-cache'
    response['X-Accel-Buffering'] = 'no'
    return response


# ==================== 皮肤保养Agent API ====================

import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..', 'backend'))

from agents.skincare_agent.core.graph import get_workflow as get_skincare_workflow
from agents.skincare_agent.core.state import SkincareState


@csrf_exempt
@require_http_methods(["POST"])
def skincare_analysis(request):
    """皮肤保养Agent - 基于皮肤表现分析生成个性化护肤方案"""
    try:
        # 调试：确保环境变量已设置
        if not os.environ.get('DASHSCOPE_API_KEY') and not os.environ.get('BAILIAN_API_KEY'):
            os.environ['DASHSCOPE_API_KEY'] = 'sk-61be8ee9942249cfb284735c015d124f'
            os.environ['BAILIAN_API_KEY'] = 'sk-61be8ee9942249cfb284735c015d124f'

        payload = parse_json_body(request)

        user_id = payload.get('userId', 'user_001')
        user_input = payload.get('note', '')
        entry_title = payload.get('entryTitle', '')
        skin_metrics = payload.get('skinMetrics', [])
        current_products = payload.get('careItems', [])
        entry_date = payload.get('entryDate', timezone.now().isoformat())

        print(f"[Skincare Agent] 用户ID: {user_id}")
        print(f"[Skincare Agent] 日记标题: {entry_title}")
        print(f"[Skincare Agent] 皮肤指标数: {len(skin_metrics)}")
        print(f"[Skincare Agent] 当前产品数: {len(current_products)}")

        # 构建初始状态
        initial_state: SkincareState = {
            "user_id": user_id,
            "user_input": user_input,
            "current_products": current_products,
            "skin_image": None,
            "skin_metrics": skin_metrics,
            "entry_date": entry_date,
            "entry_title": entry_title,
            "skin_profile": None,
            "rag_queries": None,
            "rag_results": None,
            "ingredient_assessment": None,
            "routine": None,
            "care_advice": None,
            "ai_verdict": None,
            "final_output": None
        }

        # 获取工作流并执行
        app = get_skincare_workflow()
        config = {"configurable": {"thread_id": user_id}}
        result = app.invoke(initial_state, config=config)

        return JsonResponse({
            "success": True,
            "result": {
                "skin_profile": result.get("skin_profile"),
                "care_advice": result.get("care_advice", []),
                "ai_verdict": result.get("ai_verdict", "stable"),
                "ai_verdict_reason": result.get("ai_verdict_reason", ""),
                "routine": result.get("routine"),
                "ingredient_assessment": result.get("ingredient_assessment")
            }
        })

    except ValueError as exc:
        return JsonResponse({"message": str(exc)}, status=400)
    except Exception as exc:
        import traceback
        traceback.print_exc()
        return JsonResponse({"message": str(exc)}, status=500)


# ==================== 疾病趋势诊断Agent API ====================

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


@csrf_exempt
def disease_trend_chat_stream(request):
    """疾病趋势诊断Agent AI医生流式对话接口 - 基于趋势分析结果回答用户问题"""
    from django.http import StreamingHttpResponse
    import json
    import time
    
    # 处理 CORS 预检请求
    if request.method == 'OPTIONS':
        response = StreamingHttpResponse('', content_type='text/event-stream')
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type'
        return response
    
    if request.method != 'POST':
        return JsonResponse({"error": "Method not allowed"}, status=405)

    def generate():
        try:
            if not os.environ.get('DASHSCOPE_API_KEY') and not os.environ.get('BAILIAN_API_KEY'):
                os.environ['DASHSCOPE_API_KEY'] = 'sk-61be8ee9942249cfb284735c015d124f'
                os.environ['BAILIAN_API_KEY'] = 'sk-61be8ee9942249cfb284735c015d124f'

            payload = parse_json_body(request)

            user_id = payload.get('userId', 'user_001')
            message = payload.get('message', '')
            chat_history = payload.get('chatHistory', [])
            trend_result = payload.get('trendResult', {})

            if not message:
                yield "data: " + json.dumps({"error": "消息不能为空"}) + "\n\n"
                return

            # 构建趋势分析上下文
            trend_context = _build_trend_context(trend_result)
            
            # 构建系统提示词
            system_prompt = _build_disease_trend_doctor_prompt(trend_context)
            
            # 调用流式LLM
            for chunk in _call_llm_stream(system_prompt, message, chat_history):
                yield "data: " + json.dumps({"content": chunk}) + "\n\n"

            yield "data: " + json.dumps({"done": True}) + "\n\n"

        except Exception as exc:
            import traceback
            traceback.print_exc()
            yield "data: " + json.dumps({"error": str(exc)}) + "\n\n"

    response = StreamingHttpResponse(generate(), content_type='text/event-stream')
    response['Cache-Control'] = 'no-cache'
    response['X-Accel-Buffering'] = 'no'
    return response


def _build_trend_context(trend_result: dict) -> str:
    """构建趋势分析上下文"""
    if not trend_result:
        return "暂无趋势分析数据"
    
    context_parts = []
    
    # 最终诊断结果
    final_verdict = trend_result.get('final_verdict', 'unknown')
    verdict_map = {
        'better': '好转',
        'worse': '恶化',
        'stable': '稳定',
        'insufficient': '数据不足'
    }
    context_parts.append(f"诊断结果: {verdict_map.get(final_verdict, final_verdict)}")
    
    # 恢复进度
    recovery_progress = trend_result.get('recovery_progress', {})
    if recovery_progress:
        recovery_percent = recovery_progress.get('recovery_percent', 0)
        progress_changed = recovery_progress.get('progress_changed', 'stable')
        estimated_days = recovery_progress.get('estimated_days_to_full_recovery')
        
        context_parts.append(f"恢复进度: {recovery_percent}%")
        context_parts.append(f"趋势变化: {progress_changed}")
        if estimated_days is not None:
            context_parts.append(f"预计完全恢复还需: {estimated_days}天")
    
    # 告警信息
    alerts = trend_result.get('alerts', [])
    if alerts:
        context_parts.append(f"告警信息: {'; '.join(alerts)}")
    
    # 护理建议摘要
    care_advice = trend_result.get('care_advice', [])
    if care_advice:
        advice_titles = [a.get('title', '') for a in care_advice[:3]]
        context_parts.append(f"护理建议: {'、'.join(advice_titles)}")
    
    return "\n".join(context_parts)


def _build_disease_trend_doctor_prompt(trend_context: str) -> str:
    """构建疾病趋势AI医生系统提示词"""
    return f"""你是一位专业的皮肤科医生AI助手，名为"知己肤AI医生"。你正在基于用户的疾病趋势分析结果为其提供个性化咨询。

## 当前用户的趋势分析数据
{trend_context}

## 核心指令（必须遵守）
1. **基于数据回答**：每次回答都必须引用上述趋势分析数据，不要给通用模板回复！
2. **解读趋势**：帮助用户理解病情变化趋势（好转/恶化/稳定）
3. **预估恢复时间**：基于恢复进度给出合理的恢复预期
4. **个性化建议**：根据具体趋势给出针对性的护理建议
5. **风险提示**：如果趋势显示恶化，必须强烈建议就医

## 输出格式要求
- **必须使用Markdown格式输出**
- 使用 **加粗** 强调重要信息（如关键数据、趋势变化）
- 使用有序列表(1. 2. 3.)列出建议步骤
- 使用引用块(>)突出警告或重要提醒
- 段落之间保持简洁，不要过于冗长

## 禁止事项
- 不要说"我已收到您的问题"这种通用开场白
- 不要编造用户没有的症状或数据
- 不要推荐具体药物名称（可以说"外用激素药膏"但不能说"地奈德乳膏"）

## 回答风格示例
根据您的趋势分析数据，您的病情目前**{{诊断结果}}**，恢复进度为**{{恢复进度}}%**。

针对您的问题，我的建议是：
1. **{{具体建议1，与趋势数据相关}}**
2. **{{具体建议2}}**

> 预计**{{时间范围}}**内可以看到明显改善。如果出现**{{危险信号}}**，请及时就医。

现在请回答用户的问题："""


def _call_llm_stream(system_prompt: str, user_message: str, chat_history: list):
    """流式调用大语言模型生成回复"""
    import requests
    import json
    
    # 构建消息列表
    messages = [{"role": "system", "content": system_prompt}]
    
    # 添加历史对话
    for msg in chat_history[-5:]:  # 最近5轮对话
        if msg.get("role") == "user":
            messages.append({"role": "user", "content": msg.get("content", "")})
        elif msg.get("role") == "ai":
            messages.append({"role": "assistant", "content": msg.get("content", "")})
    
    # 添加当前消息
    messages.append({"role": "user", "content": user_message})
    
    # 调用阿里云百炼API - 流式
    api_key = os.environ.get('DASHSCOPE_API_KEY') or os.environ.get('BAILIAN_API_KEY')
    if not api_key:
        yield "抱歉，AI服务未配置，请联系管理员。"
        return
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "qwen-plus",
        "messages": messages,
        "temperature": 0.7,
        "max_tokens": 800,
        "stream": True
    }
    
    try:
        response = requests.post(
            "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=60,
            stream=True
        )
        
        if response.status_code == 200:
            for line in response.iter_lines():
                if line:
                    line_text = line.decode('utf-8')
                    if line_text.startswith('data: '):
                        data = line_text[6:]
                        if data == '[DONE]':
                            break
                        try:
                            json_data = json.loads(data)
                            content = json_data.get("choices", [{}])[0].get("delta", {}).get("content", "")
                            if content:
                                yield content
                        except json.JSONDecodeError:
                            continue
        else:
            yield f"抱歉，服务暂时不可用（{response.status_code}），请稍后重试。"
    except Exception as e:
        yield f"抱歉，网络连接出现问题：{str(e)}"
