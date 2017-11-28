// shipopo.c 史婆婆

inherit NPC;
inherit F_UNIQUE;

void create()
{
        set_name("史婆婆", ({ "shi", "popo" }));
        set("title", "金乌派掌门人");
        set("gender", "女性");
        set("long", "她是雪山派掌门人白自在的妻子，虽说现在人已显得苍老，\n"
        "但几十年前提起“江湖一枝花”史小翠来，武林中却是无人不知。\n");
        set("age", 68);

        set("int", 30);

        set("qi", 500);
        set("max_qi", 500);
        set("jing", 500);
        set("max_jing", 500);
        set("shen_type", 1);

        set("combat_exp", 75000);
        set("attitude", "friendly");

        set_skill("force", 70);
        set_skill("dodge", 70);
        set_skill("blade", 40);
        set_skill("parry", 90);
        set_skill("unarmed", 90);
        set_skill("jinwu-daofa", 70);
        set_skill("yanfly", 70);

        set_temp("apply/attack", 50);
        set_temp("apply/defense", 50);
        set_temp("apply/damage", 35);


        map_skill("blade", "jinwu-daofa");
        map_skill("parry", "jinwu-daofa");
        map_skill("dodge", "yan-fly");
        setup();
        carry_object("/clone/weapon/gangdao")->wield();
}
