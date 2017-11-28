// shaonu.c

inherit NPC;

void create()
{
	set_name("少女",({ "shao nu", "girl" }) );
        set("gender", "女性" );
        set("age", 17);
        set("long", "一位乌夷族的少女，以酥泽发，盘成两环，上披蓝纱头巾，饰以花边。\n");
 	set_temp("apply/defense", 5);
	set("combat_exp", 7000);
//        set("shen", 100);
	set("shen_type", 1);
        set("per", 28);
        set("str", 14);
        set("dex", 15);
        set("con", 16);
        set("int", 15);
        set("attitude", "friendly");
        setup();
        carry_object(__DIR__"obj/wchangqun")->wear();
}

