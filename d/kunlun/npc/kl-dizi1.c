inherit NPC;

void create()
{
        set_name("昆仑派女弟子", ({ "dizi"}));
        set("long",
                "她看起来身材娇小，似乎练过一点武功。\n");
        set("gender", "女性");
        set("age", 17);
        set("attitude", "heroism");
        set("shen_type", 1);
        set("str", 25);
        set("int", 20);
        set("con", 20);
        set("dex", 23);

        set("max_qi", 200);
        set("max_jing", 150);
        set("neili", 200);
        set("max_neili", 200);
        set("jiali", 5);
        set("combat_exp", 3000);
        set("score", 400);

        set_skill("dodge", 20);
        set_skill("cuff", 20);

        create_family("昆仑派", 6, "弟子");
        setup();
        carry_object("/d/kunlun/obj/pao4")->wear();
}
