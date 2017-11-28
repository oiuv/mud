// kanzhuren.c

inherit NPC;

void create()
{
	set_name("砍竹人",({ "kanzhu ren", "ren" }) );
        set("gender", "男性" );
        set("age", 22);
        set("long", "一个壮年村民，住在山下的村落里，是上山来砍伐竹子的。\n");
        set_temp("apply/defense", 15);
	set("combat_exp", 1700);
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

