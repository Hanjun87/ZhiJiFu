"""
AI智能医生对话服务
基于RAG知识库和疾病历史记录提供智能问答
"""

import os
from typing import Dict, Any, List, Optional
from datetime import datetime
import json

from ..config.settings import settings
from .rag_service import rag_service


class AIChatService:
    """AI智能医生对话服务"""
    
    def __init__(self):
        self.model = settings.BAILIAN_MODEL or "qwen-plus"
        self.rag_service = rag_service
    
    def _get_api_key(self) -> str:
        """获取API Key，优先从环境变量读取"""
        import os
        return os.environ.get('DASHSCOPE_API_KEY') or os.environ.get('BAILIAN_API_KEY') or settings.get_api_key()
    
    def chat(
        self,
        user_id: str,
        message: str,
        disease_context: Optional[str] = None,
        chat_history: Optional[List[Dict[str, str]]] = None,
        user_records: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        处理用户对话请求

        Args:
            user_id: 用户ID
            message: 用户消息
            disease_context: 疾病上下文（如"皮炎"、"湿疹"等）
            chat_history: 对话历史
            user_records: 用户的历史皮肤记录

        Returns:
            AI回复结果
        """
        try:
            print(f"[AI Chat] 收到用户消息: {message}")
            print(f"[AI Chat] 疾病上下文: {disease_context}")
            print(f"[AI Chat] 用户记录数量: {len(user_records) if user_records else 0}")

            # 1. 使用RAG检索相关医学知识
            rag_context = ""
            if disease_context:
                try:
                    rag_result = self.rag_service.query_disease_knowledge(disease_context)
                    if rag_result.get("success"):
                        rag_context = rag_result.get("formatted_text", "")
                        print(f"[AI Chat] RAG检索成功, 长度: {len(rag_context)}")
                    else:
                        print(f"[AI Chat] RAG检索未找到相关知识")
                except Exception as e:
                    print(f"[AI Chat] RAG检索异常: {e}")

            # 2. 构建用户历史记录上下文
            records_context = self._format_user_records(user_records)
            print(f"[AI Chat] 记录上下文:\n{records_context}")

            # 3. 构建系统提示词
            system_prompt = self._build_system_prompt(disease_context, rag_context, records_context)

            # 4. 调用LLM生成回复
            response = self._call_llm(system_prompt, message, chat_history or [])
            print(f"[AI Chat] AI回复: {response[:100]}...")

            return {
                "success": True,
                "response": response,
                "timestamp": datetime.now().isoformat()
            }

        except Exception as e:
            print(f"[AI Chat] 异常: {e}")
            import traceback
            traceback.print_exc()
            return {
                "success": False,
                "response": "抱歉，我暂时无法回答您的问题。请稍后重试或咨询专业医生。",
                "error": str(e)
            }

    def stream_chat(
        self,
        user_id: str,
        message: str,
        disease_context: Optional[str] = None,
        chat_history: Optional[List[Dict[str, str]]] = None,
        user_records: Optional[List[Dict[str, Any]]] = None
    ):
        """流式处理用户对话请求"""
        try:
            print(f"[AI Chat Stream] 收到用户消息: {message}")

            rag_context = ""
            if disease_context:
                try:
                    rag_result = self.rag_service.query_disease_knowledge(disease_context)
                    if rag_result.get("success"):
                        rag_context = rag_result.get("formatted_text", "")
                except Exception as e:
                    print(f"[AI Chat Stream] RAG检索异常: {e}")

            records_context = self._format_user_records(user_records)
            system_prompt = self._build_system_prompt(disease_context, rag_context, records_context)

            for chunk in self._call_llm_stream(system_prompt, message, chat_history or []):
                yield chunk

        except Exception as e:
            print(f"[AI Chat Stream] 异常: {e}")
            yield "抱歉，我暂时无法回答您的问题。请稍后重试或咨询专业医生。"

    def _format_user_records(self, records: Optional[List[Dict[str, Any]]]) -> str:
        """格式化用户历史记录为文本"""
        if not records:
            return "暂无历史记录"
        
        formatted = []
        for record in records[:5]:  # 最近5条记录
            date = record.get("date", "未知日期")
            
            # 支持两种格式：一种是后端的 SkinRecord 模型字典，另一种是前端传来的 HistoryRecord 字典
            if "skin_overall" in record:
                # 兼容原有 SkinRecord 格式
                overall = record.get("skin_overall", "")
                issues = record.get("skin_issues", [])
                note = record.get("user_note", "")
                
                record_text = f"- {date}: 整体状态{overall}"
                if issues:
                    record_text += f"，问题: {', '.join(issues[:3])}"
                if note:
                    record_text += f"，备注: {note[:50]}"
                formatted.append(record_text)
            else:
                # 兼容前端传来的 HistoryRecord 格式
                severityLabel = record.get("severityLabel", "")
                lesionCount = record.get("lesionCount", 0)
                affectedArea = record.get("affectedArea", 0)
                status = record.get("status", "")
                
                record_text = f"- {date}: 状态[{status}]"
                if severityLabel:
                    record_text += f"，严重程度: {severityLabel}"
                if lesionCount > 0:
                    record_text += f"，病灶数量: {lesionCount}个"
                if affectedArea > 0:
                    record_text += f"，受影响面积: {affectedArea}%"
                formatted.append(record_text)
                
        return "\n".join(formatted)
    
    def _build_system_prompt(
        self,
        disease_context: Optional[str],
        rag_context: str,
        records_context: str
    ) -> str:
        """构建系统提示词"""

        # 判断是否有足够的历史数据
        has_records = records_context and records_context != "暂无历史记录"
        has_disease = disease_context and disease_context != "未指定具体疾病"

        if has_records and has_disease:
            context_instruction = f"""**重要：你必须基于以下用户的具体病情数据来回答问题！**

当前诊断疾病：{disease_context}
该用户的详细皮肤记录：
{records_context}"""
        elif has_disease:
            context_instruction = f"""当前关注疾病：{disease_context}
（注：该用户暂无详细历史记录）"""
        else:
            context_instruction = "（注：暂无特定疾病上下文和历史记录）"

        knowledge_section = ""
        if rag_context and rag_context != "暂无相关医学知识":
            knowledge_section = f"""

## 相关医学参考资料
{rag_context}"""

        prompt = f"""你是一位专业的皮肤科医生AI助手，名为"知己肤AI医生"。你必须根据用户的实际病情数据提供个性化的医疗咨询。

## {context_instruction}{knowledge_section}

## 核心指令（必须遵守）
1. **个性化回答**：每次回答都必须引用或提及用户的具体情况（如日期、症状变化、严重程度等），不要给通用模板回复！
2. **数据分析**：如果用户问"什么时候能好"、"我的情况怎么样"，必须根据历史记录分析趋势并给出预估
3. **专业但易懂**：用通俗的语言解释医学术语
4. **行动导向**：给出具体的可操作建议（如"建议每天涂抹2次"、"避免接触XX物质"）
5. **安全第一**：如果记录显示病情恶化，必须强烈建议就医

## 输出格式要求
- **必须使用Markdown格式输出**
- 使用 **加粗** 强调重要信息（如疾病名称、关键数据）
- 使用有序列表(1. 2. 3.)列出建议步骤
- 使用引用块(>)突出警告或重要提醒
- 段落之间保持简洁，不要过于冗长

## 禁止事项
- 不要说"我已收到您的问题"这种通用开场白
- 不要说"建议继续观察"而不给出具体依据
- 不要推荐具体药物名称（可以说"外用激素药膏"但不能说"地奈德乳膏"）
- 不要编造用户没有的症状

## 回答格式示例（请参考这个风格）
根据您**{{最近一次记录日期}}**的数据显示, 您的**{{疾病名称}}****{{好转/稳定/恶化}}**中。*{{具体数据支撑, 如红斑面积从X%减少到Y%}}*。

针对您的问题**{{用户问题}}**, 我的建议是:
1. **{{具体建议1, 与用户数据相关}}**
2. **{{具体建议2}}**

> 预计**{{时间范围}}**内可以看到明显改善。如果出现**{{危险信号}}**, 请及时就医。

现在请回答用户的问题: """

        return prompt
    
    def _call_llm(
        self,
        system_prompt: str,
        user_message: str,
        chat_history: List[Dict[str, str]]
    ) -> str:
        """调用大语言模型生成回复"""

        try:
            import requests

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

            # 调用阿里云百炼API
            api_key = self._get_api_key()
            if not api_key:
                return "抱歉，AI服务未配置，请联系管理员。"

            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }

            payload = {
                "model": self.model,
                "messages": messages,
                "temperature": 0.7,
                "max_tokens": 800
            }

            response = requests.post(
                "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
                headers=headers,
                json=payload,
                timeout=30
            )

            if response.status_code == 200:
                result = response.json()
                return result["choices"][0]["message"]["content"]
            else:
                return f"抱歉，服务暂时不可用（{response.status_code}），请稍后重试。"

        except Exception as e:
            return f"抱歉，我遇到了一些问题：{str(e)}。请稍后重试或联系客服。"

    def _call_llm_stream(
        self,
        system_prompt: str,
        user_message: str,
        chat_history: List[Dict[str, str]]
    ):
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
        api_key = self._get_api_key()
        if not api_key:
            yield "抱歉，AI服务未配置，请联系管理员。"
            return

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": self.model,
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


# 全局实例
ai_chat_service = AIChatService()


def chat_with_ai_doctor(
    user_id: str,
    message: str,
    disease_context: Optional[str] = None,
    chat_history: Optional[List[Dict[str, str]]] = None,
    user_records: Optional[List[Dict[str, Any]]] = None
) -> Dict[str, Any]:
    """便捷的AI医生对话函数"""
    return ai_chat_service.chat(user_id, message, disease_context, chat_history, user_records)


def stream_chat_with_ai_doctor(
    user_id: str,
    message: str,
    disease_context: Optional[str] = None,
    chat_history: Optional[List[Dict[str, str]]] = None,
    user_records: Optional[List[Dict[str, Any]]] = None
):
    """流式AI医生对话函数"""
    for chunk in ai_chat_service.stream_chat(user_id, message, disease_context, chat_history, user_records):
        yield chunk
