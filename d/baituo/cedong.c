inherit ROOM;

void create()
{
        set("short", "侧洞");
        set("long", @LONG
这里是一个小小的侧洞，里面有张梳妆台，上边凌乱的摆
放着些女人的用品。
LONG);
        set("exits", ([
                "east" : __DIR__"dongnei",
        ]));
        set("objects", ([
                __DIR__"npc/jinhua" : 1,
        ]));
        setup();
        replace_program(ROOM);
}
