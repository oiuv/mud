//xueshi.c

inherit NPC;

void create()
{
        set_name("李博渊", ({"li boyuan", "li", "boyuan"}));
        set("gender", "男性");
        set("age", 45);
	set("title", "大学士");
        set("str", 25);
	set("int", 30);
        set("long", "李博渊是国子监大学士。\n");
        set("combat_exp", 40000);
        set("attitude", "friendly");
        set("class", "scholar");
        set_skill("unarmed", 50);
        set_skill("dodge",50);
	set_skill("literate", 400);
        set_skill("parry", 50);

        set("neili", 500); 
        set("max_neili", 500);
        set("inquiry", ([
		"读书识字": "对了，你是来对地方了！\n",
		"学习" : "学习是要交学费的\n",
        ]) );

        setup();
        carry_object(__DIR__"obj/choupao")->wear();
}

int recognize_apprentice(object ob)
{
        if ((int)ob->query_temp("mark/李") < 1)
                return 0;
        ob->add_temp("mark/李", -1);
        return 1;
}

int accept_object(object who, object ob)
{
//      object me = this_player();
        if (! (int)who->query_temp("mark/李"))
        who->set_temp("mark/李", 0);
        if (ob->query("money_id") && ob->value() >= 10000) 
        {
                message_vision("李博渊同意指点$N一些读书写字的问题。\n", who);
                who->add_temp("mark/李", ob->value() / 50);
        
                return 1; 
        }
}