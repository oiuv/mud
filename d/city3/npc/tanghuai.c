// tanghuai.c

#include <ansi.h>

inherit NPC;
inherit F_DEALER;

int redeem(string arg);

void create()
{
	set_name("唐槐", ({ "tang huai", "tang" }));
	set("title", "兵器铺老板");
	set("shen_type", 0);

	set("gender", "男性");
	set_max_encumbrance(100000000);
	set("age", 35);
	set("long",
		"据说唐槐是四川唐家的后代。\n");
	set("no_get_from", 1);

	set_skill("unarmed", 60);
	set_skill("dodge", 60);
	set_temp("apply/attack", 30);
	set_temp("apply/attack", 30);
	set_temp("apply/damage", 15);

	set("combat_exp", 50000);
	set("attitude", "friendly");
	set("vendor_goods", ({
                __DIR__"obj/feihuangshi",
		__DIR__"obj/flower-leaf",
		__DIR__"obj/tea-leaf",
		__DIR__"obj/tielianzi"
	}));
	
	setup();
	carry_object("/clone/misc/cloth")->wear();
}

void init()
{
        add_action("do_list", "list");
        add_action("do_buy", "buy");
}
