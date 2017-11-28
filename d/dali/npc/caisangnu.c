// caisangnu.c

inherit NPC;

void create()
{
	set_name("采桑女",({ "caisang nu", "girl" }) );
        set("gender", "女性" );
        set("age", 17);
        set("long", "一个年轻的摆夷采桑姑娘。\n");
 	set_temp("apply/defense", 5);
	set("combat_exp", 7000);
//        set("shen", 100);
	set("shen_type", 1);
        set("per", 23);
        set("str", 14);
        set("dex", 15);
        set("con", 16);
        set("int", 15);
        set("attitude", "friendly");
        setup();
        carry_object(__DIR__"obj/bduanqun")->wear();
}

