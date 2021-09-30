// zheng.c

inherit NPC;

void create()
{
    set_name("郑镖头", ({ "zheng biaotou", "zheng" }));
    set("gender", "男性");
    set("age", 45);

    set("combat_exp", 10000);
    set("shen_type", 1);

    set_skill("unarmed", 30);
    set_skill("blade", 50);
    set_skill("parry", 50);
    set_skill("dodge", 50);

    set_temp("apply/attack", 25);
    set_temp("apply/defense", 25);
    set_temp("apply/damage", 30);

    setup();
    carry_object("/clone/weapon/gangdao")->wield();
    carry_object("/clone/cloth/cloth")->wear();
}
