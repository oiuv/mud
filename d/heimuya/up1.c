inherit ROOM;
#include <ansi.h>

void create()
{
        set("short", "日月坪");
        set("long", @TEXT
这里是半山的一片小土坪，离崖顶还有一段路途，可到这
已经没有路上去，面前是如镜般的峭壁，仰头而望，但见崖顶
依稀耸立着楼阁，宛如仙境。可云烟缭绕，看不清晰。
TEXT);

        set("exits", ([
                "eastdown" : __DIR__"shimen",
        ]));
        set("objects", ([
                CLASS_D("riyue") + "/feng" : 1,
        ]));
        setup();
}

void init()
{
        add_action("do_float", "float");
        add_action("do_float", "piao");
}

int do_float()
{
        object me;

        me = this_player();

        if (me->query_skill("juechen-shenfa", 1) < 160 || me->query_skill("dodge", 1) < 160)
        {
                message_vision("$N遥望山崖，沉思良久，叹了口气。\n", me);
                return 1;
        }

        if (me->query("neili") < 100)
        {
                tell_object(me, "你的内力不够，还是休息一下再说吧。\n");
                return 1;
        }

        me->add("neili", -80);

        message_sort(HIC "\n$N" HIC "深深纳入一口气，蓦地一飞而起，朝"
                     "山崖上飘去。\n\n" NOR, me);

        me->move("/d/heimuya/shanya3");
        tell_object(me, "你顺着崖壁飘上了黑木崖。\n");
        message("vision", HIC "\n忽听一声清啸由远及近，" + me->name() +
                          HIC "顺着崖壁飘然而上，落定身形。\n" NOR,
                          environment(me), ({ me }));
        return 1;
}

