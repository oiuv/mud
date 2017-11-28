inherit NPC;

void create()
{
        set_name("嫖客", ({ "piao ke", "piao", "ke" }) );
        set("gender", "男性" );
        set("age", 32);
        set("long",
              "一个上半身赤裸的男子。\n");
        set("shen_type", 1);
        set("combat_exp", 10000);
        set("str", 17);
        set("dex", 20);
        set("con", 17);
        set("int", 22);
        set("attitude", "peaceful");
        set_skill("dodge",20);
        set_skill("unarmed",20);
        set("chat_chance", 1);

        setup();
        add_money("silver", 50);
}

