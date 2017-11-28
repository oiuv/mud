#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", GRN "【青龙洞】" NOR);
        set("long", GRN @LONG

                    青         龙         洞

    这里是阴司碧水寒潭最深处的一个洞穴，洞的上部空旷，存有少量
的空气，你终于可以换气了。传说四神兽之首的青龙就栖息于此地。洞
内幽暗无比，令你根本看不清周围的事物，很难追寻(xun) 到青龙的踪
影。潭水冰冷刺骨，令人难以忍受，你只觉得气力在一点一点消失。洞
穴深处有一股凛冽的寒流形成了一个急速流动的旋涡(xuanwo)。

LONG NOR );

        set("objects", ([
                __DIR__"obj/shuizao" : 1,
        ]));

        set("item_desc", ([
                "xuanwo" : HIW "\n一股由寒流形成的旋涡，你似乎"
                           "可以通过它回到地面。\n" NOR,
        ]));

        set("qinglong", 1);
        setup();
}

void init()
{
        object me;
        int meqi, meneili, decqi, mq;
        me = this_player();

        add_action("do_move", "enter");
        add_action("do_xun", "xun");

        if (me->query("id") == "qing long"
           || present("diyin xuemai", me))
        {
                tell_object(me, RED "你怀中的地阴血脉发出一阵阵热"
                                "量，护住了周身的经脉！\n" NOR);
                return 0;
        }
        tell_object(me, HIW "你身陷碧水寒潭，潭中寒冰削肉刮骨，你"
                                "只觉浑身血液都被冻住一般！\n" NOR);
        me->set_temp("die_reason", "在碧水寒潭给活活冻死了");
        me->die();
        return 0;
}

int do_xun(string arg)
{
        object me = this_player();
        object ob;
        object ob1;

        if (objectp(present("qing long", environment(me))))
                return notify_fail("青龙已经现身了，还寻什么呀，赶快战斗吧！\n");

        if (query("qinglong") < 1)
                return notify_fail("青龙已经被宰了，你再怎么寻也是寻不到的！\n");

        if (me->is_busy())
                return notify_fail("你现在正忙着呢。\n");
       
        if ((int)me->query("jing") < 100)
                return notify_fail("你太累了，稍微休息一下吧。\n");

        if ((int)me->query("qi") < 100)
                return notify_fail("你太累了，稍微休息一下吧。\n");

        message_vision(HIC "\n$N" HIC "在洞内四处游走，不放过半点蛛"
                       "丝马迹，仔细的搜寻着洞穴内的一切。\n" NOR, me); 
        remove_call_out("xun"); 
        call_out("xun", 5, me);
        me->start_busy(5);
        return 1;
}
 
int xun(object me)
{ 
        object ob;
        object ob1;
        if (random(10) < 6)
        {
                me->receive_damage("jing", 50 + random(50));
                me->receive_damage("qi", 50 + random(50));
                me->start_busy(5);
                message_vision(WHT "$N" WHT "寻觅了半天，还是没发现青"
                               "龙出没的迹象，一口气再也憋不住，连忙"
                               "游到洞的上部换气。\n" NOR, me);
                return 1;
        }

        if (random(10) < 5)
        {
                me->receive_damage("jing", 50 + random(50));
                me->receive_damage("qi", 50 + random(50));
                me->start_busy(5);
                message_vision(HIY "结果$N" HIY "一转身，双脚不小心被"
                              "岩壁上伸出的水藻缠住，费了好大劲才挣扎"
                              "开。\n" NOR, me);
                return 1;
        }

   else if (random(10) < 4) 
        {         
                me->receive_damage("jing", 300 + random(50));
                me->receive_damage("qi", 300 + random(50));
                me->receive_wound("jing", 200 + random(50));
                me->receive_wound("qi", 200 + random(50));
                me->start_busy(5);
                message_vision(HIR "结果$N" HIR "翻转身体时，“砰”的一"
                               "声，头撞在了尖突的岩壁上，登时鲜血飞溅，"
                               "痛得$N" HIR "“嗷嗷”怪叫不止。\n"
                               NOR, me);
                return 1;
        }

   else { 
                ob = new("/d/death/npc/qinglong");
                ob->move("/d/death/qinglongtan");
                add("qinglong", -1);
                message_vision(HIW "\n\n只听洞穴深处传来震天动地的一声"
                                   "怒嚎，叫声震得你两耳轰鸣，鼓膜隐隐"
                                   "作\n痛。你周围的碧潭寒水急速卷动，"
                                   "激起滔天波浪，眼前一花，一个庞然大"
                                   "物\n出现在你面前，四神兽之首的青龙"
                                   "终于现身了。\n\n" NOR, me); 
                return 1;
        }
       
}

int do_move(string arg)
{
        object paper,
        me = this_player();

        if (! arg || arg == "")
                return 0;

        if (arg == "xuanwo")
        {
                if ( objectp(present("qing long", environment(me))))
                {
                        write(HIW "\n青龙一声怒嚎，龙尾直扫而出，劈打在你"
                              "身旁的岩壁上，石屑飞绽，挡住了去路。\n" NOR);
                        return 1;
                }
                message_vision(HIW "\n$N" HIW "你一纵身，跳进了寒流旋涡……\n"
                               NOR, me);
                me->move("/d/death/qiao1");
                message_vision(HIW "\n只见$N" HIW "被奈河桥下的寒流旋涡抛到空"
                                   "中，然后重重的跌落在奈河桥上。\n" NOR, me);
                me->set("neili", 0);
                me->set("jingli", 0);
                me->set("qi", 10);
                me->set("eff_qi", 10);
                me->set("jing", 10);
                me->set("eff_jing", 10);
                tell_object(me, HIR "你被跌得头晕目旋，两耳轰鸣，“哇”的喷出"
                                "一大口鲜血。\n" NOR);
                destruct(present("diyin xuemai", me));
                tell_object(me, HIC "\n你怀中的" NOR + RED "地阴血脉" NOR +
                                HIC "耗尽能源，化作了一屡气体飘出。\n" NOR);
                return 1;
        }
        return 0;
}
