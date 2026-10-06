// 普通研读物；规范 ID 自然排序，随机候选只保存数据，不在建表时抽样。
private mapping book_definitions() {
    return ([
        "baibian_shentong": ([
            "name": HIB "〖" HIY + "百变神通" HIB + "〗" NOR,
            "ids": ({ "book", "shu" }),
            "weight": 600,
            "properties": ({
                ({ "unit", "本" }),
                ({ "value", 1000 }),
                ({ "material", "paper" }),
                ({ "long", "一本可以学习易容术的书。\n" }),
                ({ "value", 100 }),
                ({ "skill", ([
                    "name": "pretending",
                    "exp_required": 1000,
                    "jing_cost": 20,
                    "difficulty": 30,
                    "max_skill": 200,
                ]) }),
            }),
        ]),
        "bojuan": ([
            "name": "薄绢",
            "ids": ({ "silk", "shu", "book" }),
            "weight": 50,
            "properties": ({
                ({ "unit", "束" }),
                ({ "long", "这是小册易筋经修行篇\n"
                    "由一束薄绢钉成，里面密密麻麻的画了不少打坐吐纳的姿势。\n" }),
                ({ "value", 500 }),
                ({ "material", "silk" }),
                ({ "skill", ([
                    "name": "force",    // name of the skill
                    "exp_required": 0,    // minimum combat experience required
                    "jing_cost": 10,    // jing cost every time study this
                    "difficulty": 20,    // the base int to learn this skill
                    "max_skill": 99    // the maximum level you can learn
                ]) }),
            }),
        ]),
        "boluomi_jing": ([
            "name_choices": ({ "波罗蜜多心经" }),
            "ids": ({ "shu", "book" }),
            "weight": 200,
            "properties": ({
                ({ "unit", "本" }),
                ({ "long", "这是一册佛经。\n" }),
                ({ "value", 500 }),
                ({ "material", "paper" }),
                ({ "skill", ([
                    "name": "buddhism",     // name of the skill
                    "exp_required": 0,      // minimum combat experience required
                    "jing_cost": 20,     // jing cost every time study this
                    "difficulty": 20,     // the base int to learn this skill
                    "max_skill": 100     // the maximum level you can learn
                ]) }),
            }),
        ]),
        "chaizhao_mishu": ([
            "name": "拆招秘术",
            "ids": ({ "book" }),
            "weight": 50,
            "properties": ({
                ({ "unit", "本" }),
                ({ "long", "这是一本薄薄的小册，上面绘了许多互相打斗的人像。\n" }),
                ({ "value", 0 }),
                ({ "material", "paper" }),
                ({ "skill", ([
                    "name": "parry",        // name of the skill
                    "exp_required": 0,      // minimum combat experience required
                    "jing_cost": 20,     // jing cost every time study this
                    "difficulty": 20,     // the base int to learn this skill
                    "max_skill": 50      // the maximum level you can learn
                ]) }),
            }),
        ]),
        "changsheng_jue": ([
            "name": HIW "长生决" NOR,
            "ids": ({ "changsheng jue", "book", "jue" }),
            "weight": 50,
            "properties": ({
                ({ "unit", "本" }),
                ({ "long", "这便是四大奇书之一的长生决，传说可以修炼至高无上的武学。\n" }),
                ({ "value", 300 }),
                ({ "material", "paper" }),
                ({ "skill", ([
                    "name": "changsheng-jue",        // name of the skill
                    "exp_required": 100000,      // minimum combat experience required
                    "jing_cost": 50,     // jing cost every time study this
                    "difficulty": 50,     // the base int to learn this skill
                    "max_skill": 250      // the maximum level you can learn
                ]) }),
            }),
        ]),
        "daodejing1": ([
            "name": "道德经「上卷」",
            "ids": ({ "jing", "daode jing" }),
            "weight": 200,
            "jing_cost_random": 10,
            "properties": ({
                ({ "unit", "本" }),
                ({ "long", "这是一册道德经「上卷」，由体道第一始至去用第四十止。\n" }),
                ({ "value", 500 }),
                ({ "material", "paper" }),
                ({ "skill", ([
                    "name": "taoism",       // name of the skill
                    "exp_required": 50000,      // minimum combat experience required
                    "jing_cost": 20,  // jing cost every time study this
                    "difficulty": 25,     // the base int to learn this skill
                    "max_skill": 99,     // the maximum level you can learn
                ]) }),
            }),
        ]),
        "daodejing2": ([
            "name": "道德经「下卷」",
            "ids": ({ "jing", "daode jing" }),
            "weight": 200,
            "jing_cost_random": 20,
            "properties": ({
                ({ "unit", "本" }),
                ({ "long", "这是一册道德经「下卷」，由同异第四十一始至显质第八十一止。\n" }),
                ({ "value", 500 }),
                ({ "material", "paper" }),
                ({ "skill", ([
                    "name": "taoism",       // name of the skill
                    "exp_required": 150000,      // minimum combat experience required
                    "jing_cost": 20,     // jing cost every time study this
                    "difficulty": 35,     // the base int to learn this skill
                    "max_skill": 179,    // the maximum level you can learn
                    "min_skill": 100,
                ]) }),
            }),
        ]),
        "daofa_jianjie": ([
            "name": "〖刀法简介〗",
            "ids": ({ "blade book", "book" }),
            "weight": 600,
            "properties": ({
                ({ "unit", "本" }),
                ({ "value", 1000 }),
                ({ "material", "paper" }),
                ({ "skill", ([
                    "name": "blade",
                    "exp_required": 100,
                    "sen_cost": 20,
                    "difficulty": 20,
                    "max_skill": 20,
                ]) }),
            }),
        ]),
        "dujing2": ([
            "name": YEL "「毒经中篇」" NOR,
            "ids": ({ "du jing2", "jing2", "book2" }),
            "weight": 50,
            "properties": ({
                ({ "unit", "本" }),
                ({ "long", YEL "这是一本薄薄的小册，上面密密麻麻的记满"
                    "了各种用毒的法门。\n" NOR }),
                ({ "value", 100 }),
                ({ "no_sell", "我…我的天…连五毒教的东西你都敢拿来卖？" }),
                ({ "material", "silk" }),
                ({ "skill", ([
                    "name": "poison",
                    "exp_required": 100000,
                    "jing_cost": 40,
                    "difficulty": 40,
                    "min_skill": 50,
                    "max_skill": 99,
                ]) }),
            }),
        ]),
        "feilong_tanyun": ([
            "name": YEL "飞龙探云秘芨" NOR,
            "ids": ({ "tanyun miji", "book", "miji" }),
            "weight": 50,
            "properties": ({
                ({ "unit", "本" }),
                ({ "long", "李逍遥的家传绝学。\n" }),
                ({ "value", 500 }),
                ({ "material", "paper" }),
                ({ "skill", ([
                    "name": "feilong-shou",        // name of the skill
                    "exp_required": 0,      // minimum combat experience required
                    "jing_cost": 100,     // jing cost every time study this
                    "difficulty": 100,     // the base int to learn this skill
                    "max_skill": 150      // the maximum level you can learn
                ]) }),
            }),
        ]),
        "fojing1": ([
            "name_choices": ({ "般若经", "维摩经", "法华经", "华严经" }),
            "ids": ({ "shu", "book" }),
            "weight": 200,
            "properties": ({
                ({ "unit", "本" }),
                ({ "long", "这是一册佛经。\n" }),
                ({ "value", 500 }),
                ({ "material", "paper" }),
                ({ "skill", ([
                    "name": "buddhism",    // name of the skill
                    "exp_required": 0,    // minimum combat experience required
                    "jing_cost": 10,    // jing cost every time study this
                    "difficulty": 10,    // the base int to learn this skill
                    "max_skill": 50    // the maximum level you can learn
                ]) }),
            }),
        ]),
        "fojing2": ([
            "name_choices": ({ "般若经", "维摩经", "法华经", "华严经" }),
            "ids": ({ "shu", "book" }),
            "weight": 200,
            "properties": ({
                ({ "unit", "本" }),
                ({ "long", "这是一册佛经。\n" }),
                ({ "value", 500 }),
                ({ "material", "paper" }),
                ({ "skill", ([
                    "name": "buddhism",    // name of the skill
                    "exp_required": 0,    // minimum combat experience required
                    "jing_cost": 20,    // jing cost every time study this
                    "difficulty": 20,    // the base int to learn this skill
                    "max_skill": 100    // the maximum level you can learn
                ]) }),
            }),
        ]),
        "fojing3": ([
            "name_choices": ({ "无量寿经", "大般涅磐经", "阿含经", "金刚经", "波罗蜜多心经" }),
            "ids": ({ "shu", "book" }),
            "weight": 200,
            "properties": ({
                ({ "unit", "本" }),
                ({ "long", "这是一册佛经。\n" }),
                ({ "value", 500 }),
                ({ "material", "paper" }),
                ({ "skill", ([
                    "name": "mahayana",  // name of the skill
                    "exp_required": 0,  // minimum combat experience required
                    "jing_cost": 10,     // jing cost every time study this
                    "difficulty": 10,     // the base int to learn this skill
                    "max_skill": 50     // the maximum level you can learn
                ]) }),
            }),
        ]),
        "fojing4": ([
            "name_choices": ({ "无量寿经", "大般涅磐经", "阿含经", "金刚经", "波罗蜜多心经" }),
            "ids": ({ "shu", "book" }),
            "weight": 200,
            "properties": ({
                ({ "unit", "本" }),
                ({ "long", "这是一册佛经。\n" }),
                ({ "value", 500 }),
                ({ "material", "paper" }),
                ({ "skill", ([
                    "name": "mahayana",  // name of the skill
                    "exp_required": 0,  // minimum combat experience required
                    "jing_cost": 20,     // jing cost every time study this
                    "difficulty": 20,     // the base int to learn this skill
                    "max_skill": 100     // the maximum level you can learn
                ]) }),
            }),
        ]),
        "fojing5": ([
            "name_choices": ({ "无量寿经", "大般涅磐经", "阿含经", "金刚经", "波罗蜜多心经" }),
            "ids": ({ "shu", "book" }),
            "weight": 200,
            "properties": ({
                ({ "unit", "本" }),
                ({ "long", "这是一册佛经。\n" }),
                ({ "value", 500 }),
                ({ "material", "paper" }),
                ({ "skill", ([
                    "name": "buddhism",    // name of the skill
                    "exp_required": 0,    // minimum combat experience required
                    "jing_cost": 20,    // jing cost every time study this
                    "difficulty": 20,    // the base int to learn this skill
                    "max_skill": 100    // the maximum level you can learn
                ]) }),
            }),
        ]),
        "jingang_jing": ([
            "name_choices": ({ "金刚经" }),
            "ids": ({ "shu", "book" }),
            "weight": 200,
            "properties": ({
                ({ "unit", "本" }),
                ({ "long", "这是一册佛经。\n" }),
                ({ "value", 500 }),
                ({ "material", "paper" }),
                ({ "skill", ([
                    "name": "buddhism",     // name of the skill
                    "exp_required": 0,      // minimum combat experience required
                    "jing_cost": 20,     // jing cost every time study this
                    "difficulty": 20,     // the base int to learn this skill
                    "max_skill": 100     // the maximum level you can learn
                ]) }),
            }),
        ]),
        "kunlun_miji": ([
            "name_choices": ({ "昆仑派秘籍" }),
            "ids": ({ "shu", "book" }),
            "weight": 200,
            "properties": ({
                ({ "unit", "本" }),
                ({ "long", "这是昆仑派内功心法的秘籍。\n" }),
                ({ "value", 500 }),
                ({ "material", "paper" }),
                ({ "skill", ([
                    "name": "force",     // name of the skill
                    "exp_required": 1000,      // minimum combat experience required
                    "jing_cost": 15,     // jing cost every time study this
                    "difficulty": 20,     // the base int to learn this skill
                    "max_skill": 41      // the maximum level you learn
                ]) }),
            }),
        ]),
        "lengjia_jing": ([
            "name": YEL "「楞伽经」" NOR,
            "ids": ({ "lengjia jing", "jing", "book" }),
            "weight": 300,
            "properties": ({
                ({ "unit", "本" }),
                ({ "long", YEL "这是一本薄薄的经书，只因油布包得紧密，虽长期\n"
                    "藏在猿腹之中，书页仍然完好无损。书面上写著几\n"
                    "个弯弯曲曲的文字，你却是一个也不识得。\n" NOR }),
                ({ "value", 10 }),
                ({ "material", "silk" }),
                ({ "skill", ([
                    "name": "buddhism",
                    "exp_required": 1000,
                    "jing_cost": 10,
                    "difficulty": 10,
                    "max_skill": 50,
                    "min_skill": 0,
                    "need": ([ "sanscrit": 500 ]),
                ]) }),
            }),
        ]),
        "niepan_jing": ([
            "name_choices": ({ "大般涅磐经" }),
            "ids": ({ "shu", "book" }),
            "weight": 200,
            "properties": ({
                ({ "unit", "本" }),
                ({ "long", "这是一册佛经。\n" }),
                ({ "value", 500 }),
                ({ "material", "paper" }),
                ({ "skill", ([
                    "name": "buddhism",     // name of the skill
                    "exp_required": 0,      // minimum combat experience required
                    "jing_cost": 20,     // jing cost every time study this
                    "difficulty": 20,     // the base int to learn this skill
                    "max_skill": 100     // the maximum level you can learn
                ]) }),
            }),
        ]),
        "qinggong_pian": ([
            "name": "轻功篇",
            "ids": ({ "dodgebook", "shu", "book" }),
            "weight": 100,
            "properties": ({
                ({ "unit", "本" }),
                ({ "long", "轻功篇\n"
                    "这是一本还施水阁的轻功藏本，书色泛黄，有不少的批注。\n" }),
                ({ "value", 500 }),
                ({ "material", "paper" }),
                ({ "skill", ([
                    "name": "dodge",        // name of the skill
                    "exp_required": 10000,  // minimum combat experience required
                    "jing_cost": 1,      // jing cost every time study this
                    "difficulty": 20,     // the base int to learn this skill
                    "max_skill": 100     // the maximum level you can learn
                ]) }),
            }),
        ]),
        "quanfa_jianjie": ([
            "name": "〖拳法简介〗",
            "ids": ({ "unarmed book", "book" }),
            "weight": 600,
            "properties": ({
                ({ "unit", "本" }),
                ({ "long", "〖拳法简介〗\n" }),
                ({ "value", 1000 }),
                ({ "material", "paper" }),
                ({ "skill", ([
                    "name": "unarmed",
                    "exp_required": 100,
                    "sen_cost": 20,
                    "difficulty": 20,
                    "max_skill": 20,
                ]) }),
            }),
        ]),
        "shiban": ([
            "name": "石板",
            "ids": ({ "stone", "shu", "book" }),
            "weight": 500,
            "skill_choices": ({ "finger", "claw", "strike", "cuff", "hand" }),
            "properties": ({
                ({ "unit", "块" }),
                ({ "long", "易筋经拳法篇\n"
                    "这是一块圆圆的石板，似乎用手指刻划了数个指印。\n" }),
                ({ "value", 500 }),
                ({ "material", "stone" }),
                ({ "skill", ([
                    "name": 0,    // name of the skill
                    "exp_required": 0,    // minimum combat experience required
                    "jing_cost": 20,    // jing cost every time study this
                    "difficulty": 20,    // the base int to learn this skill
                    "max_skill": 49    // the maximum level you can learn
                ]) }),
            }),
        ]),
        "siji_jianfa": ([
            "name": HIC "四季剑法" NOR,
            "ids": ({ "jianfa miji", "book", "miji" }),
            "weight": 50,
            "properties": ({
                ({ "unit", "本" }),
                ({ "long", "这是一本薄薄的小册，上面记载了四季剑法的奥诀。\n" }),
                ({ "value", 30 }),
                ({ "material", "paper" }),
                ({ "skill", ([
                    "name": "siji-jianfa",        // name of the skill
                    "exp_required": 0,      // minimum combat experience required
                    "jing_cost": 50,     // jing cost every time study this
                    "difficulty": 50,     // the base int to learn this skill
                    "max_skill": 150      // the maximum level you can learn
                ]) }),
            }),
        ]),
        "tiexian_quan": ([
            "name": CYN "铁线拳密芨" NOR,
            "ids": ({ "miji", "book" }),
            "weight": 50,
            "properties": ({
                ({ "unit", "本" }),
                ({ "long", "这是一本薄薄的小册，上面记载了不少精妙的拳法。\n" }),
                ({ "value", 0 }),
                ({ "material", "paper" }),
                ({ "skill", ([
                    "name": "tiexian-quan",        // name of the skill
                    "exp_required": 0,      // minimum combat experience required
                    "jing_cost": 20,     // jing cost every time study this
                    "difficulty": 20,     // the base int to learn this skill
                    "max_skill": 150      // the maximum level you can learn
                ]) }),
            }),
        ]),
        "wuliang_jing": ([
            "name_choices": ({ "无量寿经" }),
            "ids": ({ "shu", "book" }),
            "weight": 200,
            "properties": ({
                ({ "unit", "本" }),
                ({ "long", "这是一册佛经。\n" }),
                ({ "value", 500 }),
                ({ "material", "paper" }),
                ({ "skill", ([
                    "name": "buddhism",     // name of the skill
                    "exp_required": 0,      // minimum combat experience required
                    "jing_cost": 20,     // jing cost every time study this
                    "difficulty": 20,     // the base int to learn this skill
                    "max_skill": 100     // the maximum level you can learn
                ]) }),
            }),
        ]),
        "xuedao_jing": ([
            "name": HIR "【血刀刀谱】" NOR,
            "ids": ({ "book", "shu" }),
            "weight": 600,
            "properties": ({
                ({ "unit", "本" }),
                ({ "long", "封面上写著 " + HIR "【血刀刀谱】" NOR + "，还画着一些奇形怪状的倒立人形。\n" }),
                ({ "value", 0 }),
                ({ "material", "paper" }),
                ({ "skill", ([
                    "name": "blade",        // name of the skill
                    "exp_required": 1000,            // minimum combat experience required
                    // to learn this skill.
                    "jing_cost": 20,                // jing cost every time study this
                    "difficulty": 20,                // the base int to learn this skill
                    // modify is jing_cost's (difficulty - int)*5%
                    "max_skill": 40                // the maximum level you can learn
                    // from this object.
                ]) }),
            }),
        ]),
        "yueshan_yishu": ([
            "name": WHT "岳山遗书" NOR,
            "ids": ({ "yishu", "shu", "book" }),
            "weight": 50,
            "properties": ({
                ({ "unit", "本" }),
                ({ "long", "这便是当年「霸刀」岳山临死前的遗书，上面记载了他对刀法的体会。\n" }),
                ({ "value", 100 }),
                ({ "material", "paper" }),
                ({ "skill", ([
                    "name": "badao-daofa",        // name of the skill
                    "exp_required": 500000,      // minimum combat experience required
                    "jing_cost": 80,     // jing cost every time study this
                    "difficulty": 80,     // the base int to learn this skill
                    "max_skill": 150      // the maximum level you can learn
                ]) }),
            }),
        ]),
        "zhu_pian": ([
            "name": "旧竹片",
            "ids": ({ "bamboo", "shu", "book" }),
            "weight": 100,
            "properties": ({
                ({ "unit", "片" }),
                ({ "long", "易筋经轻功篇\n"
                    "这是一片两边去皮的旧竹片，正面和背面都画了无数个飞翔纵跃的小图形。\n" }),
                ({ "value", 500 }),
                ({ "material", "bamboo" }),
                ({ "skill", ([
                    "name": "dodge",    // name of the skill
                    "exp_required": 0,    // minimum combat experience required
                    "jing_cost": 10,    // jing cost every time study this
                    "difficulty": 20,    // the base int to learn this skill
                    "max_skill": 99    // the maximum level you can learn
                ]) }),
            }),
        ]),
    ]);
}
