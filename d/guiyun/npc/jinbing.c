// jinbing.c

inherit NPC;

void create()
{
	set_name("大金兵", ({ "jin bing", "bing" }));
	set("gender", "男性");
	set("age", 25);
	set("long", "那些大汉个个虎背熊腰，甚是剽健。\n");
	set("combat_exp", 40000);
        set_skill("dodge", 50);
        set_skill("unarmed", 50);
        set_temp("apply/attack",  50);
        set_temp("apply/defense", 50);
	set("shen_type", 1);
	setup();

	add_money("silver",3);
	carry_object("/clone/misc/cloth")->wear();
}


