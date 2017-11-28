// yu.c 

inherit NPC;

void create()
{
	set_name("于人豪", ({ "yu renhao", "yu", "renhao" }));
	set("gender", "男性");
	set("age", 25);
	set("long", "他就是「英雄豪杰，青城四秀」之一，武功也远高同门。\n");

	set("combat_exp", 80000);
	set("shen_type", -1);

	set_skill("sword", 80);
	set_skill("pixie-sword", 80);
	set_skill("unarmed", 80);
	set_skill("dodge", 80);
	set_skill("parry", 80);
	map_skill("parry", "pixie-sword");
	map_skill("sword", "pixie-sword");
	create_family("青城派", 6, "弟子");
	setup();
	carry_object("/clone/weapon/changjian")->wield();
	carry_object("/d/wudang/obj/bluecloth")->wear();
}
void init()
{
        object ob;

        ::init();
        if( interactive(ob=this_player()) && !is_fighting() )
        {
                remove_call_out("greeting");
                call_out("greeting", 1, ob);
        }
}

void greeting(object ob)
{
        say ("于人豪大喊一声：老子就是于人豪！\n");
        return;
}
