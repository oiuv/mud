// Npc: /kungfu/class/shaolin/hui-xu.c
// Date: YZC 96/01/19

inherit NPC;
inherit F_MASTER;

#include "hui.h"

void create()
{
	set_name("慧虚尊者", ({
		"huixu zunzhe",
		"huixu",
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
	set_skill("hand", 69);
	set_skill("fengyun-shou", 69);
	set_skill("club", 78);
	set_skill("zui-gun", 78);
	set_skill("parry", 70);
	set_skill("buddhism", 70);
	set_skill("literate", 70);

	map_skill("force", "hunyuan-yiqi");
	map_skill("dodge", "shaolin-shenfa");
	map_skill("hand", "fengyun-shou");
	map_skill("club", "zui-gun");
	map_skill("parry", "zui-gun");

	prepare_skill("hand", "fengyun-shou");

	create_family("少林派", 38, "弟子");

	setup();

        carry_object("/d/shaolin/obj/qimeigun")->wield();
        carry_object("/d/shaolin/obj/hui-cloth")->wear();
}

