# 普通 CLOTH 首批基线

源码基线：`ed10c535`。202 份原定义、源码 SHA-256、第一版品种键及引用位置见 [baseline.json](../../../../tools/tests/cloth/baseline.json)。该 JSON 保持历史内容，其中 `new_path` 是归并前的中间路径，不再是运行入口。基线留在测试目录，OpenSpec 归档不会破坏转换工具。盘点脚本为 `tools/tests/cloth_inventory.mjs`，只读取受跟踪源码，不读取玩家数据。

## 品种与身份

- 当前 202 份定义归并为 **148 个规范品种**，删除 54 个重复定义。第一版曾保留 202 个独立身份和目录拼接键，此规则已被“相同物品共用唯一身份”替代。
- 新入口为 `/d/items/cloth/<语义ID>`，如 `buyi`、`qingbu_changshan`、`baise_changpao`；全部 148 个 ID 均按物品特征命名，不携带纯粹的来源目录信息。玩家输入别名不等于品种键。
- 公共程序及数据留在 `/d/items/`，因为本库 `creator_file()` 将 `/d` 归为 Domain、`/clone` 归为 Clone；这样不必修改安全系统即可保留原 UID。
- 原 174 份定义仅蓝图设置普通属性；另 28 份在 `set_weight()` 之前写固定 long。当前这两种写法已统一为蓝图 `properties`。所有候选只有固定名称、重量、属性与 setup，无随机值或独立回调。解析器遇到额外语句会失败，不将任意 LPC 自动当作数据。
- city/jinsijia、luoyang/armor1、shaolin/jingang-zhao、wanjiegu/feature 保持原样；仅继承 EQUIP 的衣物不在本批。

## 规范映射与差异判定

[canonical_ids.json](../../../../tools/tests/cloth/canonical_ids.json) 为每组代表来源指定规范名；[cloth_canonical.mjs](../../../../tools/tests/cloth_canonical.mjs) 从不可变历史基线生成完整多对一对应。执行 `node tools/tests/cloth_canonical.mjs` 查看各规范品种、原路径、中间路径、输入别名及 404 项离线迁移映射；不加载游戏、不修改文件。

分组核对名称/颜色、重量、所有属性、初始化位置与行为，不按中文同名归并。数值与表达式按 token 核对，属性排列顺序不充当品种差异，运行数据采用代表定义的属性顺序。经核对统一普通布衣 `value=0` 与未设置、历史输入别名，以及固定描述的蓝图存放位置；不推广为任意字段归零、去色或动态初始化位置归一。

- 普通布衣 18 个来源 → `buyi`：重量 3000、防御 1、布料、价值 0；合并 `cloth`/`linen`，保留 `c`/`l` 输入。原 linen 对象主 ID 规范为 cloth，显示括号随之统一，中文名及功能不变。
- 重量 1000 的布衣 → `buyi_qingxing`；价值 5 的两份布衣 → `buyi_shoumai`，不与普通布衣合并。
- 两类铁背心分别为 `tie_beixin` 和 `tie_beixin_sengmen`，后者的 `shaolin=1` 保留。
- 价格 2000/4000 的皮背心、不同重量和防御的铁甲、颜色或描述不同的教服各自保留，不为减少条目改变实际属性。
- 28 份历史定义的提前 `long` 设置全是固定字符串或 ANSI 字符串，不依赖重量、随机值或对象状态；与其他固定描述统一进入 `properties`，删除 `instance`。回归验证默认描述、实例覆盖、删除覆盖和其他实例不变。

同文件不同历史路径未出现归并到同一配置键的冲突；744 个调用文件的 771 处引用直接改用规范路径。离线存档则显式测试混合身份，同价库存合并、异价失败，不加运行期查找表。

## 引用复核

词法扫描得到 **769 处静态引用、743 个调用文件**，包含绝对路径、相对路径、`__DIR__` 隐式拼接、NPC 携物、房间 objects、商店货表及盟主 armor 配置。名称、别名、材料等普通字符串不当作路径替换。各处原表达式和位置保存在 JSON，迁移前必须再次比对源片段。

另逐一核对 7 处动态拼接：

| 调用方 | 实际取值与处理 |
| --- | --- |
| `d/beijing/npc/qianzhenglun.c:102` | 白名单兵器、body/helmet/feet/waist；body 继承 ARMOR，不含本批品种，保留 |
| `d/changan/npc/fujiang.c:65` | 五种兵器，不含服装，保留 |
| `d/xiangyang/npc/wuxiuwen.c:76` | 护腕、护腰、手套、围脖、指套，保留 |
| `d/xiangyang/npc/wuxiuwen.c:93` | 铁背心，改为新品种路径 |
| `kungfu/class/shaolin/dao-chen.c:90` | 五种兵器，保留 |
| `kungfu/class/shaolin/dao-xiang.c:96` | 护具与僧鞋，保留 |
| `kungfu/class/shaolin/dao-xiang.c:116` | 铁背心，改为新品种路径 |

另检索源码宏定义与目录枚举：物品相关路径宏不指向本批；宝镜任务枚举 `/adm/daemons/task/obj/`，探索任务枚举地图顶层房间，不枚举本批服装目录。管理端加载/更新继续处理实体公共程序，不以物理目录列表代表虚拟品种列表。

## 存取边界

背包 `my_depot/itemN/file`、指定旧乾坤袋记录及玩家商店货品路径已有配套离线转换工具，见 [部署说明](../../../../docs/architecture/data-driven-items.md)。普通 CLOTH 不提供 query_autoload，不借此次迁移启用自动加载。正式数据未在开发阶段转换。

## 代表验证（2026-10-04）

白袍、青袍、蛇皮、军服、铁背心：`node tools/tests/test_cloth_objects.mjs`，隔离真实驱动 **242 项检查、0 失败**。使用实际 CLOTH/ITEM/EQUIP/dbase/name/move 和 itemd 的 equip_setup 函数；测试 master、显示辅助 sefun 及容纳环境为夹具。不启动正式游戏，不复制正式存档。

该初始结果覆盖虚拟蓝图/克隆名称和标志、各品种默认对象、初始化后的属性与名称缓存、UID/EUID、同品种重建、嵌套状态隔离、洗涤时长/限制/晾干、未知品种及禁止外部直接参数构造。后续扩展全部 202 份历史定义及真实业务链；归并前历史与归并后结果分别见 [validation.md](validation.md)，不将初始 242 项与整批检查混算。
