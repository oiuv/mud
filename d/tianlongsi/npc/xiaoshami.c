// xiaoshami.c
inherit NPC;

void create()
{
	set_name("Ğ¡É³ÃÖ", ({ "xiao shami","shami"}) );
	set("gender", "ÄĞĞÔ" );
	set("class", "bonze");
	set("age", 15);
	set("shen_type", 1);
	set("str", 20);
	set("int", 20);
	set("con", 20);
	set("dex", 20);

	set("qi", 500);
	set("max_qi", 500);
	set("jing", 100);
	set("max_jing", 100);
	set("neili", 100);
	set("max_neili", 100);
	set("jiali", 10);
	set("combat_exp", 8000);
	set("score", 1000);

	set_skill("force", 80);
	set_skill("dodge", 80);
	set_skill("parry", 70);
	set_skill("tiannan-step", 80);
	set_skill("kurong-changong", 70);

	map_skill("force", "kurong-changong");
	map_skill("dodge", "tiannan-step");
	map_skill("force", "hunyuan-yiqi");
	map_skill("dodge", "shaolin-shenfa");
	
	setup();
	carry_object("/d/xueshan/obj/y-jiasha")->wear();
}
