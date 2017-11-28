inherit NPC;

void create()
{
        set_name("管家", ({ "guan jia", "guan", "jia" }));
        set("long", "这是一位尖嘴候腮的老管家，一对小绿豆眼\n"
                    "总在不停地转动着。\n");
        set("gender", "男性");
        set("age", 65);

        set("combat_exp", 7500);
        set_skill("unarmed", 35);
        set_skill("force", 35);
        set_skill("dodge", 40);
        set_temp("apply/attack", 30);
        set_temp("apply/defense", 40);
        set("shen_type", -1);
        setup();
        carry_object("/clone/misc/cloth")->wear();
        add_money("silver",20);
}
