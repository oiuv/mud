// yafu.c

inherit NPC;

void create()
{
	set_name("哑妇",({ "yafu" }) );
        set("gender", "女性" );
        set("age", 37);
        set("long", "这是个终年不开口的哑妇\n");
        set("combat_exp", 50000);
	set("shen_type", 0);
	set("str", 21);
	set("per", 20);
	set("dex", 21);
	set("con", 21);
	set("int", 21);
        set("attitude", "friendly");
        setup();
	carry_object("/clone/misc/cloth")->wear();
}

