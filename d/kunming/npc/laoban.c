#include <ansi.h>;
inherit NPC;

void create()
{
	set_name("元财", ({ "yuan cai", "yuan" }) );
	set("gender", "男性" );
	set("title",  "店主" );
	set("age", 43);
	set("long", "他是这里的店主，看上去忠厚老实的样子。\n");
	set("combat_exp", 100);
	set("attitude", "friendly");
	set("rank_info/respect", "老板");
	setup();
}

int accept_object(object who, object ob)
{
	
	if (ob->query("money_id") && ob->value() >= 5000) 
	{
		tell_object(who, CYN "元财一哈腰，说道：多谢客官，楼上请。\n" NOR);
		who->set_temp("rent_paid",1);
		return 1;
	}
	return 0;
}
