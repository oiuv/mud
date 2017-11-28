// mujiang.c

inherit NPC;
inherit F_VENDOR;

void create()
{
	set_name("木匠", ({ "mu jiang", "mu", "jiang" }) );
	set("gender", "男性" );
	set("age", 32);
	set("long",
		"这位木匠正在埋头工作，因为发现你在注视着他，就抬起头来微笑了一下。\n");
	set("combat_exp", 300);
        set("str", 17);
        set("dex", 20);
        set("con", 17);
        set("int", 22);
	set("attitude", "friendly");
	set("vendor_goods", ({
		__DIR__"obj/mujian",
		__DIR__"obj/mudao",
                __DIR__"obj/mugun",
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

