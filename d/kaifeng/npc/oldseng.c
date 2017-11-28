inherit NPC;

void create()
{
        set_name("老僧人",({"lao seng", "lao", "seng"}));
        set("long", "一个老朽的僧人，脸上满是皱纹，眼睛都睁不开来了。\n" );
        set("gender", "男性");
        set("attitude", "peace");
        set("age", 87);
        set("str", 10);
        set("int", 20);
        set("con", 20);
        set("combat_exp", 1000);

        set_skill("force", 5);
        set_skill("unarmed", 5);
        set_skill("blade", 5);
        set_skill("dodge", 5);
        set_skill("parry", 5);

        setup();
        carry_object(__DIR__"obj/dao-cloth")->wear();
        add_money("coin", 50);
}
