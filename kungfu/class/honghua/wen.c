#include <ansi.h>
#include "honghua.h"

inherit NPC;
inherit F_MASTER;
inherit F_QUESTER;
inherit F_GUARDER;

mixed ask_skill1();

void create()
{
        set_name("文泰来", ({ "wen tailai", "wen","tailai" }));
        set("title", "红花会四当家");
        set("nickname", HIW "奔雷手" NOR);
        set("long", "文泰来号称“奔雷手”，十五岁起浪荡江湖，\n"
                    "手下不知击毙过多少神奸巨憝、凶徒恶霸。\n");
        set("gender", "男性");
        set("age", 34);
        set("attitude", "peaceful");
        set("shen_type", 1);
        set("per", 21);
        set("str", 30);
        set("int", 30);
        set("con", 30);
        set("dex", 30);

        set("qi", 4000);
        set("max_qi", 4000);
        set("jing", 3000);
        set("max_jing", 3000);
        set("neili", 5000);
        set("max_neili", 5000);
        set("jiali", 150);
        set("combat_exp", 1500000);
        set("score", 10000);

        set_skill("force", 200);
        set_skill("honghua-xinfa", 200);
        set_skill("tianchi-neigong", 200);
        set_skill("strike", 220);
        set_skill("benlei-zhang", 220);
        set_skill("dodge", 200);
        set_skill("hanwang-qingdao", 200);
        set_skill("blade", 200);
        set_skill("yanzi-chuanyun", 200);
        set_skill("parry", 200);
        set_skill("martial-cognize", 180);
        set_skill("literate", 150);

        map_skill("force"  , "tianchi-neigong");
        map_skill("blade"  , "hanwang-qingdao");
        map_skill("strike" , "benlei-zhang");
        map_skill("dodge"  , "yanzi-chuanyun");
        map_skill("parry"  , "benlei-zhang");

        prepare_skill("strike", "benlei-zhang");

        set("coagents", ({
                ([ "startroom" : "/d/kaifeng/hh_houting",
                   "id"        : "zhao banshan" ]),
        }));

        set("guarder", ([
                "refuse_other": CYN "$N" CYN "对$n" CYN "冷喝道："
                                "你给我站住！我们红花会岂是由得外"
                                "人随便走动地方？" NOR,
                "refuse_carry": CYN "$N" CYN "对$n" CYN "喝道：你"
                                "背上背的是什么人？给我放下来！" NOR,
        ]));

        create_family("红花会", 4, "四当家");

        set("inquiry", ([
                "雷霆万钧"  : (: ask_skill1 :),
        ]));

        set("chat_chance_combat", 100);
        set("chat_msg_combat", ({
                (: perform_action, "strike.lei" :),
                (: exert_function, "powerup" :),
                (: exert_function, "recover" :),
        }) );
        setup();

        carry_object("/d/wudang/obj/greyrobe")->wear();
    
}

void attempt_apprentice(object me)
{
        if (! permit_recruit(me))
                return;

        if ((int)me->query("shen") < 10000)
        {
                command("say 哼，我文泰来从不收无义之人。");
                return;
        }

        if ((int)me->query("combat_exp") < 150000)
        {
                command("say 你的江湖经验太浅，就算收了你，恐怕也难有作为。");
                return;
        }

        if ((int)me->query_skill("honghua-xinfa", 1) < 60)
        {
                command("say 你连本门内功心法都没练好，怎么习我高深的掌法？");
                return;
        }

        command("haha");
        command("say 不错，不错，你以后就跟着我吧。");
        command("recruit " + me->query("id"));
}

mixed ask_skill1()
{
        object me;

        me = this_player();

        if (me->query("can_perform/benlei-zhang/lei"))
                return "这招俺不是已经教给你了吗？";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "和本教素无瓜葛，何出此言？";

        if (me->query_skill("benlei-zhang", 1) < 1)
                return "你连霹雳奔雷掌都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 600)
                return "你在会中所作的贡献还不够，这招我不忙传你。";

        if (me->query("shen") < 20000)
                return "你侠义正事做得不够，这招我不能传你。";

        if (me->query_skill("force") < 200)
                return "你的内功火候不足，学不成这一招。";

        if (me->query_skill("benlei-zhang", 1) < 120)
                return "你的霹雳奔雷掌还练得不到家，自己下去练练再来吧！";

        message_vision(HIY "$n" HIY "大笑数声，对$N" HIY "说道：“想不到"
                       "你的掌法居然能有如此造\n诣，今日我传你这招又何妨"
                       "？”说罢，$n" HIY "随即摆开架势，慢\n慢的演示招数"
                       "。\n" NOR, me, this_object());

        command("haha");
        command("say 刚才那些全是这套掌法的精髓，可要给俺记牢了。");
        tell_object(me, HIC "你学会了「雷霆万钧」。\n" NOR);

        if (me->can_improve_skill("strike"))
                me->improve_skill("strike", 1500000);
        if (me->can_improve_skill("benlei-zhang"))
                me->improve_skill("benlei-zhang", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/benlei-zhang/lei", 1);
        me->add("gongxian", -600);

        return 1;
}

void unconcious()
{
        die();
}
