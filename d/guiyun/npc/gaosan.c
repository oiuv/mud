// gaosan.c
#include <ansi.h>

inherit F_UNIQUE;
inherit NPC;

void create()
{
	set_name("高三娘子", ({ "gao san", "gao"}));
	set("title", HIR "万马庄女庄主" NOR);
	set("long", "这女子颇有几分姿色，两幅罗裙外面系着绣花鸾带。
腰间整整齐齐插着两排短刀。\n");
	set("gender", "女性");
	set("age", 31);
	set("attitude", "peaceful");
	set("shen_type", 1);
	set("per", 22);
	set("str", 15);
	set("int", 25);
	set("con", 25);
	set("dex", 30);
	
	set("max_qi", 1000);
	set("max_jing", 200);
	set("neili", 1000);
	set("max_neili", 1000);
	set("jiali", 50);
	set("combat_exp", 50000+random(10000));
	set("score", 20000);

	set_skill("force", 50);
	set_skill("dodge", 50);
	set_skill("unarmed", 50);
	set_skill("throwing", 50);
	set_skill("feixing-shu", 50);
	set_skill("lingxu-bu",50);
	map_skill("dodge", "lingxu-bu");
	map_skill("parry", "feixing-shu");
	map_skill("throwing", "feixing-shu");

	set_temp("apply/attack", 25);
	set_temp("apply/attack", 25);
	set_temp("apply/damage", 25);
	setup();
	carry_object(__DIR__"obj/shortblade");
	carry_object("/clone/misc/cloth")->wear();
}

