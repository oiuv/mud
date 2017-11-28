inherit ROOM;

void create()
{
        set("short", "长廊");
        set("long", @LONG
这是个长廊，通向馆主的卧室，这里静悄悄的，没有什么
人来，走廊两边爬满了爬山虎，外面烈日，可是你走在走廊里
只觉得一阵清凉。
LONG);
        set("no_fight", 1);
        set("exits", ([
               "south" : __DIR__"guofu_dating",
               "north" : __DIR__"guofu_huayuan",
        ]));
        set("objects", ([
           	__DIR__"npc/yahuan" : 1,
        ]));
        setup();
        replace_program(ROOM);
}
