#include <ansi.h>
inherit ITEM;

void create()
{
        set_weight(100);
        set_name(HIW "五圣散" NOR, ({"wusheng san", "wusheng", "san"}));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "盒");
                set("long", HIW "这便是五毒教的独门秘药五圣散，可置人于死地。\n" NOR);
                set("value", 50);
		set("poison_type", "poison");
                set("can_pour", 1);
                set("can_daub", 1);
                set("can_drug", 1);
                set("poison", ([
                        "level" : 250,
                        "id"    : "he tieshou",
                        "name"  : "五圣散剧毒",
                        "duration": 20,
                ]));
                set("no_sell", 1);
		set("only_do_effect", 1);
        }
        setup();
}

int do_effect(object me)
{
        message_vision("$N一仰脖，将五圣散倒入了嘴中。\n", me);
        me->set_temp("die_reason", "吃了五圣散去见黑白无常了");
        me->die();
        destruct(this_object());
        return 1;
}