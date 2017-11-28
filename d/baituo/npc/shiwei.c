inherit NPC;
void create()
{
        set_name("仕卫", ({"shi wei", "wei"}) );
        set("gender", "男性" );
        set("age", 25);
        set("long", "这是个样子威严的仕卫。\n");
        set("attitude", "friendly");
        set("shen_type", -1);

        set("str", 22);
        set("int", 23);
        set("con", 22);
        set("dex", 21);

        set("max_qi", 400);
        set("max_jing", 300);
        set("neili", 200);
        set("max_neili", 200);
        set("combat_exp", 50000);
        set("score", 3000);

        set_temp("apply/attack", 30);
        set_temp("apply/defense", 20);
        set_temp("apply/damage", 20);
        set_temp("apply/armor",20);

        setup();
        add_money("coin", 20);
        carry_object("/d/baituo/obj/dadao")->wield();
        carry_object("/clone/misc/cloth")->wear();
}
