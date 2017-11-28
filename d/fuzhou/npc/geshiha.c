// geshiha.c
inherit NPC;

void create()
{
	set_name("戈什哈", ({ "ge shiha"}));
	set("gender", "男性");
	set("age", 25);

	set("long", "一个高大威猛的汉子，是靖海侯施琅大人的亲兵戈什哈。\n");
	set("combat_exp", 17500);
	set("shen_type", 1);
        set_skill("unarmed", 50);
        set_skill("dodge", 50);
	setup();
	carry_object("/clone/cloth/cloth")->wear();
}
	
