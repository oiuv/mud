inherit NPC;

void create()
{
        set_name("Ìô·ò", ({ "tiao fu", "tiao", "fu" }) );
        set("gender", "ÄÐÐÔ" );
        set("age", 25);
        set("shen_type", 1);
        set("combat_exp", 10000);
        set("str", 20);
        set("dex", 20);
        set("con", 20);
        set("int", 20);
        set("attitude", "peaceful");
        set_skill("dodge",20);
        set_skill("unarmed",20);
        set("chat_chance", 1);

        setup();
        carry_object("/d/beijing/npc/obj/cloth")->wear();
        add_money("coin", 10);
}

