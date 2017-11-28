
#include <ansi.h>
inherit ROOM;

int do_sleep(string arg);

void create()
{
        set("short", "正厅");
        set("long", @LONG
这里是古墓的正厅，本来应停放灵柩棺木之类的东西，却
不知道被人搬到哪里去了。厅正中端坐着一位白衣少女，厅角
上摆放着一张石头做成的大床(chuang)，厅中横系着一条绳子，
不知道做什么用的，除此之外，别无摆设。
LONG
        );

        set("exits", ([
                "west" : __DIR__"liangong",
                "north" : __DIR__"xiaoting",
                "south" : __DIR__"houting",
        ]));
/*
        set("objects", ([
                CLASS_D("gumu") + "/longnv" : 1,             	
        ]));
*/
        set("valid_startroom",1);

        set("item_desc", ([
        	"chuang": HIC "这是一张用" HIW "千年寒玉" HIC "雕成的寒玉床。\n" NOR,
        ]) );
        setup();
        "/clone/board/gumu_b"->foo();
}

void init()
{
        add_action("do_sleep", "sleep");
}

int do_sleep(string arg)
{
        object me=this_player();
        int lvl_force;

        lvl_force = (int)me->query_skill("force", 1);
        if (me->is_busy())
        {
                tell_object(me, RED "你觉得现在内息未定，经脉隐隐还能感到真气冲荡，不敢继续调息。\n" NOR);
                return 1;
        }
        if (lvl_force > 100)
        {
        	if ( me->query("max_neili") < 200 ) //增加内力限制
        		{
                write(HIR"你现在的内力修为太低无法抵御寒玉床的寒气，去练练再来吧。\n"NOR);
                return 1;
             }
             /*
        	if ( me->query("max_neili") > 2000 ) //增加内力限制
                {
                write(HIR"以你现在的内力修为再躺寒玉床已经没什么用了。\n"NOR);
                return 1;
                }
                */
                
                if ( me->query("max_neili") > 2000 && me->query("family/family_name") != "古墓派" ) //增加内力限制
                {
                write(HIR"以你现在的内力修为再躺寒玉床已经没什么用了。\n"NOR);
                return 1;
                } else
                	
                if ( me->query("max_neili") > 3000) //古墓增加福利 2017-02-20
                {
                write(HIR"以你现在的内力修为再躺寒玉床已经没什么用了。\n"NOR);
                return 1;
                }
                
                message_vision(HIC "\n$N" HIC "躺上了寒玉床，开始潜运内功，使内"
                               "息遍行大小周天。\n", this_player());
                if (random(20) > 10 && (int)me->query("max_neili") < (int)me->query_neili_limit())
                {
                        message_vision(HIM "\n$N" HIM" 调息完毕，只觉得精神健旺"
                                       "，内息充沛欲奔腾而出。\n" NOR, this_player());
                        me->add("max_neili", 1);
                        //me->start_busy(3 + random(5));
                        me->start_busy(2 + random(2));//减少busy
                        me->receive_damage("qi", lvl_force / 3 + random(lvl_force / 3));
                }
                else
                {
                        message_vision(HIY "\n$N" HIY "调息完毕，站起身来，提了提内力"
                                       "，好象没什么长进。\n" NOR, this_player());
                        //me->start_busy(1 + random(2));
                        me->start_busy(1); //减少busy
                        me->receive_damage("qi", 10 + random(10));
                }
        } else
        {
                message_vision(HIW "\n$N" HIW "躺上寒玉床，只觉得冰冷刺骨，‘啊’"
                               "的一声狼狈不堪地跳了起来。\n", this_player());
        }
        return 1;
}

