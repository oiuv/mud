inherit NPC;
void create()
{
        set_name("混混张三",({"zhang san"}));
        set("gender", "男性");
   	set("combat_exp", 9000);
   	set("title", "过街老鼠");
        set("long", "他长得奸嘴猴腮的，一看就不像是个好人。\n");
        
        set("combat_exp", 7000);
        set("shen_type", -1);
        set("attitude", "peaceful");
        
        set_skill("unarmed", 40);
        set_skill("dodge", 40);
        set_temp("apply/attack", 20);
        set_temp("apply/defense", 20);

        setup();
        carry_object("/clone/misc/cloth")->wear();
        add_money("silver", 2);
}
