#include <ansi.h>
inherit NPC;

#define HEILONG    "/clone/lonely/heilongbian"
#define LING       "/clone/lonely/item/tongjiling"

mixed ask_skill1();

void create()
{
        object ob;
        set_name("茅十八", ({ "mao shiba", "mao", "shiba" }));
        set("long", @LONG
他虬髯如乱草，满脸血污，好象曾受过很重的
伤，可以看得见他左腿上血迹未干。但他双目
炯炯，却又有着说不出的威风。
LONG);
        set("title", "官府通缉要犯");
        set("gender", "男性");
        set("age", 30);
        set("str", 25);
        set("dex", 16);
        set("max_qi", 500);
        set("max_jing", 300);
        set("neili", 800);
        set("max_neili", 800);
        set("jiali", 50);
        set("combat_exp", 300000);
        set("shen_type", 1);
        set("attitude", "peaceful");

        set_skill("force", 100);
        set_skill("bagua-xinfa", 100);
        set_skill("blade", 120);
        set_skill("wuhu-duanmendao", 120);
        set_skill("cuff", 120);
        set_skill("hua-quan", 120);
        set_skill("dodge", 100);
        set_skill("feiyan-zoubi", 100);
        set_skill("parry", 100);
        set_skill("literate", 60);
        set_skill("martial-cognize", 80);

        map_skill("blade", "wuhu-duanmendao");
        map_skill("parry", "wuhu-duanmendao");
        map_skill("force", "bagua-xinfa");
        map_skill("dodge", "feiyan-zoubi");
        map_skill("cuff", "hua-quan");

        prepare_skill("cuff", "hua-quan");

        set_temp("apply/attack", 30);
        set_temp("apply/defense", 30);
        set_temp("apply/armor", 100);
        set_temp("apply/damage", 50);
        set_temp("apply/unarmed_damage", 50);

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "cuff.juan" :),
                (: perform_action, "blade.duan" :),
                (: exert_function, "recover" :),
        }));

        set("inquiry", ([
                "史松"   : "谁杀了史松这奸贼，我可以帮他提高江湖威望。",
                //"断字诀" : "我总得留两手吧？",
				"断字诀" : (: ask_skill1 :),
        ]));

        set("chat_chance", 2);
        set("chat_msg", ({
                CYN "茅十八说道: 他奶奶的，我就不信鳌拜有这等厉害，我正要上北京去斗他一斗。\n" NOR,
                CYN "茅十八叹道: 我这五虎断门刀法对付盐枭可是绰绰有余，不知对付鳌拜行不行。\n" NOR,
                CYN "茅十八说道: 他奶奶的，要谁帮我杀了史松，兄弟我就谢谢了。\n" NOR,
                CYN "茅十八朗声说道：江湖有言为人不识陈近南，就称英雄也枉然。\n" NOR,
                (: random_move :)
        }) );
        setup();
        if (clonep())
        {
                ob = find_object(LING);
                if (! ob) ob = load_object(LING);
                if (! environment(ob))
                {
                        ob->move(this_object());
                        set_temp("handing", ob);
                }
        }
        carry_object("/d/city/obj/gangdao")->wield();
        carry_object("/clone/misc/cloth")->wear();
}

int accept_object(object me, object ob)
{
        int exp, pot, sc;

        exp = 1000 + random(300);
        pot = 500 + random(250);
        sc = 5 + random(25);	//奖励增加

        if (base_name(ob) != HEILONG)
        {
                command("say 你给我这种东西干什么？");
                return 0;
        }

        if (me->query("combat_exp") > 10000)
        {
        	if (! (int)me->query("skybook/luding/mao"))
        	{
                	me->add("combat_exp", exp);
                	me->add("potential", pot);
                	me->add("score", sc);
                	tell_object(me, HIW "\n\n你成功的帮助茅十八弄到了黑龙鞭！\n" NOR +
                                        HIC "通过这次的历练，你获得了" + chinese_number(exp) +
                                        "点经验、" + chinese_number(pot) + "点潜能以及" +
                                	chinese_number(sc) + "点江湖阅历。\n\n" NOR);
                	me->set("skybook/luding/mao", 1);
                	me->set("can_learn/wuhu-duanmendao/mao", 1);
		}
                command("haha");
                command("say 多谢，多谢。那个狗腿子俺早就想除去了。");
                command("say 俺这有一套五虎断门刀，你如果有意，倒是可以看看。\n");
        } else
	{
                command("pat " + me->query("id"));
                command("say 要不是你的江湖经验太浅，俺真想教你点东西。");
	}
        destruct(ob);
        return 1;
}

int recognize_apprentice(object me, string skill)
{
        if (! me->query("can_learn/wuhu-duanmendao/mao"))
        {
                command("say 干嘛？没拜师就想向俺学东西？");
                return -1;
        }

        if (skill != "wuhu-duanmendao")
        {
                command("say 俺就只有这一套刀法拿得出手。");
                return -1;
        }
        return 1;
}

mixed ask_skill1()
{
        object me;

        me = this_player();

        if (me->query("can_perform/wuhu-duanmendao/duan"))
                return "这一招我不是已经教过你了吗？";

        if (me->query_skill("wuhu-duanmendao", 1) < 1)
                return "你连五虎断门刀都没学，还谈什么绝招可言？";

        //if (me->query("gongxian") < 200)
        //        return "你在教内甚无作为，这招我暂时还不能传你。";

        if (me->query("score") > 500000)
                return "你已是成名大侠，就算学会这招又有什么用？";

        if (me->query_skill("force") < 100)
                return "你的内功火候尚需提高，练好了再来找我吧。";

        if (me->query_skill("wuhu-duanmendao", 1) < 60)
                return "你的五虎断门刀还练得不到家，自己下去练练再来吧！";

        message_sort(HIY "\n$n" HIY "朝$N" HIY "微微点了点头，说道：“看"
                     "好了！”说完$n" HIY "一声断喝，猛然伏地，手中钢刀，"
                     "携着开天辟地之势连出数刀，气势恢弘之极，顿时一片白"
                     "光向前直滚而去！真可谓是惊天地，泣鬼神，直把$N" HIY
                     "看得目瞪口呆。\n\n" NOR, me, this_object()); 
					 
        command("nod2");
        command("say 招式便是如此，你自己下去练吧。");
        tell_object(me, HIC "你学会了「断」字决。\n" NOR);
        me->set("can_perform/wuhu-duanmendao/duan", 1);
        //me->add("gongxian", -200);

        return 1;
}