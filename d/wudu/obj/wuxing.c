// duwan.c

#include <ansi.h>
inherit ITEM;

void create()
{
        set_weight(50);
        set_name("无形之毒", ({ "wuxing du","yao"}) );
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "包");
                set("long", "这是一包五毒教的秘制的毒药，吃了它必死无疑。\n");
                set("value", 50);
                set("poison_type", "poison");
                set("can_pour", 1);
                set("can_daub", 1);
                set("can_drug", 1);
                set("poison", ([
                        "level" : 200,
                        "id"    : "ding chunqiu",
                        "name"  : "毒",
                        "duration": 15,
                ]));
                set("no_sell", 1);
                set("only_do_effect", 1);
        }
        setup();
}

int do_effect(object me)
{
        message_vision("$N一仰脖，把毒药全部倒入了嘴中。\n",
                       me);
        me->set_temp("die_reason", "吃了毒药去见黑白无常了");
        me->die();
        destruct(this_object());
        return 1;
}
