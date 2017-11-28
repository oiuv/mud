inherit NPC;

void create()
{
    set_name("游客", ({ "you ke","ke","you"}));
    set("gender", "男性");
    set("age", 25);
    set("long", "这是来衡山旅游的游客。\n");
    set("combat_exp", 2000);
    set("attitude", "friendly");
    setup();
    carry_object("/clone/misc/cloth")->wear();
    add_money("silver", 5);
}
