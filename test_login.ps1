Invoke-RestMethod -Uri "http://192.168.43.3:8790/api/auth/login" -Method POST -ContentType "application/json" -Body '{"phone":"13800138000","password":"123456","role":"user"}'
