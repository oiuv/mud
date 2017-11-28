// Npc: /kungfu/class/shaolin/xuan-tong.c
// Date: YZC 96/01/19

inherit NPC;
inherit F_MASTER;

#include "xuan.h"

void create()
{
	set_name("玄痛大师", ({
		"xuantong dashi",
		"xuantong",
		"dashi",
	}));
	set("long",
		"他是一位白须白眉的老僧，身穿一袭银丝棕黄袈裟。他身材高大，\n"
		"两手过膝。双目半睁半闭，却不时射出一缕精光。\n"
	);

	set("nickname", "戒律院主持");
	set("gender", "男性");
	set("attitude", "friendly");
	set("class", "bonze");

	set("age", 70);
	set("shen_type", 1);
	set("str", 30);
	set("int", 30);
	set("con", 30);
	set("dex", 30);
	set("max_qi", 2500);
	set("max_jing", 1000);
	set("neili", 3500);
	set("max_neili", 3500);
	set("jiali", 50);
	set("combat_exp", 1100000);

	set_skill("force", 140);
	set_skill("hunyuan-yiqi", 140);
	set_skill("shaolin-xinfa", 140);
	set_skill("dodge", 140);
	set_skill("shaolin-shenfa", 140);
	set_skill("parry", 140);
	set_skill("hand", 140);
	set_skill("claw", 140);
	set_skill("club", 140);
	set_skill("staff", 140);
	set_skill("zui-gun", 140);
	set_skill("pudu-zhang", 140);
	set_skill("qianye-shou", 140);
	set_skill("yingzhua-gong", 140);
	set_skill("buddhism", 180);
	set_skill("literate", 180);
	set_skill("medical", 180);
	set_skill("shaolin-yishu", 180);

	map_skill("force", "hunyuan-yiqi");
	map_skill("dodge", "shaolin-shenfa");
	map_skill("finger", "nianhua-zhi");
	map_skill("hand", "qianye-shou");
	map_skill("claw", "yingzhua-gong");
	map_skill("staff", "pudu-zhang");
	map_skill("club", "zui-gun");
	map_skill("parry", "yingzhua-gong");

	prepare_skill("finger", "nianhua-zhi");

	create_family("少林派", 36, "弟子");

	setup();

        carry_object("/d/shaolin/obj/xuan-cloth")->wear();
}

