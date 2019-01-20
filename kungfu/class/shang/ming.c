#include <ansi.h>
#include "shang.h"

#define BAGUADAO    "/clone/lonely/baguadao"

inherit NPC;
inherit F_MASTER;
inherit F_COAGENT;
inherit F_QUESTER;

mixed ask_dao();

mixed ask_skill1();
mixed ask_skill2();
mixed ask_skill3();
mixed ask_skill4();
mixed ask_skill5();
mixed ask_skill6();
mixed ask_skill7();
mixed give_letter();


void create()
{
        // object ob;
        set_name("商剑鸣", ({"shang jianming", "shang", "jianming"}));
        set("gender", "男性");
        set("title", "商家堡堡主");
        set("nickname", YEL "八卦刀" NOR);
        set("age", 45);
        set("long", @LONG
这人身着长衫，身材高大魁梧，留着短须，神
情严肃，模样甚为威严。他就是山东大豪、商
家堡的现任堡主「八卦刀」商剑鸣，相传他刀
掌双绝，武功了得，在江湖上罕逢敌手。
LONG);
        set("attitude", "peaceful");
        set("shen_type", -1);
        set("str", 45);
        set("int", 30);
        set("con", 30);
        set("dex", 30);

        set("qi", 5000);
        set("max_qi", 5000);
        set("jing", 3300);
        set("max_jing", 3300);
        set("neili", 6000);
        set("max_neili", 6000);
        set("jiali", 180);
        set("combat_exp", 3800000);
        set("score", 10000);

        set_skill("force", 240);
        set_skill("nei-bagua", 240);
        set_skill("shangjia-neigong", 220);
        set_skill("parry", 220);
        set_skill("wai-bagua", 220);
        set_skill("dodge", 200);
        set_skill("bagua-bu", 200);
        set_skill("unarmed", 200);
        set_skill("tan-tui", 200);
        set_skill("strike", 240);
        set_skill("bagua-zhang", 240);
        set_skill("bazhen-zhang", 220);
        set_skill("cuff", 200);
        set_skill("bagua-quan", 200);
        set_skill("baisheng-quan", 200);
        set_skill("sword", 200);
        set_skill("quemen-jian", 200);
        set_skill("blade", 240);
        set_skill("bagua-dao", 240);
        set_skill("shangjia-dao", 220);
        set_skill("throwing", 200);
        set_skill("jinbiao-jue", 200);
        set_skill("literate", 240);
        set_skill("martial-cognize", 220);

        map_skill("unarmed", "tan-tui");
        map_skill("dodge", "bagua-bu");
        map_skill("force", "nei-bagua");
        map_skill("strike", "bagua-zhang");
        map_skill("sword", "quemen-jian");
        map_skill("blade", "bagua-dao");
        map_skill("cuff", "bagua-quan");
        map_skill("parry", "wai-bagua");
        map_skill("throwing", "jinbiao-jue");

        prepare_skill("cuff", "bagua-quan");
        prepare_skill("strike", "bagua-zhang");

        set("class", "fighter");

        create_family("商家堡", 3, "堡主");

        set("inquiry", ([
                "紫金八卦刀" : (: ask_dao :),
                "八卦震"     : (: ask_skill1 :),
                "混沌初开"   : (: ask_skill2 :),
                "金莲幻生"   : (: ask_skill3 :),
                "神卦天印"   : (: ask_skill4 :),
                "寒芒暴卷"   : (: ask_skill5 :),
                "劈天神芒"   : (: ask_skill6 :),
                "杀龙无悔"   : (: ask_skill7 :),
                "天刀八势"   : (: give_letter :),
                "胡一刀"     : "哦？听说此人刀法甚是了得，可惜我没见过他。",
                "苗人凤"     : "哼，这贼鸟厮居然敢号称天下无敌，改天一定要去会会。"
        ]));

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "blade.mang" :),
                (: perform_action, "blade.sha" :),
                (: perform_action, "strike.ding" :),
                (: perform_action, "cuff.gua" :),
                (: perform_action, "parry.zhen" :),
                (: perform_action, "throwing.huan" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),
        }) );

        set_temp("apply/damage", 100);
        set_temp("apply/unarmed_damage", 100);
        set_temp("apply/armor", 200);

        setup();
/*
        if (clonep())
        {
                ob = find_object(BAGUADAO);
                if (! ob) ob = load_object(BAGUADAO);
                if (! environment(ob))
                {
                        ob->move(this_object());
                        ob->wield();
                } else
                {
                        ob = new("/clone/weapon/gangdao");
                        ob->move(this_object());
                        ob->wield();
                }
        }
*/
        carry_object("/clone/misc/cloth")->wear();
        set_temp("handing", carry_object("/d/beijing/npc/obj/jinbiao"));
}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        if (ob->name(1) == "商剑鸣")
        {
                command("say 他奶奶的，怎么你也取这个名字？");
                return;
        }

        if (ob->name(1) == "商老太")
        {
                command("say 我操！你取这个名字是什么意思？");
                return;
        }

        if (ob->name(1) == "商宝震")
        {
                command("say 你给俺换起一个别的名字不行？");
                return;
        }

        if (ob->query("combat_exp") < 300000)
        {
                command("say 你现在江湖经验太浅，还是先让你娘教你吧。");
                return;
        }

        if ((int)ob->query("shen") > -30000)
        {
                command("sneer");
                command("say 你倒是学起假仁假义来了。");
                return;
        }

        if (ob->query_skill("shangjia-neigong", 1) < 100)
        {
                command("hmm");
                command("say 你连本门最基本的内功都没修好，怎么学习上乘武学。");
                return;
        }

        command("nod2");
        command("say 念在你如此有心，今日我便收你为徒。");
        command("say 日后俺这商家堡的立威扬名，就全靠你了。");
        command("recruit " + ob->query("id"));

        if ((string)ob->query("class") != "fighter")
                ob->set("class", "fighter");
        return;
}

mixed ask_skill1()
{
        object me;

        me = this_player();

        if (me->query("can_perform/wai-bagua/zhen"))
                return "自己下去练，罗嗦什么！";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "与我商家堡素无来往，何出此言？";

        if (me->query_skill("wai-bagua", 1) < 1)
                return "你连外八卦都没学，谈什么绝招？";

        if (me->query("gongxian") < 100)
                return "你在我商家堡内碌碌无为，这一招我暂时还不能传你。";

        if (me->query("shen") > -5000)
                return "哼！你这样的心慈手软之徒，就算学了这招又有何用？";

        if (me->query_skill("force") < 100)
                return "你的内功火候尚需提高，练好了再来找我吧。";

        if (me->query_skill("wai-bagua", 1) < 60)
                return "你的外八卦还练得不到家，自己下去练练再来吧！";

        message_vision(HIY "$n" HIY "微微一笑，当下也不答话，只是伸出右手，轻轻放"
                       "在\n$N" HIY "胸口。正当$N" HIY "疑惑间，却见$n" HIY "掌劲"
                       "轻吐，$N" HIY "顿时全身\n一震，如遭电击，各处经脉无不酸麻"
                       "，不禁大惊失色。\n" NOR, me, this_object());

        command("say 明白了么？");
        tell_object(me, HIC "你学会了「八卦震」。\n" NOR);

        if (me->can_improve_skill("parry"))
                me->improve_skill("parry", 1500000);
        if (me->can_improve_skill("wai-bagua"))
                me->improve_skill("wai-bagua", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/wai-bagua/zhen", 1);
        me->add("gongxian", -100);

        return 1;
}

mixed ask_skill2()
{
        object me;

        me = this_player();

        if (me->query("can_perform/baisheng-quan/kai"))
                return "自己下去练，罗嗦什么！";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "与我商家堡素无来往，何出此言？";

        if (me->query_skill("baisheng-quan", 1) < 1)
                return "你连百胜神拳都没学，谈什么绝招？";

        if (me->query("gongxian") < 300)
                return "你在我商家堡内碌碌无为，这一招我暂时还不能传你。";

        if (me->query("shen") > -20000)
                return "哼！你这样的心慈手软之徒，就算学了这招又有何用？";

        if (me->query_skill("force") < 140)
                return "你的内功火候尚需提高，练好了再来找我吧。";

        if (me->query_skill("baisheng-quan", 1) < 100)
                return "你的百胜神拳还练得不到家，自己下去练练再来吧！";

        message_vision(HIY "$n" HIY "对$N" HIY "点了点头，沉声道：“看好了！”随即"
                       "便拉开架\n势，演示拳招。霎时只见$n" HIY "身子蓦的横移，向左"
                       "转成为\n弓箭步，两臂向后成钩手，“呼”的一声倒挥出来，平举"
                       "反\n击向$N" HIY "而去，招数甚为精妙。\n" NOR, me,
                       this_object());

        command("sneer");
        command("say 马老儿能够创出这招，也算得上个人物。");
        command("say 这招并不复杂，稍加练习变成。");
        tell_object(me, HIC "你学会了「混沌初开」。\n" NOR);

        if (me->can_improve_skill("cuff"))
                me->improve_skill("cuff", 1500000);
        if (me->can_improve_skill("baisheng-quan"))
                me->improve_skill("baisheng-quan", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/baisheng-quan/kai", 1);
        me->add("gongxian", -300);

        return 1;
}

mixed ask_skill3()
{
        object me;

        me = this_player();

        if (me->query("can_perform/jinbiao-jue/huan"))
                return "自己下去练，罗嗦什么！";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "与我商家堡素无来往，何出此言？";

        if (me->query_skill("jinbiao-jue", 1) < 1)
                return "你连金镖诀都没学，谈什么绝招？";

        if (me->query("gongxian") < 300)
                return "你在我商家堡内碌碌无为，这一招我暂时还不能传你。";

        if (me->query("shen") > -15000)
                return "哼！你这样的心慈手软之徒，就算学了这招又有何用？";

        if (me->query_skill("force") < 140)
                return "你的内功火候尚需提高，练好了再来找我吧。";

        if (me->query_skill("jinbiao-jue", 1) < 100)
                return "你的金镖诀还练得不到家，自己下去练练再来吧！";

        message_vision(HIY "$n" HIY "将$N" HIY "招至跟前，轻声在耳旁秘密说了些"
                       "什么。随后又\n伸出右手，十指箕张，一伸一缩，煞是巧妙。"
                       "看样子是一种\n很特别的暗器法门。\n" NOR, me,
                       this_object());

        command("nod");
        command("say 刚才我所说的你可都记牢了？剩下的就是靠自己多加练习。");
        tell_object(me, HIC "你学会了「金莲幻生」。\n" NOR);

        if (me->can_improve_skill("throwing"))
                me->improve_skill("throwing", 1500000);
        if (me->can_improve_skill("jinbiao-jue"))
                me->improve_skill("jinbiao-jue", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/jinbiao-jue/huan", 1);
        me->add("gongxian", -300);

        return 1;
}

mixed ask_skill4()
{
        object me;

        me = this_player();

        if (me->query("can_perform/bazhen-zhang/yin"))
                return "这招我已经教过你了，自己下去练吧。";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "与我商家堡素无来往，何出此言？";

        if (me->query_skill("bazhen-zhang", 1) < 1)
                return "你连八阵八卦掌都没学，谈什么绝招？";

        if (me->query("gongxian") < 500)
                return "你在我商家堡内碌碌无为，这一招我暂时还不能传你。";

        if (me->query("shen") > -20000)
                return "哼！你这样的心慈手软之徒，就算学了这招又有何用？";

        if (me->query_skill("force") < 180)
                return "你的内功火候尚需提高，练好了再来找我吧。";

        if (me->query_skill("bazhen-zhang", 1) < 130)
                return "你的八阵八卦掌还练得不到家，自己下去练练再来吧！";

        message_vision(HIY "$n" HIY "笑了笑，对$N" HIY "点头示意赞许，当下凝神沉"
                       "履，积聚全\n身功力于一掌，携着雷霆之势奋力向$N" HIY "面前"
                       "的一座青铜香炉\n拍落，顿时只听轰然一声闷响，香炉内的香灰"
                       "被$n" HIY "的掌\n力激荡得四处飞扬，尘烟弥漫，待得烟消云散"
                       "，$N" HIY "这才发现\n那座青铜香炉上豁然嵌着一双掌印。\n"
                       NOR, me, this_object());
        command("ke");
        command("nod");
        command("say 这八阵八卦掌绝妙非凡，可要勤加练习。");
        tell_object(me, HIC "你学会了「神卦天印」。\n" NOR);

        if (me->can_improve_skill("strike"))
                me->improve_skill("strike", 1500000);
        if (me->can_improve_skill("bazhen-zhang"))
                me->improve_skill("bazhen-zhang", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/bazhen-zhang/yin", 1);
        me->add("gongxian", -500);

        return 1;
}

mixed ask_skill5()
{
        object me;

        me = this_player();

        if (me->query("can_perform/shangjia-dao/juan"))
                return "我不是已经教会你了吗？";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "与我商家堡素无来往，何出此言？";

        if (me->query_skill("shangjia-dao", 1) < 1)
                return "你连商家刀法都没学，谈什么绝招？";

        if (me->query("gongxian") < 80)
                return "你在我商家堡内碌碌无为，这一招我暂时还不能传你。";

        if (me->query("shen") > -1000)
                return "哼！你这样的心慈手软之徒，就算学了这招又有何用？";

        if (me->query_skill("shangjia-dao", 1) < 50)
                return "你的商家刀法还练得不到家，自己下去练练再来吧！";

        if (me->query_skill("force") < 80)
                return "嗯，你的内功火候尚需提高，练好了再来找我吧。";

        message_vision(HIY "$n" HIY "笑了笑，伸手将$N" HIY "招到身前，低声在$N" HIY
                       "耳旁嘀咕了半\n天。然后又拔出腰刀翻转数下，斜撩而出。似乎是"
                       "一种颇为\n独特的刀诀。\n" NOR, me, this_object());
        command("nod");
        command("say 这招很简单，稍加练习便行。");
        tell_object(me, HIC "你学会了「寒芒暴卷」。\n" NOR);

        if (me->can_improve_skill("blade"))
                me->improve_skill("blade", 1500000);
        if (me->can_improve_skill("shangjia-dao"))
                me->improve_skill("shangjia-dao", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/shangjia-dao/juan", 1);
        me->add("gongxian", -80);

        return 1;
}

mixed ask_skill6()
{
        object me;

        me = this_player();

        if (me->query("can_perform/bagua-dao/mang"))
                return "我不是已经教会你了吗？";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "与我商家堡素无来往，何出此言？";

        if (me->query_skill("bagua-dao", 1) < 1)
                return "你连八卦刀法都没学，谈什么绝招？";

        if (me->query_skill("wai-bagua", 1) < 1)
                return "你连外八卦神功都没学，谈什么绝招？";

        if (me->query("gongxian") < 1000)
                return "你在我商家堡内碌碌无为，这一招我暂时还不能传你。";

        if (me->query("shen") > -50000)
                return "哼！你这样的心慈手软之徒，就算学了这招又有何用？";

        if (me->query_skill("bagua-dao", 1) < 140)
                return "你的八卦刀法还练得不到家，自己下去练练再来吧！";

        if (me->query_skill("wai-bagua", 1) < 140)
                return "你的外八卦神功还练得不到家，自己下去练练再来吧！";

        if (me->query_skill("force") < 200)
                return "嗯，你的内功火候尚需提高，练好了再来找我吧。";

        message_vision(HIY "$n" HIY "哈哈一笑，在$N" HIY "耳旁轻声嘀咕了几句，"
                       "随即又伸手作\n刀，按照八卦四方之位比划演示。$N" HIY "在"
                       "一旁沉默不语，直到\n演示结束，突然眼睛一亮，似乎在武学"
                       "上又有了新的突破。\n" NOR,
                       me, this_object());
        command("smile");
        command("say 这便是刀芒的要诀，你自己下来勤加练习吧。");
        tell_object(me, HIC "你学会了「劈天神芒」。\n" NOR);

        if (me->can_improve_skill("blade"))
                me->improve_skill("blade", 1500000);
        if (me->can_improve_skill("bagua-dao"))
                me->improve_skill("bagua-dao", 1500000);
        if (me->can_improve_skill("parry"))
                me->improve_skill("parry", 1500000);
        if (me->can_improve_skill("wai-bagua"))
                me->improve_skill("wai-bagua", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/bagua-dao/mang", 1);
        me->add("gongxian", -1000);

        return 1;
}

mixed ask_skill7()
{
        object me;

        me = this_player();

        if (me->query("can_perform/bagua-dao/sha"))
                return "唉…你自己下去练吧。";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "与我商家堡素无来往，何出此言？";

        if (me->query_skill("bagua-dao", 1) < 1)
                return "你连八卦刀法都没学，谈什么绝招？";

        if (me->query("gongxian") < 1800)
                return "你在我商家堡内碌碌无为，这一招我暂时还不能传你。";

        if (me->query("shen") > -80000)
                return "哼！你这样的心慈手软之徒，就算学了这招又有何用？";

        if (me->query_skill("bagua-dao", 1) < 180)
                return "你的八卦刀法还练得不到家，自己下去练练再来吧！";

        if (me->query_skill("force") < 250)
                return "嗯，你的内功火候尚需提高，练好了再来找我吧。";

        message_vision(HIY "$n" HIY "凝神了$N" HIY "半天，长叹一声，说道：“这一"
                       "招「杀龙无\n悔」本是我创来对付苗人凤所用，但既然你的刀法"
                       "已达此境\n界，今日我就传你这招。”说完，便伸手将$N" HIY
                       "招至身旁，低\n声在$P" HIY "耳畔细说良久。\n" NOR, me,
                       this_object());
        command("sigh");
        command("say 这一招的诀窍就是义无返顾，奋力一击。");
        command("say 要诀我都教你了，自己下去练吧。");
        tell_object(me, HIC "你学会了「杀龙无悔」。\n" NOR);

        if (me->can_improve_skill("blade"))
                me->improve_skill("blade", 1500000);
        if (me->can_improve_skill("blade"))
                me->improve_skill("blade", 1500000);
        if (me->can_improve_skill("blade"))
                me->improve_skill("blade", 1500000);
        if (me->can_improve_skill("bagua-dao"))
                me->improve_skill("bagua-dao", 1500000);
        if (me->can_improve_skill("bagua-dao"))
                me->improve_skill("bagua-dao", 1500000);
        if (me->can_improve_skill("bagua-dao"))
                me->improve_skill("bagua-dao", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/bagua-dao/sha", 1);
        me->add("gongxian", -1800);

        return 1;
}

mixed ask_dao()
{
        object me;
        object ob;
        object owner;

        me = this_player();
        if (me->is_good())
        {
                if (me->query("family/family_name") == "商家堡")
                        message_vision(CYN "$N" CYN "冷哼一声，对$n" CYN "道："
                                       "“你身为我的弟子，反而学起假仁假义来了"
                                       "，居然还有脸问我要宝刀？”\n" NOR,
                                       this_object(), me);
                else
                        message_vision(CYN "$N" CYN "冷笑一声，对$n" CYN "说道"
                                       "：“什么东西，居然敢在我面前放肆！”\n"
                                       NOR, this_object(), me);
                return 1;
        }

        if (me->query("family/family_name") != "商家堡")
                return "哪里来的野种，居然敢窥视我的宝刀？";

        if (me->query("family/master_id") != query("id"))
                return "只有我的弟子才配用这八卦刀，你别拿去丢脸。";

        if (me->query("shen") > -50000)
                return "像你这样的心慈手软之辈，这刀你不用也罢。";

        if (me->query_skill("bagua-dao", 1) < 150)
                return "你连八卦刀法都没学好，就算宝刀在手也是白搭。";

        ob = find_object(BAGUADAO);
        if (! ob) ob = load_object(BAGUADAO);
        owner = environment(ob);
        while (owner)
        {
                if (owner->is_character() || ! environment(owner))
                        break;
                owner = environment(owner);
        }

        if (owner == me)
                return "嗯？我的八卦刀现在不是你拿着在用吗？";

        if (objectp(owner) && owner != this_object())
        {
                if (! owner->is_character())
                        return "你来晚了一步，我的八卦刀现在不在我手中。";

                if (owner->query("family/family_name") == "商家堡")
                        return "紫金八卦刀现在是你兄弟" + owner->query("name") +
                               "在用，你要用就去找他吧。";
                else
                        return "我的紫金八卦刀现在落在" + owner->query("name") +
                               "手中，你去把它抢回来吧！";
        }

        ob->move(this_object());

        ob = new("/clone/weapon/gangdao");
        ob->move(this_object());
        ob->wield();

        message_vision(CYN "$N" CYN "冷笑一声，道：“我这柄紫金八卦刀"
                       "你就拿去，在江湖上多扬扬商家堡的威风！”\n" NOR,
                       this_object(), me);
        command("give bagua dao to " + me->query("id"));
        return 1;
}

mixed give_letter()
{
        object me;


        me = this_player();

        if (me->query("can_perform/bagua-dao/tian"))
                return "你不是已经会了吗？";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "与我商家堡素无来往，何出此言？";

        if (me->query_skill("bagua-dao", 1) < 1)
                return "你连八卦刀法都没学，谈什么绝招？";

        if (me->query_skill("wai-bagua", 1) < 1)
                return "你连外八卦神功都没学，谈什么绝招？";

        if (me->query_skill("nei-bagua", 1) < 1)
                return "你连内八卦神功都没学，谈什么绝招？";

        if (me->query("gongxian") < 2200)
                return "你在镖局内碌碌无为，这一招我暂时还不能传你。";

        if (me->query_skill("bagua-dao", 1) < 200)
                return "你的八卦刀法还练得不到家，自己下去练练再来吧！";

        if (me->query_skill("wai-bagua", 1) < 200)
                return "你的外八卦神功还练得不到家，自己下去练练再来吧！";

        if (me->query_skill("nei-bagua", 1) < 200)
                return "你的内八卦神功还练得不到家，自己下去练练再来吧！";

        if ((int)me->query("max_neili") < 3200)
                return "你的内力修为不足，施展不出这招，等你内力有所攀升后再来找我吧。";

        if (present("sjm letter", me))
                return "快到镇远镖局找我师傅去吧！";

        command("nod");
        command("say 嗯，看你在武学方面还有所造诣，而且多年来对商家堡做出了不少贡献…");
        command("haha");
        command("say 现在我就修书一封，你送到镇远镖局总镖头王维扬处，他自会传你绝技！");

        "/clone/special/sjmletter"->move(me);
        write(HIC "你得到一封书信！\n" NOR);
        me->add("gongxian", -2200);
        return "快去镇远镖局找我师傅吧！";

}

void unconcious()
{
        die();
}
