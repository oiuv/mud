// laodaoshi.c
inherit NPC;

void create()
{
	set_name("老道士", ({"lao daoshi", "daoshi"}));
	set("long", "这是一个精壮老道士。\n");

	set("gender", "男性");
	set("attitude", "peace");
	set("class", "taoist");

	set("age", 67);
	set("shen_type", 1);
	set("str", 25);
	set("int", 20);
	set("con", 20);
	set("dex", 25);
	set("max_qi", 500);
	set("max_jing", 100);
	set("neili", 500);
	set("max_neili", 500);
	set("jiali", 100);
	set("combat_exp", 20000);
	set("score", 100);
	set("apply/attack",  30);
	set("apply/defense", 30);

	set_skill("force", 50);
	set_skill("unarmed", 50);
	set_skill("dodge", 50);
	set_skill("parry", 50);
	set_skill("tiyunzong", 50);
	set_skill("taiji-shengong", 50);

	map_skill("force", "hunyuan-yiqi");
	map_skill("dodge", "tiyunzong");

	setup();
	carry_object("/d/wudang/obj/greyrobe")->wear();
	add_money("silver", 5);
}

