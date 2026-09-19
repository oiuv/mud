# AI_CLIENT_D — AI服务客户端

实现文件：adm/daemons/ai_client_d.c。Python实现与配置见 [AI服务指南](../../npc_ai/README.md)。

## 接口

~~~lpc
varargs string send_chat_request(string npcId, string playerId, string playerName,
                                string message, string context);
~~~

通过127.0.0.1:9999发送UTF-8 JSON数据报。返回“处理中...”只代表已发送，最终结果由回调通知玩家。

## 请求和响应

~~~json
{
  "type": "chat",
  "request_id": "实例ID-请求序号",
  "npc_id": "li bai",
  "player_id": "player",
  "player_name": "少侠",
  "message": "如何学习剑法？",
  "context": "地点：客店"
}
~~~

成功响应回显标识并带response；错误响应type=error，带code和error。客户端只接受指定AI地址、已登记请求及匹配NPC/玩家ID的响应。回复发送给请求时的玩家对象，不再用AI配置ID调用find_living。

## 生命周期

- 同一玩家对同一NPC只允许一个待处理请求，总待处理上限64。
- 5秒未完成时原样重传一次；Python去重避免重复记录、重复关系增长。
- 90秒未完成时提示超时，之后收到的响应忽略。
- 完成后取消定时器并移除请求；重载时清理socket和待处理定时器。
- 输入最长1000字符，完整请求最多8192字节；过长或发送失败直接提示玩家。
- Python默认最多8个并发工作线程、80秒请求预算、20秒单次API超时。

AI功能通过NPC accept_talk、部分accept_ask及周不通频道入口调用。AI输出仅为文本；不执行游戏指令。
配置/关系查询可使用Python测试客户端；LPC当前公开接口只发送chat请求。

## 回归

~~~text
talk li bai about 你好
aitest li bai about 如何拜师？
chat @butong 武当派介绍
~~~

还应验证服务停止超时、连续提问、无效角色、AI角色ID与living ID不同、重复数据报、摘要容量到达时原问题正常回答。
