inherit NPC;

void create()
{
        set_name("Ğ¡º¢", ({ "kid", "xiaohai" }) );
        set("gender", "ÄĞĞÔ" );
        set("age", 5);
        set("shen_type", 1);
        set("combat_exp", 10000);
        set("str", 20);
        set("dex", 20);
        set("con", 20);
        set("int", 20);
        set("attitude", "peaceful");


        setup();
        carry_object("/d/beijing/npc/obj/cloth")->wear();
}

