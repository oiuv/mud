// liuqiushui.c

#include <ansi.h>

inherit "/inherit/char/punisher";

void create()
{
	set_name("李秋水", ({ "li qiushui", "li" }));
	set("long",  "她体态轻盈，姿势曼妙，只是脸上蒙了一张面纱，看不真切。\n");
	set("gender", "女性");
	set("age", 88);
	set("attitude", "peaceful");
	set("shen_type", 1);
	set("str", 34);
	set("int", 39);
	set("con", 38);
	set("dex", 37);
	
	set("max_qi", 6000);
	set("max_jing", 3000);
	set("neili", 7500);
	set("max_neili", 7500);
	set("jiali", 150);
	set("combat_exp", 2500000);
	set("score", 10000000);

	set_skill("force", 270);
        set_skill("xiaowuxiang", 270);
	set_skill("dodge", 270);
	set_skill("lingbo-weibu", 270);
	set_skill("liuyang-zhang", 240);
	set_skill("parry", 270);
	set_skill("zhemei-shou", 240);
	set_skill("hand", 240);
        set_skill("strike", 240);
	set_skill("literate", 200);
	set_skill("medical", 290);
	set_skill("xiaoyao-qixue", 290);

	map_skill("force", "xiaowuxiang");
	map_skill("dodge", "lingbo-weibu");
	map_skill("hand", "zhemei-shou");
	map_skill("strike", "liuyang-zhang");
	map_skill("parry", "zhemei-shou");

	prepare_skill("hand","zhemei-shou");
	prepare_skill("strike","liuyang-zhang");

	create_family("逍遥派", 0, "前辈");

	set("chat_chance_combat", 120);
	set("chat_msg_combat", ({
		(: perform_action, "hand.jiubu" :),
		(: perform_action, "strike.jiutian" :),
		(: perform_action, "dodge.lingbo" :),
		(: exert_function, "recover" :),
	}));

	setup();
	carry_object("/clone/misc/cloth")->wear();
}
