#include <ansi.h>
#include "riyue.h"

inherit NPC;
inherit F_MASTER;

mixed ask_skill1();
mixed ask_skill2();
mixed ask_skill3();

void create()
{
	set_name("上官云", ({ "shangguan yun", "shangguan", "yun"}));
        set("title", "日月神教白虎堂长老");
        set("nickname", WHT "雕侠" NOR);
        set("long", @LONG
这是日月神教白虎堂长老上官云。在教中人称
雕侠，为人极其耿直，武功又高强。
LONG);
	set("gender", "男性" );
        set("class", "scholar");
        set("age", 39);
        set("attitude", "friendly");
        set("shen_type", -1);
        set("str", 36);
        set("int", 36);
        set("con", 36);
        set("dex", 36);
        set("max_qi", 5200);
        set("max_jing", 3400);
        set("neili", 5800);
        set("max_neili", 5800);
        set("jiali", 160);
        set("combat_exp", 2500000);
        set("score", 10000);

        set_skill("force", 240);
        set_skill("tianhuan-shenjue", 240);
        set_skill("riyue-xinfa", 220);
        set_skill("dodge", 220);
        set_skill("juechen-shenfa", 240);
        set_skill("feiyan-zoubi", 220);
        set_skill("blade", 240);
        set_skill("danding-dao", 240);
        set_skill("shiying-lianhuan", 240);
        set_skill("strike", 180);
        set_skill("qingmang-zhang", 180);
        set_skill("parry", 220);
        set_skill("cuff", 200);
        set_skill("zhenyu-quan", 200);
        set_skill("claw", 200);
        set_skill("poyue-zhao", 200);
        set_skill("martial-cognize", 220);
        set_skill("literate", 140);

        map_skill("dodge", "juechen-shenfa");
        map_skill("force", "tianhuan-shenjue");
        map_skill("blade", "shiying-lianhuan");
        map_skill("parry", "shiying-lianhuan");
        map_skill("cuff", "zhenyu-quan");
        map_skill("claw", "poyue-zhao");
        map_skill("strike", "qingmang-zhang");

        prepare_skill("claw", "poyue-zhao");
        prepare_skill("cuff", "zhenyu-quan");

        create_family("日月神教", 13, "白虎堂长老");

        set("inquiry", ([
                "无痕杀" : (: ask_skill1 :),
                "断脉破岳" : (: ask_skill2 :),
                "百鬼恸哭" : (: ask_skill3 :),
        ]));

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "blade.sha" :),
                (: perform_action, "cuff.tong" :),
                (: perform_action, "claw.duan" :),
                (: exert_function, "recover" :),
        }) );
        setup();

        carry_object("/d/heimuya/npc/obj/jinpao")->wear();
        carry_object("clone/weapon/gangdao")->wield();
}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        if ((int)ob->query("shen") > -30000)
        {
                command("killair");
                command("say 老子最讨厌伪君子，再不滚开我毙了你！");
                return;
        }

        if (ob->query("combat_exp") < 200000)
        {
                command("say 你现在江湖经验太浅，应该多走动走动。");
                return;
        }

        if (ob->query_skill("blade", 1) < 80)
        {
                command("hmm");
                command("say 俺是用刀的，你我习武的路线不对，难以教授。");
                return;
        }

        if (ob->query_skill("tianhuan-shenjue", 1) < 80
           && ob->query_skill("riyue-xinfa", 1) < 80)
        {
                command("hmm");
                command("say 你连本门最基本的内功都没修好，怎么学习上乘武学。");
                return;
        }

        command("haha");
        command("say 看你有心为神教出力，今日我就成全你。");
        command("say 日月神教一统江湖的千秋大业，就全靠你们了。");
        command("recruit " + ob->query("id"));
        return;
}

mixed ask_skill1()
{
        object me;

        me = this_player();

        if (me->query("can_perform/shiying-lianhuan/sha"))
                return "这一招我不是已经教过你了吗？";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你又不是我日月神教的，跑来捣什么乱？";

        if (me->query_skill("shiying-lianhuan", 1) < 1)
                return "你连弑鹰九连环都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 600)
                return "你在教内甚无作为，这招我暂时还不能传你。";

        if (me->query("shen") > -40000)
                return "你这样心慈手软，就算学会这招又有什么用？";

        if (me->query_skill("force") < 200)
                return "你的内功火候尚需提高，练好了再来找我吧。";

        if (me->query_skill("shiying-lianhuan", 1) < 150)
                return "你的弑鹰九连环还练得不到家，自己下去练练再来吧！";

        message_sort(HIY "\n$n" HIY "笑了笑，伸手将$N" HIY "招到身前，低"
                     "声在$N" HIY "耳旁嘀咕了半天。然后又拔出腰刀翻转数下"
                     "，斜撩而出。似乎是一种颇为独特的刀诀。\n\n" NOR, me,
                     this_object()); 

        command("nod2");
        command("say 看懂了吗？看懂了就自己下去练吧。");
        tell_object(me, HIC "你学会了「无痕杀」。\n" NOR);
        if (me->can_improve_skill("blade"))
                me->improve_skill("blade", 1500000);
        if (me->can_improve_skill("shiying-lianhuan"))
                me->improve_skill("shiying-lianhuan", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/shiying-lianhuan/sha", 1);
        me->add("gongxian", -600);

        return 1;
}

mixed ask_skill2()
{
        object me;

        me = this_player();

        if (me->query("can_perform/poyue-zhao/duan"))
                return "这一招我不是已经教过你了吗？";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你又不是我日月神教的，跑来捣什么乱？";

        if (me->query_skill("poyue-zhao", 1) < 1)
                return "你连破岳神爪都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 100)
                return "你在教内甚无作为，这招我暂时还不能传你。";

        if (me->query("shen") > -10000)
                return "你这样心慈手软，就算学会这招又有什么用？";

        if (me->query_skill("force") < 100)
                return "你的内功火候尚需提高，练好了再来找我吧。";

        if (me->query_skill("poyue-zhao", 1) < 80)
                return "你的破岳神爪还练得不到家，自己下去练练再来吧！";

        message_sort(HIY "\n$n" HIY "望着$N" HIY "赞许的点了点头，笑道："
                     "“不错，不错。老夫念你平时练功努力，今日就传你此招"
                     "，可瞧好了。”说完便只见$n" HIY "身形一展，双爪疾攻"
                     "而上，霎时间爪影层层叠叠，虚实难辩，招数甚为巧妙。"
                     "\n\n" NOR, me, this_object()); 

        command("nod");
        command("say 这招的招式并不复杂，你下去后需勤加练习。");
        tell_object(me, HIC "你学会了「断脉破岳」。\n" NOR);
        if (me->can_improve_skill("claw"))
                me->improve_skill("claw", 1500000);
        if (me->can_improve_skill("poyue-zhao"))
                me->improve_skill("poyue-zhao", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/poyue-zhao/duan", 1);
        me->add("gongxian", -100);

        return 1;
}

mixed ask_skill3()
{
        object me;

        me = this_player();

        if (me->query("can_perform/zhenyu-quan/tong"))
                return "这一招我不是已经教过你了吗？";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你又不是我日月神教的，跑来捣什么乱？";

        if (me->query_skill("zhenyu-quan", 1) < 1)
                return "你连镇狱拳法都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 150)
                return "你在教内甚无作为，这招我暂时还不能传你。";

        if (me->query("shen") > -12000)
                return "你这样心慈手软，就算学会这招又有什么用？";

        if (me->query_skill("force") < 120)
                return "你的内功火候尚需提高，练好了再来找我吧。";

        if (me->query_skill("zhenyu-quan", 1) < 80)
                return "你的镇狱拳法还练得不到家，自己下去练练再来吧！";

        message_sort(HIY "\n$n" HIY "微微一笑，招手示意$N" HIY "到他跟前"
                     "，然后俯身在$N" HIY "耳边轻声嘀嘀咕咕了半天，$N" HIY
                     "直听得眉开眼笑，一边听一边不住地点头。\n\n" NOR, me,
                     this_object()); 

        command("nod");
        command("say 对付那些正派人士，一上来就要像这样痛下杀手。");
        tell_object(me, HIC "你学会了「百鬼恸哭」。\n" NOR);
        if (me->can_improve_skill("cuff"))
                me->improve_skill("cuff", 1500000);
        if (me->can_improve_skill("zhenyu-quan"))
                me->improve_skill("zhenyu-quan", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/zhenyu-quan/tong", 1);
        me->add("gongxian", -150);

        return 1;
}
