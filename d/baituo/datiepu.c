inherit ROOM;

void create()
{
        set("short", "铁铺");
        set("long", @LONG
这里是白驼山庄下面的一家打铁铺，不时从里面传来叮叮
咚咚的响声。铁匠忙着打制铁制兵器，卖给江湖侠客。
LONG);
        set("exits", ([
                "north" : __DIR__"dongjie",
        ]));
        set("objects", ([
                __DIR__"npc/smith" : 1,
        ]));
        setup();
        replace_program(ROOM);
}
