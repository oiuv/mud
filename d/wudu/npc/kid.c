inherit NPC;

void create()
{
        set_name("小孩",({ "kid" }) );
        set("gender", "男性" );
        set("age", 7);
        set("long", "这是个农家小孩子\n");
        set("combat_exp", 50);
       set("max_qi", 150);
        set("shen_type", 1);
        set("str", 10);
        set("dex", 10);
        set("con", 10);
        set("int", 10);
        set("attitude", "friendly");

        setup();
        carry_object("/d/city/obj/cloth")->wear();
        add_money("coin",50);
}
