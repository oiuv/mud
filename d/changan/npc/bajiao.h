// bajiao.h 群玉八娇

int accept_fight(object me)
{
	command("say 小女子哪里是您的对手？");
	return 0;
}

void init()
{
        remove_call_out ("says");
        call_out("says", random(3), this_player());
	add_action("do_makelove", "makelove");
}

void says(object me)
{
  	string *msgs = ({
    		"$N吃吃一笑，抿嘴看着你。\n",
    		"$N含情脉脉地对你说“……你……你还不明白妾身的心意吗？\n",
    		"看来$N很想跟你来(makelove)一次\n",
    		"$N很想跟你……\n",
    		"$N对你婉尔一笑。\n",
        });

        string msg;

        if (! me || environment(me) != environment() ||
            ! living(this_object()))
                return;

        if (me->query("gender") != "男性")
                msg = "$N打了和哈欠，看上去困极了。\n";
        else
                msg = msgs[random(sizeof(msgs))];

  	message_vision(msg, this_object());
}

int do_makelove()
{
  	object me = this_object();
  	object who = this_player();

        switch (who->query("gender"))
        {
        case "男性":
                break;
        case "女性":
                return notify_fail("你还有这爱好？没看出来。\n");
        default:
                return notify_fail("你似乎没有这能力吧？\n");
        }

        if (is_busy() || is_fighting())
                return notify_fail("你没看见人家正忙着呢吗？\n");

        if (query_temp("makelove_with") == who)
        {
                write("你好好做你的，别三心二意的。\n");
                return 1;
        }

        if (query_temp("makelove_with"))
                return notify_fail("两个一起上？你还是饶了人家吧！\n");

  	message_vision(HIM "$N" HIM "轻轻搂着$n" HIM "柔软的"
                       "身体，不由得一阵阵发麻的快感传遍全身，"
                       "不知不觉的开始扭动着……\n\n"NOR, who, me);
  	who->command_function("remove all");
  	who->start_busy(999);

        // record sex
        who->add("sex/" + name(), 1);
        who->add("sex/times", 1);
        if (who->query("sex/times") == 1)
                who->set("sex/first", name());

        set_temp("makelove_with", who);

  	remove_call_out ("get_fainted");
  	call_out ("get_fainted", 1, who, me);
        remove_call_out("says");
        call_out("says", 40, me);
        return 1;
}

void get_fainted(object who, object me)
{
        object *objs = all_inventory(who);
        int i = sizeof(objs);

        delete_temp("makelove_with");

        if (! who || environment(who) != environment())
                return;

        message_vision("$N对$n神秘地一笑。\n", me, who);
        who->unconcious();
        while (i--)
        {
            	object obj = objs[i];
                if (obj->is_character())
                        continue;
                if (! obj->query("money_id"))
                        continue;
            	message_vision("$N从$n身上拿出" +
                               obj->query("name") +
                               "。\n", me, who);
            	destruct(obj);
                break;
        }

        if (i < 0)
                // Get nothing
                command("chat 气死老娘了，原来是一个穷鬼！");
}

int accept_kill(object me)
{       
        object ob;
        if (is_fighting()) return 1;
	if (query("called")) return 1;
        command("say 要杀人了，快来人救命啊！");
        ob = present("bao biao");
        if (! ob)
	{
                seteuid(getuid());
                ob=new(__DIR__"baobiao");
                ob->move(environment());
	}
	message_vision(HIC "\n忽然从门外冲进来几个保镖，对"
                       "$N" HIC "大喊一声“干什么？在这儿闹"
                       "事，想找死吗？\n\n"NOR, me);
        ob->kill_ob(me);
	ob->set_leader(me);
        me->kill_ob(ob);
        set("called", 1);
        call_out("regenerate", 200);
        return notify_fail("坏事了！");
}

int regenerate()
{
	set("called", 0);
	return 1;
}
