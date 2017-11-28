//yuanwai.c

inherit NPC;

void create()
{
        set_name("萧员外", ({"xiao yuanwai", "xiao","yuanwai" }));
        set("gender", "男性");
        set("rank_info/respect", "老员外");
        set("age", 50);
        set("attitude", "peaceful");
        set("shen_type", 1);
        set("per", 40);
        set("int", 40);
        set("max_kee", 800);
        set("max_gin", 800);
        set("max_sen", 800);
        set("force", 900);
        set("max_force", 900);
        set("force_factor", 60);
        set("max_mana", 900);
        set("mana", 900);
        set("mana_factor", 40);
        set("combat_exp", 300000);
        set_skill("unarmed", 50);
        set_skill("dodge", 50);
        set_skill("parry", 50);
        set_skill("force", 50);
          
        setup();
        carry_object(__DIR__"obj/choupao")->wear();
}
void check_daughter(object me);

void init()
{
        ::init();
        check_daughter(this_object());
}

int accept_object (object who, object ob)
{
        object me = this_object();
        object room = environment(me);
        if (room->query("short") != "萧家大厅")
                return 0;

        if (ob->query("id") == "xin")
	{
                remove_call_out("read_letter");
                call_out("read_letter",3,me,who,ob);
                return 1;
	}
        return 0;
}

void read_letter(object me, object who, object ob)
{
        destruct (ob);
        reset_eval_cost();

        message_vision("$N看完信，不由得涕泪俱下。\n"
                       "$N道：这些天我差人寻遍长安城，也没找"
                       "到我那孩儿，\n原来竟被人拐卖到了青楼之中。\n\n",
                       me);

        message_vision("$N对$n道：若非这位" +
                       RANK_D->query_respect(who)+
                       "前来相告，我可能今生就见不到我的女儿了，\n" +
                       RANK_D->query_respect(who) +
                       "这份恩德叫老夫如何报答啊！\n", me, who);

        remove_call_out("send_to_fight");
        call_out("send_to_fight",3,me,who);
}

void send_to_fight (object me, object who)
{
        object yupei = new(__DIR__"obj/yupei");
        yupei->move(who);
        message_vision("$N对$n说道：还请这位" +
                       RANK_D->query_respect(who) +
                       "再帮帮忙，将我女儿搭救出来！\n\n",
                       me, who);

        message_vision("$N从衣袋内取出一块玉佩交给$n，道"
                       "“这是我家传玉佩，湘湘见到会认得的！\n",
                       me, who);
        message_vision("$N给$n一块玉佩。\n", me, who);
        who->save();
}

void check_daughter(object me)
{
  	object room = environment(me);
  	object xiangxiang = present("xiangxiang", room);
  	object who;
  	object yupei;
  	reset_eval_cost();
  	if (room->query("short") != "萧家大厅")
    	        return;

  	if (! xiangxiang || ! xiangxiang->query("leader"))
    	        return;
  	if (! (who = present(xiangxiang->query("leader"), room)))
    	        return;
  	if (! (yupei = present("yu pei", who)))
    	        return;
  	xiangxiang->set_leader(0);
  	xiangxiang->set_temp("no_return", 0);
  	remove_call_out ("cry_daughter");
  	call_out("cry_daughter",2,me,xiangxiang,who);
  	remove_call_out ("announce_success");
  	call_out("announce_success",4,me,who);
}

void cry_daughter(object me, object xiangxiang, object who, object yupei)
{
//      object book;
        message_vision("$N见了$n一愣，然后老泪纵横地将$n拉过去。\n",
                       me, xiangxiang); 
        destruct(xiangxiang);
      
        yupei = present("yu pei",who);
        yupei->move(me);
        destruct(yupei);
        command("thank " + who->query("id"));
        command("say 这位" + RANK_D->query_respect(who) +
                "救我儿湘湘逃出魔掌！老夫这里有一本书，\n是"
                "祖上传下来的，就送给" + RANK_D->query_respect(who) +
                "吧！\n");
        carry_object(__DIR__"obj/book");
        command("give book to " + who->query("id"));
}