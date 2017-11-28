inherit NPC;

void create()
{
        set_name("Ê³¿Í",({"shi ke", "shi", "ke"}));
        set("gender", "ÄĞĞÔ");
        set("age",25);
        set("combat_exp", 3000);
        set("shen_type", 1);
        set("attitude", "peaceful");
        
        set_skill("unarmed", 40);
        set_skill("dodge", 40);
        set_temp("apply/attack", 20);
        set_temp("apply/defense", 20);

        setup();
        carry_object("/clone/misc/cloth")->wear();
}
