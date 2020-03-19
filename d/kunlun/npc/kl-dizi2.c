inherit NPC;

void create()
{
        set_name("昆仑派弟子", ({ "dizi"}));
        set("long",
                "他看起来膀阔腰圆，似乎练过一点武功。\n");
        set("gender", "男性");
        set("age", 20);
        set("attitude", "heroism");
        set("shen_type", 1);
        set("str", 25);
        set("int", 20);
        set("con", 20);
        set("dex", 23);

        set("max_qi", 300);
        set("max_jing", 200);
        set("neili", 300);
        set("max_neili", 300);
        set("jiali", 10);
        set("combat_exp", 8000);
        set("score", 4000);

        set_skill("force", 20);
        set_skill("dodge", 20);
        set_skill("chuanyun-bu", 20);
        set_skill("cuff", 30);
        set_skill("sword", 30);

        map_skill("dodge", "chuanyun-bu");

        create_family("昆仑派", 6, "弟子");
        setup();
        carry_object("/d/kunlun/obj/sword")->wield();
        carry_object("/d/kunlun/obj/pao4")->wear();
}
