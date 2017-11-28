inherit NPC;

void create()
{
        set_name("粮草官", ({ "liangcao guan", "liangcao", "guan" }) );
        set("gender", "男性" );
        set("age", 22);
        set("long", "一个管理粮草的小官。\n");
        set("shen_type", 1);
        set("combat_exp", 10000);
        set("str", 10);
        set("dex", 10);
        set("con", 10);
        set("int", 10);
        set("attitude", "peaceful");
        set_skill("dodge",20);
        set_skill("unarmed",20);

        setup();
        carry_object("clone/misc/cloth")->wear();
        add_money("coin", 200);
}
