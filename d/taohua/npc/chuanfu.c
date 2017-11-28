// chuanfu.c 老船夫

#include <ansi.h>

inherit NPC;
int  chu_hai();
void goto_dao(object ob);

void create()
{
        set_name("老船夫", ({ "lao chuanfu","chuanfu" }));
        set("gender", "男性");
        set("age", 56);
        set("long", @LONG
这是一个老船夫。饱经风霜的脸上透出一丝狡猾。他经常出海，以前
曾经去过桃花岛。现在他拥有一艘大船可以出海。
LONG );

        set("combat_exp", 1000000);
        set("shen_type", 1);

	set("eff_qi", 2000);
	set("qi", 2000);
        set("max_neili", 1000);
        set("neili", 1000);
        set("jiali", 100);

        set_skill("force", 200);
        set_skill("unarmed", 400);
        set_skill("dodge", 200);
        set_skill("parry", 200);
        set("inquiry", ([
                "桃花岛" : "桃花岛上是一群妖魔！不过有个小妖女很美丽，啧啧！\n",
                "出海" :   (: chu_hai :),
        ]));

        setup();
	carry_object("/clone/misc/cloth")->wear();
 }

int chu_hai()
{
        object ob, myenv;

        ob = this_player();
        if (ob->query("family/family_name") == "桃花岛")
        {
                message_vision("老船夫一招手，叫来几个年轻船夫。\n",ob);
                message_vision("年轻船夫和$N上了船，一声「起锚」船就开走了，但老船夫却没上船......\n", ob);
                myenv = environment (ob) ;
                ob->move ("/d/taohua/dahai");
                tell_object(ob, BLU "你在海上航行了很久很久.......\n" NOR ) ;
	        call_out("goto_taohua",5,ob) ;
          ob->start_busy(5);
       	        return 1;
        } else
                message_vision("老船夫上上下下打量了$N一下：什么！"
                               "出海？你不要命了？！\n老船夫又想了"
                               "一下：不过... 如果给我一两金子，或"
                               "许可以考虑。\n" ,ob);
        ob->set_temp("出海", 1);
        return 1;
}

int accept_object(object who, object ob)
{
        object myenv ;
        if (! (int)who->query_temp("出海"))
        {
	        message_vision("老船夫笑着对$N说：无功不受禄，"
                               "您还是自己留着吧！\n", who);
	        return 0 ;
        }

        if (ob->query("money_id") && ob->value() >= 10000)
        {
                message_vision("老船夫对$N说：好！既然这位" +
                               RANK_D->query_respect(who) +
                               "如此看得起我，\n那我也拼上这"
                               "条破船，舍命陪君子便了！\n" , who);
                this_player()->delete_temp("出海");
                message_vision("老船夫一招手，叫来几个年轻船夫。\n", who);
                message_vision("年轻船夫和$N上了船，一声「起锚」船"
                               "就开走了，但老船夫却没上船......\n", who);
                myenv = environment(who);
                who->move("/d/taohua/dahai");
                tell_room(myenv, "老船夫看船走了，掂着手里的金子笑了：去"
                                 "桃花岛？送死的事情我可不干。\n只可惜我"
                                 "那几个听话的船夫，要被那帮人给吃掉了。"
                                 "嘿嘿，哈哈！\n") ;
                tell_object(who, BLU "你在海上航行了很久很久.......\n" NOR);
                call_out("goto_taohua", 5, who);
          who->start_busy(5);
                destruct(ob);
       	        return 1;
	} else
	        message_vision("老船夫皱眉对$N说：您给的也太少了吧？\n", who);

	return 0;
}

void goto_taohua(object ob)
{
   	if (! objectp(ob) || find_object("/d/taohua/dahai") != environment(ob))
		return;

   	tell_object(ob , "大船终于停在了一个小岛边。你走下船来。\n");
   	ob->move("/d/taohua/haitan");
}

void unconcious()
{
        ::die();
}
