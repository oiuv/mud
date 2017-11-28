// hair.c 头发

#include <ansi.h>

inherit ITEM;
inherit F_SILENTDEST;

int is_hair() { return 1; }

void create()
{
        set_name(RED "头发" NOR, ({ "hair" }));
        set_weight(50);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "束");
                set("value", 1);
                set("no_sell", "我这儿不是假发店，你一边儿去。");
                set("long", WHT "一束头发。\n" NOR);
                set("only_do_effect", 1);
        }
}

int set_from(object owner)
{
        set("gender", owner->query("gender"));
        if (query("gender") == "女性")
        {
                set("name", "青丝");
                set("long", CYN "一束青丝。\n" NOR);
        }
        return 1;
}

int do_effect(object me)
{
        message_vision("$N拿起头发就咬，结果弄的满嘴都是头发丝。\n",
                       me, this_object());
        return 1;
}
