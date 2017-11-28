// jisi1.c

inherit NPC;

void create()
{
	set_name("老祭司", ({ "lao jisi", "jisi" }));
	set("age", 62);
	set("gender", "男性");
	set("long", "一个颇老朽的摆夷老人，穿戴齐整，是本村的祭司，权力颇大，相当于族长。\n"); set("attitude", "peaceful");

	set("str", 20);
	set("per", 12);
	set("dex", 16);
	set("combat_exp", 30000);
	set("shen_type", 1);

	set_skill("unarmed", 20);
	set_skill("dodge", 20);
	set_skill("parry", 20);
	set_skill("blade", 20);
	set_skill("force", 20);
	set_temp("apply/attack", 10);
	set_temp("apply/defense", 10);
	set_temp("apply/damage", 10);
	set_temp("apply/armor", 10);

	setup();
	carry_object(__DIR__"obj/bduanqun")->wear();
}
