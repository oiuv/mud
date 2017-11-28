// du.h for fight and apprentice to 3-du

#include "shaolin.h"

mixed ask_whip();

void attempt_apprentice(object ob)
{
	object me  = this_object();
	mapping ob_fam;
	mapping my_fam  = me->query("family");

	string name, new_name;

        if (! permit_recruit(ob))
                return;

	if (! (ob_fam = ob->query("family")) ||
	    ob_fam["family_name"] != "少林派")
	{
		command("say " + RANK_D->query_respect(ob) +
		        "与本派素无来往，不知此话从何谈起？");
		return;
	}

	if ((string)ob->query("class") != "bonze" &&
	    ob_fam["family_name"] == "少林派") 
	{
		command("say " + RANK_D->query_respect(ob) +
			"是俗家弟子，不能在寺内学艺。");
		return;
	}

	if (ob_fam["generation"] <= my_fam["generation"])
	{
		command("say " + RANK_D->query_respect(ob) +
		        "，贫僧哪里敢当 !");
		return;
	}

	if (ob_fam["generation"] == (my_fam["generation"] + 1))
	{
		command("say " + ob_fam["master_name"] +
		        "的徒弟怎麽跑到我这儿来了，哈哈哈 !");
		command("recruit " + ob->query("id"));
	}

	if (ob_fam["generation"] == (my_fam["generation"] + 2))
	{
		if (ob->query_temp("valid_in_fumoquan") == 1)
		{
			if (ob->query_skill("dodge",1) >= 120 &&
			    ob->query_skill("force",1) >= 120 &&
			    ob->query_skill("parry",1) >= 120 &&
			    ob->query_skill("buddhism",1) >= 120)
			{
			        command("say 你能过金刚伏魔圈，哈哈哈！");
			        command("say 贫僧又得一可塑之才，可喜可贺！");

        			name = ob->query("name");
        			new_name = "玄" + name[2..3];
        			ob->set("name", new_name);
        	
        			command("say 从今以后你的法名叫做" +
					new_name + "！");
        			command("recruit " + ob->query("id"));
			}
			else
			command("say 贫僧要收的是有用之才，你还是回去"
				"向你师父学习吧！");
		} else
		{
			command("say " + RANK_D->query_respect(ob) +
                                "，没能过金刚伏魔圈，我不想收你。");
			return;
		}
	}
	return;
}

mixed ask_whip()
{
        object me;
        object ob;

        me = this_player();
        if (me->query("family/family_name") != query("family/family_name"))
                return "你是哪里来的？跑来和我罗嗦什么？";

        if (me->query("combat_exp") < 400000)
                return "你这点微末功夫，可不要拿了我们的护身兵器出去丢脸。";

        if (time() - me->query_temp("last_ask/blackwhip") < 3600)
                return "你干什么？不是刚从我们这儿取走了一根么，难道是弄丢了？";

        if (me->query("shen") < 30000)
        {
                message_sort("$N冷冷对$n道：“”哼！这是我等降妖除魔的利器"
                             "，你看上去也不是行侠仗义之人。不过少林弟子本"
                             "应慈悲为怀，我也怪不得你，去吧！”\n",
                             this_object(), me);
                return 1;
        }

        ob = present("hei suo", this_object());
        if (! objectp(ob))
                return "我这儿已经没有黑索了，你去寺里自己找称手的兵器吧。";

        message_vision("$N看了看$n，将手中的卷了起来，递给$n。\n",
                       this_object(), me);
        ob->move(me, 1);

        if (objectp(ob = present("bian", this_object())))
                ob->wield();

        me->set_temp("last_ask/blackwhip", time());

        return "很好，你既然有意除魔，我自然应该助你一臂之力。";
}


//新增pfm传授
int accept_ask(object me, string topic)  
{
        switch (topic)  
        {        
        
         case "合字诀" :  
                return MASTER_D->teach_pfm(me, this_object(),  
                        ([ "perform" : "can_perform/riyue-bian/he",  
                           "name"    : "合字诀",  
                           "sk1"     : "riyue-bian",  
                           "lv1"     : 120,  
                           "force"   : 150,  
                           "neili"   : 1000,  
                           "gongxian": 800,  
                           "shen"    : 20000, ]));  
                break;
                 
         case "伤字诀" :  
                return MASTER_D->teach_pfm(me, this_object(),  
                        ([ "perform" : "can_perform/riyue-bian/shang",  
                           "name"    : "伤字诀",  
                           "sk1"     : "riyue-bian",  
                           "lv1"     : 180,  
                           "force"   : 250,  
                           "neili"   : 3000,  
                           "gongxian": 1200,  
                           "shen"    : 50000, ]));  
                break;
                            
        default:  
                return 0;  
        }
}