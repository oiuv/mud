// ouyangke.c

#include <ansi.h>
#include "ouyang.h"

inherit F_MASTER;
inherit F_UNIQUE;
inherit NPC;

void greeting(object ob);
int  accept_object(object who, object ob);
void do_back();
mixed ask_shenshe();

void create()
{
	seteuid(getuid());
	set_name("欧阳克", ({ "ouyang ke", "ouyang", "ke" }));
	set("long", "他一身飘逸的白色长衫，手摇折扇，风流儒雅。\n");
	set("title", "白驼山少庄主");
	set("nickname", HIM "玉面蛇心" NOR);
	set("gender", "男性");
	set("age", 27);
	set("attitude", "friendly");
	set("shen_type", -1);

	set("str", 25);
	set("int", 29);
	set("con", 25);
	set("dex", 26);

	set("qi", 1700);
	set("max_qi", 1700);
	set("jing", 800);
	set("max_jing", 800);
	set("neili", 3000);
	set("max_neili", 3000);
	set("jiali", 50);

	set("combat_exp", 300000);

	set_skill("cuff",  130);
	set_skill("dodge", 120);
	set_skill("parry", 140);
	set_skill("force", 130);
	set_skill("staff", 100);
	set_skill("training", 80);
	set_skill("hamagong",130);
	set_skill("baituo-xinfa",140);
	set_skill("chanchu-bufa", 120);
	set_skill("lingshe-quan", 130);
	set_skill("baibian-daxue", 120);
        set_skill("poison", 120);
        set_skill("finger", 100);
        set_skill("shedu-qiqiao", 120);
	set_skill("medical", 150);
	set_skill("baituo-michuan", 150);
        set_skill("literate", 100);

	map_skill("force", "hamagong");
	map_skill("dodge", "chanchu-bufa");
	map_skill("cuff",  "lingshe-quan");
	map_skill("parry", "baibian-daxue");
	map_skill("staff", "baibian-daxue");
        map_skill("cuff", "lingshe-quan");
        map_skill("finger", "shedu-qiqiao");

        prepare_skill("finger", "shedu-qiqiao");
        prepare_skill("cuff", "lingshe-quan");

        create_family("欧阳世家", 6, "传人");

	set("chat_chance", 2);
	set("chat_msg", ({
		CYN "欧阳克把纸扇一展，转过身去，深吟道：红颜知己最难得……\n" NOR,
	}) );

        set("inquiry", ([
                "引路神蛇" : (: ask_shenshe :),
                "神蛇"     : (: ask_shenshe :),
        ]));

        set_temp("shenshe_count", 5);

	setup();
	carry_object("/d/baituo/obj/baipao")->wear();
	add_money("silver",10);
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

void greeting(object ob)
{
	if (!ob || environment(ob) != environment()) return;

        if (check_family(ob, "欧阳世家"))
        {
                command("nod " + ob->query("id"));
                return;
        }

	if ((string)ob->query("gender") == "女性")
	{
                if (ob->query("per") < 22)
                        return;

                if (ob->query("sex/欧阳克"))
                {
                        command("kiss " + ob->query("id"));
                        command("say 怎么样，要不要再来几次？");
                } else
        	switch(random(3))
        	{
        	case 0: command("kiss "+(string)ob->query("id"));break;
        	case 1: command("kiss6 "+(string)ob->query("id"));break;
        	case 2: command("smile "+(string)ob->query("id"));break;
        	}
     
	}
	else
           say(CYN "欧阳克叹了一口气说：这位" + RANK_D->query_respect(ob) +
               CYN "，你要是能给我弄一个女人来就好了。\n" NOR);
	return;
}

void attempt_apprentice(object ob)
{
	if ((string)ob->query("gender") == "女性" &&
            (string)ob->query("born_family") != "欧阳世家")
        {
		message_vision(CYN "欧阳克动情地说道：这位" + RANK_D->query_respect(ob) +
		               CYN "真乃我的红颜知己，可\n惜家规所限，不能传你武功，你还"
                               "是做我的小妾吧。\n" NOR, ob);
                return;
        }

        if (! permit_recruit(ob))
                return;

        message_vision("$N道：好... 很好！\n", this_object());
	command("recruit " + ob->query("id"));
        if (! ob->query("special/shenshe"))
        {
                command("say 你还不会使用引路神蛇吧？我告诉你口诀，你可不要忘记了！");
                command("whisper " + ob->query("id") + " 口诀是：@#$%^&*，你"
                        "拿着引路神蛇到了西域沙漠就可以让神蛇带你回家了！");
                ob->set("special/shenshe", 1);
        }
}

int accept_fight(object ob)
{
	if ((string)ob->query("gender") == "女性")
	{
		message_vision(CYN "欧阳克摆摆手说道：这位" + RANK_D->query_respect(ob) +
		               CYN "，我怎能欺负女孩子呢！\n" NOR, ob);
		return 0;
        }

        return ::accept_fight(ob);
}
 
int accept_object(object who, object ob)
{
	object obn;
        int addition;

        if (! who || environment(who) != environment()) return 0;
	if (! objectp(ob)) return 0;
	
	if (! present(ob, who))
                return notify_fail("你没有这件东西。\n");

	if (! ob->is_character() || (string)ob->query("gender") != "女性")
	{
              	command("say 我欧阳克不需要这件东西。");
                return 0;
        }

	if (ob->is_corpse())
	{
		command("slap " + who->query("id"));
		command("say 好嘛你，居然拿具尸体来糊弄我，找晦气啊？");
		return 0;
	}

        if ((string)ob->query("born_family") == "欧阳世家")
        {
                command("kick " + who->query("id"));
                command("slap " + who->query("id"));
                command("say 我靠！你胆子可真不小，连我的胞妹你也敢欺负？");
                return 1;
        }

	if (environment(this_object())->query("short") == "丽春院")
	{
               	command("say 我已经有女人了，你改天再送来吧。");
                return 0;
        }

	if ((int)ob->query("age") <18)
	{
                command("fear");
                command("say 未成年少女我怎敢要！");
                return 0;
        }

        if ((int)ob->query("age") > 29)
	{
        	command("say 这种老古董还是留给你自己吧！");
                return 0;
        }

        addition = 0;
        if (userp(ob))
        {
                // 5 + 2 :: because times & first will occupy two item
                if (sizeof(ob->query("sex")) > 4 + 2 )
                {
                        command("say 靠！这种女人人尽可夫，我欧阳克可不想要。");
                        return 0;
                }

                if (ob->query("per") < 25)
                {
                        command("shrug");
                        command("say 这……这种货色也未免差了点，你"
				"也找个漂亮些的啊。");
                        return 0;
                }

                addition += ob->query("per");
                if ((int) ob->query("sex/times") == 0)
                {
                        command("say 哇，这还是个处女，怎么也得多给"
			        "你点辛苦费！");
                        addition += 30;
                }
        }

        if (ob->query("sex/欧阳克") >= 3)
        {
                command("shake");
                command("say 这女人我已经玩腻了，你自个留着吧。");
                return 0;
        }

	obn=new("/clone/money/silver");
        obn->set_amount(20 + addition);
        obn->move(who);

        message_vision(HIC "$n" HIC "把" + ob->name() + HIC "交给了$N"
                       HIC "。\n\n" NOR, this_object(), who);

        message_vision(HIY "$N" HIY "一把把" + ob->name() + HIY "揽在"
                       "怀里，对$n" HIY "说：这点银子是你的辛苦费，咱"
                       "回头见。\n说完，就携着" + ob->name() + HIY "往"
                       "丽春院奔去。\n" NOR, this_object(), who);

        ob->move("/d/city/lichunyuan");
        move("/d/city/lichunyuan");

        message_vision("$N抱着昏迷不醒的$n走了进来。\n", this_object(), ob);

        ob->add("sex/欧阳克", 1);
        ob->add("sex/times",  1);
        if (ob->query("sex/times") == 1)
                ob->set("sex/first", "欧阳克");

        ob->revive();
        tell_object(ob, HIY "你刚刚挣开眼睛，却发现一个人"
		        "正抱着你，你大叫一声，几乎晕了过去。\n\n" NOR);
        command("kiss " + ob->query("id"));
        command("say 嘻嘻，你慌什么么嘛，可是" + who->name() + "把你送过来的啊。");
        shout(sprintf(HIW "\n%s(%s)大声喊道：救命啊……救…救命………\n\n" NOR,
                      ob->name() + HIW, ob->query("id")));

        if (! userp(ob))
        {
                ob->set("chat_chance", 15);
                ob->set("chat_msg", ({CYN + ob->name() + CYN "不住的抽泣。\n" NOR,
                                      CYN + ob->name() + CYN "呜咽道：" + this_object()->name() +
                                      CYN "，他…他…他这个坏东西。\n" NOR,
                                      CYN + ob->name() + CYN "哭了起来：我不想活了！\n" NOR,
                }) );
        }

        remove_call_out("do_back");
        call_out("do_back", 10 + random(10));
        return -1;
}

void do_back()
{
        remove_call_out("do_back");
        if (base_name(environment()) == query("startroom"))
                return;

        if (! living(this_object()) ||
            is_busy() || is_fighting())
        {
                call_out("do_back", 10 + random(10));
                return;
        }

        message_vision(HIW "$N" HIW "轻摇羽扇，飘然而去。\n" NOR, this_object());
        move(query("startroom"));
        message_vision(HIW "$N" HIW "轻摇羽扇，施施然的走了过来。\n" NOR, this_object());
}

mixed ask_shenshe()
{
        object me;
        object ob;

        me = this_player();
        if (me->query("family/family_name") != query("family/family_name"))
                return "哈哈，你向我打听这个干什么？";

        if (time() - me->query_temp("ask_shenshe") < 900)
                return "我不是刚刚给你一条吗？你怎么还要？";

        if (query_temp("shenshe_count") < 1)
                return "没了，我又不是卖这个的，哪里带得了这么多？";

        me->set_temp("ask_shenshe", time());

        add_temp("shenshe_count", -1);
        ob = new("/d/baituo/obj/shenshe");
        message_vision(HIC "$N" HIC "看看四周，摸出一样东西递给$n"
                       HIC "。\n" NOR, this_object(), me);
        ob->move(me, 1);
        return "嗯，你可得收好了！别到处乱放。";
}

void reset()
{
        set("shenshe_count", 5);
}
