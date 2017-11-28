// laoseng.c 雪山老僧

#include <ansi.h>

inherit "/inherit/char/punisher";

void create()
{
	set_name("雪山老僧", ({ "lao seng", "seng" }));
	set("long",  "此人一副雪山派的打扮，神采飘逸，一看便是得道高僧。\n");
	set("gender", "男性");
	set("age", 62);
	set("attitude", "peaceful");
	set("shen_type", 1);
	set("str", 33);
	set("int", 36);
	set("con", 34);
	set("dex", 33);
	
	set("max_qi", 6000);
	set("max_jing", 3000);
	set("neili", 7500);
	set("max_neili", 7500);
	set("jiali", 150);
	set("combat_exp", 2500000);
	set("score", 10000000);

        set_skill("force", 270);
        set_skill("xiaowuxiang", 270);
        set_skill("mizong-neigong", 270);
        set_skill("dodge", 240);
        set_skill("shenkong-xing", 240);
        set_skill("parry", 270);
        set_skill("sword", 220);
        set_skill("mingwang-jian", 220);
        set_skill("lamaism", 250);
        set_skill("literate", 220);
        set_skill("strike", 270 );
        set_skill("huoyan-dao", 270);
	set_skill("cuff", 260);
	set_skill("yujiamu-quan", 260);
	set_skill("hand", 270);
	set_skill("dashou-yin", 270);

        map_skill("force", "xiaowuxiang");
        map_skill("dodge", "shenkong-xing");
        map_skill("parry", "mingwang-jian");
        map_skill("sword", "mingwang-jian");
        map_skill("strike","huoyan-dao");
	map_skill("cuff", "yujiamu-quan");

        prepare_skill("strike", "huoyan-dao");
	prepare_skill("hand", "dashou-yin");

	create_family("大轮寺", 0, "高僧");
        set("class", "bonze");

	set("chat_chance_combat", 120);
	set("chat_msg_combat", ({
		(: perform_action, "sword.bei" :),
		(: perform_action, "strike.fen" :),
		(: perform_action, "cuff.chen" :),
		(: exert_function, "recover" :),
	}));

	setup();
	carry_object("/clone/weapon/changjian")->wield();
        carry_object("/d/xueshan/obj/y-jiasha")->wear();
}
