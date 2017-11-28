// girl.c

inherit NPC;

void create()
{
	set_name("摆夷女子",({ "girl" }) );
        set("gender", "女性" );
        set("age", 22);
        set("long", "她是一个身着白衣的摆夷女子，长发飘飘，身态娥娜。\n");
 	set_temp("apply/defense", 5);
	set("combat_exp", 7000);
//        set("shen", 100);
	set("shen_type", 1);
        set("per", 24);
        set("str", 24);
        set("dex", 25);
        set("con", 16);
        set("int", 15);
        set("attitude", "friendly");
        setup();
        carry_object(__DIR__"obj/whitecloth")->wear();
}

