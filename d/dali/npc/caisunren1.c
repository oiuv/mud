// caisunren1.c

inherit NPC;

void create()
{
	set_name("采笋人",({ "caisun ren", "ren" }) );
        set("gender", "男性" );
        set("age", 22);
        set("long", "一个壮年村民，住在数里外的村庄，背后背了个竹筐，手拿一把砍柴刀，上山来采竹笋。\n");
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
        carry_object(__DIR__"obj/maotan")->wear();
        carry_object(__DIR__"obj/kandao")->wield();
}

