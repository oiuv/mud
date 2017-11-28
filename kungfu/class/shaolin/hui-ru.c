// Npc: /kungfu/class/shaolin/hui-ru.c
// Date: YZC 96/01/19

inherit NPC;
inherit F_MASTER;

#include "hui.h"

void create()
{
	set_name("慧如尊者", ({
		"huiru zunzhe",
		"huiru",
		"zunzhe",
	}));
	set("long",
		"他是一位两鬓斑白的老僧，身穿一袭青布镶边袈裟。他身材略高，\n"
		"太阳穴微凸，双目炯炯有神。\n"
	);


	set("gender", "男性");
	set("attitude", "friendly");
	set("class", "bonze");

	set("age", 50);
	set("shen_type", 1);
	set("str", 20);
	set("int", 20);
	set("con", 20);
	set("dex", 20);
	set("max_qi", 450);
	set("max_jing", 300);
	set("neili", 600);
	set("max_neili", 600);
	set("jiali", 50);
	set("combat_exp", 50000);
	set("score", 100);

	set_skill("force", 70);
	set_skill("hunyuan-yiqi", 70);
	set_skill("shaolin-xinfa", 70);
	set_skill("dodge", 70);
	set_skill("shaolin-shenfa", 70);
	set_skill("sword", 70);
	set_skill("fumo-jian", 70);
	set_skill("parry", 70);
	set_skill("buddhism", 70);
	set_skill("literate", 70);

	map_skill("force", "hunyuan-yiqi");
	map_skill("dodge", "shaolin-shenfa");
	map_skill("sword", "fumo-jian");
	map_skill("parry", "fumo-jian");

	create_family("少林派", 38, "弟子");

	setup();

        carry_object("/d/shaolin/obj/changjian")->wield();
        carry_object("/d/shaolin/obj/hui-cloth")->wear();
}

