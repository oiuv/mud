
inherit ROOM;

void create()
{
        set("short", "前厅");
        set("long", @LONG
这里是古墓的前厅，黑黝黝的，你几乎什么也看不清。全
靠大厅正中间的梁上悬挂着一颗夜明珠，映射出淡淡黄光。厅
柱都是由硕大的石柱砌成的，上面似乎还写着一些什么字--你
怎么也看不清楚了。
LONG
        );

        set("exits", ([
                "south" : __DIR__"xiaoting",
                "north" : __DIR__"mumen",
        ]));

        setup();
        replace_program(ROOM);
}
