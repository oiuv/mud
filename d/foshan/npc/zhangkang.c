// zhangkang.c

inherit NPC;

void create()
{
	set_name("张康", ({ "zhang kang", "zhang" }));
	set("gender", "男性");
	set("age", 25);
	set("per", 20);
	set("long", "这是个老实巴交的汉子，是张朝唐的从人。\n");
	set("combat_exp", 2000);
        set_skill("dodge", 20);
        set_skill("unarmed", 20);
        set_temp("apply/attack",  10);
        set_temp("apply/defense", 10);
	set("shen_type", 1);
	setup();

	add_money("silver",3);
	carry_object("/clone/misc/cloth")->wear();
}

