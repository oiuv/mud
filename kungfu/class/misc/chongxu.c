// chongxu.c 冲虚

#include <ansi.h>

inherit "/inherit/char/punisher";

void create()
{
	set_name("冲虚", ({ "chong xu", "xu" }));
	set("long",  "他就是武当派的高手冲虚道长，道貌岸然，飘飘欲仙。\n");
	set("gender", "男性");
	set("age", 55);
	set("attitude", "peaceful");
	set("shen_type", 1);
	set("str", 32);
	set("int", 33);
	set("con", 32);
	set("dex", 31);
	
	set("max_qi", 6000);
	set("max_jing", 3000);
	set("neili", 7500);
	set("max_neili", 7500);
	set("jiali", 150);
	set("combat_exp", 2500000);
	set("score", 10000000);

	set_skill("force", 280);
	set_skill("wudang-xinfa", 280);
        set_skill("taiji-shengong", 280);
	set_skill("dodge", 250);
	set_skill("tiyunzong", 250);
	set_skill("unarmed", 270);
	set_skill("taiji-quan", 270);
	set_skill("strike", 270);
	set_skill("wudang-zhang", 270);
        set_skill("hand", 270);
        set_skill("paiyun-shou", 270);
	set_skill("parry", 270);
	set_skill("sword", 270);
	set_skill("wudang-jian", 270);
        set_skill("taiji-jian", 270);
  	set_skill("taoism", 250);
	set_skill("literate", 100);
	set_skill("medical", 260);
	set_skill("liandan-shu", 260);

	map_skill("force", "taiji-shengong");
	map_skill("dodge", "tiyunzong");
	map_skill("unarmed", "taiji-quan");
	map_skill("parry", "taiji-quan");
	map_skill("sword", "taiji-jian");
	map_skill("strike", "wudang-zhang");

	prepare_skill("unarmed", "taiji-quan");
	prepare_skill("strike", "wudang-zhang");

	create_family("武当派", 0, "名宿");

	set("chat_chance_combat", 120);
	set("chat_msg_combat", ({
		(: perform_action, "sword.chan" :),
		(: perform_action, "sword.lian" :),
		(: perform_action, "sword.sui" :),
		(: exert_function, "recover" :),
	}));

	setup();
	carry_object("/clone/weapon/changjian")->wield();
	carry_object("/d/wudang/obj/whiterobe")->wear();
}
