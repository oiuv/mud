inherit NPC;

void create()
{
        set_name("弃婴", ({ "qi ying", "qi", "ying", "baby" }));
        set("gender", "男性");
        set("age", 3);
        set("long", "不知是谁家小姐的私生子，不要了丢在街上。\n");
        set("combat_exp", 0);
        set("attitude", "friendly");
        setup();
}
