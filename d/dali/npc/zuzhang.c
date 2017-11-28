// zuzhang.c

inherit NPC;

void create()
{
	set_name("族长", ({ "zu zhang", "zhang" }));
	set("age", 62);
	set("gender", "女性");
	set("long", "一位满脸皱纹的老年妇女，正是本村的族长。台夷时处母系氏族，族中权贵皆为妇女。\n");
	set("attitude", "peaceful");

	set("str", 24);
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
	carry_object(__DIR__"obj/tongqun")->wear();
}
