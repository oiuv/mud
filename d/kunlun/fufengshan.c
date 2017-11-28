#include <ansi.h>
#include <room.h>
inherit ROOM;

void create()
{
        set("short", "扶峰山");
        set("long", @LONG
扶峰山的山壁 (cliff)极高且十分陡峭，山腰以上尽没入
茫茫云海，峰顶终年积雪，山腰以下却是郁郁苍苍，林木茂密
花团锦簇，春意烂漫。
LONG);
        set("outdoors", "kunlun");

        set("exits", ([
                "enter" : __DIR__"houyuan",
                "northeast" : __DIR__"bainiushan",
        ]));

        set("item_desc", ([
                "cliff" : "扶峰山山壁很是陡峭，看样子要攀爬(climb)上去并不容易。\n",
        ]));

        set("no_clean_up",0);
        create_door("enter", "小门", "out", DOOR_CLOSED);
        setup();
}

void init()
{
        add_action("do_climb", "climb");
}

int do_climb()
{
        object me = this_player();

        message_vision(HIY "$N" HIY "深吸了一口气，飞身向山崖奔去。\n" NOR, me);

        if (random(me->query_skill("dodge", 1)) <= 30)
        {
                me->receive_damage("qi", 50);
                me->receive_wound("qi", 50);
                message_vision(HIR "只见$N" HIR "一不小心脚下踏空，摔了下来。\n" NOR, me);
                me->move(__DIR__"fufengshan");
                tell_object(me, HIR "你从山上滚了下来，只觉得浑身疼痛无比，还受了几处伤。\n" NOR);

                message("vision", HIR "只见" + me->query("name") + HIR "从山上骨碌碌地滚了"
                                  "下来，躺在地上半天爬不起来！\n" NOR, environment(me), ({me}));
                return 1;
        }
        message("vision", HIY + me->name() + HIY "提一口真气，足尖连点数下，奔上山去。\n",
                          environment(me), ({me}) );
        me->move(__DIR__"sanshengao");

        message_vision(HIY "$N" HIY "从下面的扶峰山山脚爬了上来。\n" NOR, me);

        return 1;
}
