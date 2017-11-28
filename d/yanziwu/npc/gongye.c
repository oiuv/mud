// gongye.c

#include <ansi.h>;

inherit NPC;
inherit F_GUARDER;

void create()
{
	set_name("公冶乾", ({"gongye qian", "gongye"}));
	set("gender", "男性");
	set("age", 35);
	set("long", "他是慕容家四大家臣之二，为人稳重。\n");
	set("attitude", "peaceful");
	set("str", 27);
	set("int", 24);
	set("con", 26);
	set("dex", 24);

	set("qi", 3200);
	set("max_qi", 3200);
	set("jing", 1600);
	set("max_jing", 1600);
	set("neili", 3400);
	set("max_neili", 3400);
	set("combat_exp", 620000);

	set_skill("force", 150);
	set_skill("hunyuan-yiqi", 150);
	set_skill("sword", 155);
	set_skill("fumo-jian", 155);
	set_skill("dodge", 140);
	set_skill("shaolin-shenfa", 140);
	set_skill("parry", 150);
	set_skill("hand", 140);
	set_skill("fengyun-shou", 140);

	map_skill("force", "hunyuan-yiqi");
	map_skill("sword", "fumo-jian");
	map_skill("dodge", "shaolin-shenfa");
	map_skill("parry", "fumo-jian");
	map_skill("hand", "fengyun-shou");

	prepare_skill("hand", "fengyun-shou");

	create_family("慕容世家", 0, "家臣");

	set("coagents", ({
		([ "startroom" : "/d/yanziwu/qinyun",
		   "id"        : "bao butong" ]),
		([ "startroom" : "/d/yanziwu/shuiyun",
		   "id"        : "murong fu" ]),
	}));

	set("inquiry", ([
		"慕容博":   "那是老主人。\n",
		"慕容复":   "他就是我们跟随的公子！\n",
	]));

	setup();

	carry_object("/clone/cloth/cloth")->wear();
	carry_object("/clone/weapon/gangjian")->wield();
}

void attempt_apprentice(object ob)
{
	command("say 我们跟随慕容公子，不收徒。");
	return;
}
