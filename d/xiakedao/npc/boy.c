// boy.c

inherit NPC;

void create()
{
        set_name("男孩",({ "boy" }) );
        set("gender", "男性" );
        set("age", 13);
        set("long",
"这是个渔家少年，大概由于长期在室外的缘故，皮肤已晒得黝黑，人也长得很粗壮了。\n");

        set("str", 17);
        set("dex", 16);
        set("con", 15);
        set("int", 17);
        set("shen_type", 1);

        set_temp("apply/defense", 10);
        set("combat_exp", 100);
        set("attitude", "peaceful");

        setup();

        carry_object("/clone/misc/cloth")->wear();
        add_money("coin",100);
}

