#include <ansi.h>

inherit NPC;
string *names = ({"打扫马房", "锯木头", "劈柴", "浇菜地", "锄草" });
string ask_job();

void create()
{
        set_name("耶律齐", ({ "yelv qi", "yelv", "qi" }));
        set("title", "全真教第二代弟子");
        set("nickname", HIY "丐帮帮主" NOR);
        set("long", "耶律齐是郭靖和黄蓉的大女婿，郭芙的丈夫。\n");
        set("gender", "男性");
        set("age", 35);
        set("str", 35);
        set("dex", 30);
        set("int", 30);
        set("con", 30);
        set("per", 28);
        set("shen_type", 1);
        set("max_qi", 4000);
        set("max_jing", 3000);
        set("max_neili", 5000);
        set("neili", 5000);
        set("jiali", 200);
        set("combat_exp", 2500000);
        set("score", 5000);

        set_skill("force", 220);
        set_skill("quanzhen-xinfa", 200);
        set_skill("xiantian-gong", 220);
        set_skill("staff", 200);
        set_skill("dagou-bang", 200);
        set_skill("unarmed", 220);
        set_skill("kongming-quan", 220);
        set_skill("strike", 200);
        set_skill("haotian-zhang", 200);
        set_skill("sword", 200);
        set_skill("quanzhen-jian", 200);
        set_skill("dodge", 200);
        set_skill("jinyan-gong", 200);
        set_skill("parry", 200);
        set_skill("jinguan-yusuo", 200);
        set_skill("literate", 180);
        set_skill("martial-cognize", 220);

        map_skill("force", "xiantian-gong");
        map_skill("unarmed", "kongming-quan");
        map_skill("sword", "quanzhen-jian");
        map_skill("staff", "dagou-bang");
        map_skill("parry", "jinguan-yusuo");
        map_skill("dodge", "jinyan-gong");
        map_skill("strike", "haotian-zhang");

        prepare_skill("unarmed", "kongming-quan");

        create_family("郭府", 2, "女婿");

        set("inquiry", ([
             "job"  : (: ask_job :),
             "工作" : (: ask_job :),
             "工具" : "你去物品房找老李要吧。",
        ]));

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "unarmed.ruo" :),
                (: perform_action, "unarmed.kong" :),
                (: exert_function, "hup" :),
                (: exert_function, "shield" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),
        }) );

        setup();
        carry_object("clone/misc/cloth")->wear();
}

void init()
{
        object ob;

        ::init();

        if (interactive(ob = this_player())
          && ob->query("mark/guofu_ok")
          && ! ob->query_temp("job_name")
          && ob->query("combat_exp") < 40000)
	{
       		command("nod " + ob->query("id"));
        	command("say 现在郭府内正缺人手，你可以找我领工作(" HIY
               		"ask yelv qi about 工作" NOR + CYN ")来做。" NOR);
	}
     	add_action("do_task", "task");
}

string ask_job()
{
        object me, ob;
        string target;

        ob = this_player();
        me = this_object();

        target = names[random(sizeof(names))];

        if (ob->query_temp("job_name"))
		return "你不是已经领了工作吗？还不快去做。";

        if (ob->query("combat_exp") >= 40000)
             	return "你功夫已经足够闯荡江湖，这里没有什么适合你的工作了。";

        if (ob->query("mark/guofu_out"))
             	return "你不是已经外出闯荡了吗，怎么又回来了？";

        ob->set_temp("job_name", target);
        ob->apply_condition("wuguan_job", random(3) + 4);
        return "…嗯…你先到物品房领工具，然后去后院「" HIY + target + NOR
               + CYN "」吧。\n" NOR;
}

int do_task(string arg)
{
        object ob, me, obj;
        int exp, pot;

        ob = this_player();
        me = this_object();
        exp = 50 + random(20);//2015年3月28日
        pot = 25 + random(10);//奖励增加

        if (! arg || arg != "ok")
		return 0;

        if (! ob->query_temp("job_name"))
		return notify_fail(CYN "耶律齐皱眉道：我没给你工作，怎"
                                   "么跑来覆命了？\n" NOR);

        if (! (ob->query_temp("mark/劈完了")
           || ob->query_temp("mark/浇完了")
           || ob->query_temp("mark/锄完了")
           || ob->query_temp("mark/锯完了")
           || ob->query_temp("mark/扫完了")
           || ob->query_temp("mark/挑完了")))
                return notify_fail(CYN "耶律齐皱眉道：我让你干的事都干"
                                   "完了吗？\n" NOR);

        if (interactive(ob)
        && (int)ob->query_condition("wuguan_job"))
	{
              command("hmm " + ob->query("id"));
              return notify_fail(CYN "耶律齐皱眉道：怎么这么快，是不是"
                                 "没做完啊，吩咐你回来了吗？\n" NOR);
        }

        if (! ob->query_temp("mark/还了"))
		return notify_fail(CYN "耶律齐道：…嗯…你还是先把工具"
                                   "还了""再说吧。\n" NOR);

        command("smile " + ob->query("id"));
        command("say 干得不错，这是给你的奖赏。");

        obj = new("/clone/money/silver");
        obj->set_amount(1 + random(5));
        obj->move(me, 1);
        command("give " + ob->query("id") + " silver");

        if (ob->query("potential") > ob->query_potential_limit()) 
            pot = 5;		//加强奖励，帮助新手成长（2015年4月10日）

        ob->add("combat_exp", exp);
        ob->improve_potential(pot);

        tell_object(ob, HIC "你获得了" + chinese_number(exp) + "点"
                        "经验和" + chinese_number(pot) + "点潜能。"
                        "\n" NOR);
        ob->delete_temp("job_name");
        ob->delete_temp("mark");
        ob->add("mark/guofu_job", 1);
        return 1;
}

void unconcious()
{
        die();
}
