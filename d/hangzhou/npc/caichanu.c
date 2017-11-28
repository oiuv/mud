// caichanu.c

inherit NPC;

void create()
{
        set_name("采茶女", ({ "girl" }) );
        set("gender", "女性" );
        set("age", 19);
        set("per", 40);
        set("long", "江南清秀的采茶姑娘一样楚楚动人。\n");
        set("combat_exp", 700);
        set("attitude", "friendly");
        set_skill("unarmed", 40);
        set_skill("parry", 25);
        set_skill("dodge", 30);

        set("chat_chance", 5);
        set("chat_msg", ({
            "采茶女说道：侬今早去庙里上香伐，带我一道去好勿好？\n",
        }) );

        setup();
        add_money("coin", 15);
        carry_object("/clone/cloth/cloth")->wear();
}

