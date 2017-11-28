inherit NPC;

void create()
{
        set_name("村民", ({ "cun min", "min" }) );
        set("gender", "男性" );
        set("age", 30);
        set("long", "一个魁梧的庄稼汉子。\n");
        set("attitude", "friendly");
        set("combat_exp", 500);
        set("shen", 100);
        set("shen_type", 1);
        set("str", 22);
        set("dex", 18);
        set("con", 18);
        set("int", 13);
        setup();
        carry_object(__DIR__"obj/cloth")->wear();
        add_money("coin", 100);
}
