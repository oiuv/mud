inherit NPC;

void create()
{
        set_name("À¥ÂØÅÉµÜ×Ó", ({ "dizi"}));
        set("long",
                "Ëû¿´ÆğÀ´°òÀ«ÑüÔ²£¬ËÆºõÁ·¹ıÒ»µãÎä¹¦¡£\n");
        set("gender", "ÄĞĞÔ");
        set("age", 30);
        set("attitude", "heroism");
        set("shen_type", 1);
        set("str", 25);
        set("int", 20);
        set("con", 20);
        set("dex", 23);

        set("max_qi", 400);
        set("max_jing", 300);
        set("neili", 500);
        set("max_neili", 500);
        set("jiali", 10);
        set("combat_exp", 30000);
        set("score", 4000);

        set_skill("force", 40);
        set_skill("kunlun-xinfa", 40);
        set_skill("dodge", 50);
        set_skill("chuanyun-bu", 50);
        set_skill("parry", 40);
        set_skill("sword", 40);
        set_skill("strike", 40);

        map_skill("force", "kunlun-xinfa");
        map_skill("dodge", "chuanyun-bu");

        create_family("À¥ÂØÅÉ", 6, "µÜ×Ó");
        setup();
        carry_object("/d/kunlun/obj/sword")->wield();
        carry_object("/d/kunlun/obj/pao4")->wear();
}

