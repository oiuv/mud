
#include <ansi.h>
inherit ROOM; 

void create() 
{ 
        set("short", HIR "血池地狱" NOR);
        set("long", HIR @LONG
血池地狱，你疑心怎么从酆都走到这里来了的。四处弥漫着浓厚的
血雾，你什么也看不清楚，空中浮动着若隐若现的鬼火，血池里到处是
死人肉和沸腾的鲜血，十分恐怖。

LONG NOR);
        set("no_clean_up", 0);
        
        set("exits", ([ /* sizeof() == 2 */
                "south" : __DIR__"yanluodian",
                "down"  : "/d/death/xuechi2",
        ]));
       
        setup();
}

int valid_leave(object me, string dir)
{
        int i;
        object ob;
        me = this_player();
        if (dir == "down")
        {
                if (! present("qilin xue", me) || 
                    ! objectp(ob = me->query_temp("armor/boots")) ||
                    ob->query("id") != "qilin xue") 
                        return notify_fail(CYN "你没有穿麒麟靴无法进入沸腾的血池中！\n" NOR);
        }
        return ::valid_leave(me, dir);
}
