#include <ansi.h>
inherit ITEM;

void create()
{
        set_weight(100);
        set_name(HIR "鹤顶红" NOR, ({"heding hong", "heding", "hong"}));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "瓶");
                set("long", HIR "这是一瓶火红色的剧毒粉末，可杀人于无形。\n" NOR);
                set("value", 50);
		set("poison_type", "poison");
                set("can_pour", 1);
                set("can_daub", 1);
                set("can_drug", 1);
                set("poison", ([
                        "level" : 200,
                        "id"    : "he tieshou",
                        "name"  : "鹤顶红剧毒",
                        "duration": 15,
                ]));
                set("no_sell", 1);
		set("only_do_effect", 1);
        }
        setup();
}

int do_effect(object me)
{
        message_vision("$N一仰脖，将鹤顶红倒入了嘴中。\n", me);
        me->set_temp("die_reason", "吃了鹤顶红去见黑白无常了");
        me->die();
        destruct(this_object());
        return 1;
}