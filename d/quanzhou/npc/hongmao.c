// hongmao.c

#include <ansi.h>

inherit NPC;

void create()
{
	set_name("红毛鬼", ({ "hongmao gui", "gui"}));
	set("gender", "男性");
	set("age", random(10) + 30);
	set("str", 25);
	set("dex", 16);
	set("long", "入侵我天朝宝岛台湾的荷兰红毛鬼。他手上端着一支火枪，枪口还冒着青烟。\n");
	set("combat_exp", 25000);
	set("shen_type", 1);
	set("attitude", "peaceful");

	set_temp("apply/attack", 30);
	set_temp("apply/defense", 30);
	set_temp("apply/armor", 30);
	set_temp("apply/damage", 30);

	setup();
	carry_object(__DIR__"obj/huoqiang")->wield();
}

void init()
{
	object ob;

	::init();

	if (interactive(ob = this_player()) && ! is_fighting())
        {
		remove_call_out("greeting");
		call_out("greeting", 1, ob);
	}
}

void greeting(object ob)
{
        string startroom;

	if (! objectp(ob) || environment(ob) != environment()) return;

        if (stringp(startroom = query("startroom")) &&
            find_object(startroom) == environment())
        {
                say("红毛鬼抬手就是一枪，“砰”的一团火焰从枪口窜出。\n");
                tell_object(ob, HIR "你躲避不及，只觉得伤口一痛。\n" NOR);
                ob->receive_wound("qi", 90);
        } else
	        say("红毛鬼瞪着你，看了半天。\n");
}
