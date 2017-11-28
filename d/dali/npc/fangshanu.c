// fangshanu.c

inherit NPC;

void create()
{
	set_name("纺纱女",({ "fangsha nu", "girl" }) );
        set("gender", "女性" );
        set("age", 17);
        set("long", "一个年轻的摆夷村妇，心灵手巧，专擅纺纱。\n");
 	set_temp("apply/defense", 5);
	set("combat_exp", 2000);
//        set("shen", 100);
	set("shen_type", 1);
        set("per", 18);
        set("str", 14);
        set("dex", 15);
        set("con", 16);
        set("int", 15);
        set("attitude", "friendly");
        setup();
        carry_object(__DIR__"obj/bduanqun")->wear();
}

