# updated - 更新守护进程

## 📋 概述

updated 是炎黄群侠传MUD游戏的核心数据维护守护进程，负责玩家数据的完整性检查、称号管理、数据清理和转世重生处理。它是游戏数据一致性和玩家状态管理的关键组件，确保所有玩家数据的正确性和完整性。

## 🎯 主要功能

### 1. 玩家数据完整性检查
- **数据一致性验证**：检查并修正玩家各项数据的逻辑一致性
- **属性范围检查**：验证玩家属性值是否在合理范围内
- **技能数据校验**：检查技能等级与玩家等级的匹配性
- **状态数据同步**：确保玩家状态数据之间的一致性

### 2. 称号管理系统
- **称号数据库管理**：维护称号与对应条件的映射关系
- **称号自动授予**：根据玩家条件自动授予相应称号
- **称号冲突处理**：处理多个称号之间的优先级和显示
- **称号历史记录**：记录玩家获得过的所有称号

### 3. 数据清理功能
- **分类数据清理**：支持按类别清理玩家特定数据
- **安全数据删除**：确保数据删除的安全性和完整性
- **批量数据处理**：支持批量玩家数据的清理操作
- **数据备份机制**：在清理前进行必要的数据备份

### 4. 转世重生系统
- **转世数据处理**：处理玩家转世时的数据重置和清理
- **属性重新分配**：处理转世后的属性重新分配
- **技能清空重置**：清空玩家所有技能数据
- **转世奖励发放**：发放转世后的属性加成和特技奖励

## 💻 技术实现

### 核心数据结构

```lpc
// 称号基础数据库（包含获得条件和显示格式）
mixed title_base = ([
    "门派宗师": (["cond":"opinion", "value":100000, "title":HIG"【一代宗师】"NOR]),
    "武学大宗师": (["cond":"opinion", "value":1000000, "title":HIY"【大宗师】"NOR]),
    "元婴出世": (["cond":"animaout", "value":1, "title":HIM"【元婴】"NOR]),
    "任督二脉": (["cond":"breakup", "value":1, "title":HIC"【任督通】"NOR]),
    "生死玄关": (["cond":"death", "value":1, "title":HIR"【生死关】"NOR]),
    "转世重生": (["cond":"reborn", "value":1, "title":HIW"【"HIY"元"HIR"神"HIG"转世"HIW"】"NOR]),
    "前世门派": (["cond":"old_family", "value":1, "title":HIG"【前世】"NOR])
]);
```

### 主要函数接口

#### 数据完整性检查
```lpc
void check_user(object ob)
```
- **参数**：`ob` - 需要检查的玩家对象
- **功能**：全面检查玩家数据的完整性和一致性，自动修正异常数据

#### 数据清理函数
```lpc
string clear_user_data(string user, string cat)
```
- **参数**：
  - `user`: 玩家ID
  - `cat`: 清理类别（name/room/couple/item/board/hatred/league/title）
- **返回值**：清理结果消息
- **功能**：按类别清理玩家指定类型的数据

#### 玩家查找函数
```lpc
object global_find_player(string user)
```
- **参数**：`user` - 玩家ID
- **返回值**：玩家对象（在线或离线加载）
- **功能**：查找或加载指定玩家对象，支持离线玩家加载

#### 转世处理函数
```lpc
void zhuan_player(object me)
```
- **参数**：`me` - 转世玩家对象
- **功能**：执行完整的转世重生流程，包括数据清理、属性重置、奖励发放

## 🔄 核心工作流程

### 数据完整性检查流程

1. **基础属性检查**
   ```lpc
   // 检查年龄合理性
   if (my["age"] < 14 || my["age"] > 100)
       my["age"] = 14;

   // 检查属性值范围
   foreach (string attr in ({"str", "con", "dex", "int", "per"})) {
       if (my[attr] < 1 || my[attr] > 50)
           my[attr] = 10 + random(21);
   }
   ```

2. **称号自动授予**
   ```lpc
   // 检查各项称号条件
   foreach (string title, mixed cond in title_base) {
       if (me->query(cond["cond"]) >= cond["value"]) {
           // 检查是否已获得此称号
           if (!me->query("title_bak/" + title))
               me->set("title_bak/" + title, cond["title"]);
       }
   }
   ```

3. **技能数据校验**
   ```lpc
   // 检查技能等级合理性
   all_skills = me->query_skills();
   if (all_skills) {
       foreach (string skill, int level in all_skills) {
           if (level > 500) {  // 超过最大等级限制
               me->set_skill(skill, 500);
           }
       }
   }
   ```

### 转世重生处理流程

1. **数据清理阶段**
   ```lpc
   // 清除社会关系
   me->delete("couple");      // 婚姻关系
   me->delete("brothers");   // 结拜关系
   me->delete("family");     // 门派关系
   me->delete("bunch");      // 帮派关系
   me->delete("league");     // 同盟关系

   // 清除修炼状态
   me->delete("animaout");   // 元婴出世
   me->delete("breakup");    // 任督二脉
   me->delete("death");      // 生死玄关
   me->delete("can_learn");  // 技能解密
   ```

2. **技能清空处理**
   ```lpc
   // 获取所有技能并清空
   all_skills = me->query_skills();
   if (all_skills) {
       skills = keys(all_skills);
       foreach (string skill in skills)
           me->delete_skill(skill);
   }
   ```

3. **属性重置**
   ```lpc
   // 重置基础属性
   me->set("combat_exp", 0);     // 经验清零
   me->set("potential", 0);      // 潜能清零
   me->set("max_neili", 0);      // 内力清零
   me->set("max_jingli", 0);     // 精力清零
   me->set("shen", 0);            // 神值清零

   // 重置生命值
   me->set("max_qi", 100);
   me->set("max_jing", 100);
   me->set("age", 14);            // 年龄重置为14岁
   ```

4. **转世奖励发放**
   ```lpc
   // 增加转世计数
   me->add("reborn/count", 1);

   // 随机属性加成（每项50%概率）
   if (random(2)) me->add("reborn/str", 1);
   if (random(2)) me->add("reborn/con", 1);
   if (random(2)) me->add("reborn/int", 1);
   if (random(2)) me->add("reborn/dex", 1);

   // 发放固定特技
   me->set("special_skill/shenyan", 1);   // 通慧神眼
   if (me->query("int") < 16)
       me->set("special_skill/tiandao", 1); // 天道酬勤
   else
       me->set("special_skill/clever", 1); // 天赋聪颖
   ```

## ⚙️ 数据清理类别说明

| 清理类别 | 清除内容 | 使用场景 |
|----------|----------|----------|
| `name` | 玩家自定义名字和描述 | 名字违规重置 |
| `room` | 玩家房屋相关数据 | 房屋系统重置 |
| `couple` | 婚姻关系数据 | 离婚处理 |
| `item` | 特殊物品获得记录 | 物品系统重置 |
| `board` | 门派留言板记录 | 门派清理 |
| `hatred` | 仇恨关系数据 | 关系重置 |
| `league` | 同盟关系数据 | 同盟变更 |
| `title` | 称号数据 | 称号重置 |

## ⚠️ 开发注意事项

### 数据安全
1. **原子操作**：所有数据修改必须是原子操作
2. **备份机制**：重要数据修改前应考虑备份
3. **异常处理**：完善的异常情况处理机制
4. **日志记录**：关键操作需要记录日志

### 性能考虑
1. **批量处理**：大批量数据处理应考虑性能影响
2. **缓存机制**：频繁访问的数据应适当缓存
3. **延迟加载**：离线玩家数据应支持延迟加载
4. **内存管理**：及时清理不再使用的对象

### 扩展性设计
1. **配置驱动**：称号等数据应通过配置管理
2. **模块化设计**：功能模块应独立可维护
3. **接口稳定**：对外接口应保持稳定性
4. **文档完整**：所有功能都应有详细文档

## 🔧 开发接口使用

### 称号检查与授予
```lpc
// 在玩家登录时检查称号
void check_user(object me)
{
    // 检查是否满足大宗师条件
    if (me->query("opinion") >= 1000000) {
        if (!me->query("title_bak/武学大宗师"))
            me->set("title_bak/武学大宗师", HIY"【大宗师】"NOR);
    }

    // 检查转世称号
    if (me->query("reborn")) {
        if (!me->query("title_bak/转世重生"))
            me->set("title_bak/转世重生", HIW"【"HIY"元"HIR"神"HIG"转世"HIW"】"NOR);
    }
}
```

### 数据清理调用
```lpc
// 清理玩家婚姻关系
string result = UPDATED_D->clear_user_data("player_id", "couple");

// 清理玩家房屋数据
string result = UPDATED_D->clear_user_data("player_id", "room");
```

### 离线玩家处理
```lpc
// 查找离线玩家
object player = UPDATED_D->global_find_player("offline_player");
if (player) {
    // 执行相关操作
    player->add("some_data", 1);

    // 保存并销毁离线玩家对象
    player->save();
    destruct(player);
}
```

## 🔗 相关文档

- [转世重生系统](../features/reborn/overview.md) - 转世系统详细说明
- [称号系统文档](../systems/character/titles.md) - 称号系统设计
- [数据完整性文档](../development/data_integrity.md) - 数据一致性保证
- [门派系统文档](../systems/factions/overview.md) - 门派数据管理

---

*最后更新: 2025-09-14*
*维护团队: 炎黄群侠传开发组*