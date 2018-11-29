inherit NPC;
#include <ansi.h>

void create()
{
	set_name("鳌拜", ({ "ao bai", "ao", "bai" }));
	set("age", 32);
	set("gender", "男性");
	set("title", "当朝第一大臣");
	set("nickname", HIR "满洲第一勇士" NOR );
	set("long",
		"他就是满洲第一勇士，身穿一件黄马褂。他身材魁梧，\n"
		"相貌狰狞，太阳穴高高鼓起，似乎身怀绝世武功。\n");
	set("attitude", "peaceful");

	set("age", 50);
	set("shen_type", -1);
	set("str", 25);
	set("int", 25);
	set("con", 25);
	set("dex", 25);
	set("max_qi", 1500);
	set("max_jing", 1500);
	set("neili", 2500);
	set("max_neili", 2500);
	set("jiali", 100);
	set("combat_exp", 250000);
	set("score", 50000);

	set_skill("unarmed", 150);
	set_skill("dodge", 150);
	set_skill("parry", 150);
	set_skill("sword", 120);
	set_skill("force", 150);
	set_skill("changquan", 150);
	set_skill("feiyan-zoubi", 150);
	set_skill("literate", 100);

	map_skill("dodge", "feiyan-zoubi");
	map_skill("parry", "changquan");
	map_skill("unarmed", "changquan");

	setup();
        carry_object(__DIR__"obj/goldcloth1")->wear();
}

int accept_fight(object me)
{
	command("say 他奶奶的，你活腻了！来人，给我拿下！\n");
	me->apply_condition("killer", 500);
	kill_ob(me);
	return 1;
}
