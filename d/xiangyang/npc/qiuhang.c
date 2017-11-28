// qiuhang.c 邱航 

#include <ansi.h>

inherit NPC;
inherit F_DEALER;

void create()
{
	set_name("邱航", ({ "qiu hang", "qiu" }));
	set("title", "当铺老板");
	set("nickname", "老滑头");
	set("shen_type", 0);

	set("gender", "男性");
	set_max_encumbrance(100000000);
	set("age", 55);
	set("str", 100);
	set("long", "一个老奸商，你要被宰了！\n");
	set("no_get_from", 1);

	set_skill("unarmed", 60);
	set_skill("dodge", 60);
	set_temp("apply/attack", 30);
	set_temp("apply/attack", 30);
	set_temp("apply/damage", 15);

	set("combat_exp", 50000);
	set("attitude", "friendly");
	
	setup();
	carry_object("/clone/misc/cloth")->wear();
}

void init()
{
	add_action("do_list", "list");
        add_action("do_buy", "buy");
	add_action("do_sell", "sell");
	add_action("do_value", "value");
}

void die()
{
	message_vision("\n$N死了。\n", this_object());
	destruct(this_object());
}
