#include <ansi.h>
#include "jueqing.h"

inherit NPC;
inherit F_MASTER;
inherit F_QUESTER;

void create()
{
        set_name("裘千尺", ({ "qiu qianchi", "qiu", "qianchi" }));
        set("nickname", HIG "铁掌莲花" NOR);
        set("long", @LONG
她就是铁掌帮的帮主铁掌水上漂裘千仞的妹妹，
只见她头发散乱，面色苍老，衣衫破烂。
LONG);

        set("gender", "女性");
        set("age", 40);
        set("attitude", "friendly");
        set("shen_type", 1);
        set("str", 30);
        set("int", 30);
        set("con", 30);
        set("dex", 30);
       
        set("qi", 6000);
        set("max_qi", 6000);
        set("jing", 3000);
        set("max_jing", 3000);
        set("neili", 8000);
        set("max_neili", 8000);
        set("jiali", 200);
        set("combat_exp", 3000000);

        set_skill("force", 260);
        set_skill("tiezhang-xinfa", 260);
        set_skill("jueqing-xinfa", 260);
        set_skill("tianlei-shengong", 260);
        set_skill("dodge", 260);
        set_skill("jueqing-shenfa", 260);
        set_skill("dengping-dushui", 260);
        set_skill("strike", 260);
        set_skill("strike", 260);
        set_skill("jueqing-zhang", 260);
        set_skill("guhong-zhang", 260);
        set_skill("parry", 260);
        set_skill("tie-zhang", 260);
        set_skill("chuanxin-zhang", 260);
        set_skill("cuff", 260);
        set_skill("tiexian-quan", 260);
        set_skill("sword", 240);
        set_skill("jueqing-jian", 240);
        set_skill("unarmed", 240);
        set_skill("feilong-zhang", 240);
        set_skill("staff", 240);
        set_skill("literate", 160);
        set_skill("martial-cognize", 220);

        map_skill("force", "tianlei-shengong");
        map_skill("unarmed", "chuanxin-zhang");
        map_skill("strike", "tie-zhang");
        map_skill("cuff", "tiexian-quan");
        map_skill("parry", "tie-zhang");
        map_skill("dodge", "dengping-dushui");
        map_skill("staff", "feilong-zhangfa");

        prepare_skill("strike", "tie-zhang");

        create_family("绝情谷", 4, "谷主夫人");

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "strike.juesha" :),
                (: perform_action, "strike.lei" :),
                (: perform_action, "strike.ying" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),
        }) );

        setup();

        carry_object("/d/gaibang/npc/obj/cloth")->wear();
}

void attempt_apprentice(object me)
{
        string purename, name, new_name;

        if (! permit_recruit(me))
                return;

        if (me->query("family/master_name") == "公孙止")
        {
                command("sneer");
                command("say 我裘千尺可不收公孙止那恶贼的徒弟。");
                return;
        }

        if ((int)me->query("shen") > -60000)
        {
                command("heng");
                command("say 我裘千尺可不收心慈手软的人做徒弟。");
                return;
        }

        if ((int)me->query("combat_exp") < 400000)
        {
                command("heng");
                command("say 你这点能力怎能继承我的衣钵？");
                return;
        }

        if ((int)me->query_skill("force") < 140)
        {
                command("say 要学我的铁掌绝技，内功非精纯不可，你还是先多练练吧。");
                return;
        }

        if ((int)me->query_skill("strike", 1) < 80)
        {
                command("say 要学我的铁掌绝技，需要精湛的掌法作基础，我看你在那"
                        "上面下的工夫还不够啊。");
                return;
        }

        command("say 不错，不错！");
        command("say 我就收下你了，希望你苦练铁掌神功，将之发扬光大。");
        command("recruit " + me->query("id"));

        //if ( me->query("move_party/绝情谷—铁掌帮") &&
            // me->query("surname") == "公孙" )
        if (me->query("surname") == "公孙" )
        {
                name = me->query("name");
                purename = me->query("purename");

                new_name = "裘" + purename;

                me->set("surname", "裘");
                me->set("name", new_name);
                //me->delete("move_party/绝情谷—铁掌帮", 1);

                command("say 公孙止那老家伙不是个东西，你以后还是跟你娘亲姓为好。");
                command("say 从今以后你就叫作" + new_name + "吧。");
        }
}


int accept_ask(object me, string topic)
{
        switch (topic)
        {
        case "历练" :
        case "历炼" :
        case "锻炼" :
                return QUEST_D->accept_ask(this_object(), me, topic);
                break;

        case "破甲推山" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/tiexian-quan/jia",
                           "name"    : "破甲推山",
                           "sk1"     : "tiexian-quan",
                           "lv1"     : 60,
                           "force"   : 80,
                           "gongxian": 100,
                           "shen"    : -60000, ]));
                break;

        case "龙飞势" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/feilong-zhang/fei",
                           "name"    : "龙飞势",
                           "sk1"     : "feilong-zhang",
                           "lv1"     : 150,
                           "force"   : 120,
                           "gongxian": 300,
                           "shen"    : -60000, ]));
                break;

        case "穿心锥" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/chuanxin-zhang/zhui",
                           "name"    : "穿心锥",
                           "sk1"     : "chuanxin-zhang",
                           "lv1"     : 80,
                           "force"   : 140,
                           "gongxian": 220,
                           "shen"    : -70000 ]));
                break;

        case "无影掌" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/tie-zhang/ying",
                           "name"    : "无影掌",
                           "sk1"     : "tie-zhang",
                           "msg1"    : "$N点了点头，在$n耳边轻声嘀"
                                       "咕了几句，忽然又拉开架势，"
                                       "双掌急速运转，掌影虚虚实实"
                                       "，一掌毫无章理的拍出。招式"
                                       "精奇，直看得$n目瞪口呆。",
                           "lv1"     : 100,
                           "force"   : 160,
                           "gongxian": 400,
                           "shen"    : -85000, ]));
                break;

        case "掌心雷" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/tie-zhang/lei",
                           "name"    : "掌心雷",
                           "msg1"    : "$N投以$n赞许的一笑，说道：“"
                                       "看好了！”随即只见$N猛催内力"
                                       "，双掌登时变得火红，趁$n惊诧"
                                       "之际双掌幻为一对掌刀凌空劈斩"
                                       "而出，只听「喀嚓」一声，一块"
                                       "大石应声而碎！",
                           "sk1"     : "tie-zhang",
                           "lv1"     : 120,
                           "gongxian": 600,
                           "shen"    : -950000, ]));
                break;


        default:
                return 0;
        }
}

void unconcious()
{
        die();
}

