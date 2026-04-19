#!/usr/bin/env python
"""创建默认用户账号"""
import os
import sys
import django

# 设置 Django 环境
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'skinai_django.settings')
django.setup()

from dashboard.models import UserAccount


def create_default_user():
    """创建默认用户账号 13800000000/123456"""
    phone = '13800000000'
    password = '123456'
    
    # 检查是否已存在
    if UserAccount.objects.filter(phone=phone).exists():
        user = UserAccount.objects.get(phone=phone)
        user.set_password(password)
        user.save()
        print(f'用户 {phone} 已存在，密码已重置为 {password}')
        return
    
    # 创建新用户
    user = UserAccount.objects.create(
        phone=phone,
        role='user',
        is_active=True
    )
    user.set_password(password)
    user.save()
    print(f'默认用户创建成功！')
    print(f'  手机号: {phone}')
    print(f'  密码: {password}')
    print(f'  用户ID: {user.account_id}')


if __name__ == '__main__':
    create_default_user()
