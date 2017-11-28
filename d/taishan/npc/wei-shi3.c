// wu-shi1.c 盟主卫士

#include <ansi.h>

inherit NPC;

void create()
{
	set_name("青衣武士", ({ "wei shi", "shi", "guard" }) );
	set("gender", "男性");
	set("age", 35);
	set("long",
		"这是位青衣武士，身披钢甲，手执长剑，双目精光炯炯，警惕地巡视着四周的情形。\n");
	set("combat_exp", 60000);
        set("shen_type", 1);
	set("attitude", "heroism");

	set("str", 26);
	set("con", 22);
	set("int", 20);
	set("dex", 24);

	set("max_qi", 400);
	set("eff_qi", 400);
	set("qi", 400);
	set("max_jing", 200);
	set("jing", 200);
	set("neili", 300);
	set("max_neili", 300);
	set("jiali", 20);
	set("shen_type", 0);

	set_temp("apply/attack",  30);
	set_temp("apply/defense", 30);

	set_skill("sword", 60);
	set_skill("unarmed", 50);
	set_skill("parry", 60);
	set_skill("dodge", 60);

	setup();

        carry_object("/d/city/obj/changjian")->wield();
        carry_object("/d/city/obj/tiejia")->wear();
}

void init()
{
	object ob1;
	string mengzhu;
	
	if(!( ob1 = find_living("mengzhu")) )
	ob1 = load_object("/clone/npc/meng-zhu");
	mengzhu = ob1->query("winner");

	if( this_player()->query("id") == mengzhu ) {
		message_vision(HIY "青衣武士举起长剑，向$N齐声大喊：盟主万岁，万岁，万万岁！\n" NOR, 
		this_player());
	}	
}