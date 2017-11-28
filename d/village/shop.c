// Room: /d/village/shop.c

inherit ROOM;

void create()
{
        set("short", "杂货店");
	set("long", @LONG
这是一间小小的杂货店，经营些油、盐、酱、醋及日用百货，村子里
的人多数是很穷，除了生活必需品，这里很少贩卖其它物品。
LONG
        );

        set("exits", ([ /* sizeof() == 1 */
            "south" : __DIR__"eroad3",
        ]));

        set("objects", ([
            __DIR__"npc/xiejian": 1
        ]));

        setup();
        replace_program(ROOM);
}
 
