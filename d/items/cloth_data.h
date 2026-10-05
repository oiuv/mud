// 普通 CLOTH 共用资产；ID 描述物品本身，不包含历史目录来源。
// 相同物品只维护一条定义。历史对应表仅用于离线迁移，不是运行期入口。
// properties 统一保存品种蓝图默认值，实例通过默认对象读取并可独立覆盖。
private mapping cloth_definitions() {
    return ([
        "bagua_fu": ([
            "name": "八卦服",
            "ids": ({ "baguafu" }),
            "weight": 2000,
            "properties": ({
                ({ "long", "这是八卦弟子练功服。\n" }),
                ({ "material", "cloth" }),
                ({ "unit", "件" }),
                ({ "value", 200 }),
                ({ "armor_prop/armor", 50 })
            }),
        ]),
        "bai_choushan": ([
            "name": "白绸衫",
            "ids": ({ "white cloth", "cloth" }),
            "weight": 3000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "material", "cloth" }),
                ({ "value", 300 }),
                ({ "armor_prop/armor", 3 })
            }),
        ]),
        "bai_jiasha": ([
            "name": "白布黑边袈裟",
            "ids": ({ "jia sha", "cloth" }),
            "weight": 5000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 4 })
            }),
        ]),
        "baihu_piqiu": ([
            "name": HIW "白虎皮裘" NOR,
            "ids": ({ "cloth" }),
            "weight": 3000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "long", "一件用白虎皮所制作的短袄。\n" }),
                ({ "value", 50000 }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 30 })
            }),
        ]),
        "baipao": ([
            "name": HIW "白袍" NOR,
            "ids": ({ "bai pao", "pao" }),
            "weight": 2000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "long", "这是件轻纱制成的白色长袍。\n" }),
                ({ "material", "silk" }),
                ({ "armor_prop/armor", 8 }),
                ({ "value", 100 })
            }),
        ]),
        "baipao2": ([
            "name": "白布长袍",
            "ids": ({ "cloth", "pao" }),
            "weight": 1000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "long", "这是件白布长袍，虽不奢华，却洗得一尘不染，在袍襟上锈了一团血红的火焰，\n"
                    "颇为鲜艳。\n" }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 1 })
            }),
        ]),
        "baise_changpao": ([
            "name": HIW "白色长袍" NOR,
            "ids": ({ "chang pao", "cloth", "pao" }),
            "weight": 2000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "long", HIW "这是件质量上佳的白色长袍。\n" NOR }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 8 }),
                ({ "value", 100 })
            }),
        ]),
        "baise_changpao2": ([
            "name": WHT "黑边白色长袍" NOR,
            "ids": ({ "chang pao", "cloth", "changpao", "pao" }),
            "weight": 6000,
            "properties": ({
                ({ "long", "这是一件黑色滚边的白色长袍，华贵异常，看不出是什么质料做的。\n" }),
                ({ "unit", "件" }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 65 }),
                ({ "value", 100 }),
                ({ "wear_msg", "$N迎风一展，[唰]的一声，披上一件$n。\n" }),
                ({ "remove_msg", "$N解开$n,把$n从身上脱了下来。\n" })
            }),
        ]),
        "baise_changshan": ([
            "name": HIW "白色长衫" NOR,
            "ids": ({ "cloth" }),
            "weight": 3000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 1 })
            }),
        ]),
        "baise_daopao": ([
            "name": "白色道袍",
            "ids": ({ "pao", "cloth", "dao pao" }),
            "weight": 4500,
            "properties": ({
                ({ "unit", "件" }),
                ({ "long", "这是件素雅洁净的白色道袍。\n" }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 3 })
            }),
        ]),
        "baisha_qun": ([
            "name": "白纱挑线镶边裙",
            "ids": ({ "xiangbian qun" }),
            "weight": 2000,
            "properties": ({
                ({ "long", "这是一件当地土著常用的白纱挑线镶边裙。\n" }),
                ({ "material", "cloth" }),
                ({ "unit", "件" }),
                ({ "value", 250 }),
                ({ "armor_prop/armor", 1 })
            }),
        ]),
        "baiyi": ([
            "name": "白衣",
            "ids": ({ "bai yi", "cloth" }),
            "weight": 3000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "material", "cloth" }),
                ({ "value", 100 }),
                ({ "armor_prop/armor", 1 })
            }),
        ]),
        "baiyi_duanqun": ([
            "name": "摆夷短裙",
            "ids": ({ "duan qun" }),
            "weight": 2000,
            "properties": ({
                ({ "long", "这是一件摆夷短裙。\n" }),
                ({ "material", "cloth" }),
                ({ "unit", "件" }),
                ({ "value", 250 }),
                ({ "armor_prop/armor", 3 })
            }),
        ]),
        "bingfu": ([
            "name": "兵服",
            "ids": ({ "cloth" }),
            "weight": 3000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "long", "普通官兵所穿戴的制服。\n" }),
                ({ "value", 1000 }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 5 })
            }),
        ]),
        "bingfu2": ([
            "name": "兵服",
            "ids": ({ "cloth", "bingfu" }),
            "weight": 3000,
            "properties": ({
                ({ "long", "一件兵服，前后有铜镜护心，中间绣了一个兵字．\n" }),
                ({ "material", "cloth" }),
                ({ "value", 300 }),
                ({ "unit", "件" }),
                ({ "armor_prop/armor", 10 })
            }),
        ]),
        "bosi_changpao": ([
            "name": "波斯长袍",
            "ids": ({ "bosi robe", "robe" }),
            "weight": 3000,
            "properties": ({
                ({ "long", "这是一件脏兮兮的波斯长袍。\n" }),
                ({ "material", "cloth" }),
                ({ "unit", "件" }),
                ({ "value", 250 }),
                ({ "armor_prop/armor", 10 })
            }),
        ]),
        "bosi_jiaofu": ([
            "name": MAG "波斯明教教服" NOR,
            "ids": ({ "bosi cloth", "cloth" }),
            "weight": 3000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "long", "这是一件波斯明教总舵的教服。\n" }),
                ({ "value", 300 }),
                ({ "material", "silk" }),
                ({ "armor_prop/armor", 2 })
            }),
        ]),
        "bosi_jiaofu2": ([
            "name": NOR + MAG "波斯明教教服" NOR,
            "ids": ({ "bosi cloth", "bosi", "cloth" }),
            "weight": 3000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "long", NOR + MAG "这是一件波斯明教总舵的教服。\n" NOR }),
                ({ "value", 300 }),
                ({ "material", "silk" }),
                ({ "armor_prop/armor", 2 })
            }),
        ]),
        "buyi": ([
            "name": "布衣",
            "ids": ({ "cloth", "linen", "l" }),
            "weight": 3000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 1 })
            }),
        ]),
        "buyi2": ([
            "name": "布衣",
            "ids": ({ "cloth" }),
            "weight": 1000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 1 })
            }),
        ]),
        "buyi3": ([
            "name": "布衣",
            "ids": ({ "buyi", "cloth" }),
            "weight": 3000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "value", 5 }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 1 })
            }),
        ]),
        "changpao": ([
            "name": "长袍",
            "ids": ({ "chang pao", "cloth" }),
            "weight": 3000,
            "properties": ({
                ({ "long", "一件长袍。\n" }),
                ({ "material", "cloth" }),
                ({ "unit", "件" }),
                ({ "value", 300 }),
                ({ "armor_prop/armor", 15 })
            }),
        ]),
        "changpao2": ([
            "name": "长袍",
            "ids": ({ "chang pao", "cloth", "pao" }),
            "weight": 2000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "long", "这是件质量上佳长袍，是由[针神]亲手缝制的。\n" }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 10 }),
                ({ "value", 100 })
            }),
        ]),
        "choupao": ([
            "name": "绸袍",
            "ids": ({ "choupao", "cloth" }),
            "weight": 3000,
            "properties": ({
                ({ "long", "一件丝绸长袍，质的和裁剪都不错．\n" }),
                ({ "material", "cloth" }),
                ({ "unit", "件" }),
                ({ "value", 600 }),
                ({ "armor_prop/armor", 4 }),
                ({ "armor_prop/personality", 1 })
            }),
        ]),
        "cu_bupao": ([
            "name": "粗布袍",
            "ids": ({ "cu bupao", "bupao", "pao" }),
            "weight": 1000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "armor_type", "cloth" }),
                ({ "value", 100 }),
                ({ "armor_prop/dodge", 1 }),
                ({ "armor_prop/armor", 1 })
            }),
        ]),
        "cubu_yi": ([
            "name": WHT "粗布衣" NOR,
            "ids": ({ "cloth" }),
            "weight": 3000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 1 })
            }),
        ]),
        "cuilv_choushan": ([
            "name": "翠绿绸衫",
            "ids": ({ "green cloth", "cloth" }),
            "weight": 1000,
            "properties": ({
                ({ "long", "这件翠绿色的绸衫上面绣着几只黄鹊，闻起来还有一股淡香。\n" }),
                ({ "unit", "件" }),
                ({ "value", 600 }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 1 }),
                ({ "armor_prop/personality", 3 }),
                ({ "female_only", 1 })
            }),
        ]),
        "danhuang_shan": ([
            "name": "淡黄衫",
            "ids": ({ "cloth" }),
            "weight": 3000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 1 })
            }),
        ]),
        "diaoqiu": ([
            "name": MAG "貂裘" NOR,
            "ids": ({ "diao qiu", "cloth" }),
            "weight": 3000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "long", "一件用貂皮制作，做工细致的皮外套，很是名贵。\n" }),
                ({ "value", 1000 }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 20 })
            }),
        ]),
        "doupeng": ([
            "name": "斗篷",
            "ids": ({ "dou peng", "peng" }),
            "weight": 2000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "long", "这是件斗篷。\n" }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 10 }),
                ({ "value", 100 })
            }),
        ]),
        "doupeng2": ([
            "name": "斗篷",
            "ids": ({ "dou peng" }),
            "weight": 2000,
            "properties": ({
                ({ "long", "这是一件绿色宽大的斗篷。\n" }),
                ({ "material", "cloth" }),
                ({ "unit", "件" }),
                ({ "value", 200 }),
                ({ "armor_prop/armor", 3 })
            }),
        ]),
        "duanqun": ([
            "name": "短裙",
            "ids": ({ "duan qun" }),
            "weight": 3000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 1 })
            }),
        ]),
        "fenhong_choushan": ([
            "name": "粉红绸衫",
            "ids": ({ "pink cloth", "cloth" }),
            "weight": 1000,
            "properties": ({
                ({ "long", "这件粉红色的绸衫上面绣着几只黄鹊，闻起来还有一股淡香。\n" }),
                ({ "unit", "件" }),
                ({ "value", 600 }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 1 }),
                ({ "armor_prop/personality", 3 }),
                ({ "female_only", 1 })
            }),
        ]),
        "fenhong_choushan2": ([
            "name": HIM "粉红绸衫" NOR,
            "ids": ({ "pink cloth", "cloth" }),
            "weight": 1000,
            "properties": ({
                ({ "long", "这件粉红色的绸衫上面绣著几只黄鹊，闻起来还有一股淡香。\n" }),
                ({ "unit", "件" }),
                ({ "value", 600 }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 1 }),
                ({ "armor_prop/personality", 3 }),
                ({ "female_only", 1 })
            }),
        ]),
        "gebu_changpao": ([
            "name": "葛布长袍",
            "ids": ({ "gebu changpao", "cloth" }),
            "weight": 3000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 3 })
            }),
        ]),
        "goupi": ([
            "name": "狗皮",
            "ids": ({ "gou pi", "pi" }),
            "weight": 5000,
            "properties": ({
                ({ "unit", "块" }),
                ({ "material", "fur" }),
                ({ "value", 300 }),
                ({ "armor_prop/armor", 1 })
            }),
        ]),
        "goupi2": ([
            "name": "狗皮",
            "ids": ({ "gou pi", "pi" }),
            "weight": 1200,
            "properties": ({
                ({ "unit", "件" }),
                ({ "value", 200 }),
                ({ "material", "leather" }),
                ({ "armor_prop/armor", 5 })
            }),
        ]),
        "guanfu": ([
            "name": "官服",
            "ids": ({ "cloth" }),
            "weight": 3000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "long", "官兵所穿戴的制服。\n" }),
                ({ "value", 1000 }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 5 })
            }),
        ]),
        "guanfu2": ([
            "name": HIY "锦团官服" NOR,
            "ids": ({ "cloth" }),
            "weight": 3000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "long", "上品官兵所穿戴的制服。\n" }),
                ({ "value", 1000 }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 5 })
            }),
        ]),
        "guanfu3": ([
            "name": HIC "官服" NOR,
            "ids": ({ "guan fu", "fu" }),
            "weight": 3000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "material", "丝" }),
                ({ "value", 5000 }),
                ({ "armor_prop/armor", 3 })
            }),
        ]),
        "guazi": ([
            "name": "对衿褂子",
            "ids": ({ "duijin guazi" }),
            "weight": 2000,
            "properties": ({
                ({ "long", "这是一件少数民族常用的对衿褂子。\n" }),
                ({ "material", "cloth" }),
                ({ "unit", "件" }),
                ({ "value", 350 }),
                ({ "armor_prop/armor", 5 })
            }),
        ]),
        "guiwang_pao": ([
            "name": WHT "鬼王袍" NOR,
            "ids": ({ "cloth" }),
            "weight": 3000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 1 })
            }),
        ]),
        "hasake_aoqun": ([
            "name": "哈萨克袄裙",
            "ids": ({ "ao qun", "qun" }),
            "weight": 3000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "long", "这是一件织著红花绿草的袄裙，哈萨克女孩常穿的衣着。\n" }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 3 }),
                ({ "value", 500 })
            }),
        ]),
        "heise_buyi": ([
            "name": "黑色布衣",
            "ids": ({ "cloth" }),
            "weight": 3000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 1 })
            }),
        ]),
        "heise_changshan": ([
            "name": "黑色长衫",
            "ids": ({ "chang shan", "cloth" }),
            "weight": 2000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 1 })
            }),
        ]),
        "heise_jiasha": ([
            "name": BLK "黑色袈裟" NOR,
            "ids": ({ "jiasha", "jia sha", "cloth" }),
            "weight": 5000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 20 }),
                ({ "value", 100 })
            }),
        ]),
        "heise_jiasha2": ([
            "name": "金边黑布袈裟",
            "ids": ({ "jia sha", "cloth" }),
            "weight": 5000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 10 })
            }),
        ]),
        "heiyi": ([
            "name": CYN "黑衣" NOR,
            "ids": ({ "cloth" }),
            "weight": 3000,
            "properties": ({
                ({ "long", "这是一件绣着红色火焰的黑色圣衣。\n" }),
                ({ "unit", "件" }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 1 })
            }),
        ]),
        "hongchou_shan": ([
            "name": "红绸小杉",
            "ids": ({ "cloth" }),
            "weight": 5000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 1 })
            }),
        ]),
        "hongling_ao": ([
            "name": HIR "红绫袄" NOR,
            "ids": ({ "red cloth" }),
            "weight": 3000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 1 })
            }),
        ]),
        "hongse_changpao": ([
            "name": HIR "红色" HIW "长袍" NOR,
            "ids": ({ "chang pao", "chang", "pao" }),
            "weight": 3000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 1 })
            }),
        ]),
        "hongse_jiasha": ([
            "name": HIR "红色袈裟" NOR,
            "ids": ({ "jiasha", "jia sha", "cloth" }),
            "weight": 5000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 20 }),
                ({ "value", 100 })
            }),
        ]),
        "hongse_jiasha2": ([
            "name": HIR "红色袈裟" NOR,
            "ids": ({ "jia sha", "cloth" }),
            "weight": 3000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "long", "一件火红色的袈裟。\n" }),
                ({ "value", 1000 }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 5 })
            }),
        ]),
        "huang_changpao": ([
            "name": YEL "白边黄色长袍" NOR,
            "ids": ({ "chang pao", "cloth", "changpao", "pao" }),
            "weight": 5000,
            "properties": ({
                ({ "long", "这是一件白色滚边黄色长袍，做工似乎比较简单。\n" }),
                ({ "unit", "件" }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 10 }),
                ({ "value", 100 }),
                ({ "wear_msg", "$N把$n迎风一展，缓缓的披在身上。\n" }),
                ({ "remove_msg", "$N轻轻的把$n从身上脱了下来。\n" })
            }),
        ]),
        "huangbu_jiasha": ([
            "name": "黄布袈裟",
            "ids": ({ "jia sha", "cloth" }),
            "weight": 5000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 2 })
            }),
        ]),
        "huangjin_jia": ([
            "name": "黄金甲",
            "ids": ({ "goldarmor", "jinarmor", "jinjia" }),
            "weight": 35000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "value", 20000 }),
                ({ "material", "leather" }),
                ({ "armor_prop/armor", 50 })
            }),
        ]),
        "huangmagua": ([
            "name": HIY "黄马褂" NOR,
            "ids": ({ "huang magua", "cloth" }),
            "weight": 3000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "long", "皇上御赐的黄马褂。\n" }),
                ({ "value", 1000 }),
                ({ "no_sell", "这，这可不敢买！" }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 10 })
            }),
        ]),
        "huangmagua2": ([
            "name": HIY "镶边黄马褂" NOR,
            "ids": ({ "huang magua", "cloth" }),
            "weight": 3000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "long", "皇上御赐的黄马褂。\n" }),
                ({ "value", 1500 }),
                ({ "no_sell", "这，这可不敢买！" }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 18 })
            }),
        ]),
        "huangse_jiasha": ([
            "name": HIY "黄色袈裟" NOR,
            "ids": ({ "jiasha", "jia sha", "cloth" }),
            "weight": 5000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 20 }),
                ({ "value", 100 })
            }),
        ]),
        "huangshan": ([
            "name": "黄衫",
            "ids": ({ "cloth" }),
            "weight": 3000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 1 })
            }),
        ]),
        "huangshan2": ([
            "name": HIY "黄衫" NOR,
            "ids": ({ "huang shan", "shan", "cloth" }),
            "weight": 3000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "long", "一件鹅黄色的女子长衫。" }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 10 })
            }),
        ]),
        "huangyi_junfu": ([
            "name": "黄衣军服",
            "ids": ({ "junfu", "cloth" }),
            "weight": 2000,
            "properties": ({
                ({ "long", "这是一件有点旧的黄衣军服。\n" }),
                ({ "material", "cloth" }),
                ({ "unit", "件" }),
                ({ "value", 200 }),
                ({ "armor_prop/armor", 5 })
            }),
        ]),
        "hufa_jiasha": ([
            "name": "护法袈裟",
            "ids": ({ "jia sha", "cloth" }),
            "weight": 8000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 15 })
            }),
        ]),
        "hufa_jiasha2": ([
            "name": YEL "护法袈裟" NOR,
            "ids": ({ "jia sha", "jia", "sha" }),
            "weight": 8000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 30 })
            }),
        ]),
        "hui_jiasha": ([
            "name": "灰布镶边袈裟",
            "ids": ({ "jia sha", "cloth" }),
            "weight": 5000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 6 })
            }),
        ]),
        "huibai_changshan": ([
            "name": WHT "灰白长衫" NOR,
            "ids": ({ "chang shan", "cloth" }),
            "weight": 3000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "long", "一件灰白色的普通长衫。\n" }),
                ({ "value", 50 }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 2 })
            }),
        ]),
        "huise_daopao": ([
            "name": "灰色道袍",
            "ids": ({ "pao", "cloth", "dao pao" }),
            "weight": 3000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "long", "一件普普通通的灰布道袍。\n" }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 2 })
            }),
        ]),
        "huise_daopao2": ([
            "name": WHT "灰色道袍" NOR,
            "ids": ({ "pao", "cloth", "dao pao" }),
            "weight": 1200,
            "properties": ({
                ({ "unit", "件" }),
                ({ "long", "一件普普通通的灰布道袍。\n" }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 2 })
            }),
        ]),
        "hulv_changqun": ([
            "name": HIG "湖绿长裙" NOR,
            "ids": ({ "green skirt", "cloth" }),
            "weight": 3000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "long", "一件清新可人的湖绿长裙。\n" }),
                ({ "material", "cloth" }),
                ({ "value", 0 }),
                ({ "armor_prop/armor", 3 }),
                ({ "female_only", 1 })
            }),
        ]),
        "hupi": ([
            "name": "虎皮",
            "ids": ({ "hu pi", "pi" }),
            "weight": 2000,
            "properties": ({
                ({ "unit", "块" }),
                ({ "material", "fur" }),
                ({ "value", 2000 }),
                ({ "armor_prop/armor", 10 })
            }),
        ]),
        "hupi2": ([
            "name": "虎皮",
            "ids": ({ "hu pi" }),
            "weight": 20000,
            "properties": ({
                ({ "unit", "张" }),
                ({ "material", "cloth" }),
                ({ "value", 20000 }),
                ({ "armor_prop/armor", 10 })
            }),
        ]),
        "huxinjing": ([
            "name": "护心镜",
            "ids": ({ "huxin jing", "mirror", "huxinjing", "jing", "huxin", "waist" }),
            "weight": 1000,
            "properties": ({
                ({ "unit", "面" }),
                ({ "long", "一面黄铜做的护心镜。\n" }),
                ({ "material", "copper" }),
                ({ "value", 0 }),
                ({ "armor_prop/armor", 5 })
            }),
        ]),
        "jinduan": ([
            "name": "锦缎",
            "ids": ({ "jin duan", "jin", "duan" }),
            "weight": 3000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "material", "丝" }),
                ({ "value", 4000 }),
                ({ "armor_prop/armor", 3 })
            }),
        ]),
        "jinyi": ([
            "name": "锦衣",
            "ids": ({ "cloth" }),
            "weight": 3000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 50 }),
                ({ "value", 2000 })
            }),
        ]),
        "jinyi_junfu": ([
            "name": "锦衣军服",
            "ids": ({ "junfu", "cloth" }),
            "weight": 2000,
            "properties": ({
                ({ "long", "这是一件颜色鲜亮的锦衣军服。\n" }),
                ({ "material", "cloth" }),
                ({ "unit", "件" }),
                ({ "value", 1200 }),
                ({ "armor_prop/armor", 15 })
            }),
        ]),
        "jinzhuang": ([
            "name": "短打劲装",
            "ids": ({ "cloth" }),
            "weight": 3000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 1 })
            }),
        ]),
        "junfu": ([
            "name": "军服",
            "ids": ({ "junfu", "cloth" }),
            "weight": 2000,
            "properties": ({
                ({ "long", "这是一件有点旧的官兵服。\n" }),
                ({ "material", "cloth" }),
                ({ "unit", "件" }),
                ({ "value", 200 }),
                ({ "armor_prop/armor", 10 })
            }),
        ]),
        "kongque_yuyi": ([
            "name": HIW "孔雀羽衣" NOR,
            "ids": ({ "kongque yuyi", "kongque", "yuyi" }),
            "weight": 600,
            "properties": ({
                ({ "long", HIW "这是一件出自天宫织女妙手神裁的羽"
                    "纱轻衣。款式新颖别致，\n轻柔飘逸的。"
                    "放在手中简直轻若无物，真是一件服饰极品。\n" NOR }),
                ({ "unit", "件" }),
                ({ "value", 100000 }),
                ({ "material", "feather" }),
                ({ "armor_prop/per", 10 }),
                ({ "armor_prop/armor", 10 }),
                ({ "armor_prop/armor_vs_force", 10 }),
                ({ "armor_prop/attack", -2 }),
                ({ "wear_msg", HIW "$N" HIW "轻柔的展开一件洁白如雪的飘逸纱"
                    "衣轻轻披在身上，映衬的\n$P" HIW "肌肤如"
                    "雪一般，一张盈盈笑脸如出水芙蓉，"
                    "让人意动魂摇。\n" NOR })
            }),
        ]),
        "lan_changpao": ([
            "name": BLU "白边蓝色长袍" NOR,
            "ids": ({ "chang pao", "cloth", "changpao", "pao" }),
            "weight": 5000,
            "properties": ({
                ({ "long", "这是一件白色滚边做工精细的蓝色长袍。\n" }),
                ({ "unit", "件" }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 30 }),
                ({ "value", 100 }),
                ({ "wear_msg", "$N把$n迎风一展，缓缓的披在身上。\n" }),
                ({ "remove_msg", "$N轻轻的把$n从身上脱了下来。\n" })
            }),
        ]),
        "lanse_jinzhuang": ([
            "name": HIB "蓝色劲装" NOR,
            "ids": ({ "jin zhuang" }),
            "weight": 3000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "long", "这是一套短打劲装。\n" }),
                ({ "value", 1000 }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 2 })
            }),
        ]),
        "liangyin_jia": ([
            "name": "亮银甲",
            "ids": ({ "silverarmor", "yinarmor", "yinjia" }),
            "weight": 30000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "value", 10000 }),
                ({ "material", "leather" }),
                ({ "armor_prop/armor", 45 })
            }),
        ]),
        "lianyiqun": ([
            "name": HIW "连衣裙" NOR,
            "ids": ({ "cloth" }),
            "weight": 3000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 1 })
            }),
        ]),
        "longpao": ([
            "name": HIY "龙袍" NOR,
            "ids": ({ "cloth", "longpao" }),
            "weight": 3000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 1 }),
                ({ "no_sell", 1 })
            }),
        ]),
        "longwen_pao": ([
            "name": HIY "雕龙长袍" NOR,
            "ids": ({ "cloth" }),
            "weight": 3000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "value", 6000 }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 1 })
            }),
        ]),
        "luopao": ([
            "name": "熟罗长袍",
            "ids": ({ "cloth" }),
            "weight": 3000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 1 })
            }),
        ]),
        "lvse_shengyi": ([
            "name": GRN "绿色圣衣" NOR,
            "ids": ({ "cloth" }),
            "weight": 3000,
            "properties": ({
                ({ "long", "这是一件绣着红色火焰的绿色圣衣。\n" }),
                ({ "unit", "件" }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 5 })
            }),
        ]),
        "lvshan": ([
            "name": HIG "绿衫" NOR,
            "ids": ({ "lv shan", "lv", "shan", "cloth" }),
            "weight": 3000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 1 })
            }),
        ]),
        "magua": ([
            "name": "马褂",
            "ids": ({ "cloth" }),
            "weight": 3000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "long", "一件普通的马褂。\n" }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 1 })
            }),
        ]),
        "maotan": ([
            "name": "毛毯",
            "ids": ({ "mao tan" }),
            "weight": 20000,
            "properties": ({
                ({ "unit", "张" }),
                ({ "material", "cloth" }),
                ({ "value", 2000 }),
                ({ "armor_prop/armor", 2 })
            }),
        ]),
        "pi_beixin": ([
            "name": "皮背心",
            "ids": ({ "beixin", "pi beixin" }),
            "weight": 1000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "value", 2000 }),
                ({ "material", "leather" }),
                ({ "armor_prop/armor", 6 })
            }),
        ]),
        "pi_beixin2": ([
            "name": "皮背心",
            "ids": ({ "pi beixin", "beixin" }),
            "weight": 1000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "value", 4000 }),
                ({ "material", "leather" }),
                ({ "armor_prop/armor", 6 })
            }),
        ]),
        "pipao": ([
            "name": HIR "枣红缎面皮袍" NOR,
            "ids": ({ "zaohong pao", "zaohong", "pao" }),
            "weight": 4000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "material", "cloth" }),
                ({ "value", 3000 }),
                ({ "armor_prop/armor", 6 })
            }),
        ]),
        "piqiu": ([
            "name": "皮裘",
            "ids": ({ "piqiu" }),
            "weight": 3000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "value", 5000 }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 10 }),
                ({ "armor_prop/warm", 35 })
            }),
        ]),
        "po_buyi": ([
            "name": NOR + WHT "破布衣" NOR,
            "ids": ({ "cloth" }),
            "weight": 1000,
            "properties": ({
                ({ "long", WHT "这是一件满是油腻的破布衣。\n" NOR }),
                ({ "unit", "件" }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 1 })
            }),
        ]),
        "qing_bupao": ([
            "name": HIB "青布袍" NOR,
            "ids": ({ "qing bupao", "bupao", "pao" }),
            "weight": 1000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "armor_type", "cloth" }),
                ({ "value", 100 }),
                ({ "armor_prop/dodge", 1 }),
                ({ "armor_prop/armor", 1 })
            }),
        ]),
        "qing_buyi": ([
            "name": HIG "青布衣" NOR,
            "ids": ({ "green cloth" }),
            "weight": 3000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 1 })
            }),
        ]),
        "qing_changpao": ([
            "name": HIC "白边青色长袍" NOR,
            "ids": ({ "chang pao", "cloth", "changpao", "pao" }),
            "weight": 5000,
            "properties": ({
                ({ "long", "这是一件白色滚边做工精细的青色长袍，看不出是用什么质料裁成的。\n" }),
                ({ "unit", "件" }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 45 }),
                ({ "value", 100 }),
                ({ "wear_msg", "$N把$n迎风一展，缓缓的披在身上。\n" }),
                ({ "remove_msg", "$N轻轻的把$n从身上脱了下来。\n" })
            }),
        ]),
        "qing_daopao": ([
            "name": "青色道袍",
            "ids": ({ "pao", "cloth", "dao pao" }),
            "weight": 3000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "long", "一件普普通通的青布道袍。\n" }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 2 })
            }),
        ]),
        "qing_daopao2": ([
            "name": HIG "青色道袍" NOR,
            "ids": ({ "pao", "cloth", "dao pao" }),
            "weight": 1500,
            "properties": ({
                ({ "female_only", 1 }),
                ({ "unit", "件" }),
                ({ "long", "这是件质地柔软的青色道袍。\n" }),
                ({ "material", "silk" }),
                ({ "armor_prop/armor", 3 })
            }),
        ]),
        "qing_daopao3": ([
            "name": "青色道袍",
            "ids": ({ "pao", "cloth", "dao pao" }),
            "weight": 1500,
            "properties": ({
                ({ "female_only", 1 }),
                ({ "unit", "件" }),
                ({ "long", "这是件质地轻软的青色道袍，边上还镂着花呢。\n" }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 1 })
            }),
        ]),
        "qingbu_changshan": ([
            "name": "青布长衫",
            "ids": ({ "shan", "cloth" }),
            "weight": 3000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 1 })
            }),
        ]),
        "qingbu_changshan2": ([
            "name": HIB "青布长衫" NOR,
            "ids": ({ "cloth" }),
            "weight": 3000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 1 })
            }),
        ]),
        "qingbu_sengyi": ([
            "name": "青布僧衣",
            "ids": ({ "cloth" }),
            "weight": 3000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 1 })
            }),
        ]),
        "qingse_changshan": ([
            "name": HIB "青色长衫" NOR,
            "ids": ({ "cloth" }),
            "weight": 3000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 1 })
            }),
        ]),
        "qingse_jiasha": ([
            "name": HIC "青色袈裟" NOR,
            "ids": ({ "jiasha", "jia sha", "cloth" }),
            "weight": 5000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 20 }),
                ({ "value", 100 })
            }),
        ]),
        "qingse_jiasha2": ([
            "name": "青布镶边袈裟",
            "ids": ({ "jia sha", "cloth" }),
            "weight": 5000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 8 })
            }),
        ]),
        "qingse_sipao": ([
            "name": "青色丝袍",
            "ids": ({ "si pao", "cloth", "pao" }),
            "weight": 1000,
            "properties": ({
                ({ "female_only", 1 }),
                ({ "unit", "件" }),
                ({ "long", "这是件质地轻柔的青色镂花丝袍，特别受女性青睐。\n" }),
                ({ "material", "cloth" }),
                ({ "value", 70 }),
                ({ "armor_prop/armor", 4 })
            }),
        ]),
        "qingsha_changqun": ([
            "name": "轻纱长裙",
            "ids": ({ "skirt", "cloth" }),
            "weight": 1000,
            "properties": ({
                ({ "long", "一条朦朦胧胧的纱裙，闻起来还有一股淡香。\n" }),
                ({ "unit", "条" }),
                ({ "value", 0 }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 1 }),
                ({ "armor_prop/personality", 3 }),
                ({ "female_only", 1 })
            }),
        ]),
        "qingshan": ([
            "name": "青衫",
            "ids": ({ "cloth" }),
            "weight": 3000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 1 })
            }),
        ]),
        "qingyi": ([
            "name": "青衣",
            "ids": ({ "qing yi", "cloth", "yi" }),
            "weight": 2000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "long", "这是件质量上佳青衣，是由[针神]亲手缝制的。\n" }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 10 }),
                ({ "value", 100 })
            }),
        ]),
        "qingyi2": ([
            "name": "绣梅青衣",
            "ids": ({ "cloth" }),
            "weight": 3000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 1 })
            }),
        ]),
        "riyue_jinpao": ([
            "name": HIW "日月锦袍" NOR,
            "ids": ({ "jin pao", "jin", "pao", "cloth" }),
            "weight": 10,
            "properties": ({
                ({ "long", HIW "这是一件日月神教长老所穿戴的华丽锦袍。\n" NOR }),
                ({ "material", "cloth" }),
                ({ "unit", "件" }),
                ({ "armor_prop/armor", 1 }),
                ({ "value", 10000 }),
                ({ "no_sell", "我的天…连日月神教的东西你都拿出来卖？" })
            }),
        ]),
        "sengpao": ([
            "name": HIY "僧袍" NOR,
            "ids": ({ "seng pao", "pao", "cloth" }),
            "weight": 3000,
            "properties": ({
                ({ "long", "这是一件寻常的僧袍，是和尚们的普通装束。\n" }),
                ({ "unit", "件" }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 10 }),
                ({ "armor_prop/dodge", 3 })
            }),
        ]),
        "sengyi": ([
            "name": "僧衣",
            "ids": ({ "sengyi", "cloth" }),
            "weight": 1000,
            "properties": ({
                ({ "material", "cloth" }),
                ({ "unit", "件" }),
                ({ "armor_prop/armor", 2 })
            }),
        ]),
        "shayi": ([
            "name": "胸部半开纱衣",
            "ids": ({ "cloth" }),
            "weight": 3000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 1 })
            }),
        ]),
        "shengdan_mao": ([
            "name": HIR "圣诞" HIW "帽" NOR,
            "ids": ({ "mao zi", "mao", "zi" }),
            "weight": 1000,
            "properties": ({
                ({ "unit", "顶" }),
                ({ "long", "一顶圣诞帽子，洋溢着节日的气氛。\n" }),
                ({ "value", 0 }),
                ({ "material", "cloth" }),
                ({ "armor_prop/dodge", 5 })
            }),
        ]),
        "shepi": ([
            "name": "蛇皮",
            "ids": ({ "she pi", "pi" }),
            "weight": 1000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "value", 8000 }),
                ({ "material", "leather" }),
                ({ "armor_prop/armor", 10 })
            }),
        ]),
        "shiweifu": ([
            "name": HIR "御前侍卫装" NOR,
            "ids": ({ "cloth" }),
            "weight": 3000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "long", "御前侍卫的统一装束。\n" }),
                ({ "value", 1000 }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 25 })
            }),
        ]),
        "shiweifu2": ([
            "name": HIY "一品侍卫装" NOR,
            "ids": ({ "cloth" }),
            "weight": 3000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "long", "御前侍卫的统一装束。\n" }),
                ({ "value", 1000 }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 25 })
            }),
        ]),
        "shiweifu3": ([
            "name": HIW "二品侍卫装" NOR,
            "ids": ({ "cloth" }),
            "weight": 3000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "long", "御前侍卫的统一装束。\n" }),
                ({ "value", 1000 }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 25 })
            }),
        ]),
        "taiyi_duanqun": ([
            "name": "台夷短裙",
            "ids": ({ "duan qun" }),
            "weight": 2000,
            "properties": ({
                ({ "long", "这是一件台夷短裙。\n" }),
                ({ "material", "cloth" }),
                ({ "unit", "件" }),
                ({ "value", 200 }),
                ({ "armor_prop/armor", 1 })
            }),
        ]),
        "tianying_jiaofu": ([
            "name": WHT "天鹰教服" NOR,
            "ids": ({ "ying cloth", "cloth" }),
            "weight": 3000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "long", "这是一件天鹰教服。\n" }),
                ({ "value", 300 }),
                ({ "material", "silk" }),
                ({ "armor_prop/armor", 2 })
            }),
        ]),
        "tie_beixin": ([
            "name": "铁背心",
            "ids": ({ "tie beixin", "beixin" }),
            "weight": 3000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "value", 0 }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 15 })
            }),
        ]),
        "tie_beixin2": ([
            "name": "铁背心",
            "ids": ({ "tie beixin", "beixin" }),
            "weight": 3000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "value", 0 }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 15 }),
                ({ "shaolin", 1 })
            }),
        ]),
        "tiejia": ([
            "name": "铁甲",
            "ids": ({ "armor" }),
            "weight": 20000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "material", "steel" }),
                ({ "value", 2000 }),
                ({ "armor_prop/armor", 20 })
            }),
        ]),
        "tiejia2": ([
            "name": "铁甲",
            "ids": ({ "armor" }),
            "weight": 20000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "material", "steel" }),
                ({ "value", 2000 }),
                ({ "armor_prop/armor", 50 })
            }),
        ]),
        "tiejia3": ([
            "name": "铁甲",
            "ids": ({ "armor", "tiejia" }),
            "weight": 1000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "value", 4000 }),
                ({ "material", "leather" }),
                ({ "armor_prop/armor", 10 })
            }),
        ]),
        "tiejia4": ([
            "name": "铁甲",
            "ids": ({ "armor", "jia" }),
            "weight": 28000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "value", 4000 }),
                ({ "material", "leather" }),
                ({ "armor_prop/armor", 25 })
            }),
        ]),
        "tongqun": ([
            "name": "筒裙",
            "ids": ({ "tong qun" }),
            "weight": 2000,
            "properties": ({
                ({ "long", "这是一件台夷筒裙。\n" }),
                ({ "material", "cloth" }),
                ({ "unit", "件" }),
                ({ "value", 200 }),
                ({ "armor_prop/armor", 1 })
            }),
        ]),
        "wuchang_pao": ([
            "name": HIR "无常袍" NOR,
            "ids": ({ "cloth" }),
            "weight": 3000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 1 })
            }),
        ]),
        "wuxing_fu": ([
            "name": "五行服",
            "ids": ({ "wuxingfu" }),
            "weight": 2000,
            "properties": ({
                ({ "long", "这是五行弟子练功服。\n" }),
                ({ "material", "cloth" }),
                ({ "unit", "件" }),
                ({ "value", 200 }),
                ({ "armor_prop/armor", 50 })
            }),
        ]),
        "wuyi_changqun": ([
            "name": "乌夷长裙",
            "ids": ({ "chang qun" }),
            "weight": 2000,
            "properties": ({
                ({ "long", "这是一件乌夷长裙。\n" }),
                ({ "material", "cloth" }),
                ({ "unit", "件" }),
                ({ "value", 200 }),
                ({ "armor_prop/armor", 2 })
            }),
        ]),
        "wuyi_dahui": ([
            "name": "乌夷大麾",
            "ids": ({ "da hui" }),
            "weight": 2000,
            "properties": ({
                ({ "long", "这是一件乌夷大麾。\n" }),
                ({ "material", "cloth" }),
                ({ "unit", "件" }),
                ({ "value", 200 }),
                ({ "armor_prop/armor", 3 })
            }),
        ]),
        "xiaoao": ([
            "name": "圆领小袄",
            "ids": ({ "xiao ao", "cloth" }),
            "weight": 2000,
            "properties": ({
                ({ "long", "这是一件台夷族的圆领小袄。\n" }),
                ({ "material", "cloth" }),
                ({ "unit", "件" }),
                ({ "value", 300 }),
                ({ "armor_prop/armor", 1 })
            }),
        ]),
        "yangpi_ao": ([
            "name": "羊皮袄",
            "ids": ({ "yangpi ao", "ao" }),
            "weight": 5000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "long", "这是一件灰色的羊皮袄。牧羊人不管春夏秋冬都穿着它。\n" }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 3 }),
                ({ "value", 500 })
            }),
        ]),
        "yanluo_pao": ([
            "name": HIR "阎罗袍" NOR,
            "ids": ({ "cloth" }),
            "weight": 3000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 1 })
            }),
        ]),
        "yayifu": ([
            "name": "衙役服",
            "ids": ({ "yayi cloth", "cloth" }),
            "weight": 2000,
            "properties": ({
                ({ "long", "这是一件崭新的白棉布衙役服。\n" }),
                ({ "material", "cloth" }),
                ({ "unit", "件" }),
                ({ "value", 150 }),
                ({ "armor_prop/armor", 5 })
            }),
        ]),
        "yayifu2": ([
            "name": "衙役服",
            "ids": ({ "yayi fu", "cloth" }),
            "weight": 2000,
            "properties": ({
                ({ "long", "一件黑色短装，嵌以红边，是长安府的衙役穿的．\n" }),
                ({ "material", "cloth" }),
                ({ "unit", "件" }),
                ({ "value", 500 }),
                ({ "armor_prop/armor", 10 })
            }),
        ]),
        "yexing_shuikao": ([
            "name": "夜行水靠",
            "ids": ({ "Shui kao", "kao" }),
            "weight": 1000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 5 })
            }),
        ]),
        "yinwang_pao": ([
            "name": HIB "阴王袍" NOR,
            "ids": ({ "cloth" }),
            "weight": 3000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 1 })
            }),
        ]),
        "yuchang": ([
            "name": NOR + YEL "羽氅" NOR,
            "ids": ({ "yu chang", "yu", "chang" }),
            "weight": 3000,
            "properties": ({
                ({ "unit", "领" }),
                ({ "long", NOR + YEL "这是一领用秃鹰长羽织就的大氅。\n" NOR }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 15 })
            }),
        ]),
        "yunchang": ([
            "name": HIW "云裳" NOR,
            "ids": ({ "cloth" }),
            "weight": 3000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 1 })
            }),
        ]),
        "zhaiken_ao": ([
            "name": "窄裉袄",
            "ids": ({ "ken ao" }),
            "weight": 2000,
            "properties": ({
                ({ "long", "这是一件少数民族常用的窄裉袄。\n" }),
                ({ "material", "cloth" }),
                ({ "unit", "件" }),
                ({ "value", 400 }),
                ({ "armor_prop/armor", 5 })
            }),
        ]),
        "zhanjia": ([
            "name": "战甲",
            "ids": ({ "zhan armor", "zhanjia", "jia", "armor" }),
            "weight": 40000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "long", "一件精钢造就的战甲。\n" }),
                ({ "value", 3000 }),
                ({ "material", "steel" }),
                ({ "armor_prop/armor", 40 }),
                ({ "armor_prop/dodge", -10 })
            }),
        ]),
        "zi_choushan": ([
            "name": MAG "紫绸衫" NOR,
            "ids": ({ "zichou shan", "zichou", "shan", "cloth" }),
            "weight": 2000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "material", "cloth" }),
                ({ "value", 400 }),
                ({ "armor_prop/armor", 10 })
            }),
        ]),
        "zipao": ([
            "name": "紫袍",
            "ids": ({ "zi pao", "cloth" }),
            "weight": 500,
            "properties": ({
                ({ "unit", "件" }),
                ({ "material", "cloth" }),
                ({ "value", 300 }),
                ({ "armor_prop/armor", 1 })
            }),
        ]),
        "zipao2": ([
            "name": MAG "紫袍" NOR,
            "ids": ({ "zi pao", "cloth" }),
            "weight": 3000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "value", 200 }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 5 })
            }),
        ]),
        "zise_jiasha": ([
            "name": MAG "紫色袈裟" NOR,
            "ids": ({ "jiasha", "jia sha", "cloth" }),
            "weight": 5000,
            "properties": ({
                ({ "unit", "件" }),
                ({ "material", "cloth" }),
                ({ "armor_prop/armor", 20 }),
                ({ "value", 100 })
            }),
        ])
    ]);
}
