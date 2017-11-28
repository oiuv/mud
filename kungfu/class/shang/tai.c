#include <ansi.h>
#include "shang.h"

inherit NPC;
inherit F_MASTER;

mixed ask_skill1();
mixed ask_skill2();
mixed ask_skill3();
mixed ask_skill4();

mixed  try_to_learn_waibagua();

void create()
{
        set_name("商老太", ({"shang laotai", "shang", "laotai"}));
        set("gender", "女性");
        set("title", "商家堡堡主夫人");
        set("age", 41);
        set("long", @LONG
这是一位身材高大的妇人，表情严肃，令人起
敬。她便是「八卦刀」商剑鸣的夫人，她少女
时便跟随丈夫走南闯北，不愧为女中豪杰。
LONG);
        set("attitude", "peaceful");
        set("shen_type", -1);
        set("str", 45);
        set("int", 30);
        set("con", 30);
        set("dex", 30);

        set("qi", 3600);
        set("max_qi", 3600);
        set("jing", 2800);
        set("max_jing", 2800);
        set("neili", 4000);
        set("max_neili", 4000);
        set("jiali", 160);
        set("combat_exp", 2500000);
        set("score", 10000);

        set_skill("force", 160);
        set_skill("shangjia-neigong", 160);
        set_skill("parry", 160);
        set_skill("wai-bagua", 160);
        set_skill("dodge", 160);
        set_skill("bagua-bu", 160);
        set_skill("unarmed", 140);
        set_skill("tan-tui", 140);
        set_skill("strike", 160);
        set_skill("bagua-zhang", 160);
        set_skill("cuff", 160);
        set_skill("bagua-quan", 160);
        set_skill("sword", 140);
        set_skill("quemen-jian", 140);
        set_skill("blade", 180);
        set_skill("bagua-dao", 180);
        set_skill("shangjia-dao", 160);
        set_skill("throwing", 160);
        set_skill("jinbiao-jue", 160);
        set_skill("literate", 200);
        set_skill("martial-cognize", 160);

        map_skill("unarmed", "tan-tui");
        map_skill("dodge", "bagua-bu");
        map_skill("force", "shangjia-neigong");
        map_skill("strike", "bagua-zhang");
        map_skill("sword", "quemen-jian");
        map_skill("blade", "bagua-dao");
        map_skill("cuff", "bagua-quan");
        map_skill("parry", "wai-bagua");
        map_skill("throwing", "jinbiao-jue");

        prepare_skill("cuff", "bagua-quan");
        prepare_skill("strike", "bagua-zhang");

        set("no_teach", ([
                "bagua-dao" : "八卦刀需由我夫君亲自传授。",
                "wai-bagua" : (: try_to_learn_waibagua :),
        ]));

        set("class", "fighter");

        create_family("商家堡", 3, "堡主夫人");

        set("inquiry", ([
                "劈卦拳"     : (: ask_skill1 :),
                "背心钉"     : (: ask_skill2 :),
                "犀牛望月"   : (: ask_skill3 :),
                "天残剑诀"   : (: ask_skill4 :),
        ]));

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "blade.mang" :),
                (: perform_action, "strike.ding" :),
                (: perform_action, "cuff.gua" :),
                (: perform_action, "parry.zhen" :),
                (: perform_action, "throwing.huan" :),
                (: exert_function, "recover" :),
        }) );
        setup();

        carry_object("/clone/weapon/gangdao")->wield();
        carry_object("/clone/misc/cloth")->wear();
        set_temp("handing", carry_object("/d/beijing/npc/obj/jinbiao"));
}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        if (ob->name(1) == "商剑鸣")
        {
                command("say 你取我丈夫的名字做甚？");
                return;
        }

        if (ob->name(1) == "商老太")
        {
                command("say 你取这个名字是什么意思？");
                return;
        }

        if (ob->name(1) == "商宝震")
        {
                command("say 你给俺换起一个别的名字不行？");
                return;
        }

        if (ob->query("family/master_name") == "商剑鸣")
        {
                command("say 既然你已经跟随我夫君学艺，就应努力上进，干嘛又来找我？");
                return;
        }

        command("say 今日我便代夫君收你为徒，望你日后在我商家堡有所作为。");
        command("recruit " + ob->query("id"));

        if ((string)ob->query("class") != "fighter")
                ob->set("class", "fighter");
        return;
}

mixed try_to_learn_waibagua()
{
        object ob = this_player();

        if (ob->query("can_learn/shanglaotai/wai-bagua"))
                return 0;

        if (ob->query("combat_exp") > 100000)
        {
                command("say 看来你武功已有了一定火候，我就替夫君传你外八卦神功。");
                ob->set("can_learn/shanglaotai/wai-bagua", 1);
                return 0;
        }

        return "你此时功力太浅，还是先学一些入门功夫吧。";
}

mixed ask_skill1()
{
        object me;

        me = this_player();

        if (me->query("can_perform/bagua-quan/gua"))
                return "这招我已经教过你了，自己下去练吧。";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "与我商家堡素无来往，何出此言？";

        if (me->query_skill("bagua-quan", 1) < 1)
                return "你连八卦拳法都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 100)
                return "你在我商家堡内碌碌无为，这一招我暂时还不能传你。";

        if (me->query("shen") > -10000)
                return "哼！你这样的心慈手软之徒，就算学了这招又有何用？";

        if (me->query_skill("force") < 100)
                return "你的内功火候尚需提高，练好了再来找我吧。";

        if (me->query_skill("bagua-quan", 1) < 70)
                return "你的八卦拳法还练得不到家，自己下去练练再来吧！";

        message_vision(HIY "$n" HIY "对$N" HIY "点了点头，说道：“我给你演示一遍"
                       "，可要瞧清\n楚了。”$n" HIY "话音刚落，突然身体一侧，双掌"
                       "顿时向下沉\n去，接着却又向上一翻，朝着$N" HIY "的双肩斜斜"
                       "地劈去，招数甚\n为精妙，顿时将$N" HIY "攻了个措手不及。\n"
                       NOR, me, this_object());

        command("heng");
        command("say 你看明白了多少？");
        tell_object(me, HIC "你学会了「劈卦拳」。\n" NOR);

        if (me->can_improve_skill("cuff"))
                me->improve_skill("cuff", 1500000);
        if (me->can_improve_skill("bagua-quan"))
                me->improve_skill("bagua-quan", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/bagua-quan/gua", 1);
        me->add("gongxian", -100);

        return 1;
}

mixed ask_skill2()
{
        object me;

        me = this_player();

        if (me->query("can_perform/bagua-zhang/ding"))
                return "这招我已经教过你了，自己下去练吧。";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "与我商家堡素无来往，何出此言？";

        if (me->query_skill("bagua-zhang", 1) < 1)
                return "你连八卦掌法都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 150)
                return "你在我商家堡内碌碌无为，这一招我暂时还不能传你。";

        if (me->query("shen") > -20000)
                return "哼！你这样的心慈手软之徒，就算学了这招又有何用？";

        if (me->query_skill("force") < 120)
                return "你的内功火候尚需提高，练好了再来找我吧。";

        if (me->query_skill("bagua-zhang", 1) < 80)
                return "你的八卦掌法还练得不到家，自己下去练练再来吧！";

        message_vision(HIY "$n" HIY "眉头微微一皱，上下打量了$N" HIY "一翻，这才伸"
                       "手将$N" HIY "招\n至身旁，在耳边轻声讲解了半天，时不时还探出"
                       "右手比划几\n下招式，$N" HIY "听后冷笑一声，似乎有所领悟。\n"
                       NOR, me, this_object());

        command("nod");
        command("say 这招可以攻敌不备，你自己下去练吧。");
        tell_object(me, HIC "你学会了「背心钉」。\n" NOR);
        if (me->can_improve_skill("strike"))
                me->improve_skill("strike", 1500000);
        if (me->can_improve_skill("bagua-zhang"))
                me->improve_skill("bagua-zhang", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/bagua-zhang/ding", 1);
        me->add("gongxian", -150);

        return 1;
}

mixed ask_skill3()
{
        object me;

        me = this_player();

        if (me->query("can_perform/tan-tui/wang"))
                return "自己下去练，罗嗦什么！";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "与我商家堡素无来往，何出此言？";

        if (me->query_skill("tan-tui", 1) < 1)
                return "你连十二路潭腿都没学，谈什么绝招？";

        if (me->query("gongxian") < 350)
                return "你在我商家堡内碌碌无为，这一招我暂时还不能传你。";

        if (me->query("shen") > -25000)
                return "哼！你这样的心慈手软之徒，就算学了这招又有何用？";

        if (me->query_skill("force") < 150)
                return "你的内功火候尚需提高，练好了再来找我吧。";

        if (me->query_skill("tan-tui", 1) < 120)
                return "你的十二路潭腿还练得不到家，自己下去练练再来吧！";

        message_vision(HIY "$n" HIY "哼了一声，沉声道：“潭腿本身威力并不强，但却被"
                       "\n喻为武林四大家之一，倒也有它的独到之处。”说完便随即\n起身"
                       "而立，左腿连变数中方位，“砰”的一声陡然踢出，顿\n时将$N" HIY
                       "面前的那张木几踢得粉碎。\n" NOR, me, this_object());

        command("say 明白了么？");
        tell_object(me, HIC "你学会了「犀牛望月转回还」。\n" NOR);

        if (me->can_improve_skill("unarmed"))
                me->improve_skill("unarmed", 1500000);
        if (me->can_improve_skill("tan-tui"))
                me->improve_skill("tan-tui", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/tan-tui/wang", 1);
        me->add("gongxian", -350);

        return 1;
}

mixed ask_skill4()
{
        object me;

        me = this_player();

        if (me->query("can_perform/quemen-jian/can"))
                return "自己下去练，罗嗦什么！";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "与我商家堡素无来往，何出此言？";

        if (me->query_skill("quemen-jian", 1) < 1)
                return "你连缺门剑法都没学，谈什么绝招？";

        if (me->query("gongxian") < 60)
                return "你在我商家堡内碌碌无为，这一招我暂时还不能传你。";

        if (me->query("shen") > -5000)
                return "哼！你这样的心慈手软之徒，就算学了这招又有何用？";

        if (me->query_skill("force") < 120)
                return "你的内功火候尚需提高，练好了再来找我吧。";

        if (me->query_skill("quemen-jian", 1) < 80)
                return "你的缺门剑法还练得不到家，自己下去练练再来吧！";

        message_vision(HIY "$n" HIY "冷笑一声，也不答话，当即从$N" HIY "手中接过长"
                       "剑，慢慢\n的演示剑招，$N" HIY "见招式轻盈灵动，变幻无方，甚"
                       "为奇异。实\n乃前所谓闻，顿时大有所悟。\n" NOR, me,
                       this_object());

        command("say 这招乃是以奇制胜，我演示的你可都记清了？");
        tell_object(me, HIC "你学会了「天残剑诀」。\n" NOR);

        if (me->can_improve_skill("sword"))
                me->improve_skill("sword", 1500000);
        if (me->can_improve_skill("quemen-jian"))
                me->improve_skill("quemen-jian", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/quemen-jian/can", 1);
        me->add("gongxian", -60);

        return 1;
}
