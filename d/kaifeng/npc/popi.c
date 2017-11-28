inherit NPC;

void create()
{
	set_name("泼皮",({"po pi", "po", "pi"}));
	set("long", "大相国寺附近的泼皮,平时专到菜园中偷菜.\n" );
        set("gender", "男性");
	set("age",25);
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
