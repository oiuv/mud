// newbie.c

#include <ansi.h>
#include <command.h>

inherit ITEM;

void create()
{
        set_name(HIY "九转金丹" NOR, ({ "jiuzhuan jindan", "dan" }) );
        set_weight(200);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("long", HIY "一颗金色的仙丹，传说是太上老君"
                            "精心修炼的灵丹妙药。\n" NOR);
                set("unit", "颗");
                set("only_do_effect", 1);
        }
}

int do_effect(object me)
{
	return HELP_CMD->main(this_player(), "feature");
}

