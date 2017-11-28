// wang.c
#include <ansi.h>
inherit NPC;

void create()
{
	set_name("王夫人", ({ "wang furen", "wang" }));
	set("gender", "女性");
	set("title", HIY"金刀"NOR);
	set("long", "她是洛阳金刀王老爷子的独生爱女，福威镖局总镖头夫人。");
	set("age", 39);

	set("combat_exp", 25000);
	set("shen_type", 1);

	set_skill("unarmed", 50);
	set_skill("blade", 50);
	set_skill("parry", 50);
	set_skill("dodge", 50);
	set_skill("yanxing-dao", 50);
	map_skill("parry", "yanxing-dao");
	map_skill("blade", "yanxing-dao");

	setup();
	carry_object("/clone/weapon/gangdao")->wield();
	carry_object("/clone/cloth/cloth")->wear();
}
