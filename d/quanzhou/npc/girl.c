// kid.c

inherit NPC;

void create()
{
	set_name("女孩",({ "girl" }) );
	set("gender", "女性" );
	set("age", 12);
	set("long", 
"这是个农家少女，虽然只有十二、三岁，身材已经开始发育。\n");
	set_temp("apply/defense", 5);
	set("combat_exp", 70);
	set("shen", 100);
	set("shen_type", 1);
	set("str", 14);
	set("dex", 15);
	set("con", 16);
	set("int", 15);
	set("attitude", "friendly");

	setup();
        carry_object(__DIR__"obj/cloth")->wear();
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
        say ("小女孩天真地笑着说：去桃花岛呀，要从嘉兴出海的。\n");
        return;
}

