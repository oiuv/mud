// girl.c

inherit NPC;

void create()
{
        set_name("女孩",({ "girl" }) );
        set("gender", "女性" );
        set("age", 12);
        set("long",
"这是个渔家少女，虽然只有十二、三岁，但由于处在热带，身材已经发育得很好了。\n");
        set_temp("apply/defense", 5);
        set("combat_exp", 70);
        set("shen_type", 1);
        set("str", 14);
        set("dex", 15);
        set("con", 16);
        set("int", 15);
        set("attitude", "friendly");
        setup();
        carry_object("/clone/misc/cloth")->wear();
        add_money("coin", 80);
}

