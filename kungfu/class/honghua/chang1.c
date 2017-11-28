#include <ansi.h>
#include "honghua.h"

inherit NPC;
inherit F_MASTER;

mixed ask_skill1();

void create()
{
        set_name("常赫志", ({ "chang hezhi", "chang", "hezhi" }));
        set("title", "红花会五当家");
        set("nickname", HIB "黑无常" NOR);
        set("long", "他身材又高又瘦，脸色蜡黄，眼睛凹进，眼\n"
                    "角上有一粒黑痣，眉毛斜斜的倒垂下来，形\n"
                    "相甚是可怖。他是青城派慧侣道人的徒弟。\n"
                    "黑沙掌的功夫，江湖上无人能敌。黑白无常\n"
                    "两兄弟是川江上著名的侠盗，一向劫富济贫，\n"
                    "不过心狠手辣，因此得了这难听的外号。\n");
        set("gender", "男性");
        set("age", 32);
        set("attitude", "peaceful");
        set("shen_type", 1);
        set("per", 21);
        set("str", 30);
        set("int", 30);
        set("con", 30);
        set("dex", 30);

        set("qi", 3000);
        set("max_qi", 3000);
        set("jing", 2000);
        set("max_jing", 2000);
        set("neili", 3500);
        set("max_neili", 3500);
        set("jiali", 120);
        set("combat_exp", 1000000);
        set("score", 10000);

        set_skill("force", 140);
        set_skill("honghua-xinfa", 140);
        set_skill("qingcheng-neigong", 140);
        set_skill("strike", 160);
        set_skill("heisha-zhang", 160);
        set_skill("dodge", 160);
        set_skill("yanzi-chuanyun", 160);
        set_skill("sword", 140);
        set_skill("songfeng-jian", 140);
        set_skill("parry", 160);
        set_skill("martial-cognize", 120);
        set_skill("literate", 140);

        map_skill("force"  , "qingcheng-neigong");
        map_skill("sword"  , "songfeng-jian");
        map_skill("strike" , "heisha-zhang");
        map_skill("dodge"  , "yanzi-chuanyun");
        map_skill("parry"  , "heisha-zhang");

        prepare_skill("strike", "heisha-zhang");

        set("no_teach", ([
                "qingcheng-neigong" : "这内功没得啥子用，你给老子好生练掌法就行了。",
        ]));

        create_family("红花会", 4, "当家");

        set("inquiry", ([
                "催魂掌" : (: ask_skill1 :),
        ]));

        set("chat_chance_combat", 100);
        set("chat_msg_combat", ({
                (: perform_action, "strike.cui" :),
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

        if ((int)me->query("shen") < 5000)
        {
                command("say 你非我侠义中人，我不能收你。");
                return;
        }

        if ((int)me->query_skill("honghua-xinfa", 1) < 50)
        {
                command("say 你把本门的心法练好了再来。");
                return;
        }

        command("heihei");
        command("say 以后你就跟着老子吧。");
        command("recruit " + me->query("id"));
}

mixed ask_skill1()
{
        object me;

        me = this_player();

        if (me->query("can_perform/heisha-zhang/cui"))
                return "老子把啥子都给你说完了，你龟儿咋那么烦哦！";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你龟儿子是哪儿来的？老子认不到你。";

        if (me->query_skill("heisha-zhang", 1) < 1)
                return "你龟儿黑砂掌都没学，还说啥子催魂掌哦！";

        if (me->query("gongxian") < 150)
                return "你龟儿贡献都做得不够，喊我咋个传你嘛？";

        if (me->query("shen") < 5000)
                return "你连行侠仗义都搞忘了，我还敢传你啥子嘛？";

        if (me->query_skill("force") < 150)
                return "你龟儿内功都没学好，学啥子这招哦！";

        if (me->query_skill("heisha-zhang", 1) < 100)
                return "你黑砂掌学成这副龟儿子德性，咋个练催魂掌嘛？";

        message_vision(HIY "$n" HIY "看了看$N" HIY "，哈哈一笑，说道"
                       "：“要得，要得！看你娃学得还\n可以，今天我就"
                       "教你催魂掌。”$n" HIY "说罢，便轻轻拍出一掌，"
                       "看\n似不着半点力道。正当$N" HIY "纳闷间，听得"
                       "“噗”的一声，随即尘沙滚\n滚，飘然四起，身前"
                       "沙地豁然留下一个乌黑的掌印，煞是惊人。\n" NOR,
                       me, this_object());

        command("heihei");
        command("say 刚才老子说的你都要记好了好，自己下去练。");
        tell_object(me, HIC "你学会了「催魂掌」。\n" NOR);

        if (me->can_improve_skill("strike"))
                me->improve_skill("strike", 1500000);
        if (me->can_improve_skill("heisha-zhang"))
                me->improve_skill("heisha-zhang", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/heisha-zhang/cui", 1);
        me->add("gongxian", -150);

        return 1;
}
