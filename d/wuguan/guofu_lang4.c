inherit ROOM;

void create()
{
        set("short", "长廊");
        set("long", @LONG
这是个长廊，北面是武馆内的物品房，要在武馆做杂事
的人都得去物品房领工具，南边是东练武场。
LONG);
        set("no_fight", 1);
        set("exits", ([
               "north" : __DIR__"guofu_wupinfang",
               "south" : __DIR__"guofu_wuchang4",
        ]));
        set("objects", ([
                __DIR__"npc/wusantong" : 1,
        ]));
        setup();
        replace_program(ROOM);
}
