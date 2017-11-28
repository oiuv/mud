// wu-shi2.c 盟主卫士

#include <ansi.h>

inherit NPC;

void create()
{
	set_name("红衣武士", ({ "wei shi", "shi", "guard" }) );
	set("gender", "男性");
	set("age", 35);
	set("long",
		"这是位红衣武士，身披钢甲，手执长剑，双目精光炯炯，警惕地巡视着四周的情形。\n");
	set("combat_exp", 80000);
        set("shen_type", 1);
	set("attitude", "heroism");

	set("str", 28);
	set("con", 23);
	set("int", 20);
	set("dex", 26);

	set("max_qi", 450);
	set("eff_qi", 450);
	set("qi", 450);
	set("max_jing", 200);
	set("jing", 200);
	set("neili", 400);
	set("max_neili", 400);
	set("jiali", 25);
	set("shen_type", 0);

	set_temp("apply/attack",  40);
	set_temp("apply/defense", 40);

	set_skill("sword", 80);
	set_skill("unarmed", 60);
	set_skill("parry", 80);
	set_skill("dodge", 80);

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
		message_vision(HIY "红衣武士举起长剑，向$N齐声大喊：盟主万岁，万岁，万万岁！\n" NOR, 
		this_player());
	}	
}