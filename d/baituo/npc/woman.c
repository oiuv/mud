inherit NPC;

void create()
{
        set_name("农家妇女", ({ "fu nv", "fu", "nv" }));
        set("gender", "女性" );
        set("age", 32);
        set("long", "一个很精明能干的农家妇女。\n");
        set("shen_type", 1);
        set("combat_exp", 1200);
        set("str", 15);
        set("dex", 16);
        set("con", 15);
        set("int", 17);
        set("attitude", "friendly");
        setup();
        carry_object("/clone/misc/cloth")->wear();
        add_money("coin", 5);
}

