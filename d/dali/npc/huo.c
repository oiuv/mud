// huo.c

inherit NPC;

string ask_for_zigong();
int ask_for_gongzi();

void create()
{
        set_name("霍先生", ({"huo xiansheng", "huo", "xiansheng"}));
        set("long",
"他一身邋遢，形容委琐，整天迷迷糊糊的睡不醒模样。可是他的账务十几年来无可挑剔。
原来他就是伏牛派的崔百泉，为避仇祸隐居于此。\n"
        );

        set("gender", "男性");
        set("attitude", "heroism");

        set("inquiry",([
                "工资"    : (: ask_for_gongzi :),
                "薪水"    : (: ask_for_gongzi :),
                "salary"  : (: ask_for_gongzi :),
                "payment" : (: ask_for_gongzi :),
                "gongzi"  : (: ask_for_gongzi :),
        ]));

        set("age", 51);
        set("shen_type", 0);
        set("str", 25);
        set("int", 20);
        set("con", 20);
        set("dex", 25);
        set("max_qi", 500);
        set("max_jing", 100);
        set("neili", 500);
        set("max_neili", 500);
        set("jiali", 100);
        set("combat_exp", 100000);
        set("score", 100);
        set("apply/attack",  30);
        set("apply/defense", 30);

        set_skill("force", 50);
        set_skill("unarmed", 50);
        set_skill("sword", 50);
        set_skill("dodge", 50);
        set_skill("parry", 50);

        setup();

        carry_object("/clone/weapon/changjian")->wield();
        carry_object("/clone/misc/cloth")->wear();
        add_money("silver", 50);
}

int ask_for_gongzi()
{
        object me,payment;
        int paytimes;
	string oldtitle;

        me = this_player();
	oldtitle = me->query("title");
	if (strsrch(oldtitle, "大理镇南王府武将") >= 0) 
	{
	    paytimes = (int)(me->query("mud_age")/7200);
	    if (me->query("dlpaytimes")<paytimes)
	    {
	        payment=new("/clone/money/gold");
	        payment->move(me);
	        me->add("dlpaytimes",1);
	        tell_object(me,"霍先生道：这是你本月的份额，收好吧。\n");
	    }
	    else tell_object(me,"霍先生道：欺负我老糊涂？你本月工资已经领取过了！\n");
	}
	else
	tell_object(me,"霍先生道：欺负我老糊涂？等你升到武将再来领工资！\n");
        return 1;
}

