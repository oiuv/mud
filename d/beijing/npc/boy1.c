inherit NPC;

void create()
{
        set_name("男孩", ({ "boy", "nan hai" }) );
        set("gender", "男性" );
        set("age", 12);
        set("shen_type", 1);
        set("combat_exp", 10000);
        set("str", 20);
        set("dex", 20);
        set("con", 20);
        set("int", 20);
        set("attitude", "peaceful");
        setup();
        carry_object(__DIR__"obj/cloth")->wear();
}

