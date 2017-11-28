//wanxi.c

inherit NPC;
inherit F_DEALER;

void create()
{
	set_name("萧万喜", ({ "xiao wanxi", "xiao", "wanxi"}));
	set("title", "当铺老板");
	set("shen_type", 1);
	set("gender", "男性");
	set_max_encumbrance(100000000);
	set("age", 34);
	set("str", 100);
	set("long",
		"萧万喜是东城萧员外的胞弟。\n");
	set("no_get_from", 1);
	set_skill("unarmed", 60);
	set_skill("dodge", 60);
	set_temp("apply/attack", 30);
	set_temp("apply/attack", 30);
	set_temp("apply/damage", 15);
	set("combat_exp", 50000);
	set("attitude", "friendly");
	
	setup();
	carry_object(__DIR__"obj/choupao")->wear();
}

void init()
{
	add_action("do_list", "list");
        add_action("do_buy", "buy");
	add_action("do_sell", "sell");
	add_action("do_value", "value");
}

int clean_up()
{
        return 0;
}

void die()
{
        message_vision("\n$N一声惨叫，死了。\n", this_object());
        destruct(this_object());
}

void unconcious()
{
        die();
}
