inherit NPC;

void create()
{
        set_name("游客", ({ "you ke", "you", "ke" }));
        set("gender", "男性" );
        set("age", random(20) + 10);
        set("long", "这是一个游山玩水的游人。\n");

        set_temp("apply/attack", 30);
        set_temp("apply/defense", 20);
        set("combat_exp", 2000);
        set("shen_type", 1);
        set("str", 24);
        set("dex", 20);
        set("con", 20);
        set("int", 18);
        set("attitude", "friendly");

        setup();
        carry_object(__DIR__"obj/cloth")->wear();
        add_money("silver", 5);
}
