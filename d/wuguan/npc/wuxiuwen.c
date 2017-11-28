#include <ansi.h>
inherit NPC;

string give_tools();

void create()
{
        set_name("武修文", ({"wu xiuwen", "wu", "xiuwen"}));
        set("title", HIY "郭靖二弟子" NOR);
        set("gender", "男性");
        set("age", 21);
        set("long", "他是郭靖的二弟子，精明强干，专门负责后勤。\n");
        set("attitude", "peaceful");
        set("shen_type", 1);
        set("per", 24);
        set("str", 20);
        set("int", 20);
        set("con", 30);
        set("dex", 25);

        set("max_qi", 3000);
        set("max_jing", 2500);
        set("neili", 2800);
        set("max_neili", 2800);
        set("jiali", 50);
        set("combat_exp", 400000);
        set("score", 20000);
         
        set_skill("force", 160);
        set_skill("yijin-duangu", 160);
        set_skill("dodge", 160);
        set_skill("shexing-lifan", 160);
        set_skill("finger", 160);
        set_skill("yiyang-zhi", 160);
        set_skill("sword", 160);
        set_skill("yuenv-jian", 160);
        set_skill("parry", 160);
        set_skill("literate", 140);
        set_skill("jingluo-xue", 160);
        set_skill("martial-cognize", 140);

        map_skill("force", "yijin-duangu");
        map_skill("dodge", "shexing-lifan");
        map_skill("finger", "yiyang-zhi");
        map_skill("sword", "yuenv-jian");
        map_skill("parry", "jinyuan-gun");

        prepare_skill("finger", "yiyang-zhi");

        create_family("郭府", 2, "弟子");

        set("inquiry", ([
                "黄蓉" : "那是我师母。",
                "郭靖" : "那是我师父。",
                "工具" : (: give_tools :),
                "tools" : (: give_tools :),
        ]));

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "finger.qian" :),
                (: perform_action, "finger.dian" :),
                (: perform_action, "dodge.gui" :),
                (: perform_action, "powerup" :),
                (: exert_function, "recover" :),
        }));

        setup();
        carry_object("/clone/misc/cloth")->wear();
}

void init()
{
        object ob;

        ::init();
        if (interactive(ob = this_player()) && ! is_fighting())
	{
                remove_call_out("greeting");
                call_out("greeting", 1, ob);
        }
}
	
string give_tools()
{
       	object tools, ob, me;

       	me = this_object();
       	ob = this_player();

       	if (ob->query_temp("mark/工具"))
		return "我不是已经给你了吗，怎么那么罗嗦？";

       	if (ob->query_temp("mark/还了"))
		return "你还是先到耶律师兄那覆命了再说吧。";

       	if (! ((ob->query_temp("job_name") == "锯木头")
	   || (ob->query_temp("job_name") == "锄草")
           || (ob->query_temp("job_name") == "浇菜地")
	   || (ob->query_temp("job_name") == "劈柴")
	   || (ob->query_temp("job_name") == "打扫马房")))
             	return "你又没有领工作，跑来要什么工具？";

       	if (ob->query_temp("job_name") == "锄草")
		tools = new("/d/wuguan/obj/chutou");
       	else
	if (ob->query_temp("job_name") == "浇菜地")
		tools = new("/d/wuguan/obj/piao");
        else
	if (ob->query_temp("job_name") == "锯木头")
		tools = new("/d/wuguan/obj/juzi");
        else
	if (ob->query_temp("job_name") == "劈柴")
		tools = new("/d/wuguan/obj/chaidao");
        else
		tools = new("/d/wuguan/obj/saozhou");

        tools->move(this_player());

        message_vision(HIC "$N" HIC "交给$n" HIC "一把工具。\n"
                       NOR, me, ob);
        ob->set_temp("mark/工具", 1);
        return "东西交给你了，可要小心保管，别弄丢了。";
}

int accept_object(object me, object obj)
{
      	object ob;
      	me = this_object();
      	ob = this_player();

      	if (! (ob->query_temp("mark/劈完了")
	   || ob->query_temp("mark/浇完了")
	   || ob->query_temp("mark/锄完了")
	   || ob->query_temp("mark/锯完了")
	   || ob->query_temp("mark/扫完了")))
	{
              	command("say 你还没完成工作，怎么就回来还工具了，偷懒吗？");
	      	return 0;
        }

      	if ((obj->query("id") != "ju zi")
	   && (obj->query("id") != "chu tou")
	   && (obj->query("id") != "shui piao")
	   && (obj->query("id") != "sao zhou")
	   && (obj->query("id") != "chai dao"))
	{
              	command("say 你还错东西了吧，我从没有发过这样工具。");
              	return 0;
        }

	if (! ob->query_temp("job_name"))
	{  
              	command("shake");
              	command("say 我没有发给你过东西，你是不是还错了？");
              	return 0;
        }
     	command("nod");
     	command("say 干得不错，你现在去耶律师兄那儿领取酬劳吧。");
     	ob->set_temp("mark/还了", 1);
        destruct(obj);
     	return 1;
}

void greeting(object ob)
{
	if (! ob || environment(ob) != environment())
		return;

        if (ob->query_temp("mark/劈完了")
	   || ob->query_temp("mark/浇完了")
	   || ob->query_temp("mark/锄完了")
	   || ob->query_temp("mark/锯完了")
	   || ob->query_temp("mark/扫完了"))
	{
		command("nod " + ob->query("id"));
         	command("say 你的工作做完了？那现在把工具还给我吧。");
         	return; 
        }

        if (ob->query_temp("mark/工具"))
		return 0; 

        if ((ob->query_temp("job_name") == "锯木头")
	   || (ob->query_temp("job_name") == "锄草")
	   || (ob->query_temp("job_name") == "浇菜地")
	   || (ob->query_temp("job_name") == "劈柴")
	   || (ob->query_temp("job_name") == "打扫马房"))
	{
       		command("nod " + ob->query("id"));
       		command("say 你是来我这里领工具(" HIY "ask wu xiuwen about 工具"
                        NOR + CYN ")的吧。" NOR);
       	}
}
