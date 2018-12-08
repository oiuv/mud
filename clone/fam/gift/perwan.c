// xiandan.c 仙丹

#include <ansi.h>

inherit ITEM;

void create()
{
        set_name(HIM "萦香丸" NOR, ({ "yingxiang wan", "yingxiang", "wan" }) );
        set_weight(200);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("long", "一颗圆圆的丹丸，据说吃了可以变美，是每个女子梦寐以求的灵丹妙药。\n");
                set("value", 10000);
                set("unit", "粒");
                set("only_do_effect", 1);
        }
}

int do_effect(object me)
{
        message_vision("$N一仰脖，吞下了一粒" + this_object()->name() +
                       "。\n", me);
        if (me->query("per") >= 40)
        {
                message_vision("$N忽然“哇哇”，吐了一地。\n", me);
                tell_object(me, "你觉得嘴里非常的苦。\n");
        } else
        {
                tell_object(me, HIG "你发觉你的容貌变得漂亮多了。\n" NOR);
                me->add("per", 1);
        }

        destruct(this_object());
        return 1;
}
