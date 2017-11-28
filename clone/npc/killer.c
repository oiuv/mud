// killer.c
// by doing

#include <ansi.h>

inherit NPC;

void create()
{
	set_name("杀手", ({ "killer", "sha shou" }) );
	set("gender", "男性" );
	set("age", 20 + random(20));

	set("long",
	        "这是一个身材高大的江湖人，两臂粗壮，膀阔"
                "腰圆，看起来似乎不怀好意。\n"
        );

	set("str", 25);
	set("con", 25);
	set("dex", 25);
	set("int", 25);

	set("combat_exp", 150000);
	set("attitude", "heroism");
	set("chat_chance_combat", 15);
	set("chat_msg_combat", ({
		"杀手骂道：你奶奶的，敢和我斗？不知道死字怎么写是么？\n",
		"杀手喝道：快把宝物交出来，我饶了你这条小命！\n",
		"杀手呵呵大笑：你遇到了老子我，那算是倒霉了！\n"
	}) );

	set_skill("blade", 80);
	set_skill("dodge", 80);
	set_skill("unarmed", 80);
	set_skill("parry", 80);
        set_skill("wuhu-duanmendao", 80);
        set_skill("feiyan-zoubi", 80);

        map_skill("blade", "wuhu-duanmendao");
        map_skill("parry", "wuhu-duanmendao");

        set_temp("apply/damage", 25);
        set_temp("apply/attack", 50);
        set_temp("apply/defense", 50);

	setup();

	carry_object("/clone/weapon/gangdao")->wield();
	carry_object("/clone/cloth/cloth")->wear();

        call_out("do_flee", 60);
}

void do_flee()
{
        if (! living(this_object()) || is_fighting())
                call_out("do_flee", 60);

        if (environment())
                message_vision("$N东张西望的看了一会儿，拔腿溜走了。\n",
                               this_object());

        destruct(this_object());
}

void unconcious()
{
        message_vision(HIR "$N" HIR "嚎道：“好么！这个江湖上到底还"
                       "是有比我狠的！”\n" NOR, this_object());
        ::unconcious();
}
