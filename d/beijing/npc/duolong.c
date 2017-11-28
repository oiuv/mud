#include <ansi.h>
inherit NPC;

void create()
{
	set_name("多隆", ({ "duo long", "duo", "long" }));
	set("title", HIY "御前侍卫总管" NOR);
	set("age", 32);
	set("gender", "男性");
	set("long", "多隆乃御前侍卫的总管，身才高大魁梧，一身外家功夫很是了得。\n");
	set("attitude", "peaceful");

	set("str", 30);
	set("dex", 30);
	set("combat_exp", 1000000);
	set("shen_type", 1);

	set_skill("unarmed", 200);
	set_skill("dodge", 200);
	set_skill("parry", 200);
	set_skill("sword", 200);
	set_skill("force", 200);
	set_temp("apply/attack", 150);
	set_temp("apply/defense", 150);
	set_temp("apply/damage", 100);
	set_temp("apply/armor", 100);

       set("chat_chance_combat", 10);
	set("chat_msg_combat", ({
		"多隆喝道：他奶奶的，你连我都敢惹？\n",
	}));
	setup();
       carry_object("/d/beijing/npc/obj/guanfu2")->wear();
       carry_object("/d/beijing/npc/obj/goldcloth1")->wear();
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
	command("say 这可是你活腻了自找的，休得怪我无情。\n");
	me->apply_condition("killer", 500);
	kill_ob(me);
	return 1;
}
