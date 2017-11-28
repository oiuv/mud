// xiaoju.c

inherit NPC;

void create()
{
	set_name("小菊", ({ "xiao ju", "ju" }));
	set("long", "一个模样乖巧的小丫环，瓜子脸，肤色白晰。细看时，嘴角有一颗小痣。\n");
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

