// bing.c 宋兵

inherit NPC;

void create()
{
	set_name("宋兵", ({ "song bing", "bing" }));
	set("age", 22);
	set("gender", "男性");
	set("long", "大宋官兵的武艺不能和武林人士相比，但襄阳守军之精，天下第一。\n");
	set("attitude", "peaceful");
//	set("vendetta_mark", "authority");
//      set("pursuer", 1);

	set("str", 24);
	set("dex", 16);
	set("combat_exp", 20000);
	set("shen_type", 1);

	set_skill("unarmed", 40);
	set_skill("changquan", 40);
	set_skill("dodge", 40);
	set_skill("parry", 40);
	set_skill("blade", 40);
	set_skill("wuhu-duanmendao", 40);
	set_skill("force", 40);
	map_skill("unarmed", "changquan");
	map_skill("blade", "wuhu-duanmendao");
	set_temp("apply/attack", 40);
	set_temp("apply/defense", 40);
	set_temp("apply/damage", 20);
	set_temp("apply/armor", 40);

        set("chat_chance_combat", 10);
	set("chat_msg_combat", ({
		"宋兵喝道：大胆刁民，竟敢造反不成？\n",
		"宋兵喝道：跑得了和尚跑不了庙，你还是快快束手就擒！\n",
	}));
	setup();
	carry_object("/clone/weapon/gangdao")->wield();
	carry_object("/d/city/npc/obj/junfu")->wear();
}

void init()
{
	object ob;
	::init();
	if (interactive(ob = this_player()) && 
		(int)ob->query_condition("killer")) {
		remove_call_out("kill_ob");
		call_out("kill_ob", 1, ob);
	}
}

int accept_fight(object me)
{
	command("say 大爷我正想找人杀呐，今天算你倒霉。\n");
	kill_ob(me);
	return 1;
}
