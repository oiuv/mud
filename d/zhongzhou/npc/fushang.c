inherit NPC;
void create()
{
        set_name("富商",({"fu shang","fu","shang"}));
        set("gender", "男性");
        set("age", 35);
        set("long", "中州本地的暴发户。\n");
        set("combat_exp", 3600);
        
        set_skill("unarmed", 20);
        set_skill("dodge", 40);
        set_skill("parry", 20);
        set_temp("apply/attack", 10);
        set_temp("apply/defense", 30);
        set_temp("apply/armor", 15);
        set_temp("apply/damage", 5);
        setup();
        carry_object("/clone/misc/cloth")->wear();
        add_money("silver", 20);
}
