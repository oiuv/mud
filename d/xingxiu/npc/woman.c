inherit NPC;

void create()
{
        set_name("维吾尔族妇女", ({ "fu nv", "fu", "nv" }));
        set("gender", "女性" );
        set("age", 40);
        set("long", "一个很胖的维吾尔族中年妇女。\n");
        set("combat_exp", 150);
        set("env/wimpy", 60);
        set("chat_chance_combat", 50 );
        set("str", 13);
        set("dex", 12);
        set("con", 14);
        set("int", 13);
        set("attitude", "friendly");
        setup();
        carry_object("/clone/cloth/wcloth")->wear();
        add_money("coin", 100);
}

