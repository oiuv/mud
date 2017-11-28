inherit NPC;

void create()
{
        set_name("Çîºº", ({ "qong han","han"}) );
        set("gender", "ÄĞĞÔ" );
        set("age", 33);
        set("long", "Ò»¸öÇîÀ§ÁÊµ¹µÄºº×Ó¡£\n");
        set("attitude", "friendly");
        set("combat_exp", 5000);
        set("shen_type", 1);
        set_skill("unarmed", 40);
        set_skill("dodge", 40);
        set_skill("parry", 40);
        set_temp("apply/attack", 20);
        set_temp("apply/defense", 15);
        setup();
        carry_object("/clone/misc/cloth")->wear();
}

