inherit NPC;

void create()
{
        set_name("香客", ({ "xiang ke", "xiang", "ke" }));
        set("gender", "男性");
        set("age", random(20)+10);
        set("long", "这是一位到山上进香的香客。\n");

        set_temp("apply/attack", 35);
        set_temp("apply/defense", 25);
        set("combat_exp", 3500);
        set("shen_type", 1);
        set("str", 24);
        set("dex", 20);
        set("con", 20);
        set("int", 18);
        set("attitude","friendly");

        setup();
        carry_object(__DIR__"obj/cloth")->wear();
        add_money("silver", 8);
}
