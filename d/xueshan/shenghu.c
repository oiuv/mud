#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "圣湖");
        set("long", @LONG
眼前就是著名的圣湖，碧蓝的湖面倒影着蓝天和白云，浩
淼的水面让人心旷神怡。金碧辉煌的大轮寺清晰可见，再远处
是几座延绵的大雪山，其中最高大的是神山，相传山中有神仙
居住。雪山中融化的雪水都汇入湖中。但是周围却是被极浓的
雾气所笼罩，使你的眼前一片朦胧，瞧不清四周。
LONG );
        set("resource/water", 1);
        set("exits", ([
                "east" :  __FILE__,
                "west" :  __FILE__,
                "south" : __FILE__,
                "north" : __FILE__,
        ]));
        set("objects", ([
                "/clone/npc/walker" : 1,
        ]));
        set("outdoors", "xuedao");

        setup();
}

int valid_leave(object me, string dir)
{
        int total_steps;

        if (! userp(me)
           || me->query("family/family_name") == "大轮寺"
           || me->query("family/family_name") == "血刀门")
        {
                total_steps = 1; 
        } else
        {
                me->receive_damage("jing", 5);
                me->receive_wound("jing", 5);
                message_vision(HIM "\n突然间$N" HIM "发现眼前的景象有"
                               "些迷乱，不禁觉得头晕目眩。\n\n" NOR, me);

                total_steps = 5;
        }

        if (dir == "east")
                me->add_temp("taohua/steps", 1);

        if (dir == "south")
                me->add_temp("taohua/steps", -1);

        if (me->query_temp("taohua/steps") == total_steps)
        {
                me->move(__DIR__"hubian1");
                me->delete_temp("taohua/steps");
                write(HIC "\n雾气散开，你的眼前豁然开朗起来。\n\n" NOR);
                return -1;
        }  

        if (me->query_temp("taohua/steps") == - total_steps)
        {  
                me->move(__DIR__"tulu3");
                me->delete_temp("taohua/steps");
                write(HIC "\n雾气散开，你的眼前豁然开朗起来。\n\n" NOR);
                return -1;
        }

        return ::valid_leave(me, dir);
}
