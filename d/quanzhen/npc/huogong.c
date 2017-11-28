inherit NPC;

void create()
{
        set_name("火工道人", ({ "huogong daoren", "huogong", "daoren" }));
        set("gender", "男性");
        set("age", 35);
        set("class", "taoist");
        set("long", "这里全真教掌管厨房的火工道人。\n");
        set("attitude", "friendly");

        set("str", 20);
        set("int", 20);
        set("con", 20);
        set("dex", 20);

        set("qi", 300);
        set("max_qi", 300);
        set("jing", 200);
        set("max_jing", 200);
        set("neili", 300);
        set("max_neili", 300);
        set("jiali", 0);

        set("combat_exp", 15000);

        set_skill("force", 50);
        set_skill("quanzhen-xinfa", 40);
        set_skill("dodge", 50);
        set_skill("jinyan-gong", 50);
        set_skill("parry", 50);
        set_skill("strike",50);

        map_skill("force", "quanzhen-xinfa");
        map_skill("dodge", "jinyan-gong");


        setup();

        carry_object(__DIR__"obj/grayrobe")->wear();

}
