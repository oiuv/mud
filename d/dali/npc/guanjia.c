// guanjia.c 管家

#include <ansi.h>
inherit NPC;
inherit F_MASTER;

void create()
{
	set_name("管家", ({ "guan jia", "guan" }));
	set("title",  "镇南府管家" );
	set("long", "他是大理国镇南王府管家。\n");
	set("gender", "男性");
	set("age", 40);
	set("attitude", "friendly");
	set("shen_type", 1);
	set("str", 20);
	set("int", 20);
	set("con", 20);
	set("dex", 20);
	
	set("max_qi", 600);
	set("max_jing", 200);
	set("neili", 300);
	set("max_neili", 300);
	set("jiali", 10);
	set("combat_exp", 3000);
	set("score", 2000);

        set_skill("force", 25);
        set_skill("dodge", 25);
        set_skill("parry", 25);
        set_skill("unarmed", 25);
	set_skill("kurong-changong", 25);
        set_skill("tiannan-step", 25);
        set_skill("jinyu-quan", 25);

	map_skill("force", "kurong-changong");
	map_skill("dodge", "tiannan-step");
	map_skill("unarmed", "jinyu-quan");
	map_skill("parry", "jinyu-quan");

	setup();
	carry_object("/clone/misc/cloth")->wear();
	add_money("silver",2 );

}

int accept_fight(object ob)
{
	object me  = this_object();
	if ((int)ob->query_skill("kurong-changong",1) < 30) return 0;
	remove_call_out("checking");
	call_out("checking", 1, me, ob);
	return 1;
}


int checking(object me, object ob)
{

	object obj;
	int my_max_qi, his_max_qi;

	my_max_qi  = me->query("max_qi");
	his_max_qi = ob->query("max_qi");

	if (me->is_fighting()) 
	{
		call_out("checking",2, me, ob);
                return 1;
	}

	if ( !present(ob, environment()) ) return 1; 

	if (( (int)me->query("qi")*100 / my_max_qi) <= 50 ) 
	{
		command("say 青出於蓝胜於蓝，不愧是大理段家的好弟子 ! 恭喜你了 !\n");
		command("say 你的武功可以进一步深造了 !\n");
		ob->set_temp("have_fight1",1);
		return 1;
	}

	if (( (int)ob->query("qi")*100 / his_max_qi) < 50 ) 
	{
		command("say 看来" + RANK_D->query_respect(ob) + 
			"还得多加练习，方能在大理段家诸多弟子中出人头地 !\n");
		return 1;
	}

	return 1;  
}

