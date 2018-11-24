// newbie.c

#include <ansi.h>
#include <command.h>

inherit ITEM;

void create()
{
        set_name(HIY "武林外传" NOR, ({ "heros book", "book" }) );
        set_weight(200);
        if( clonep() )
                set_default_object(__FILE__);
        else {
                set("long", HIY "一本不知道啥材料制成的书，上书【武林外传】四个大字。\n" NOR
                            HIC "这本书是武林生存指南，建议你仔细阅读（read book）。\n" NOR);
                set("unit", "本");
				//set("value", 5000);
				set("material", "paper");
        }
}

void init()
{
        add_action("do_du", "read");
}

int do_du(string arg)
{
		if (arg == "book")
			return HELP_CMD->main(this_player(), "newbie");
		return 0;
}
