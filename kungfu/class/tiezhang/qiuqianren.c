#include <ansi.h>
#include "tiezhang.h"

inherit NPC;
inherit F_MASTER;
inherit F_COAGENT;
inherit F_QUESTER;

void create()
{
        set_name("裘千仞", ({ "qiu qianren", "qiu", "qianren", "ren"}));
        set("nickname", WHT "铁掌水上漂" NOR);
        set("long", "他就是威震川湘的铁掌帮的帮主铁掌水上漂裘千仞。\n"
                    "他头须皆白，身穿黄葛短衫，右手挥着一把大蒲扇。\n" );

        set("gender", "男性");
        set("age", 60);
        set("attitude", "friendly");
        set("shen_type", -1);
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
        set("combat_exp", 4000000);
        set("score", 40000);

        set_skill("force", 280);
        set_skill("tiezhang-xinfa", 280);
        set_skill("tianlei-shengong", 280);
        set_skill("dodge", 320);
        set_skill("dengping-dushui", 320);
        set_skill("strike", 320);
        set_skill("parry", 280);
        set_skill("tie-zhang", 320);
        set_skill("chuanxin-zhang", 280);
        set_skill("cuff", 280);
        set_skill("tiexian-quan", 280);
        set_skill("unarmed", 280);
        set_skill("feilong-zhang", 260);
        set_skill("staff", 260);
        set_skill("tianlei-dao", 260);
        set_skill("literate", 200);
        set_skill("martial-cognize", 200);

        map_skill("force", "tianlei-shengong");
        map_skill("unarmed", "chuanxin-zhang");
        map_skill("strike", "tie-zhang");
        map_skill("cuff", "tiexian-quan");
        map_skill("parry", "tie-zhang");
        map_skill("dodge", "dengping-dushui");
        map_skill("staff", "feilong-zhang");

        prepare_skill("strike", "tie-zhang");

        create_family("铁掌帮", 14, "帮主");

        set("inquiry", ([
                "绝招"    : "你要问什么绝招？",
                "绝技"    : "你要问什么绝技？",
                "铁掌掌谱": "这本秘籍不在我手里，想必已经失落很久了。",
                "上官剑南": "他是我的授业恩师，你问这个干嘛？",
                "裘千丈"  : "哼，大哥老是打着我的名号到处招摇撞骗，总有一天我要……",
                "裘千尺"  : "三妹下嫁到绝情谷去了，你问这个有什么事吗？",
                "绝情谷"  : "绝情谷公孙止那家伙不是个东西，你问这个干嘛？",
                "华山论剑": "哼，去年的华山论剑要不是因为我在闭观，哪里轮得上王重阳那牛鼻子。",
        ]));

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "strike.juesha" :),
                (: perform_action, "strike.lei" :),
                (: perform_action, "strike.yin" :),
                (: perform_action, "cuff.kai" :),
                (: perform_action, "unarmed.zhui" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),
        }) );

        setup();

        carry_object("/clone/misc/cloth")->wear();
        add_money("silver", 50);
}

void attempt_apprentice(object me)
{
        //string purename, name, new_name;

        if (! permit_recruit(me))
                return;

        if ( me->query("family/family_name") &&
             me->query("family/family_name") == "绝情谷" &&
             me->query("family/master_name") == "裘千尺" )
        {
                command("nod");
                command("say 原来是三妹的后裔，这样也好，我们本来就是一家人。且让"
                "我先看看你的能力。\n");
                me->set("move_party/绝情谷—铁掌帮", 1);
        }

        if ((int)me->query("shen") > -60000)
        {
                command("heng");
                command("say 我裘千仞可不收心慈手软的人做徒弟。");
                return;
        }

        if ((int)me->query("combat_exp") < 800000)
        {
                command("heng");
                command("say 你这点能力怎能继承我的衣钵？");
                return;
        }

        if ((int)me->query_skill("force") < 260)
        {
                command("say 要学我的铁掌绝技，内功非精纯不可，你还是先多练练吧。");
                return;
        }

        if ((int)me->query_skill("strike", 1) < 180)
        {
                command("say 要学我的铁掌绝技，需要精湛的掌法作基础，我看你在那上"
                        "面下的工夫还不够啊。");
                return;
        }

        command("say 不错，不错！");
        command("say 我就收下你了，希望你苦练铁掌神功，将之发扬光大。");
        command("recruit " + me->query("id"));
/*
        if ( me->query("move_party/绝情谷—铁掌帮") &&
             me->query("surname") == "公孙" )
        {
                name = me->query("name");
                purename = me->query("purename");

                new_name = "裘" + purename;

                me->set("surname", "裘");
                me->set("name", new_name);
                me->delete("move_party/绝情谷—铁掌帮", 1);

                command("say 公孙止那老家伙不是个东西，你以后还是跟你娘亲姓为好。");
                command("say 从今以后你就叫作" + new_name + "吧。");
        }
*/
       if ( me->query("move_party/绝情谷—铁掌帮"))
        {
                me->delete("move_party/绝情谷—铁掌帮", 1);
                command("say 公孙止那老家伙不是个东西，你以后还是跟我学习铁掌帮的功夫吧。");
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

        case "掌心雷" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/tie-zhang/lei",
                           "name"    : "掌心雷",
                           "msg1"    : HIY "$N" HIY "投以赞许的"
                                       "一笑，说道：“看好了！”" 
                                       "随即只见$N" HIY "猛催内"
                                       "力，双掌登时变得火红，你"
                                       "正惊诧之际$N" HIY "双掌幻"
                                       "为一对掌刀凌空劈\n斩而出"
                                       "，只听「喀嚓」一声，大厅"
                                       "内一张青石桌应声而碎！",
                           "sk1"     : "tie-zhang",
                           "lv1"     : 160,
                           "force"   : 240,
                           "neili"   : 2200,
                           "gongxian": 600,
                           "shen"    : -65000, ]));
                break;

        case "九穹绝刹掌" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/tie-zhang/juesha",
                           "name"    : "九穹绝刹掌",
                           "msg1"    : HIY "$N" HIY "默默注视了你"
                                       "良久，说道：“既然如此，今"
                                       "日我便传你这招！我只演示一"
                                       "遍，你可要看仔细了！”说完"
                                       "一声怒喝，体内所积存数十载"
                                       "的天雷真气澎湃而发，衣衫鼓"
                                       "动，双臂陡然暴长数尺。只听"
                                       "四周破空之声骤然响之，$N" HIY 
                                       "双掌幻出漫天掌影，铺天盖地向"
                                       "四面八方云涌而出，当真气势磅"
                                       "礴，无与伦比！", 
                           "sk1"     : "tie-zhang",
                           "lv1"     : 200,
                           "force"   : 300,
                           "neili"   : 2200,
                           "gongxian": 800,
                           "shen"    : -85000, ]));
                break;

        case "龙影掌" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/tie-zhang/long",
                           "name"    : "龙影掌",
                           "sk1"     : "tie-zhang",
                           "lv1"     : 100,
                           "force"   : 80,
                           "neili"   : 1300,
                           "gongxian": 300,
                           "shen"    : -60000, ]));
                break;

        case "五指刀" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/tie-zhang/dao",
                           "name"    : "五指刀",
                           "sk1"     : "tie-zhang",
                           "lv1"     : 180,
                           "force"   : 280,
                           "neili"   : 2500,
                           "gongxian": 700,
                           "shen"    : -90000, ]));
                break;

        case "阴阳磨" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/tie-zhang/yin",
                           "name"    : "阴阳磨",
                           "sk1"     : "tie-zhang",
                           "lv1"     : 220,
                           "force"   : 300,
                           "neili"   : 3500,
                           "gongxian": 900,
                           "shen"    : -95000, ]));
                break;

        case "春雷炸空" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/tianlei-dao/zha",
                           "name"    : "春雷炸空",
                           "sk1"     : "tianlei-dao",
                           "lv1"     : 150,
                           "force"   : 140,
                           "neili"   : 1500,
                           "gongxian": 600,
                           "shen"    : -75000, ]));
                break;

        case "五雷连闪" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/tianlei-dao/shan",
                           "name"    : "五雷连闪",
                           "sk1"     : "tianlei-dao",
                           "lv1"     : 150,
                           "force"   : 150,
                           "neili"   : 1500,
                           "gongxian": 600,
                           "shen"    : -75000, ]));
                break;
/*
        case "镇岳尚方" :
                return MASTER_D->give_item(me, this_object(),
                        ([ "item"    : ZHENYUE,
                           "master"  : 1,
                           "sk1"     : "henshan-jian",
                           "lv1"     : 120,
                           "shen"    : 50000, ]));
                break;
*/
        default:
                return 0;
        }
}

void unconcious()
{
        die();
}

