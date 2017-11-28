// lao-qiao.c ÇÇÈý»±

inherit NPC;

void create()
{
	set_name("ÇÇÈý»±", ({ "lao qiao", "qiao" }));
	set("gender", "ÄÐÐÔ");
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
