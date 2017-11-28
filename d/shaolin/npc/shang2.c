inherit NPC;

void create()
{
        set_name("家丁", ({ "jia ding", "jia", "ding"}));
        set("gender", "男性" );
        set("age", 20);
        set("long", "一个二十来岁的青年，在商家堡内当差。\n");
        set("shen_type", 1);
        set("combat_exp", 2000);
        set("str", 17);
        set("dex", 20);
        set("con", 17);
        set("int", 22);
        set("attitude", "peaceful");
        set_skill("dodge",10);
        set_skill("unarmed",10);

        setup();
        carry_object("/clone/cloth/cloth")->wear();
}
