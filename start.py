import socket
import subprocess
import sys
import os
import signal
import time

processes = []
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
DJANGO_BOOTSTRAP = os.path.join('services', 'django', 'bootstrap.py')
NPM_EXECUTABLE = 'npm.cmd' if os.name == 'nt' else 'npm'
NPX_EXECUTABLE = 'npx.cmd' if os.name == 'nt' else 'npx'

def get_venv_python():
    venv_dir = os.path.join(PROJECT_ROOT, '.venv')
    if os.name == 'nt':
        return os.path.join(venv_dir, 'Scripts', 'python.exe')
    return os.path.join(venv_dir, 'bin', 'python')

_venv_python = get_venv_python()
PYTHON_EXECUTABLE = _venv_python if os.path.exists(_venv_python) else sys.executable

def load_env_file(path):
    if not os.path.exists(path):
        return
    with open(path, 'r', encoding='utf-8') as file:
        for raw_line in file:
            line = raw_line.strip()
            if not line or line.startswith('#') or '=' not in line:
                continue
            key, value = line.split('=', 1)
            os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))

load_env_file(os.path.join(PROJECT_ROOT, '.env'))

WEB_PORT = int(os.getenv('WEB_PORT', '3001'))
DJANGO_PORT = int(os.getenv('DJANGO_PORT', '8788'))
API_PORT = int(os.getenv('API_PORT', '8790'))

def stop_all_processes():
    """停止所有已启动的进程"""
    for p in processes:
        if p.poll() is not None:
            continue
        try:
            p.terminate()
            p.wait(timeout=5)
        except:
            try:
                p.kill()
            except:
                pass

def is_port_in_use(port):
    """检查端口是否被占用"""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        return sock.connect_ex(('127.0.0.1', port)) == 0

def kill_process_on_port(port, max_retries=3):
    """强制结束占用指定端口的进程"""
    for attempt in range(max_retries):
        try:
            # 使用PowerShell获取占用端口的进程
            if os.name == 'nt':
                # 查找占用端口的PID
                result = subprocess.run(
                    ['powershell', '-Command', 
                     f"Get-NetTCPConnection -LocalPort {port} -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess"],
                    capture_output=True,
                    text=True
                )
                
                if result.returncode == 0 and result.stdout.strip():
                    pids = [pid.strip() for pid in result.stdout.strip().split('\n') if pid.strip()]
                    for pid in pids:
                        try:
                            # 尝试优雅终止
                            subprocess.run(['taskkill', '/PID', pid], capture_output=True)
                            time.sleep(0.5)
                            # 强制终止
                            subprocess.run(['taskkill', '/F', '/PID', pid], capture_output=True)
                            print(f'  已结束占用端口 {port} 的进程 (PID: {pid})')
                        except:
                            pass
            else:
                # Linux/Mac
                result = subprocess.run(
                    ['lsof', '-ti', f':{port}'],
                    capture_output=True,
                    text=True
                )
                if result.returncode == 0 and result.stdout:
                    pids = result.stdout.strip().split('\n')
                    for pid in pids:
                        if pid:
                            try:
                                subprocess.run(['kill', '-9', pid], capture_output=True)
                                print(f'  已结束占用端口 {port} 的进程 (PID: {pid})')
                            except:
                                pass
        except Exception as e:
            print(f'  清理端口 {port} 时出错: {e}')
        
        # 检查端口是否释放
        time.sleep(0.5)
        if not is_port_in_use(port):
            return True
    
    return not is_port_in_use(port)

def wait_for_port_release(port, timeout=10):
    """等待端口释放"""
    start_time = time.time()
    while time.time() - start_time < timeout:
        if not is_port_in_use(port):
            return True
        time.sleep(0.5)
    return False

def clean_ports(ports):
    """清理所有需要使用的端口"""
    print('清理端口占用...')
    all_clean = True
    for port in ports:
        if is_port_in_use(port):
            print(f'  端口 {port} 被占用，正在清理...')
            if kill_process_on_port(port):
                print(f'  ✓ 端口 {port} 已释放')
            else:
                print(f'  ✗ 端口 {port} 清理失败')
                all_clean = False
        else:
            print(f'  ✓ 端口 {port} 可用')
    
    # 等待端口完全释放
    if not all_clean:
        print('等待端口完全释放...')
        for port in ports:
            if not wait_for_port_release(port, timeout=5):
                print(f'  警告: 端口 {port} 可能仍被占用')
    
    print('端口清理完成')
    return all_clean

def run_setup(name, cmd, cwd, env=None):
    """执行初始化命令"""
    print(f'执行 {name}...')
    env_vars = {**os.environ, **env} if env else os.environ
    result = subprocess.run(
        cmd,
        cwd=cwd,
        env=env_vars
    )
    if result.returncode != 0:
        print(f'✗ {name} 失败')
        return False
    print(f'✓ {name} 完成')
    return True

def start_service(name, cmd, cwd, port, env=None, max_retries=3):
    """启动服务，带重试机制"""
    env_vars = {**os.environ, **env} if env else os.environ
    
    for attempt in range(max_retries):
        print(f'启动 {name} (端口 {port})... (尝试 {attempt + 1}/{max_retries})')
        
        try:
            # 检查端口是否可用
            if is_port_in_use(port):
                print(f'  端口 {port} 仍被占用，尝试清理...')
                kill_process_on_port(port)
                time.sleep(1)
                if is_port_in_use(port):
                    print(f'  ✗ 端口 {port} 无法释放')
                    continue
            
            # 启动进程
            p = subprocess.Popen(
                cmd,
                shell=False,
                cwd=os.path.join(PROJECT_ROOT, cwd),
                env=env_vars,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True
            )
            
            # 等待进程启动
            time.sleep(3)
            
            # 检查进程是否存活
            if p.poll() is not None:
                stdout, _ = p.communicate()
                print(f'  ✗ {name} 启动失败')
                if stdout:
                    print(f'  错误: {stdout[:500]}')
                continue
            
            # 等待端口监听
            for _ in range(10):
                if is_port_in_use(port):
                    print(f'  ✓ {name} 启动成功 (PID: {p.pid})')
                    return p
                time.sleep(0.5)
            
            # 端口未监听，可能启动失败
            print(f'  警告: {name} 已启动但端口未监听')
            return p
            
        except FileNotFoundError as e:
            print(f'  ✗ 找不到命令: {e}')
            return None
        except Exception as e:
            print(f'  ✗ 启动出错: {e}')
    
    return None

def signal_handler(sig, frame):
    """处理退出信号"""
    print('\n正在停止所有服务...')
    stop_all_processes()
    print('所有服务已停止')
    sys.exit(0)

def main():
    """主函数"""
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    print('=' * 50)
    print('知己肤 服务启动器')
    print('=' * 50)

    # 清理端口占用
    if not clean_ports([WEB_PORT, DJANGO_PORT, API_PORT]):
        print('警告: 部分端口清理失败，将尝试使用备用端口')
    print()

    project_root = PROJECT_ROOT
    
    # Django 数据迁移
    if not run_setup('Django 数据迁移', 
                     [PYTHON_EXECUTABLE, DJANGO_BOOTSTRAP, 'migrate'], 
                     project_root):
        print('数据库迁移失败，继续尝试启动...')
    
    # 初始化管理员
    if not run_setup('默认管理员初始化', 
                     [PYTHON_EXECUTABLE, DJANGO_BOOTSTRAP, 'bootstrap_admin'], 
                     project_root):
        print('管理员初始化失败，继续尝试启动...')
    print()

    # 定义要启动的服务
    services = [
        {
            'name': '前端应用',
            'cmd': [NPX_EXECUTABLE, 'vite', '--host=0.0.0.0', '--port', str(WEB_PORT)],
            'cwd': os.path.join('apps', 'web'),
            'port': WEB_PORT,
            'env': {
                'VITE_DEV_PROXY_TARGET': f'http://localhost:{DJANGO_PORT}'
            }
        },
        {
            'name': 'Django 主后端',
            'cmd': [PYTHON_EXECUTABLE, DJANGO_BOOTSTRAP, 'runserver', f'0.0.0.0:{DJANGO_PORT}'],
            'cwd': '.',
            'port': DJANGO_PORT,
            'env': {
                'DJANGO_PORT': str(DJANGO_PORT)
            }
        },
        {
            'name': 'Node 兼容层',
            'cmd': [NPM_EXECUTABLE, 'run', 'dev:api'],
            'cwd': '.',
            'port': API_PORT,
            'env': {
                'API_PORT': str(API_PORT),
                'SKINAI_DJANGO_API_BASE_URL': f'http://127.0.0.1:{DJANGO_PORT}'
            }
        },
    ]
    
    # 按顺序启动服务
    for service in services:
        p = start_service(
            service['name'],
            service['cmd'],
            service['cwd'],
            service['port'],
            service['env']
        )
        
        if p is None:
            print(f'✗ {service["name"]} 启动失败')
            stop_all_processes()
            sys.exit(1)
        
        processes.append(p)
        time.sleep(2)  
    
    print()
    print('=' * 50)
    print(' 所有服务已启动!')
    print('=' * 50)
    print()
    print('访问地址:')
    print(f'  前端应用: http://localhost:{WEB_PORT}')
    print(f'  Django 主后端: http://localhost:{DJANGO_PORT}')
    print(f'  Node 兼容层: http://localhost:{API_PORT}')
    print()
    print('按 Ctrl+C 停止所有服务')
    print()
    
    # 监控进程状态
    reported_exits = set()
    check_interval = 0.5
    
    while True:
        time.sleep(check_interval)
        
        for i, p in enumerate(processes):
            if i in reported_exits:
                continue
                
            if p.poll() is not None:
                reported_exits.add(i)
                service_name = services[i]['name']
                print(f'✗ 错误: 服务 {service_name} 已退出，退出码 {p.returncode}')
                
                # 尝试读取错误输出
                try:
                    stdout, _ = p.communicate(timeout=1)
                    if stdout:
                        print(f'  输出: {stdout[-500:]}')  # 最后500字符
                except:
                    pass
                
                print('正在停止其他服务...')
                stop_all_processes()
                sys.exit(p.returncode or 1)

if __name__ == '__main__':
    main()
