#include <ansi.h>

inherit ROOM;

void create()
{
        set("short",HIC "练功房" NOR);
        set("long", @LONG
这是一间用花岗岩砌成的石屋。室内一只大炉中燃了洪炭，煮着热气腾
腾的一镬 (huo)东西，镬旁两个黑衣小童，一个使劲推拉风箱，另一个用铁
铲翻炒镬中之物，听这沙沙之声，所炒的似是铁沙。几名帮中弟子闭目盘膝
坐在锅前，或对着腾上的热气吐呐，或把手掌插入(charu)镬中苦练掌法。
LONG
        );
        set("exits", ([ 
                "east" : __DIR__"guangchang",
        ]));

        set("objects",([
                __DIR__"npc/heiyi" : 1,
        ]));

        set("item_desc", ([
                "huo" : HIR "\n这是一口巨大的铁锅，锅中盛满铁沙，下面燃着炭火。\n" NOR,
        ]));

        setup();
}

void init()
{
        add_action("do_cha", "charu");
}

int do_cha(string arg)
{       
//      mapping fam;
        object me;
        me = this_player();

        if ( ! living(me)) return 0;
        if ( ! living(this_player()) || arg != "huo" )
        {
                write("你想往哪儿插呀！\n");
                return 1;
        }

        if( me->is_busy() )
                return notify_fail("你现在正忙着呢。\n");

        if ( (int)me->query_skill("strike", 1) < 30 )
                return notify_fail("你将双手插入镬中，灼热的铁沙登时烫得你怪叫不止，看来还是吧掌法练高点再来吧。\n");

        if ( (int)me->query_skill("strike", 1) > 100)
                return notify_fail("你将双手插入镬中，发现用铁沙练习已丝毫提高不了你的掌法了。\n");

        if (! me->can_improve_skill("strike"))
                return notify_fail("你的实战经验不够，无法再加深你的掌法！\n");

        if((int)me->query("qi") < 40)
        {
                write("你觉得一股热气直逼上来，焦燥难当。还是休息一下再接着练吧！\n");
                return 1;
        }

        me->receive_damage("qi", 30);
        me->improve_skill("strike", me->query("con") * 2);
        me->start_busy(random(2));
        message_vision(HIR "\n$N" HIR "将双手插进镬中的铁沙里。\n" NOR, me);
        write(RED "灼热的铁沙将你的双手烫得通红，你觉得双手登时变得更加强壮有力了。\n" NOR);
        return 1;
}