inherit NPC;

void create()
{
        set_name("太监", ({ "tai jian", "tai", "jian" }) );
        set("gender", "无性" );
        set("age", 32);

        set("shen_type", 1);
        set("combat_exp", 1000);
        set("attitude", "peaceful");

        setup();
        carry_object("/d/beijing/npc/obj/cloth")->wear();
}

