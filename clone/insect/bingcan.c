//qingshe.c 冰蚕

#include <ansi.h>

inherit POISON_INSECT;

void create()
{
	set_name("冰蚕", ({ "bing can", "can" }) );
        set_weight(100);
	set("race", "野兽");
	set("age", 2);
	set("long", "一只浑身上下透体通明的蚕。\n");
	set("attitude", "peaceful");
	set("str", 20);
	set("con", 20);
        set("unit", "只");
	set("limbs", ({ "头部", "身体", "尾巴" }) );
	set("verbs", ({ "bite" }) );

        set("insect_poison", ([
                "level"  : 400,
                "maximum": 400,
        ]));

	set("combat_exp", 100);

	setup();
}

// 被练毒吸收
int absorbed(object me)
{
        object ob;

        //if (! undefinedp(me->query_skill("freezing-force")))
         //       return 0;
         if (me->query_skill("freezing-force",1) > 0)
                return 0;

       if (objectp(ob = present("yijin jing", me)))
        {
                message_sort(HIW "$N" HIW "眼见$n" HIW "缓缓化作一股碧亮的的血水，缓缓沿经脉"
                             "而上，浑身越来越冷，血液几乎凝固了，不由的惊"
                             "惶失措。这冰蚕的寒劲何等强劲，$N" HIW "以多年化功大法"
                             "竟然不能将之导入正途，一时浑身麻木，动弹不得"
                             "，忽的$N" HIW "怀中掉出一本书来，此时$N" HIW "涕泪横流，将"
                             "那书打湿，隐隐显出几个图形，上有几人，姿势怪"
                             "异，$N" HIW "神志已然不清，冥冥中按图依法施为，渐渐"
                             "经脉通畅，内息循入正途，只是浑身愈发寒冷，渐"
                             "渐昏迷过去。良久醒来只觉得浑身舒畅无比，说不"
                             "出的欣快。那冰蚕的寒劲通过化功大法和书本图形"
                             "上行功运气之法催炼，竟成了世上罕见的一门奇功，"
                             "正邪相符，水火交济，让$N" HIW "不禁内力大进。\n" NOR,
                             me, this_object());
                CHANNEL_D->do_channel(this_object(), "rumor", "听说" + me->name() + "无意中练成了冰蚕寒功。");
                tell_object(me, HIG "你意外领悟了冰蚕寒功。\n" NOR);
                me->set_skill("freezing-force", 50);
                me->delete_skill("yijinjing");
        } else
        {
                message_sort(HIG "$N" HIG "眼见$n" HIG "缓缓化作一股碧亮的的血水，缓缓沿经脉"
                             "而上，浑身越来越冷，血液几乎凝固了，不由的惊"
                             "惶失措。这冰蚕的寒劲何等强劲，立时将$N" HIG "冻僵。\n" NOR,
                             me, this_object());
                me->unconcious();
                destruct(this_object());
                return -1;
        }

        if (me->can_improve_skill("force"))
                me->improve_skill("force", 250000);
        me->improve_neili(300 + random(300));
        destruct(this_object());
        return -1;
}