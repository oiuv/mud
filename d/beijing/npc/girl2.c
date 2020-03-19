inherit NPC;

void create()
{
        set_name("少妇", ({ "shao fu", "fu" }) );
        set("gender", "女性" );
        set("age", 23);

        set("shen_type", 1);
        set("combat_exp", 10000);
        set("str", 20);
        set("dex", 20);
        set("con", 20);
        set("int", 20);
        set("attitude", "peaceful");

        setup();
        carry_object("/d/beijing/npc/obj/nvcloth")->wear();
        add_money("silver", 2);
}

