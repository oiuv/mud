// wanyanhonglie.c

inherit NPC;

void create()
{
        set_name("完颜洪烈", ({"wanyan honglie", "honglie", "wanyan"}));
        set("gender", "男性");
        set("title", "大金国赵王爷");
        set("age", 48);
        set("class", "officer");
        set("attitude", "friendly");
        set("shen_type", -1);
        set("str", 26);
        set("per", 25);
        set("int", 25);
        set("con", 25);
        set("dex", 26);

        set("qi", 300);
        set("max_qi", 300);
        set("jing", 200);
        set("max_jing", 200);
        set("neili", 300);
        set("max_neili", 300);
        set("jiali", 10);

        set("combat_exp", 30000);
        set("score", 10000);

        set_skill("force", 40);
        set_skill("dodge", 40);
        set_skill("parry", 40);
        set_skill("unarmed",40);
        set_skill("changquan",40);

        map_skill("unarmed", "changquan");
        map_skill("parry", "changquan");
        setup();
        carry_object("/clone/cloth/male1-cloth")->wear();
}

