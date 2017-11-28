// kid.c

inherit NPC;

void create()
{
	set_name("男孩",({ "boy" }) );
        set("gender", "男性" );
        set("age", 13);
        set("long", 
"这是个城里的少年。\n");

        set("str", 17);
        set("dex", 16);
        set("con", 15);
        set("int", 17);
	set("shen_type", 1);
//	set("shen", 100);
        set_temp("apply/defense", 10);
        set("combat_exp", 100);
        set("attitude", "peaceful");

        setup();
        carry_object(__DIR__"obj/cloth")->wear();
}