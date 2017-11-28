#include <ansi.h>
inherit NPC;

void create()
{
        set_name("知客僧", ({"zhike seng", "seng"}));
        set("long", "一个精壮僧人。\n" );
        set("gender", "男性");
        set("attitude", "peace");

        set("age", 34);
        set("str", 15);
        set("int", 16);
        set("con", 20);
        set("attitude", "peaceful");
        
        set_skill("unarmed", 40);
        set_skill("dodge", 40);
        set_temp("apply/attack", 20);
        set_temp("apply/defense", 20);

        setup();
        carry_object("/clone/misc/cloth")->wear();
}

void init()
{
        object ob;
	if (interactive(ob = this_player()) && ! is_fighting() )
	{
                remove_call_out("greeting");
                call_out("greeting", 1, ob);
        }    
}

void greeting(object ob)
{ 
	if (! ob || environment(ob) != environment())
		return;
  	if (ob->query("id") == "qi gai")
	{
        	message_vision(CYN "$N" CYN "对着$n" CYN "连连挥袖：去，去"
                               "去，一边去！" NOR, this_object(), ob);
    		return;
  	}
	command("say 施主请到大殿上香。");
   	return;
}
