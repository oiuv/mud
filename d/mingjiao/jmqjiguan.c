#include <room.h>
#include <ansi.h>

inherit ROOM;

void create()
{ 
        set("short", "巨木旗机关");
        set("long",@LONG
你眼前骤然一暗，朦胧中，只见左右前后，到处都是铺天盖地
的不知名的巨树，好象松柏，又似冷杉，簇在一起，密实的枝叶象
一蓬蓬巨伞般伸向天空，遮天蔽日。你似乎迷失了方向，象没头苍
蝇般到处乱闯。
LONG );
	set("exits", ([
		"east" :  __FILE__,
		"west" :  __FILE__,
		"south" : __FILE__,
		"north" : __FILE__,
	]));             
	set("no_clean_up", 0);
        setup();
}
void init()
{
    this_player()->receive_damage("qi", 15);
    this_player()->receive_wound("qi",  15);
    message_vision(HIG"突然一阵巨木桩遮天蔽日凌空砸向$N！\n"NOR, this_player());
}

int valid_leave(object me, string dir)
{
        int total_steps ;
        mapping myfam;
        total_steps = 10 ;
        if ( total_steps <= 0 ) total_steps = 1 ;  
        myfam = (mapping) this_player()->query("family");
        if(myfam && myfam["family_name"] == "明教") total_steps = 1 ; 
	if ( dir == "west")
            me->add_temp("mingjiao/steps",1);
	if ( dir == "east")
            me->add_temp("mingjiao/steps",-1);

	if (me->query_temp("mingjiao/steps") == total_steps)
        {
     	    me->move(__DIR__"jmqshenmu");
            me->delete_temp("mingjiao/steps");
                return notify_fail("你走了半天，终于走到神木。真累! \n");
        }  

        if (me->query_temp("mingjiao/steps") == - total_steps )
        {  
	     me->move(__DIR__"jmqshulin6");
             me->delete_temp("mingjiao/steps");
             return notify_fail("你走了半天，终于走出了巨木旗机关。\n");
     	}

        return ::valid_leave(me,dir);
}
