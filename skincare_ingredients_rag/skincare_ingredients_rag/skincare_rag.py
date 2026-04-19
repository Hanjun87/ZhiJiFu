#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
美容保养成分RAG知识库查询系统
基于权威皮肤科学来源的成分数据库
"""

import json
import os
from typing import List, Dict, Any, Optional
from difflib import get_close_matches

class SkincareRAG:
    """美容保养成分RAG知识库类"""
    
    def __init__(self, data_path: str = None):
        """初始化RAG知识库"""
        if data_path is None:
            data_path = os.path.join(os.path.dirname(__file__), 'data')
        
        self.data_path = data_path
        self.ingredients = []
        self.index = {}
        self.load_data()
    
    def load_data(self):
        """加载数据文件"""
        try:
            # 加载成分数据
            ingredients_file = os.path.join(self.data_path, 'skincare_ingredients.json')
            with open(ingredients_file, 'r', encoding='utf-8') as f:
                self.ingredients = json.load(f)
            
            # 加载索引
            index_file = os.path.join(self.data_path, 'index.json')
            with open(index_file, 'r', encoding='utf-8') as f:
                self.index = json.load(f)
            
            print(f"成功加载 {len(self.ingredients)} 种成分数据")
            print(f"证据等级A级: {self.index['evidence_levels']['A级']} 种")
            print(f"证据等级B级: {self.index['evidence_levels']['B级']} 种")
            
        except Exception as e:
            print(f"加载数据失败: {e}")
            raise
    
    def get_all_ingredients(self) -> List[Dict]:
        """获取所有成分"""
        return self.ingredients
    
    def get_ingredient_by_id(self, ingredient_id: str) -> Optional[Dict]:
        """通过ID获取成分"""
        for ing in self.ingredients:
            if ing['ingredient_id'] == ingredient_id:
                return ing
        return None
    
    def search_by_name(self, name: str, limit: int = 5) -> List[Dict]:
        """通过名称搜索成分"""
        results = []
        name_lower = name.lower()
        
        for ing in self.ingredients:
            # 匹配中文名称
            if name_lower in ing['ingredient_name'].lower():
                results.append(ing)
                continue
            
            # 匹配英文别名
            for alias in ing.get('aliases', []):
                if name_lower in alias.lower():
                    results.append(ing)
                    break
        
        return results[:limit]
    
    def search_by_category(self, category: str) -> List[Dict]:
        """通过类别搜索成分"""
        category_map = self.index.get('categories', {})
        ingredient_ids = category_map.get(category, [])
        
        results = []
        for ing_id in ingredient_ids:
            ing = self.get_ingredient_by_id(ing_id)
            if ing:
                results.append(ing)
        
        return results
    
    def search_by_benefit(self, benefit: str) -> List[Dict]:
        """通过功效搜索成分"""
        keyword_map = self.index.get('search_keywords', {})
        ingredient_ids = keyword_map.get(benefit, [])
        
        results = []
        for ing_id in ingredient_ids:
            ing = self.get_ingredient_by_id(ing_id)
            if ing:
                results.append(ing)
        
        return results
    
    def search_by_skin_type(self, skin_type: str) -> List[Dict]:
        """通过适合肤质搜索成分"""
        results = []
        for ing in self.ingredients:
            suitable_types = ing.get('suitable_skin_types', [])
            if any(skin_type in st for st in suitable_types):
                results.append(ing)
        return results
    
    def get_ingredients_by_evidence_level(self, level: str) -> List[Dict]:
        """通过证据等级获取成分"""
        return [ing for ing in self.ingredients if ing.get('evidence_level') == level]
    
    def get_recommendations(self, skin_concerns: List[str], skin_type: str = None) -> Dict[str, List[Dict]]:
        """根据皮肤问题获取推荐"""
        recommendations = {
            'high_priority': [],
            'medium_priority': [],
            'supportive': []
        }
        
        for concern in skin_concerns:
            # 根据问题类型匹配成分
            if concern in ['抗衰老', '细纹', '皱纹', '松弛']:
                candidates = self.search_by_benefit('抗衰老')
            elif concern in ['美白', '色斑', '暗沉', '痘印']:
                candidates = self.search_by_benefit('美白')
            elif concern in ['祛痘', '粉刺', '黑头', '闭口']:
                candidates = self.search_by_benefit('祛痘')
            elif concern in ['保湿', '干燥', '脱皮']:
                candidates = self.search_by_benefit('保湿')
            elif concern in ['敏感', '泛红', '刺激']:
                candidates = self.search_by_benefit('舒缓')
            elif concern in ['屏障受损', '修复']:
                candidates = self.search_by_benefit('修复')
            else:
                candidates = self.search_by_name(concern)
            
            # 按优先级分类
            for ing in candidates:
                if ing['evidence_level'] == 'A级':
                    if ing not in recommendations['high_priority']:
                        recommendations['high_priority'].append(ing)
                else:
                    if ing not in recommendations['medium_priority']:
                        recommendations['medium_priority'].append(ing)
        
        return recommendations
    
    def check_compatibility(self, ingredient_ids: List[str]) -> Dict:
        """检查成分兼容性"""
        incompatible_pairs = []
        warnings = []
        
        # 定义不兼容组合
        incompatible_combos = [
            (['ING001', 'ING024'], ['ING005', 'ING006', 'ING021', 'ING022']),  # 维A类避免与酸类同用
            (['ING002'], ['ING003']),  # 高浓度维C和烟酰胺
            (['ING006'], ['ING023', 'ING024']),  # 水杨酸与处方维A酸
        ]
        
        for group1, group2 in incompatible_combos:
            has_group1 = any(id in group1 for id in ingredient_ids)
            has_group2 = any(id in group2 for id in ingredient_ids)
            
            if has_group1 and has_group2:
                incompatible_pairs.append({
                    'group1': group1,
                    'group2': group2,
                    'warning': '建议分开使用，避免过度刺激'
                })
        
        return {
            'is_compatible': len(incompatible_pairs) == 0,
            'incompatible_pairs': incompatible_pairs,
            'warnings': warnings
        }
    
    def format_ingredient(self, ingredient: Dict) -> str:
        """格式化成分信息为可读文本"""
        text = f"""
{'='*60}
【{ingredient['ingredient_name']}】 ({ingredient['ingredient_id']})
{'='*60}

概述:
{ingredient['overview']}

类别: {ingredient['category']}
证据等级: {ingredient['evidence_level']} ({ingredient['evidence_description']})
浓度范围: {ingredient['concentration_range']}
使用频率: {ingredient['usage_frequency']}

主要功效:
"""
        for benefit in ingredient['benefits']:
            text += f"  • {benefit}\n"
        
        text += "\n作用机制:\n"
        for mech in ingredient['mechanism']:
            text += f"  • {mech}\n"
        
        text += "\n使用方法:\n"
        for usage in ingredient['usage_instructions']:
            text += f"  • {usage}\n"
        
        text += "\n注意事项:\n"
        for precaution in ingredient['precautions']:
            text += f"  • {precaution}\n"
        
        text += f"\n适合肤质:\n"
        for skin_type in ingredient['suitable_skin_types']:
            text += f"  • {skin_type}\n"
        
        if ingredient.get('contraindications'):
            text += "\n🚫 禁忌:\n"
            for contra in ingredient['contraindications']:
                text += f"  • {contra}\n"
        
        text += f"\n📚 数据来源: {ingredient['source']}\n"
        
        if ingredient.get('aliases'):
            text += f"\n🏷️ 别名: {', '.join(ingredient['aliases'])}\n"
        
        return text
    
    def query(self, question: str) -> str:
        """处理自然语言查询"""
        question_lower = question.lower()
        
        # 功效关键词匹配
        benefit_keywords = {
            '抗衰老': ['抗衰老', '抗老', '细纹', '皱纹', '松弛', '老化'],
            '美白': ['美白', '淡斑', '色斑', '暗沉', '提亮', '痘印'],
            '祛痘': ['祛痘', '痘痘', '粉刺', '黑头', '闭口', '痤疮'],
            '保湿': ['保湿', '补水', '干燥', '脱皮', '滋润'],
            '修复': ['修复', '屏障', '受损', '敏感'],
            '舒缓': ['舒缓', '镇静', '泛红', '刺激', '消炎'],
            '抗氧化': ['抗氧化', '自由基', '防护'],
            '去角质': ['去角质', '焕肤', '光滑', '细腻'],
            '防晒': ['防晒', '紫外线', 'UV']
        }
        
        # 检查是否是功效查询
        for benefit, keywords in benefit_keywords.items():
            if any(kw in question_lower for kw in keywords):
                results = self.search_by_benefit(benefit)
                if results:
                    response = f"针对【{benefit}】推荐以下成分:\n\n"
                    for i, ing in enumerate(results[:5], 1):
                        response += f"{i}. {ing['ingredient_name']} ({ing['evidence_level']})\n"
                        response += f"   功效: {', '.join(ing['benefits'][:3])}\n\n"
                    return response
        
        # 成分名称查询
        results = self.search_by_name(question, limit=3)
        if results:
            if len(results) == 1:
                return self.format_ingredient(results[0])
            else:
                response = "找到以下相关成分:\n\n"
                for ing in results:
                    response += f"• {ing['ingredient_name']} - {ing['overview'][:50]}...\n"
                return response
        
        return "抱歉，没有找到相关信息。请尝试使用功效关键词（如：美白、祛痘、抗衰老等）或成分名称进行查询。"


def main():
    """主函数 - 交互式查询"""
    print("="*60)
    print("美容保养成分RAG知识库")
    print("="*60)
    print("\n基于权威皮肤科学来源的成分数据库")
    print("数据来源: AAD, JID, PubMed, FDA等")
    print("\n" + "="*60)
    
    # 初始化RAG
    rag = SkincareRAG()
    
    print("\n使用提示:")
    print("  • 输入成分名称查询详细信息")
    print("  • 输入功效关键词(如: 美白、祛痘、抗衰老)")
    print("  • 输入'list'查看所有成分")
    print("  • 输入'quit'退出\n")
    
    while True:
        try:
            question = input("\n请输入查询内容: ").strip()
            
            if not question:
                continue
            
            if question.lower() in ['quit', 'exit', 'q', '退出']:
                print("\n感谢使用，再见！")
                break
            
            if question.lower() in ['list', 'all', '全部']:
                print("\n所有成分列表:")
                for ing in rag.get_all_ingredients():
                    print(f"  • {ing['ingredient_name']} ({ing['category']}) [{ing['evidence_level']}]")
                continue
            
            # 处理查询
            response = rag.query(question)
            print("\n" + response)
            
        except KeyboardInterrupt:
            print("\n\n感谢使用，再见！")
            break
        except Exception as e:
            print(f"\n查询出错: {e}")


if __name__ == "__main__":
    main()
