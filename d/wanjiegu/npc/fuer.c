// fuer.c

inherit NPC;

void create()
{
        set_name("来福儿", ({ "lai fuer","lai" }) );
        set("gender", "男性" );
        set("age", 45);
        set("str", 16);
        set("con", 24);
        set("dex", 21);
        set("per", 17);
        set("int", 14);
        set("long", "来福儿是万劫谷的下人。\n");
        set("attitude", "friendly");

        set("max_force", 200);
        set("force", 200);
        set("force_factor", 10);

        set("combat_exp", 5000);

        set_skill("unarmed", 30);
        set_skill("parry", 40);
        set_skill("dodge", 50);
        set_skill("force", 50);


        setup();

        carry_object("/d/wanjiegu/npc/obj/cloth")->wear();
        carry_object("/d/wanjiegu/npc/obj/bu-shoes")->wear();
}

