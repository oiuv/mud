// daoseng.c
inherit NPC;

void create()
{
        set_name("刀僧", ({"daoseng","walker",}));
        set("title", "少林刀僧");
        set("long",
                "他是一位云游四方的行者，风霜满面，行色匆匆，似乎正在办一件急事。\n"
        );

        set("gender", "男性");
        set("attitude", "heroism");
        set("class", "bonze");

        set("age", 35);
        set("shen_type", 1);
        set("str", 25);
        set("int", 20);
        set("con", 20);
        set("dex", 25);
        set("max_qi", 2000);
        set("max_jing", 1000);
        set("neili", 1500);
        set("max_neili", 1500);
        set("jiali", 50);
        set("combat_exp", 200000);
        set("score", 100);
        set("apply/attack",  30);
        set("apply/defense", 30);

        set_skill("force", 100);
        set_skill("unarmed", 100);
        set_skill("blade", 100);
        set_skill("dodge", 100);
        set_skill("parry", 100);
        set_skill("shaolin-shenfa", 100);
        set_skill("xiuluo-dao", 100);
        set_skill("hunyuan-yiqi", 100);

        map_skill("force", "hunyuan-yiqi");
        map_skill("dodge", "shaolin-shenfa");
        map_skill("blade", "xiuluo-dao");
        map_skill("parry", "xiuluo-dao");

        setup();
        carry_object("/clone/weapon/gangdao")->wield();
        carry_object("/clone/misc/cloth")->wear();
        add_money("silver", 50);
}
