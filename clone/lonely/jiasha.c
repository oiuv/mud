#include <ansi.h>
#include <armor.h>

inherit F_OBSAVE;
inherit ARMOR;

void create()
{
        set_name(HIR "龙象袈裟" NOR, ({ "longxiang jiasha", "longxiang", "jiasha" }));
        set_weight(8000);
        if (clonep())
                destruct(this_object());
        else {
                set("unit", "件");
                set("long", HIR "这是一件陈旧的袈裟，通体血红，印有龙象纹样。着"
                            "手处坚韧\n无比，想必是由金刚丝混及雪蚕丝编织而成。"
                            "更有传闻说密宗\n神功龙象般若功便是记载于这件袈裟之"
                            "上。\n" NOR);
                set("value", 100000);
                set("no_sell", "我…我的天…蒙古国师的衣服你也敢拿来卖？");
                set("material", "cloth");
                set("wear_msg", HIY "$N" HIY "展开$n" HIY "，霎时金波流转，罡气"
                                "笼罩全身。\n" NOR);
                set("armor_prop/armor", 200);
                set("skill", ([
                        "name" : "longxiang-gong",
                        "exp_required" : 1000000,
                        "jing_cost"    : 200,
                        "difficulty"   : 80,
                        "max_skill"    : 299,
                        "min_skill"    : 210,
                        "need"         : ([ "sanscrit" : 200 ]),
                ]));
                // 初始抵挡次数设定为十三，装备后可以抵挡十三道任何攻击。
                // 以后每注入一次内力可以多抵挡一次攻击，最多可为十三次。
                set("force", 13);
                set("stable", 100);
        }
        setup();
}

void init()
{
        add_action("do_force", "force");
}

int do_force(string arg)
{
        object me = this_player();

        if (! arg || ! id(arg))
                return notify_fail("你打算往哪里注入内力？\n");

        if (me->is_fighting())
                return notify_fail("你现在正在打架，哪有时间忙这个？\n"); 

        if (me->is_busy())
                return notify_fail("你现在正忙着呢。\n"); 

        if (query("equipped"))
                return notify_fail("你必须先将" + name() + "脱下。\n");

        if ((int)me->query_skill("longxiang-gong", 1) < 280)
                return notify_fail("你龙象般若功修为不够，难以将真气注入袈裟。\n");

        if (me->query_skill_mapped("force") != "longxiang-gong")
                return notify_fail("你没有激发龙象般若功，难以将真气注入袈裟。\n");

        if (me->query("max_neili") < 6000)
                return notify_fail("你目前的内力修为不够，难以将真气注入袈裟。\n");

        if (me->query("neili") < me->query("max_neili"))
                return notify_fail("你目前的内力尚不饱满，难以将真气注入袈裟。\n");

        if (query("force") >= 13)
                return notify_fail("现在袈裟已然膨胀，无法再容纳更多的内力。\n");

        me->set("neili", 0);
        me->add("max_neili", -5);
        me->start_busy(5);
        add("force", 1);
        message_sort(HIY "\n$N" HIY "微一凝神，默默运聚龙象般若功劲力，双掌紧"
                     "紧压住" + name() + HIY "两侧。过得片刻" + name() + HIY
                     "竟然渐渐膨起，似乎已将内力尽数纳入其中。$N" HIY "见状赶"
                     "忙收回双掌，脸色变了变，真气有所衰竭。\n\n" NOR, me);
        return 1;
}

mixed valid_damage(object ob, object me, int damage)
{
        if (query("force") > 0)
	{
                add("force", -1);
                return ([ "damage" : -damage,
                          "msg" : HIY "霎时只见" + name() + HIY "上一道光华闪"
                                  "过，竟然将$N" HIY "这一招化于无形。\n" NOR ]);
	}
}

// 进行保存数据的接口函数
mixed save_dbase_data()
{
        mapping data;

        data = ([ "force" : query("force") ]);

        return data;
}

// 接受存盘数据的接口函数
int receive_dbase_data(mixed data)
{
        if (! mapp(data))
                return 0;

        if (! undefinedp(data["force"]))
        {
                set("force", data["force"]);
        }
        return 1;
}

