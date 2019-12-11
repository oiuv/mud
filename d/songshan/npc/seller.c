// seller.c
#include <ansi.h>;

inherit KNOWER;
inherit F_VENDOR;

void create()
{
	set_name("小贩", ({ "seller" }) );
	set("nickname", HIC "消息灵通" NOR);
	set("gender", "男性" );
	set("age", 32);
	set("long",
		"这是个小贩，别看他长的老老实实，可你别想从他那儿掏便宜。\n");
	set("combat_exp", 300);
        set("str", 17);
        set("dex", 20);
        set("con", 17);
        set("int", 22);
	set("attitude", "friendly");
	set("vendor_goods", ({
		"/d/village/npc/obj/stick",
		"/d/village/npc/obj/shoes",
                "/d/village/npc/obj/bottle",
	}));

        set("chat_msg_chance", 5);
        set("chat_msg", ({
                "小贩慢悠悠的道：我虽然是个做小买卖的，但是嵩山方"
                "圆几十里地的事情我还真没有不知道的。\n",
                "小贩看看你道：你有啥事？不妨和我说说，也许我就知道。\n",
                "小贩得意的摇摇头道：要说京城的事情那是老爷们清楚，可是这嵩山的事情，那就要算我了。\n",
        }));

	setup();

        carry_object("/clone/cloth/cloth")->wear();
	add_money("coin", 100);
}

void init()
{
        ::init();
        add_action("do_buy", "buy");
        add_action("do_list", "list");
}
