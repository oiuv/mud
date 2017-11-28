inherit ROOM;

void create()
{
        set("short", "秘密通道");
        set("long", @LONG
这是一段又长又黑的秘密通道，隐约可以感觉到四周是冰
冷而坚硬的石壁，你什么了看不清楚，只能靠摸索着前进。
LONG );
        set("exits", ([
                "out" : __DIR__"qingcaop",
                "down": __DIR__"shishi",
        ]));
        setup();
        replace_program(ROOM);
}
