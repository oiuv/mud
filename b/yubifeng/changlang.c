// changlang.c
inherit ROOM;

void create()
{
        set("short", "长廊");
        set("long", @LONG
这是一条长长的走廊，四处透着浓浓的寒气。出去就是山庄大门，沿这里走
过去可以直达大厅，周围一尘不染，非常安静。
LONG
        );
        set("exits", ([ /* sizeof() == 4 */
            "north" : __DIR__"dating",
	    "out"   : __DIR__"damen"
        ]));
        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}
