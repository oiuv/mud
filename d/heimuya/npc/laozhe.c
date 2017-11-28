inherit NPC;
 
void create()
{
        set_name("老者", ({ "lao zhe", "oldman" }) );
        set("gender", "男性" );
        set("age", 70);
        set("long", "这个老头正抽旱烟抽得上瘾呢。\n");
        set("combat_exp", 1000);
        set("attitude", "friendly");
        set("rank_info/respect", "老大爷");
        setup();
        carry_object("/clone/cloth/cloth")->wear();
        add_money("silver", 10);
}

