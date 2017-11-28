// nanpu.c

inherit NPC;

void create()
{
        set_name("ÄĞÆÍ", ({ "nan pu", "pu" }));
        set("gender", "ÄĞĞÔ");
        set("age", 25);

        set("combat_exp", 4000);
        set_skill("dodge", 20);
        set_skill("unarmed", 20);
        set_temp("apply/attack",  10);
        set_temp("apply/defense", 10);
        set("shen_type", -1);
        setup();

        add_money("silver",3);
        carry_object("/clone/misc/cloth")->wear();
}

