#include <ansi.h>
#include "meizhuang.h"

inherit NPC;
inherit F_MASTER;
inherit F_GUARDER;

mixed ask_skill1();

void create()
{
        set_name("丁坚", ({"ding jian","ding",}));
        set("long",
                "他就是隐居江湖数年的一字电剑丁坚，现在在梅庄当仆人。\n"
        );
        set("gender", "男性");
        set("nickname", HIY "一字电剑" NOR);
        set("title", "梅庄仆从");
        set("attitude", "friendly");

        set("age", 30);
        set("str", 25);
        set("int", 25);
        set("con", 25);
        set("dex", 25);
        set("max_qi", 3000);
        set("max_jing", 2700);
        set("neili", 3500);
        set("max_neili", 3500);
        set("jiali", 50);
        set("combat_exp", 500000);

        set_skill("force", 120);
        set_skill("wuzheng-xinfa", 120);
        set_skill("sword", 140);
        set_skill("jidian-jian", 140);
        set_skill("dodge", 140);
        set_skill("feiyan-zoubi", 140);
        set_skill("parry", 120);
        set_skill("strike", 120);
        set_skill("qingmang-zhang", 120);
        set_skill("literate", 100);
        set_skill("martial-cognize", 120);

        map_skill("force", "wuzheng-xinfa");
        map_skill("dodge", "feiyan-zoubi");
        map_skill("parry", "jidian-jian");
        map_skill("sword", "jidian-jian");
        map_skill("strike", "qingmang-zhang");

        prepare_skill("strike", "qingmang-zhang");

        set("coagents", ({
                ([ "startroom" : "/d/meizhuang/houting",
                   "id"        : "hei baizi" ]),
        }));

        set("guarder", ([
                "refuse_other": CYN "$N" CYN "对$n" CYN "皱眉道："
                                "给我站住，孤山梅庄岂是随便走动地"
                                "方？" NOR,
                "refuse_carry": CYN "$N" CYN "对$n" CYN "喝道：你"
                                "背上背的是什么人？" NOR,
        ]));

        create_family("梅庄", 2, "仆从");

        set("inquiry", ([
                "绝招"        : "你要问什么绝招？",
                "绝技"        : "你要问什么绝技？",
                "电光四射"    : (: ask_skill1 :),
        ]));

        set("chat_chance_combat", 100);
        set("chat_msg_combat", ({
                (: perform_action, "sword.dian" :),
                (: exert_function, "recover" :),
        }) );

        setup();
        carry_object("/d/city/npc/obj/cloth")->wear();
        carry_object("/d/city/npc/obj/changjian")->wield();
        carry_object("/d/meizhuang/obj/yaoshi");
}

void attempt_apprentice(object me)
{
        // string purename, name, new_name;

        if (! permit_recruit(me))
                return;

        if ( me->query("family/family_name") &&
             me->query("family/family_name") == "日月神教" &&
             me->query("family/master_name") == "东方不败" )
        {
                command("ah");
                command("say 原来是东方教主的弟子，兴会，兴会！");
                command("say 这件事非同小可，我做不了主，你还是去找几位庄主吧。");
                me->set("move_party/日月神教—梅庄", 1);
                return;
        }

        if ((int)me->query("shen") > 1000)
        {
                command("heng");
                command("say 我们孤山梅庄向来不问江湖事，也不结交你这样的侠义之士。");
                return;
        }

        if ((int)me->query("shen") < -1000)
        {
                command("heng");
                command("say 我们孤山梅庄向来不问江湖事，更不会结交名声不好之人。");
                return;
        }

        command("say 好吧，既然你有心练武，我就收下你。");
        command("recruit " + me->query("id"));
}

mixed ask_skill1()
{
        object me;

        me = this_player();

        if (me->query("can_perform/jidian-jian/dian"))
                return "能教的我已经都教完了。";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "和本教素无瓜葛，何出此言？";

        if (me->query_skill("jidian-jian", 1) < 1)
                return "你连疾电剑法都没学，何谈此言？";

        if (me->query("gongxian") < 50)
                return "你对本庄所作出的贡献不够，这一招我暂时还不能传你。";

        if (me->query_skill("jidian-jian", 1) < 100)
                return "你的疾电剑法还练得不到家，自己下去练练再来吧！";

        if (me->query_skill("force") < 150)
                return "你的内功火候尚不精纯，是学不会这招的。";

        message_vision(HIY "$n" HIY "点了点头，说道：这疾电剑法的电光"
                       "四射其实是慑人声势使其无所施其\n技，我这里给你"
                       "演示一遍，你可看好了。$n" HIY "说完手中长剑一"
                       "抖，将这套剑\n法施展出来，霎时之间，满室都是电"
                       "光，耀人眼目。$N" HIY "看后双目一亮，顿时\n大"
                       "有所悟。\n" NOR, me, this_object());
        command("nod");
        command("say 这招其实很简单，稍微练练便可以施展了。");
        tell_object(me, HIC "你学会了「电光四射」。\n" NOR);

        if (me->can_improve_skill("sword"))
                me->improve_skill("sword", 1500000);
        if (me->can_improve_skill("jidian-jian"))
                me->improve_skill("jidian-jian", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/jidian-jian/dian", 1);
        me->add("gongxian", -50);

        return 1;
}
