// seller.c

inherit NPC;
inherit F_VENDOR;

void create()
{
	set_name("小贩", ({ "seller" }) );
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
	set("inquiry", ([
		"大力丸" : "看你也是正人君子，怎么问这个？\n",
	]) );
	set("vendor_goods", ({
		"/d/village/npc/obj/bottle",
		"/d/village/npc/obj/egg",
	}) );
	setup();
        carry_object("/clone/misc/cloth")->wear();
	add_money("coin", 100);
}
void init()
{
	object ob;
        ::init();
        if( interactive(ob=this_player()) && !is_fighting() )
        {
                remove_call_out("greeting");
                call_out("greeting", 1, ob);
        }

        add_action("do_buy", "buy");
        add_action("do_list", "list");
}
void greeting(object ob)
{
        if (ob->query("gender")!="女性")
                say("小贩吆喝道：大力丸，大力丸，一夜管睡百姑娘！\n");
        return;
}
