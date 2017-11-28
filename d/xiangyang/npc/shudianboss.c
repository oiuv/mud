// shudianboss.c

inherit NPC;
inherit F_VENDOR;

void create()
{
	set_name("书店老板", ({ "shudian laoban", "boss" }) );
	set("gender", "男性" );
	set("age", 62);
	set("long", "一个让孩子们一见就觉得可亲的老翁。\n");
	set("combat_exp", 3000);
        set("str", 17);
        set("dex", 20);
        set("con", 17);
        set("int", 22);
	set("attitude", "friendly");
	set("vendor_goods", ({
                "/clone/book/parry_book",
	}) );
	setup();
        carry_object("/clone/misc/cloth")->wear();
	add_money("coin", 100);
}
void init()
{
        ::init();
        add_action("do_buy", "buy");
        add_action("do_list", "list");
}

