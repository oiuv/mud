// shami.c
inherit NPC;

void create()
{
        set_name("小沙弥", ({"xiao shami","shami",}));
        set("long",
                "他是本寺小沙弥。\n");
        set("gender", "男性");
        set("age", 12);
        set("attitude", "peaceful");
        set("shen_type", 1);
        set("class", "bonze");

        set("str", 20);
        set("int", 20);
        set("con", 22);
        set("dex", 25);

        set("max_qi", 150);
        set("max_jing", 100);
        set("neili", 150);
       set("max_neili", 150);

        set("combat_exp", 2000);
        set("score", 1000);

        set_skill("force", 30);
        set_skill("dodge", 20);
        set_skill("unarmed", 20);
        set_skill("parry", 20);
        set_temp("apply/attack", 15);
        set_temp("apply/defense", 15);
        set_temp("apply/damage", 5);

        setup();

        carry_object("/clone/cloth/dao-cloth.c")->wear();
}
