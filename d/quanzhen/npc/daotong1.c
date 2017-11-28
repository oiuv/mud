inherit NPC;

void create()
{
        set_name("小道童", ({ "xiao daotong", "xiao", "daotong" }));
        set("gender", "男性");
        set("class", "taoist");
        set("age", 14);
        set("long", "这是一位小道童，看来年纪不大，脸上稚气\n"
                    "犹存，整天笑嘻嘻的无忧无虑。\n");
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
        set("combat_exp", 2000);

        create_family("全真教", 5, "弟子");

        setup();

        carry_object(__DIR__"obj/grayrobe")->wear();
}
