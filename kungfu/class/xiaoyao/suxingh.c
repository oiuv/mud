#include <ansi.h>
#include "xiaoyao.h"

inherit NPC;
inherit F_MASTER;
inherit F_GUARDER;
inherit F_QUESTER;

mixed ask_skill1();
mixed ask_skill2();
mixed ask_skill3();

void create()
{
        set_name("苏星河", ({"su xinghe", "su", "xinghe"}));
        set("gender", "男性" );
        set("nickname", HIW "聪辩老人" NOR);
        set("long", @LONG
此人就是号称聪辩老人的苏星河，据说他能言
善辩，是武林中颇为传神的一位智者，而他的
武功也是无人能知。
LONG );
        set("class", "scholar");
        set("age", 60);
        set("str", 29);
        set("con", 30);
        set("int", 45);
        set("dex", 37);
        set("combat_exp", 2000000);
        set("attitude", "peaceful");

        set("max_qi", 5000);
        set("max_jing", 3000);
        set("neili", 5500);
        set("max_neili", 5500);
        set("jiali", 120);

        set_skill("force", 260);
        set_skill("xiaoyao-xinfa", 240);
        set_skill("xiaowuxiang", 260);
        set_skill("dodge", 240);
        set_skill("feiyan-zoubi", 240);
        set_skill("strike", 240);
        set_skill("panyang-zhang", 240);
        set_skill("liuyang-zhang", 240);
        set_skill("hand", 240);
        set_skill("qingyun-shou", 240);
        set_skill("zhemei-shou", 240);
        set_skill("parry", 240);
        set_skill("blade", 240);
        set_skill("ruyi-dao", 240);
        set_skill("literate", 280);
        set_skill("medical", 260);
        set_skill("xiaoyao-qixue", 260);
        set_skill("mathematics", 240);
        set_skill("qimen-wuxing", 240);
        set_skill("drawing",   240);
        set_skill("chuixiao-jifa", 240);
        set_skill("tanqin-jifa", 240);
        set_skill("chess", 280);
        set_skill("calligraphy", 240);
        set_skill("martial-cognize", 240);

        map_skill("force", "xiaowuxiang");
        map_skill("dodge", "feiyan-zoubi");
        map_skill("hand", "zhemei-shou");
        map_skill("strike", "liuyang-zhang");
        map_skill("parry", "zhemei-shou");
        map_skill("blade", "ruyi-dao");
        map_skill("medical", "xiaoyao-qixue");

        prepare_skill("hand", "zhemei-shou");
        prepare_skill("strike", "liuyang-zhang");

        set("no_teach", ([
                "zhemei-shou"   : "逍遥折梅手乃本门神功，只能由掌门人传授。",
                "liuyang-zhang" : "这天山六阳掌向来只能由逍遥派掌门传功，我不便教授。",
        ]));

        create_family("逍遥派", 2, "掌门弟子");

        set("inquiry", ([
                "捕风捉影" : (: ask_skill1 :),
                "攀阳邀月" : (: ask_skill2 :),
                "如意六刀" : (: ask_skill3 :),
        ]));

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "hand.zhe" :),
                (: perform_action, "hand.hai" :),
                (: perform_action, "strike.huan" :),
                (: perform_action, "strike.zhong" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),
                (: exert_function, "shield" :),
        }));

        set("coagents", ({
                ([ "startroom" : "/d/xiaoyao/shishi",
                   "id"        : "wuya zi" ]),
        }));

        set("guarder", ([
                "refuse_other": CYN "$N" CYN "对$n" CYN "冷喝道："
                                "阁下请留步，此处乃本门禁地，旁人"
                                "不得入内。" NOR,
                "refuse_carry": CYN "$N" CYN "对$n" CYN "喝道：你"
                                "背负的是什么人，还不快快给我放下"
                                "！" NOR,
        ]));

        setup();
        carry_object("/clone/cloth/cloth")->wear();
}


void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        if (ob->query_int() < 30)
        {
                command("say " + RANK_D->query_respect(ob) + "是否还应该在学"
                        "问上多下点功夫，笨人可逍遥不了！");
                return;
        }

	if ((int)ob->query("combat_exp") < 200000)
	{
		command("say 你现在经验尚浅，不能领会高深的武功，先锻炼要紧。");
		return;
	}

        if (ob->query_skill("force", 1) < 100)
        {
                command("sigh");
                command("say 我们逍遥派的武功都要以内功为基础，你先把"
                        "基础内功学扎实吧。");
                return;
        }

        if (ob->query_skill("xiaoyao-xinfa", 1) < 100)
        {
                command("sigh");
                command("say 你连本门的入门心法都没有学好，还想学本门"
                        "的上乘武学？");
                return;
        }

        command("say 好吧，我就收下你了，今后要多加努力啊！");
        command("recruit " + ob->query("id"));
}

int permit_pass(object me, string dir)
{
        if (! ::permit_pass(me, dir))
                return 0;

        if (me->query("family/master_id") == "wuya zi")
                return 1;

        if (me->query("combat_exp") < 300000)
        {
                command("say 你这种身手不要去那里，好好学我们逍遥派武功。");
                return 0;
        }

        if (me->query_skill("xiaoyao-xinfa", 1) < 120)
        {
                command("say 连我们逍遥心法都学不好，乱走什么？");
                return 0;
        }

        command("sigh");
        command("say 去吧，去吧！有缘者事竟成。");
        return 1;
}

mixed ask_skill1()
{
        object me;

        me = this_player();

        if (me->query("can_perform/qingyun-shou/zhuo"))
                return "我不是已经教过你了吗？";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "和本派素无瓜葛，何出此言？";

        if (me->query_skill("qingyun-shou", 1) < 1)
                return "你连青云手都未曾学过，何来绝招？";

        if (me->query("gongxian") < 50)
                return "你虽在我逍遥门下，却甚无作为，这招我先不忙传你。";

        if (me->query_skill("force") < 100)
                return "你的内功火候不足，学不成这招。";

        if (me->query_skill("qingyun-shou", 1) < 50)
                return "你的青云手火候未到，还得多练习练习。";

        message_vision(HIY "$n" HIY "点了点头，伸手将$N" HIY "招至"
                       "身边，在耳旁低声细说良久，$N" HIY "听"
                       "后会\n心的一笑，看来大有所悟。\n" NOR, me,
                       this_object());

        command("nod");
        command("say 明白了？");
        tell_object(me, HIC "你学会了「捕风捉影」。\n" NOR);

        if (me->can_improve_skill("hand"))
                me->improve_skill("hand", 1500000);
        if (me->can_improve_skill("qingyun-shou"))
                me->improve_skill("qingyun-shou", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/qingyun-shou/zhuo", 1);
        me->add("gongxian", -50);
        return 1;
}

mixed ask_skill2()
{
        object me;

        me = this_player();

        if (me->query("can_perform/panyang-zhang/pan"))
                return "我不是已经教过你了吗？";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "和本派素无瓜葛，何出此言？";

        if (me->query_skill("panyang-zhang", 1) < 1)
                return "你连攀阳掌都未曾学过，何来绝招？";

        if (me->query("gongxian") < 100)
                return "你虽在我逍遥门下，却甚无作为，这招我先不忙传你。";

        if (me->query_skill("force") < 100)
                return "你的内功火候不足，学不成这招。";

        if (me->query_skill("panyang-zhang", 1) < 60)
                return "你的攀阳掌火候未到，还得多练习练习。";

        message_vision(HIY "$n" HIY "略微点了点头，说道：“我给你演示"
                      "一遍，可瞧仔细了！”随即\n一声清啸，双掌纷飞贯"
                      "出，掌影重重叠叠虚实难辨，全全笼罩$N" HIY "全身"
                      "。\n" NOR, me, this_object());

        command("nod");
        command("say 看清楚了就自己下去练吧。");
        tell_object(me, HIC "你学会了「攀阳邀月」。\n" NOR);

        if (me->can_improve_skill("strike"))
                me->improve_skill("strike", 1500000);
        if (me->can_improve_skill("panyang-zhang"))
                me->improve_skill("panyang-zhang", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/panyang-zhang/pan", 1);
        me->add("gongxian", -100);
        return 1;
}

mixed ask_skill3()
{
        object me;

        me = this_player();

        if (me->query("can_perform/ruyi-dao/ruyi"))
                return "我不是已经教过你了吗？";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "和本派素无瓜葛，何出此言？";

        if (me->query_skill("ruyi-dao", 1) < 1)
                return "你连如意刀法都未曾学过，何来绝招？";

        if (me->query("gongxian") < 200)
                return "你虽在我逍遥门下，却甚无作为，这招我先不忙传你。";

        if (me->query_skill("force") < 150)
                return "你的内功火候不足，学不成这招。";

        if (me->query_skill("ruyi-dao", 1) < 100)
                return "你的如意刀法火候未到，还得多练习练习。";

        message_vision(HIY "$n" HIY "点点头，微笑着示意赞许，伸手将$N"
                       HIY "招到身前，低声在$N" HIY "耳旁嘀\n咕了半天"
                       "。不时还拔出腰刀挥舞几下，似乎是一种颇为神妙的"
                       "刀诀。\n" NOR, me, this_object());

        command("smile");
        command("say 这招很简单，只需稍加练习便成。");
        tell_object(me, HIC "你学会了「如意六刀」。\n" NOR);

        if (me->can_improve_skill("blade"))
                me->improve_skill("blade", 1500000);
        if (me->can_improve_skill("ruyi-dao"))
                me->improve_skill("ruyi-dao", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/ruyi-dao/ruyi", 1);
        me->add("gongxian", -200);
        return 1;
}

void unconcious()
{
        die();
}
