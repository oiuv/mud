#include <ansi.h>
#include "kunlun.h"

inherit NPC;
inherit F_MASTER;
inherit F_GUARDER;

mixed ask_skill1();
mixed ask_skill2();

void create()
{
	set_name("班淑娴", ({ "ban shuxian", "ban", "shuxian" }));
	set("title", "昆仑派掌门夫人");
        set("long", @LONG
她就是昆仑派第四代掌门铁琴先生何太冲的夫
人班淑娴。只见她身材高大，头发花白，双目
含威。眉心间聚有煞气。
LONG);
	set("gender", "女性");
	set("age", 46);
	set("attitude", "heroism");
	set("str", 25);
	set("int", 25);
	set("con", 25);
	set("dex", 25);
        set("max_qi", 4800);
        set("max_jing", 2800);
        set("neili", 5500);
        set("max_neili", 5500);
        set("jiali", 130);
        set("combat_exp", 1500000);

        set_skill("force", 210);
        set_skill("kunlun-xinfa", 200);
        set_skill("liangyi-shengong", 210);
        set_skill("dodge", 180);
        set_skill("chuanyun-bu", 180);
        set_skill("hand", 210);
        set_skill("sanyin-shou", 210);
        set_skill("cuff", 210);
        set_skill("zhentian-quan", 210);
        set_skill("parry", 200);
        set_skill("sword", 200);
        set_skill("kunlun-jian", 200);
        set_skill("xunlei-jian", 200);
        set_skill("zhengliangyi-jian", 200);
        set_skill("throwing", 180);
        set_skill("kunlun-qifa", 180);
        set_skill("tanqin-jifa", 160);
        set_skill("qiuyue-lai", 160);
        set_skill("literate", 220);
        set_skill("martial-cognize", 200);

        map_skill("force", "liangyi-shengong");
        map_skill("dodge", "chuanyun-bu");
        map_skill("parry", "kunlun-jian");
        map_skill("sword", "zhengliangyi-jian");
        map_skill("cuff", "zhentian-quan");
        map_skill("hand", "sanyin-shou");
        map_skill("throwing", "kunlun-qifa");
        map_skill("tanqin-jifa", "qiuyue-lai");

        prepare_skill("strike", "kunlun-zhang");
        prepare_skill("cuff", "zhentian-quan");

        set("coagents", ({
                ([ "startroom" : "/d/kunlun/tieqinju",
                   "id"        : "he taichong" ]),
        }));

        set("guarder", ([
                "refuse_other": CYN "$N" CYN "对$n" CYN "冷喝道："
                                "你给我站住！我们昆仑派岂是由得外"
                                "人随便走动地方？" NOR,
                "refuse_carry": CYN "$N" CYN "对$n" CYN "喝道：你"
                                "背上背的是什么人？给我放下来！" NOR,
        ]));

        create_family("昆仑派", 4, "掌门夫人");

        set("inquiry", ([
                "绝招"      : "你要问什么绝招？",
                "绝技"      : "你要问什么绝技？",
                "石破天惊"  : "这招你找我丈夫学去，别来烦我。",
                "流星电闪"  : "这招你找我丈夫学去，别来烦我。",
                "迅雷一击"  : "这招你找我丈夫学去，别来烦我。",
                "域外梵音"  : "这招你找我丈夫学去，别来烦我。",
                "玉碎昆冈"  : "这招你找我丈夫学去，别来烦我。",
                "损筋诀"    : (: ask_skill1 :),
                "无声无色"  : (: ask_skill2 :),
        ]));

        set("chat_chance_combat", 100);
        set("chat_msg_combat", ({
                (: perform_action, "sword.wu" :),
                (: perform_action, "throwing.liu" :),
                (: perform_action, "cuff.shi" :),
                (: perform_action, "hand.sun" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),

        }) );

	setup();

        carry_object("clone/weapon/changjian")->wield();
        carry_object("clone/misc/cloth")->wear();
}

void attempt_apprentice(object me)
{
        if (! permit_recruit(me))
                return;

        if (me->query("gender") != "女性")
        {
                command("say 我看见你们这些臭男人就烦，快给我滚开！");
                return;
        }

        if ((int)me->query("combat_exp") < 150000)
        {
                command("say 你的江湖经验太浅，还是锻炼锻炼再说吧。");
                return;
        }

        if ((int)me->query_skill("kunlun-xinfa", 1) < 80)
        {
		command("say 你对本门的内功心法所知尚浅，练习高了再来找我吧。");
		return;
	}

	command("say 好吧，以后你就跟我吧，你须得安心学艺，不可乱来。");
        command("recruit " + me->query("id"));
}

mixed ask_skill1()
{
        object me;

        me = this_player();

        if (me->query("can_perform/sanyin-shou/sun"))
                return "自己下去练，别老跟我纠缠不休！";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "和本派素无瓜葛，何出此言？";

        if (me->query_skill("sanyin-shou", 1) < 1)
                return "你连三阴手都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 400)
                return "你对本派所作出的贡献不够，这一招我暂时还不能传你。";

        if (me->query_skill("force") < 200)
                return "你的内功火候不足，学不了这一招！";

        if (me->query_skill("sanyin-shou", 1) < 140)
                return "你的三阴手修为还不够，自己下去练练再来吧。";

        message_vision(HIY "$n" HIY "微微一笑，对$N" HIY "说道：看"
                       "好了。说完单手轻轻拂\n过身前的茶几，不着半"
                       "点力道。$N" HIY "正诧异间，茶几突然\n从中碎"
                       "裂，“喀嚓”一声断为两截。\n" NOR, me,
                       this_object());
        command("smile");
        command("say 这招便是损筋诀，并不复杂，只需记住‘以柔克刚’四字皆可。");
        tell_object(me, HIC "你学会了「损筋诀」。\n" NOR);

        if (me->can_improve_skill("hand"))
                me->improve_skill("hand", 1500000);
        if (me->can_improve_skill("sanyin-shou"))
                me->improve_skill("sanyin-shou", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/sanyin-shou/sun", 1);
        me->add("gongxian", -400);

        return 1;
}

mixed ask_skill2()
{
        object me;

        me = this_player();

        if (me->query("can_perform/zhengliangyi-jian/wu"))
                return "自己下去练，别老跟我纠缠不休！";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "和本派素无瓜葛，何出此言？";

        if (me->query_skill("zhengliangyi-jian", 1) < 1)
                return "你连正两仪剑法都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 1200)
                return "你对本派所作出的贡献不够，这一招我暂时还不能传你。";

        if (me->query_skill("force") < 220)
                return "你的内功火候不足，学不了这一招。";

        if (me->query_skill("dodge") < 220)
                return "你的轻功火候不足，学不了这一招。";

        if (me->query_dex() < 45)
                return "你的身法实在太差，学不了这一招。";

        if (me->query_skill("zhengliangyi-jian", 1) < 160)
                return "你的正两仪剑法修为还不够，自己下去练练再来吧。";

        message_vision(HIY "$n" HIY "眉头微微一皱，一挥手，示意其它弟子"
                       "全部出去。\n待其余昆仑派弟子陆续退下后，$n" HIY
                       "谨慎的环顾了下\n四周，最后将$N" HIY "招至身边，"
                       "悄声在$N" HIY "耳旁细说良久。\n" NOR, me,
                       this_object());
        command("nod");
        command("say 刚才我所说的你都记牢了吗？自己下去练吧！");
        tell_object(me, HIC "你学会了「无声无色」。\n" NOR);

        if (me->can_improve_skill("sword"))
                me->improve_skill("sword", 1500000);
        if (me->can_improve_skill("zhengliangyi-jian"))
                me->improve_skill("zhengliangyi-jian", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/zhengliangyi-jian/wu", 1);
        me->add("gongxian", -1200);

        return 1;
}

