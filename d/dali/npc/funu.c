// funu.c

inherit NPC;

void create()
{
	set_name("台夷妇女",({ "fu nu", "woman" }) );
        set("gender", "女性" );
        set("age", 37);
        set("long", "一位中年的台夷妇女，上着无领衬花对襟，下穿五色筒裙，正在编织渔网。\n");
 	set_temp("apply/defense", 5);
	set("combat_exp", 3000);
	set("shen_type", 1);
        set("per", 20);
        set("str", 24);
        set("dex", 25);
        set("con", 16);
        set("int", 15);
        set("attitude", "friendly");
        setup();
        carry_object(__DIR__"obj/tongqun")->wear();
}

