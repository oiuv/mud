// lao-qiao.c 乔三槐

inherit NPC;

void create()
{
	set_name("乔三槐", ({ "lao qiao", "qiao" }));
	set("gender", "男性");
	set("age", 55 );

	set_skill("unarmed", 20);
	set_skill("dodge", 20);
	set("qi", 400);
	set("max_qi", 400);
	set("eff_qi", 400);
	set("jing", 300);
	set("max_jing", 300);

	setup();

}
