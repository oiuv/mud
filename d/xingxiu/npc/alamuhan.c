inherit NPC;

void create()
{
        set_name("阿拉木罕", ({ "ala muhan", "ala", "muhan" }));
        set("long", "她身段不肥也不瘦。她的眉毛像弯月，她的眼睛很多情。\n");
        set("title", "牧羊姑娘");
        set("gender", "女性");
        set("age", 17);

        set_skill("unarmed", 20);
        set_skill("dodge", 40);
        set_skill("parry", 20);
        set_skill("whip", 50);

        set_temp("apply/attack", 30);
        set_temp("apply/defense", 30);
        set_temp("apply/damage", 5);

        set("combat_exp", 5000);
        set("attitude","friendly");

        set("shen_type", 1);
        setup();
        carry_object("/clone/cloth/wcloth")->wear();
        carry_object("/clone/weapon/changbian")->wield();
}
