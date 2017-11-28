#include <ansi.h>
inherit ROOM;

#define DAN_DIR         "/d/beijing/npc/dan/"

int do_liandan(string arg);

void create()
{       set("short", HIY "炼丹房" NOR);
        set("long", @LONG
这是姚春的炼丹房，四周堆放着炼丹的药材，一个漆黑的炼丹炉(lu)耸立
在中央，房中的药味经久不散，并且总有一股散不尽的淡青色烟雾，长时间的
丹药炼制已经让这个房间充满了神秘的色彩。
LONG );
        set("no_fight", 1);
        set("item_desc", ([
                "lu" : YEL "一个深黑色的大铁丹炉，顶部不停地升起丝丝青烟。\n" NOR,
        ]));

        set("exits", ([
                "south" : __DIR__"liandan_yaoshi",
        ]));

        setup();
}

void init()
{
        add_action("do_liandan", "liandan"); 
}

int do_liandan(string arg)
{
        int time;
        int time2;

        object me = this_player();
        time = 15 + random(15);
        time2 = time;
        

        if (me->is_busy())
                return notify_fail("等你有空了再说吧。\n");

        if ((int)me->query_temp("liandan") < 1)
                return notify_fail("炼丹之地，切勿滋扰。\n");

        if ((int)me->query_temp("liandan") < 2)
                return notify_fail("原料都没有，炼什么啊？\n");

        if ((int)me->query_temp("liandan") == 3)
                return notify_fail("丹药炼制中，请勿分心。\n");

        if ((int)me->query_temp("liandan") == 4)
                return notify_fail("炼制成功，快去复命吧。\n");

        if ((int)me->query("jing") < 80 ||
            (int)me->query("qi") < 80)
                return notify_fail("你现在的精神状况无法炼制丹药。\n");

        message_vision(HIY "$N" HIY "将原料药材一一放进炉中，盘"
                       "腿坐下，闭目静待。\n" NOR, me); 
        me->set_temp("liandan", 3);
        me->start_call_out((: call_other, __FILE__, "liandan", me :), time2);
        //me->start_busy(time / 2 + 1);
        me->start_busy(time2);
        return 1;
}

// 特殊丹列表
string *SM_LIST = ({ "danS_1", "danS_2", "danS_3", "danS_4", "danS_5",
                     "danM_5", "danM_9", "danA_5", "danB_6", "danC_5",
                     "danD_6", });

// 普通丹列表
string *NORMAL_LIST = ({ "danM_3", "danM_4", "danM_7", "danM_8", "danA_3",
                         "danA_4", "danB_3", "danB_4", "danB_5", "danC_4",
                         "danD_3", "danD_4", "danD_5", });

void liandan(object me)
{
        object ob;
        int skill;

        skill = (int)me->query_skill("liandan-shu", 1);

        if (environment(me) != this_object())
                return;

        me->receive_damage("jing", 50 + random(30));
        me->receive_damage("qi", 50 + random(30));
        if (random(skill) < 100 && random(5) == 1) 
        {
                me->set_temp("liandan", 1);
                message_vision(HIR "正当$N" HIR "昏昏然的时候，一阵刺鼻"
                               "的气味从炉中冲出，$N" HIR "急忙开炉取药，"
                               "结果被弄得个灰头土脸。\n"NOR,me);
        } else
        if (random(skill) > 100 && random(10) == 1)
        {
                message_vision(HIY "炉顶青烟渐渐转淡，蓦然一道金光闪过，$N"
                               HIY "不禁吃了一惊，此时丹药气味渐浓，$N"
                               HIY "赶紧把炼制而成的丹丸取出。\n" NOR, me);
                me->set_temp("liandan", 4);
                ob = new(DAN_DIR + SM_LIST[random(sizeof(SM_LIST))]);
                tell_object(me, HIC "你炼成了珍品「" + NOR + ob->name() + NOR + HIC "」。\n" NOR);
                ob->move(me, 1);

                if (me->can_improve_skill("liandan-shu") && skill < 400)
                {
                        me->improve_skill("liandan-shu", me->query("int") + 10);
                        tell_object(me, HIC "在炼丹过程中你的「炼丹术」提高了！\n" NOR);
                }
        } else
        {
                message_vision(HIC "炉顶青烟渐渐转淡，丹药气味渐浓，$N"
                               HIC "高兴地把炼制而成的丹丸取出。\n" NOR, me);
                me->set_temp("liandan", 4);
                ob = new(DAN_DIR + NORMAL_LIST[random(sizeof(NORMAL_LIST))]);
                tell_object(me, HIC "你炼成了「" + NOR + ob->name() + NOR + HIC "」。\n" NOR);
                ob->move(me, 1);

                if (me->can_improve_skill("liandan-shu") && skill < 400)
                {
                        me->improve_skill("liandan-shu", me->query("int") / 4 + 1);
                        tell_object(me, HIC "在炼丹过程中你的「炼丹术」提高了！\n" NOR);
                }
        }
}

