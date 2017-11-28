inherit NPC;

void create()
{
    set_name("敬香客", ({ "jingxiang ke","ke","jingxiang"}));
    set("gender", "男性");
    set("age", 45);
    set("long", "这是来衡山朝拜的人。\n");
    set("combat_exp", 2000);
    set("attitude", "friendly");
    setup();
    carry_object("/clone/misc/cloth")->wear();
    add_money("silver", 5);
}
