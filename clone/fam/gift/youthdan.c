// xiandan.c 仙丹

#include <ansi.h>

inherit ITEM;

void create()
{
    set_name(HIG "驻颜丹" NOR, ({"zhuyan dan", "zhuyan", "dan"}));
    set_weight(200);
    if (clonep())
        set_default_object(__FILE__);
    else
    {
        set("long", "一颗晶莹剔透的丹丸，据说吃了可以返老还童，天颜永驻，是每个女子梦寐以求的灵丹妙药。\n");
        set("value", 1000000);
        set("unit", "粒");
        set("only_do_effect", 1);
    }
}

int do_effect(object me)
{
    message_vision("$N一仰脖，吞下了一粒" + this_object()->name() + "。\n", me);
    if (me->query("special_skill/youth"))
    {
        message_vision("$N忽然“哇哇”，吐了一地。\n", me);
        tell_object(me, "你觉得嘴里非常的苦。\n");
    }
    else
    {
        tell_object(me, HIG "你感觉自己的身体有了莫名其妙的变化。\n" NOR);
        me->set("special_skill/youth", 1);
    }

    destruct(this_object());
    return 1;
}
