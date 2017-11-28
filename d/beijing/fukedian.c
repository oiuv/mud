inherit ROOM;

void create()
{
        set("short", "虎坊客栈");
        set("long", @LONG
这是京城虎坊路街头邻街的一家客栈。客栈不大，前厅挂着一幅猛虎下山
的巨画。当门挂着对鸳鸯球。球上系着几个小小的黄铜风铃。微风掠过，风铃
发出清脆悦耳的叮咚声。上有横批“虎坊客栈”。
LONG );
        set("no_fight", 1);
        set("valid_startroom", 1);
        set("objects", ([
                __DIR__"npc/xiaoer3" : 1,
        ]));
        set("exits", ([
                "south" : __DIR__"fu_2",
                "north" : __DIR__"kediandayuan",
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
