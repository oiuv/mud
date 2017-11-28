#include <ansi.h>
#include "quanzhen.h"

inherit NPC;
inherit F_MASTER;

#define ZHENJING    "/clone/lonely/book/zhenjing1"

mixed ask_skill1();
mixed ask_skill2();

void create()
{
        object ob;
        set_name("周伯通", ({ "zhou botong", "zhou", "botong" }));
        set("gender", "男性");
        set("nickname", HIY "老顽童" NOR);
        set("title", "全真教高手");
        set("long", @LONG
他看上去须眉皆白，一副得道模样，然而眼神
却透露出一股狡黠。
LONG);
        set("age", 72);
        set("class", "taoist");
        set("attitude", "peaceful");
        set("shen_type", 1);
        set("str", 33);
        set("int", 35);
        set("con", 38);
        set("dex", 33);

        set("max_qi", 47000);
        set("max_jing", 36000);
        set("neili", 20000);
        set("max_neili", 20000);
        set("jingli", 36000);
        set("max_jingli", 36000);
        set("jiali", 450);
        set("combat_exp", 9000000);
        set("score", 900000);

        set_skill("force", 390);
        set_skill("quanzhen-xinfa", 390);
        set_skill("xuanmen-neigong", 390);
        set_skill("xiantian-gong", 390);
        set_skill("yijin-duangu", 390);      // 易筋锻骨
        set_skill("unarmed", 390);
        set_skill("dodge", 390);
        set_skill("tianshan-feidu", 390);
        set_skill("jinyan-gong", 390);
        set_skill("shexing-lifan", 390);     // 蛇行狸翻
        set_skill("parry", 390);
        set_skill("jinguan-yusuo", 390);
        set_skill("unarmed", 390);
        set_skill("kongming-quan", 390);
        set_skill("strike", 390);
        set_skill("chongyang-shenzhang", 390);
        set_skill("haotian-zhang", 390);
        set_skill("finger", 390);
        set_skill("zhongnan-zhi", 390);
        set_skill("hand", 390);
        set_skill("qixing-shou", 390);
        set_skill("sword", 390);
        set_skill("qixing-jian", 390);
        set_skill("quanzhen-jian", 390);
        set_skill("whip", 390);
        set_skill("tiangang-chenfa", 390);
        set_skill("zuoyou-hubo", 400);
        set_skill("taoism", 200);
        set_skill("literate", 100);
        set_skill("martial-cognize", 340);

        map_skill("force", "yijin-duangu");
        map_skill("sword", "quanzhen-jian");
        map_skill("whip", "tiangang-chenfa");
        map_skill("dodge", "shexing-lifan");
        map_skill("parry", "jinguan-yusuo");
        map_skill("unarmed", "kongming-quan");
        map_skill("finger", "zhongnan-zhi");
        map_skill("strike", "haotian-zhang");
        map_skill("hand", "qixing-shou");

        prepare_skill("unarmed", "kongming-quan");

        set("no_teach/xiantian-gong", "这个我也没弄清楚，你还是去找我师兄学吧。");
        set("no_teach/yijin-duangu",  "这玩意我还正在想法忘记，不能教你。");
        set("no_teach/shexing-lifan", "这玩意我还正在想法忘记，不能教你。");

        create_family("全真教", 1, "高手");

        set("inquiry", ([
                "全真教"   : "我全真教是天下道家玄门正宗。",
                "九阴真经" : "你打听这个做什么？",
                "段皇爷"   : "段……段皇爷？人家是皇爷，我不认识！",
                "瑛姑"     : "这个…嗯…你…刚才你说啥来着？",
                "刘瑛"     : "嗯…这个…嗯…嗯？",
                "空明若玄" : (: ask_skill1 :),
                "空空如也" : (: ask_skill2 :),
        ]));

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: command("perform unarmed.ruo and unarmed.kong") :),
                (: command("perform parry.suo and unarmed.kong") :),
                (: command("perform unarmed.kong twice") :),
                (: perform_action, "dodge.guiyuan" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),
        }));

        set_temp("apply/damage", 200);
        set_temp("apply/unarmed_damage", 200);
        set_temp("apply/armor", 600);

        setup();

        if (clonep())
        {
                ob = find_object(ZHENJING);
                if (! ob) ob = load_object(ZHENJING);

                if (! environment(ob))
                        ob->move(this_object());
        }
                
        carry_object("/clone/cloth/cloth")->wear();
}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        if (ob->query("combat_exp") < 400000)
        {
                command("say 你经验这么差，还是去找我那几个师侄教你吧。");
                return;
        }

        if ((int)ob->query("shen") < 50000)
        {
                command("say 你这人品行不好，跟你一起肯定做不了什么好事。");
                return;
        }

        command("smile");
        command("say 反正最近也没啥事干，就收下你玩玩吧。");
        command("recruit " + ob->query("id"));
}

int recognize_apprentice(object ob, string skill)
{
        if (! ob->query("can_learn/zuoyou-hubo/zhou"))
        {
                message_vision(CYN "$N" CYN "做了个鬼脸，对$n" CYN "说"
                               "道：我又不是你师父，为啥要教你？\n" NOR,
                               this_object(), ob);
                return -1;
        }

        if (skill != "zuoyou-hubo")
        {
                command("say 你的武功比我还好，你教我还差不多。");
                return -1;
        }

        return 1;
}

mixed ask_skill1()
{
        object me;

        me = this_player();

        if (me->query("can_perform/kongming-quan/ruo"))
                return "还问这个干嘛？不如来陪我玩玩。";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你是谁，我怎么不认识你？";

        if (me->query_skill("kongming-quan", 1) < 1)
                return "嘿嘿，你连我的空明拳都没学，又怎么学绝招？";

        if (me->query("gongxian") < 200)
                return "你投入我全真教，却不努力做事，我为什么要教你？";

        if (me->query("shen") < 50000)
                return "你这人心地还不够好，暂时我还不能教你。";

        if (me->query_skill("kongming-quan", 1) < 100)
                return "你的空明拳还练得不够好，下次再说吧。";

        if (me->query("max_neili") < 1000)
                return "你的内力差成这样，真不知道你是怎么练功的。";

        message_sort(HIY "\n$n" HIY "抓了抓头，满不情愿的嘀咕了两句，这"
                     "才说道：“小子，我把口诀说给你听，然后你就自己下去"
                     "练，别再来烦我了。”说完便一把将$N" HIY "楸到身边"
                     "，在$N" HIY "耳旁唧唧咕咕说了半天。\n\n" NOR, me,
                     this_object()); 

        command("bite");
        command("say 好了，好了，你快走吧。");
        tell_object(me, HIC "你学会了「空明若玄」。\n" NOR);
        if (me->can_improve_skill("unarmed"))
                me->improve_skill("unarmed", 1500000);
        if (me->can_improve_skill("kongming-quan"))
                me->improve_skill("kongming-quan", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/kongming-quan/ruo", 1);
        me->add("gongxian", -200);

        return 1;
}

mixed ask_skill2()
{
        object me;

        me = this_player();

        if (me->query("can_perform/kongming-quan/kong"))
                return "快滚，快滚。";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你是谁，我怎么不认识你？";

        if (me->query_skill("kongming-quan", 1) < 1)
                return "嘿嘿，你连我的空明拳都没学，又怎么学绝招？";

        if (me->query("gongxian") < 500)
                return "你投入我全真教，却不努力做事，我为什么要教你？";

        if (me->query("shen") < 60000)
                return "你这人心地还不够好，暂时我还不能教你。";

        if (me->query_skill("kongming-quan", 1) < 150)
                return "你的空明拳还练得不够好，下次再说吧。";

        if (me->query("max_neili") < 2000)
                return "你的内力差成这样，真不知道你是怎么练功的。";

        message_sort(HIY "\n$n" HIY "双目一瞪，对$N" HIY "说道：“你怎么"
                     "这么烦，没看见我正在玩吗？”接着$n" HIY "摇了摇头，"
                     "又道：“真是后悔当初收了你，看好了！”说话间右手一"
                     "陡，轻飘飘挥出一拳，拳劲虚实难测，周围登时被激得尘"
                     "土飞扬。\n\n" NOR, me, this_object()); 

        command("angry");
        command("say 快走，快走，以后别再来烦我了。");
        tell_object(me, HIC "你学会了「空空如也」。\n" NOR);
        if (me->can_improve_skill("unarmed"))
                me->improve_skill("unarmed", 1500000);
        if (me->can_improve_skill("kongming-quan"))
                me->improve_skill("kongming-quan", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/kongming-quan/kong", 1);
        me->add("gongxian", -500);

        return 1;
}

int accept_fight(object ob)
{
        if (is_fighting())
        {
                message_vision(CYN "$N" CYN "对$n" CYN "叫道：你先别急"
                               "，我打完这架就来领教你的。\n" NOR,
                               this_object(), ob);
                return -1;
        }

        if (ob->query("combat_exp") < 500000)
        {
                message_vision(CYN "$N" CYN "嘻嘻一笑，对$n" CYN "道："
                               "你还是先把功夫练好了再说吧。\n" NOR,
                               this_object(), ob);
                return -1;
        }

        if (query("qi") < 5000 ||
            query("jing") < 3000 ||
            query("neili") < 6000)
        {
                message_vision(CYN "$N" CYN "摇摇头对$n" CYN "道：我现"
                               "在太累了，待我歇会儿再说吧。\n" NOR,
                               this_object(), ob);
                return -1;
        }

        if (ob->query("can_learn/zuoyou-hubo/zhou"))
        {
                message_vision(CYN "$N" CYN "对$n" CYN "道：好，那咱们"
                               "就再玩玩。\n" NOR, this_object(), ob);
                return 1;
        }

        message_vision(HIW "$N" HIW "大喜道：好好好！我正手痒痒，咱们"
                       "来比划比划！\n" NOR, this_object(), ob);

        competition_with(ob);
        return -1;
}

void win()
{
        object ob;
        if (! objectp(ob = query_competitor()))
                return;

        message_vision(CYN "$N" CYN "看了看$n" CYN "，嘿嘿笑道：你的水"
                       "平还算是马马虎虎，要好好练功，好好练功。\n" NOR,
                       this_object(), ob);
        ::win();
}

void lost()
{
        object ob;
        int exp, pot, sc, ww;
        string msg;

        exp = 20000 + random(10000);
        pot = 2000 + random(1000);
        sc = 800 + random(300);
        ww = 800 + random(300);

        if (! objectp(ob = query_competitor()))
                return;

        message_sort(HIW "\n$N" HIW "哎呀一声，抹了抹头上的汗，喜道：这"
                     "位" + RANK_D->query_respect(ob) + HIW "，你的武功"
                     "真厉害！这样吧，我拜你为师好了。你教我点功夫，我这"
                     "里有一套可以让双手打架的小伎俩，称之为左右互搏，你"
                     "有兴趣也可以学学，以后咱们再来玩。\n" NOR,
                     this_object(), ob);

        tell_object(ob, HIC "\n周伯通同意传授你「左右互搏」。\n" NOR);
        ob->set("can_learn/zuoyou-hubo/zhou", 1);
        ob->improve_skill("martial-cognize", 1500000);

        if (ob->query("potential") > ob->query_potential_limit()) 
        	pot = 1;

        ob->add("combat_exp", exp);
        ob->improve_potential(pot);
        ob->add("score", sc);
        ob->add("weiwang", ww);

        msg = HIC "\n通过这次的历练，你获得了" +
              chinese_number(exp) + "点经验、" +
              chinese_number(pot) + "点潜能、" +
              chinese_number(sc) + "点江湖阅历及" +
              chinese_number(ww) + "点江湖威望。\n" NOR;

        tell_object(ob, sort_msg(msg));

        ::lost();
}
