// muyangren.c

inherit NPC;

void create()
{
	set_name("牧羊人",({ "muyang ren", "ren" }) );
        set("gender", "男性" );
        set("age", 22);
        set("long", "他一个摆夷牧羊男子。\n");
        set_temp("apply/defense", 15);
	set("combat_exp", 170);
	set("shen_type", 1);
        set("per", 18);
        set("str", 24);
        set("dex", 25);
        set("con", 16);
        set("int", 15);
        set("attitude", "friendly");
        setup();
        carry_object(__DIR__"obj/wchangqun")->wear();
        carry_object("/clone/weapon/bian")->wear();
}

