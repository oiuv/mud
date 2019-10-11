// deng.c

#include <ansi.h>;

inherit NPC;
inherit F_GUARDER;

void create()
{
	set_name("邓百川", ({"deng baichuan", "deng"}));
	set("gender", "男性");
	set("age", 42);
	set("long", "他是慕容家四大家臣之首，功力最为深厚。\n");
	set("attitude", "peaceful");
	set("str", 26);
	set("int", 22);
	set("con", 25);
	set("dex", 22);

	set("qi", 3600);
	set("max_qi", 3600);
	set("jing", 1800);
	set("max_jing", 1800);
	set("neili", 3800);
	set("max_neili", 3800);
	set("combat_exp", 750000);
        set("jiali", 100);

	set_skill("force", 175);
	set_skill("hunyuan-yiqi", 175);
	set_skill("dodge", 130);
	set_skill("shaolin-shenfa", 130);
	set_skill("parry", 140);
	set_skill("cuff", 175);
	set_skill("jingang-quan", 175);

	map_skill("force", "hunyuan-yiqi");
	map_skill("dodge", "shaolin-shenfa");
	map_skill("parry", "jingang-quan");
	map_skill("cuff", "jingang-quan");

	prepare_skill("cuff", "jingang-quan");

	create_family("慕容世家", 0, "家臣");

	set("inquiry", ([
		"慕容博":   "那是老主人。\n",
		"慕容复":   "他就是我们跟随的公子！\n",
	]));

	set("coagents", ({
		([ "startroom" : "/d/yanziwu/shuiyun",
		   "id"        : "murong fu" ]),
	}));

	setup();

	carry_object("/clone/cloth/cloth")->wear();
}

void attempt_apprentice(object ob)
{
	command("say 我们跟随慕容公子，不收徒。");
	return;
}
