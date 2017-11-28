#include <ansi.h>

inherit ROOM;

void create()
{
        set("short", "芝房");
        set("long", @LONG
这里是绝情谷储藏各类药材的地方，只见墙角放着一个药
柜，阵阵药味从中散发出来。
LONG);

        //set("item_desc",([
        //       "chest" : HIC "这是储藏药物的柜子，想必里面定是藏着许多珍贵的药材。\n" NOR,
        //]));

        set("exits", ([
               "east"   : __DIR__"houtang",
        ]));

        set("no_clean_up", 0);

        setup();
}
/*
void init()
{       
        add_action("do_open", ({ "open" }));
}

int do_open(string arg)
{
        object me = this_player();
        object ob;

        if (! arg || arg != "chest")
                return notify_fail("你要做什么？\n");


       return 1;
}

*/
