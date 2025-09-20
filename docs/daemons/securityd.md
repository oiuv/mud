# SECURITY_D - 安全权限守护进程

## 概述
SECURITY_D 是MUD游戏的安全权限管理守护进程，负责管理巫师权限等级、文件访问控制和用户状态管理。它确保游戏系统的安全性和权限的正确分配。

## 核心功能

### 权限等级管理
- 定义和管理6个权限等级：玩家、不朽者、学徒、巫师、高级巫师、管理员
- 动态权限分配和验证
- 权限持久化存储

### 文件访问控制
- 基于目录的读写权限控制
- 排除列表和信任列表机制
- 扩展权限规则支持

### 用户状态管理
- 巫师状态映射维护
- 命令授权管理
- 站点特权管理

## 权限等级系统

### 等级定义
```lpc
private nosave string *wiz_levels = ({
    "(player)",      // 0 - 普通玩家
    "(immortal)",    // 1 - 不朽者
    "(apprentice)",  // 2 - 学徒
    "(wizard)",      // 3 - 巫师
    "(arch)",        // 4 - 高级巫师
    "(admin)"        // 5 - 管理员
});
```

### 权限检查
```lpc
// 获取用户权限等级
int level = SECURITY_D->get_wiz_level(string user);

// 检查是否为巫师
int is_wizard = SECURITY_D->wizardp(string user);
```

## 文件访问控制

### 访问规则
- **trusted_read/exclude_read**: 读取权限控制
- **trusted_write/exclude_write**: 写入权限控制
- **extend_trusted/exclude**: 扩展规则支持

### 访问验证
```lpc
// 检查文件写入权限
int valid_write = SECURITY_D->valid_write(string path, string user);

// 检查文件读取权限
int valid_read = SECURITY_D->valid_read(string path, string user);
```

## 配置管理

### 安全策略配置
```lpc
// 查询安全策略
mapping security = SECURITY_D->query_security(string parameter);

// 设置安全策略
int result = SECURITY_D->set_security(string parameter, mapping rules);
```

### 权限重置
```lpc
// 重置所有安全策略
SECURITY_D->reset_security();
```

## 命令授权

### 命令授权管理
- 支持按命令授权
- 支持按站点授权
- 权限继承机制

### 授权查询
```lpc
// 检查用户是否有特定命令权限
int has_permission = SECURITY_D->valid_grant(string user, string command);
```

## 数据存储

### 存储文件
- 主数据：`/data/securityd`
- 包含巫师状态、权限规则、授权信息

### 数据持久化
- 自动保存配置变更
- 支持手动保存和恢复
- 数据完整性验证

## 安全特性

### 防欺骗机制
- 使用括号包裹权限名称防止用户命名欺骗
- 严格的权限验证流程
- 多层次的访问控制

### 系统保护
- 限制ROOT权限访问
- 防止恶意文件操作
- 审计日志记录

## 使用示例

### 检查用户权限
```lpc
// 检查用户权限等级
int level = SECURITY_D->get_wiz_level("player_name");
if (level >= 3) {
    // 执行巫师操作
}
```

### 设置权限
```lpc
// 设置用户权限等级
SECURITY_D->set_wiz_level("user_name", 3);
```

### 文件访问控制
```lpc
// 检查文件访问权限
if (SECURITY_D->valid_write("/d/city/kedian", "username")) {
    // 允许写入
}
```

## 相关文件
- `/adm/daemons/securityd.c` - 守护进程实现
- `/data/securityd` - 权限数据存储
- `/include/security.h` - 安全定义