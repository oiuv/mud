#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "石道");
        set("long", @LONG
这是星宿海边有人用石头铺成的一条小道，周围弥漫着沼
泽的瘴气和一种说不出来的香味。路边有个石洞。
LONG);
        set("exits", ([ 
            	"east" : __DIR__"xxh4",
            	"enter" : __DIR__"xiaoyao",
        ]));

        set("objects", ([ 
            	__DIR__"npc/caihua" : 1,
        ]));

        set("outdoors", "xingxiu");

        setup();
}

int valid_leave(object me, string dir)
{
        mapping myfam;
        myfam = (mapping)me->query("family");

        if (dir == "enter")
	{
	        if (present("caihua zi", environment(me)))
		{
                        if (! myfam || myfam["family_name"] != "星宿派") 
                	        return notify_fail(CYN "采花子挡住了你：我的小妞可不是"
                                                   "给你们邪派弟子准备的！\n" NOR);

                        if  (me->query("gender") == "无性") 
                                return notify_fail(CYN "采花子挡住了你，一脸讥笑：您这"
                                                   "小身板还想玩妞？别开玩笑了。\n" NOR);

                        if (! (int)this_player()->query_temp("marks/花"))
                                return notify_fail(CYN "采花子挡住了你：喂，你总该意思"
                                                   "意思吧？\n" NOR);
                }
	        return 1;
        }
        return ::valid_leave(me, dir);
}
