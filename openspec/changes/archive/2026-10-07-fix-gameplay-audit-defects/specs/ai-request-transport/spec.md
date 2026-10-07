## ADDED Requirements

### Requirement: Player replies belong to the originating connection

玩家 AI 请求 SHALL 绑定发起时的可信连接身份；该连接结束、被接管或替换后，旧请求 MUST NOT 向新连接投递结果，且在后续存活检查中取消。相同账号和玩家对象仍存在不能证明连接连续。

#### Scenario: Reconnect occurs between liveness checks
- **WHEN** 玩家在两次存活检查之间断线并重连，复用相同角色对象后收到旧响应
- **THEN** 旧回复被丢弃，旧请求释放；新连接发起的请求正常回复且只投递一次

#### Scenario: An uninterrupted connection receives a reply
- **WHEN** 原连接保持且对象、身份及响应校验全部通过
- **THEN** 正常投递，不额外调用模型或改变世界后台请求
