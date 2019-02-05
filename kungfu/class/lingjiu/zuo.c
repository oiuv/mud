#include <ansi.h>
#include "etc.h"

inherit NPC;
inherit F_MASTER;
inherit F_QUESTER;

mixed ask_me();

void create()
{
        set_name("左子穆", ({ "zuo zimu", "zuo", "zimu"}));
        set("gender", "男性");
        set("title", "无量剑派东宗掌门");
        set("age", 54);
        set("long", @LONG
这就是无量剑派东宗掌门左子穆，只见他五十
多岁年纪，身着青衫，作儒生打扮。他腰间佩
有一柄长剑，想必剑法着实了得。
LONG );
        set("attitude", "peaceful");
        set("str", 30);
        set("int", 30);
        set("con", 30);
        set("dex", 30);

        set("qi", 3800);
        set("max_qi", 3800);
        set("jing", 2000);
        set("max_jing", 2000);
        set("neili", 4000);
        set("max_neili", 4000);
        set("jiali", 120);
        set("combat_exp", 2000000);

        set_skill("force", 180);
        set_skill("wuliang-xinfa", 180);
        set_skill("dahai-wuliang", 180);
        set_skill("dodge", 180);
        set_skill("feiyan-zoubi", 180);
        set_skill("sword", 180);
        set_skill("wuliang-jian", 180);
        set_skill("unarmed", 160);
        set_skill("liuhe-quan", 160);
        set_skill("claw", 160);
        set_skill("da-qinna", 160);
        set_skill("parry", 180);
        set_skill("martial-cognize", 160);
        set_skill("literate", 160);

        map_skill("dodge", "feiyan-zoubi");
        map_skill("force", "dahai-wuliang");
        map_skill("sword", "wuliang-jian");
        map_skill("parry", "wuliang-jian");
        map_skill("unarmed", "liuhe-quan");
        map_skill("claw", "da-qinna");

        prepare_skill("claw", "da-qinna");

        set("inquiry", ([
                "乾坤无量" : (: ask_me :),
                "虚竹子"   : "他是我们灵鹫宫新的主公，我们全部听他号令。",
                "虚竹"     : "他是我们灵鹫宫新的主公，我们全部听他号令。",
        ]));

        create_family("无量剑派", 22, "东宗掌门");

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "sword.qian" :),
                (: exert_function, "powerup" :),
                (: exert_function, "recover" :),
        }) );

        setup();
        carry_object("/clone/weapon/changjian")->wield();
        carry_object("/clone/cloth/cloth")->wear();
}

int recognize_apprentice(object ob, string skill)
{
        if (ob->query("family/family_name") != "灵鹫宫")
        {
                command("say 你我素不相识，何谈得上“指教”二字？");
                return -1;
        }

        if (ob->query("family/master_id") != "xuzhu zi")
        {
                command("en");
                command("say 这个…你还是去找你师父学好了。");
                return -1;

        }

        if (skill != "wuliang-jian" && skill != "sword")
        {
                command("say 我只传授你一些剑法方面的知识，阁下不学就算了。");
                return -1;
        }

        if (! ob->query_temp("can_learn/zuozimu"))
        {
                command("say 既然阁下是主公身旁的人，我也就恭敬不如从命了。");
                ob->set_temp("can_learn/zuozimu", 1);
        }
        return 1;
}

mixed ask_me()
{
        object me;

        me = this_player();
        if (me->query("can_perform/wuliang-jian/qian"))
                return "阁下不是已经练成这招了吗？";

        if (me->query("family/family_name") != "灵鹫宫" &&
           me->query("family/family_name") != "无量剑派")
                return "你我素不相识，不知阁下此话是什么意思？";

        if (me->query_skill("wuliang-jian", 1) < 1)
                return "阁下连无量剑法都未曾学习，何谈绝招可言？";

        if (me->query("family/family_name") == "灵鹫宫" &&
           me->query("gongxian") < 300)
                return "…这个…主公有令，不得传功给无功劳的弟子。";

        if (me->query_skill("force") < 150)
                return "你的内功火候不足，练不成这招。";

        if (me->query_skill("wuliang-jian", 1) < 100)
                return "你的无量剑法火候未到，练不成这招。";

        message_vision(HIY "$n" HIY "点了点头，拔出腰间佩带的长"
                       "剑，手臂一振，当即\n朝着$N" HIY "“唰唰"
                       "唰唰”连攻四剑，这四剑一气呵成，去势极\n"
                       "快，全然笼罩$N" HIY "的周身要穴。\n" NOR,
                       me, this_object());
        command("nod");
        command("say 这招是无量剑法的精髓，以后可要勤加练习。");
        tell_object(me, HIC "你学会了「乾坤无量」。\n" NOR);
        if (me->can_improve_skill("sword"))
                me->improve_skill("sword", 1500000);
        if (me->can_improve_skill("wuliang-jian"))
                me->improve_skill("wuliang-jian", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/wuliang-jian/qian", 1);
        if (me->query("family/family_name") == "灵鹫宫")
                me->add("gongxian", -300);
        return 1;
}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        command("nod2");
        command("say 那你以后就跟着我好了。");
        command("recruit " + ob->query("id"));
}

void unconcious()
{
        die();
}
