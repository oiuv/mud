// xiaolan.c

inherit NPC;

void create()
{
	set_name("小兰", ({ "xiao lan", "lan" }));
	set("long", "一个模样乖巧的小丫环，扎两个发环，眼睛大大的，嘴角浅浅一对酒窝。\n");
	set("gender", "女性");
	set("age", 15);
	set("combat_exp", 1000);
        set_skill("dodge", 10);
        set_skill("unarmed", 10);
        set_temp("apply/attack",  10);
        set_temp("apply/defense", 10);
	set("shen_type", 1);
	setup();

	add_money("silver",1);
	carry_object(__DIR__"obj/red_cloth")->wear();
}

