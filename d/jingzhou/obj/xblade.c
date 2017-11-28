//
// xue-dao.c
//

#include <ansi.h>
#include <weapon.h>

inherit BLADE;

int do_wield(string arg);

void create()
{
	set_name( HIR "血刀" NOR , ({ "xblade" }));
	set_weight(1000);
	if (clonep())
		set_default_object(__FILE__);
	else {
		set("unit", "把");
		set("long", HIR "这是一把缠在腰间的宝刀，刀锋带着淡淡的血影。\n" NOR );
		set("value", 1000);
		set("material", "steel");
		set("wield_msg", "$N「唰」的一声抽出一柄$n握在手中。\n");
		set("unwield_msg", "$N将手中的$n插回刀鞘。\n");
	}
	init_blade(20);
	setup();
}

void init()
{
        add_action("do_wield", "wield");
}


int do_wield(string arg)
{
        object me=this_player();

        object ob;
        string str;
	int i, count;

        if (!id(arg))   return notify_fail("你要装备什么？\n");


	if( !objectp(ob = present(arg, me)) )
		return notify_fail("你身上没有这样东西。\n");

	if( ob->query("equipped") )
		return notify_fail("你已经装备著了。\n");


	if( ob->wield() ) {
              if( !stringp(str = ob->query("wield_msg")) )
			str = "$N装备$n作武器。\n";
              message_vision(str, me, ob);
              if ( me->query_skill("xue-dao")
              && me->query_skill_mapped("blade") == "xue-dao" )
			me->add_temp("apply/damage",200);

              return 1;
	}

        else
                return 0;
}

