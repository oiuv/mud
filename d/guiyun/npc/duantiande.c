inherit NPC;

void create()
{
        set_name("段天德", ({ "duan tiande", "duan" }));
        set("gender", "男性");
        set("title", "大宋兵马指挥使");
        set("age", 45);
        set("per", 15);
        set("long", "他是大宋临安兵马指挥使。\n");
        set("combat_exp", 4000);
        set_skill("dodge", 20);
        set_skill("unarmed", 20);
        set_temp("apply/attack",  20);
        set_temp("apply/defense", 20);
        set("shen_type", -1);
        setup();

        add_money("silver", 50);
        carry_object("/d/city/npc/obj/junfu")->wear();
}
