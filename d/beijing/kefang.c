inherit ROOM;

void create()
{
        set("short", "东客房");
        set("long", @LONG
一进门，只见六个喇嘛手持戒刀，围着一白衣女尼拼命砍杀，只是给白衣
女尼的袖力掌风逼住了，欺不近身。但那白衣女子头顶已冒出丝丝白气，显然
已尽了全力。她只一条臂膀，再支持下去恐怕难以抵敌。地上斑斑点点都是血
迹。
LONG );
        set("exits", ([
                "west" : __DIR__"kediandayuan",
        ]));
        set("objects", ([
                __DIR__"npc/dubi" : 1,
                __DIR__"npc/lama" : 6,
        ]));
        setup();
        replace_program(ROOM);
}

