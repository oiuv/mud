// Npc: /kungfu/class/shaolin/xuan-bei.c
// Date: YZC 96/01/19

inherit NPC;
inherit F_MASTER;

#include "xuan.h"

void create()
{
	set_name("玄悲大师", ({
		"xuanbei dashi",
		"xuanbei",
		"dashi",
	}));
	set("long",
		"他是一位白须白眉的老僧，身穿一袭银丝棕黄袈裟。他身材甚高，\n"
		"但骨瘦如柴，顶门高耸，双目湛然有神。\n"
	);


	set("nickname", "达摩院主持");
	set("gender", "男性");
	set("attitude", "friendly");
	set("class", "bonze");

	set("age", 70);
	set("shen_type", 1);
	set("str", 30);
	set("int", 30);
	set("con", 30);
	set("dex", 30);
	set("max_qi", 3000);
	set("max_jing", 1500);
	set("neili", 4200);
	set("max_neili", 4200);
	set("jiali", 50);
	set("combat_exp", 1600000);

	set_skill("force", 180);
	set_skill("hunyuan-yiqi", 180);
	set_skill("shaolin-xinfa", 180);
	set_skill("dodge", 180);
	set_skill("shaolin-shenfa", 180);
	set_skill("hand", 180);
	set_skill("claw", 180);
	set_skill("blade", 180);
	set_skill("sword", 180);
	set_skill("parry", 180);
	set_skill("qianye-shou", 180);
	set_skill("longzhua-gong", 180);
	set_skill("cibei-dao", 180);
	set_skill("damo-jian", 180);
	set_skill("buddhism", 200);
	set_skill("literate", 200);
	set_skill("medical", 200);
	set_skill("shaolin-yishu", 200);

	map_skill("force", "hunyuan-yiqi");
	map_skill("dodge", "shaolin-shenfa");
	map_skill("hand", "qianye-shou");
	map_skill("claw", "longzhua-gong");
	map_skill("blade", "cibei-dao");
	map_skill("sword", "damo-jian");
	map_skill("parry", "cibei-dao");

	prepare_skill("hand", "qianye-shou");
	prepare_skill("claw", "longzhua-gong");

	create_family("少林派", 36, "弟子");

	setup();

        carry_object("/d/shaolin/obj/xuan-cloth")->wear();
}

