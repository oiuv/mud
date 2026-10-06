// 普通乐器固定蓝图属性；规范 ID 自然排序，演奏复用原 MI 继承。
private mapping qin_definitions() {
    return ([
        "honghuqin": ([
            "name": RED "红木胡琴·五玄" NOR,
            "ids": ({ "hongmu huqin", "qin", "huqin", "hongmu" }),
            "weight": 800,
            "properties": ({
                ({ "unit", "把" }),
                ({ "long", RED "一把精致的红木胡琴，琴身光滑，微泛红光。\n" NOR }),
                ({ "value", 2000 }),
                ({ "material", "wood" }),
            }),
        ]),
        "huqin": ([
            "name": NOR + YEL "胡琴" NOR,
            "ids": ({ "hu qin", "hu", "qin" }),
            "weight": 600,
            "properties": ({
                ({ "unit", "把" }),
                ({ "long", NOR + YEL "这是一把普通的胡琴。\n" NOR }),
                ({ "value", 50 }),
                ({ "material", "wood" }),
            }),
        ]),
        "huqin2": ([
            "name": YEL "普通胡琴" NOR,
            "ids": ({ "hu qin", "hu", "qin" }),
            "weight": 600,
            "properties": ({
                ({ "unit", "把" }),
                ({ "long", YEL "一把普通的胡琴。\n" NOR }),
                ({ "value", 200 }),
                ({ "material", "wood" }),
            }),
        ]),
        "jiaoweiqin": ([
            "name": NOR + RED "焦尾琴" NOR,
            "ids": ({ "jiaowei qin", "jiaowei", "qin" }),
            "weight": 600,
            "properties": ({
                ({ "unit", "台" }),
                ({ "long", RED "相传这便是当年蔡文姬从火中所救出的焦木"
                    "做成的美琴，琴的\n尾端仍可见焦黑色。\n" NOR }),
                ({ "value", 10000 }),
                ({ "material", "wood" }),
            }),
        ]),
        "jiaoyeqin": ([
            "name": HIY "蕉叶古琴·明朝" NOR,
            "ids": ({ "jiaoye qin", "jiaoye", "qin" }),
            "weight": 700,
            "properties": ({
                ({ "unit", "把" }),
                ({ "long", HIY "此琴乃弘治嘉靖年间著名斫琴家祝海鹤所制\n"
                    "琴形旖旎秀逸，蕉叶卷边工雅生动，音色润\n"
                    "匀透静，为琴器中难得一见的珍品。\n" NOR }),
                ({ "value", 800000 }),
                ({ "material", "wood" }),
            }),
        ]),
        "jimo_qin": ([
            "name": WHT "七玄流银·寂寞" NOR,
            "ids": ({ "jimo qin", "jimo", "qin" }),
            "weight": 1000,
            "properties": ({
                ({ "unit", "把" }),
                ({ "long", WHT "此琴通体泛出银光，耀眼夺"
                    "目。上刻「" HIY "寂寞" WHT "」。\n" NOR }),
                ({ "value", 5000000 }),
                ({ "material", "wood" }),
            }),
        ]),
        "jiuxiaoqin": ([
            "name": MAG "九霄环佩·唐朝" NOR,
            "ids": ({ "jiuxiao qin", "jiuxiao", "qin" }),
            "weight": 600,
            "properties": ({
                ({ "unit", "把" }),
                ({ "long", MAG "这是历史最悠久的传世之琴，盛唐开元之器。\n"
                    "此琴形体饱满，上髹紫漆，间杂朱砂后补之  \n"
                    "色，贵在声形俱佳，为传世之器的极品。\n" NOR }),
                ({ "value", 400000 }),
                ({ "material", "wood" }),
            }),
        ]),
        "jueyin_qin": ([
            "name": WHT "七玄流银·绝音" NOR,
            "ids": ({ "jueyin qin", "jueyin", "qin" }),
            "weight": 1000,
            "properties": ({
                ({ "unit", "把" }),
                ({ "long", WHT "此琴通体泛出银光，耀眼夺"
                    "目。上刻「" HIR "绝音" WHT "」。\n" NOR }),
                ({ "value", 5000000 }),
                ({ "material", "wood" }),
            }),
        ]),
        "konggu_qin": ([
            "name": WHT "七玄流银·空谷" NOR,
            "ids": ({ "konggu qin", "konggu", "qin" }),
            "weight": 1000,
            "properties": ({
                ({ "unit", "把" }),
                ({ "long", WHT "此琴通体泛出银光，耀眼夺"
                    "目。上刻「" HIC "空谷" WHT "」。\n" NOR }),
                ({ "value", 5000000 }),
                ({ "material", "wood" }),
            }),
        ]),
        "muqin": ([
            "name": "木琴",
            "ids": ({ "muqin" }),
            "weight": 600,
            "properties": ({
                ({ "unit", "台" }),
                ({ "long", "一个平凡的木琴，没有什么特殊之处。\n" }),
                ({ "value", 50 }),
                ({ "material", "wood" }),
            }),
        ]),
        "shixuanqin": ([
            "name": YEL "十玄古琴·战国" NOR,
            "ids": ({ "shixuan qin", "shixuan", "qin" }),
            "weight": 700,
            "properties": ({
                ({ "unit", "把" }),
                ({ "long", YEL "这是迄今能看到的中国最早的琴类乐器，此\n"
                    "琴埋于战国曾候乙墓之中，琴长67公分，琴\n"
                    "面起伏有致。\n" NOR }),
                ({ "value", 100000 }),
                ({ "material", "wood" }),
            }),
        ]),
        "tanhuqin": ([
            "name": HIY "檀木胡琴" NOR,
            "ids": ({ "tanmu huqin", "qin", "huqin", "tanmu" }),
            "weight": 800,
            "properties": ({
                ({ "unit", "把" }),
                ({ "long", HIY "一把精致的檀木胡琴。\n" NOR }),
                ({ "value", 1000 }),
                ({ "material", "wood" }),
            }),
        ]),
        "tanmuqin": ([
            "name": NOR + YEL "檀木琴" NOR,
            "ids": ({ "tanmu qin", "tanmu", "qin" }),
            "weight": 600,
            "properties": ({
                ({ "unit", "把" }),
                ({ "long", NOR + YEL "一把檀木所制的木琴，古典雅致。\n" NOR }),
                ({ "value", 50 }),
                ({ "material", "wood" }),
            }),
        ]),
        "tianlai_qin": ([
            "name": WHT "七玄流银·天籁" NOR,
            "ids": ({ "tianlai qin", "tianlai", "qin" }),
            "weight": 1000,
            "properties": ({
                ({ "unit", "把" }),
                ({ "long", WHT "此琴通体泛出银光，耀眼夺"
                    "目。上刻「" HIG "天籁" WHT "」。\n" NOR }),
                ({ "value", 5000000 }),
                ({ "material", "wood" }),
            }),
        ]),
        "zhongniqin": ([
            "name": HIC "仲尼式琴·宋朝" NOR,
            "ids": ({ "zhongni qin", "zhongni", "qin" }),
            "weight": 500,
            "properties": ({
                ({ "unit", "把" }),
                ({ "long", HIC "此琴体扁身薄，琴体怪异，琴轸右面垂下深\n"
                    "舌罗汉腿，漆色亮绿，微泛绿光，仲尼式琴\n"
                    "为元朝主流。\n" NOR }),
                ({ "value", 200000 }),
                ({ "material", "wood" }),
            }),
        ]),
    ]);
}
