#include <ansi.h>
#include "etc.h"

inherit NPC;
inherit F_MASTER;
inherit F_QUESTER;

mixed ask_skill();
mixed ask_skill2();

void create()
{
        set_name("黎夫人", ({ "li furen", "li", "furen"}));
        set("gender", "女性");
        set("title", "南海椰花岛岛主");
        set("age", 37);
        set("long", @LONG
这便是南海椰花岛岛主黎夫人，只见她不过中
年，但头发已是班白，手持一根形状颇为奇特
的钓竿，不知究为何物。
LONG );
        set("attitude", "peaceful");
        set("str", 30);
        set("int", 30);
        set("con", 30);
        set("dex", 30);

        set("qi", 3600);
        set("max_qi", 3600);
        set("jing", 2000);
        set("max_jing", 2000);
        set("neili", 3200);
        set("max_neili", 3200);
        set("jiali", 100);
        set("combat_exp", 1400000);

        set_skill("force", 180);
        set_skill("linji-zhuang", 180);
        set_skill("dodge", 180);
        set_skill("caiyan-gong", 180);
        set_skill("hand", 180);
        set_skill("jieshou-jiushi", 180);
        set_skill("parry", 180);
        set_skill("club", 180);
        set_skill("literate", 160);
        set_skill("martial-cognize", 160);
        set_skill("mahayana", 180);

        map_skill("force", "linji-zhuang");
        map_skill("dodge", "caiyan-gong");
        map_skill("club", "caiyan-gong");
        map_skill("parry", "caiyan-gong");
        map_skill("hand", "jieshou-jiushi");

        prepare_skill("hand", "jieshou-jiushi");

        set("inquiry", ([
                "云霞幻生"   : (: ask_skill :),
                "截筋断脉"   : (: ask_skill2 :),
                "虚竹"       : "他是我们灵鹫宫新的主公，我们全部听他号令。",
                "虚竹子"     : "他是我们灵鹫宫新的主公，我们全部听他号令。",
        ]));

        create_family("椰花岛", 11, "岛主");

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "club.huan" :),
                (: exert_function, "powerup" :),
                (: exert_function, "recover" :),
        }) );

        setup();
        carry_object("/d/lingjiu/npc/obj/diaogan")->wield();
        carry_object("/d/city/npc/cloth/color-dress")->wear();
}

int recognize_apprentice(object ob, string skill)
{
        if (ob->query("family/family_name") != "灵鹫宫")
        {
                command("hmm");
                command("say 给老娘滚开。");
                return -1;
        }

        if (ob->query("family/master_id") != "xuzhu zi")
        {
                command("heng");
                command("say 找你师父去，没大没小，缺乏管教。");
                return -1;

        }

        if (skill != "caiyan-gong" && skill != "club")
        {
                command("say 我只能教你一些棍法功夫，不学就算了。");
                return -1;
        }

        if (! ob->query_temp("can_learn/lifuren"))
        {
                command("nod2");
                command("say 既然你是主公的弟子，我就教你好了。");
                ob->set_temp("can_learn/lifuren", 1);
        }
        return 1;
}

mixed ask_skill()
{
        object me;

        me = this_player();
        if (me->query("can_perform/caiyan-gong/huan"))
                return "你不是已经学会了吗？何故来消遣老娘！";

        if (me->query("family/family_name") != "灵鹫宫" &&
           me->query("family/family_name") != "椰花岛")
                return "还不给老娘滚开！";

        if (me->query_skill("caiyan-gong", 1) < 1)
                return "你采燕功都未曾练过，还谈什么绝招。";

        if (me->query("family/family_name") == "灵鹫宫" &&
           me->query("gongxian") < 500)
                return "主公有令，不得传功给无功劳的弟子。";

        if (me->query_skill("dodge") < 180)
                return "你的轻功火候未到，学不了这招。";

        if (me->query_skill("caiyan-gong", 1) < 120)
                return "你的采燕功火候还差得远，再回去练练！";

        message_vision(HIY "$n" HIY "点了点头，喝道：“看好了！”说完"
                       "单手一抖，已抽\n出背负在背上的钓竿，随即急速舞"
                       "动，顿时只见钓竿由一变\n二，由二变四，由四变八"
                       "，由八变十六……幻出无数竿影连\n连刺出，全全笼"
                       "罩$N" HIY "四周各个方位。\n" NOR, me,
                       this_object());
        command("sweat");
        command("say 这招看起来复杂，其实却并不难练习。");
        tell_object(me, HIC "你学会了「云霞幻生」。\n" NOR);
        if (me->can_improve_skill("dodge"))
                me->improve_skill("dodge", 1500000);
        if (me->can_improve_skill("club"))
                me->improve_skill("club", 1500000);
        if (me->can_improve_skill("caiyan-gong"))
                me->improve_skill("caiyan-gong", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/caiyan-gong/huan", 1);
        if (me->query("family/family_name") == "灵鹫宫")
                me->add("gongxian", -500);
        return 1;
}

mixed ask_skill2()
{
        object me;

        me = this_player();
        if (me->query("can_perform/jieshou-jiushi/jie"))
                return "这招我不是已经教过你了吗？自己下去多练吧！";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你是哪里来的？快给我滚开！";

        if (me->query_skill("jieshou-jiushi", 1) < 1)
                return "你连截手九式都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 300)
                return "哼，你在本派中碌碌无为，这一招我暂时还不能传你。";

        if (me->query("max_neili") < 850)
                return "你的内力修行太浅，尚且学不了这一招。";

        if (me->query_skill("force") < 120)
                return "你的内功修行太浅，尚且学不了这一招。";

        if (me->query_skill("jieshou-jiushi", 1) < 100)
                return "你的截手九式火候未到，尚且学不了这一招。";

        message_sort(HIY "\n$n" HIY "甚喜，对$N" HIY "点头道：“不错，不"
                     "错。你这孩子，真不亏了我平时的教诲。”说完将$N" HIY
                     "招至跟前，细说良久。\n\n" NOR, me, this_object());

        command("say 这招也是峨眉派的绝学，你可不能外传。");
        tell_object(me, HIC "你学会了「截筋断脉」。\n" NOR);

        if (me->can_improve_skill("hand"))
                me->improve_skill("hand", 1500000);
        if (me->can_improve_skill("jieshou-jiushi"))
                me->improve_skill("jieshou-jiushi", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/jieshou-jiushi/jie", 1);
        me->add("gongxian", -300);
        return 1;
}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        command("en");
        command("say 好吧，既然你想闹着玩，老娘就收下你好了！");
        command("recruit " + ob->query("id"));
}

void unconcious()
{
        die();
}
