// yangcannu.c

inherit NPC;

void create()
{
	set_name("养蚕女",({ "yangcan nu", "girl" }) );
        set("gender", "女性" );
        set("age", 21);
        set("long", "一个年轻的摆夷村妇，养蚕纺丝为生。\n");
 	set_temp("apply/defense", 5);
	set("combat_exp", 5000);
//        set("shen", 100);
	set("shen_type", 1);
        set("per", 21);
        set("str", 14);
        set("dex", 15);
        set("con", 16);
        set("int", 15);
        set("attitude", "friendly");
        setup();
        carry_object(__DIR__"obj/bduanqun")->wear();
}

