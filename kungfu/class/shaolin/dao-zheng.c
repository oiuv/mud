// Npc: /kungfu/class/shaolin/dao-zheng.c
// Date: YZC 96/01/19

inherit NPC;
inherit F_MASTER;

#include "dao.h"

void create()
{
	set_name("道正禅师", ({
		"daozheng chanshi",
		"daozheng",
		"chanshi",
	}));
	set("long",
		"他是一位身材高大的中年僧人，两臂粗壮，膀阔腰圆。他手持兵\n"
		"刃，身穿一袭灰布镶边袈裟，似乎有一身武艺。\n"
	);

	set("gender", "男性");
	set("attitude", "friendly");
	set("class", "bonze");

	set("age", 40);
	set("shen_type", 1);
	set("str", 20);
	set("int", 20);
	set("con", 20);
	set("dex", 20);
	set("max_qi", 400);
	set("max_jing", 300);
	set("neili", 450);
	set("max_neili", 450);
	set("jiali", 40);
	set("combat_exp", 10000);
	set("score", 100);

	set_skill("force", 50);
	set_skill("hunyuan-yiqi", 50);
	set_skill("shaolin-xinfa", 50);
	set_skill("dodge", 50);
	set_skill("shaolin-shenfa", 50);
	set_skill("strike", 50);
	set_skill("sanhua-zhang", 50);
	set_skill("parry", 50);
          set_skill("sword", 50);
	set_skill("damo-jian", 50);
	set_skill("buddhism", 50);
	set_skill("literate", 50);

	map_skill("force", "hunyuan-yiqi");
	map_skill("dodge", "shaolin-shenfa");
	map_skill("strike", "sanhua-zhang");
          map_skill("sword", "damo-jian");
	map_skill("parry", "sanhua-zhang");

	create_family("少林派", 39, "弟子");

	setup();

        carry_object("/d/shaolin/obj/dao-cloth")->wear();
}

